'use client';

import { useEffect, useRef, useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { LaunchContentLanguage } from '@/lib/languages';
import { fetchFreshCouponAvailability, subscribeLead, type CouponAvailability } from '@/lib/api';
import { Turnstile, TURNSTILE_ENABLED, type TurnstileHandle } from './Turnstile';
import { trackEvent } from '@/lib/analytics';
import { EMAIL_REGEX, mapPublicFormError } from '@/lib/publicForm';

/**
 * 홈 화면 하단 이메일 리드 캡처 — 신년운세 캠페인의 EmailSignupForm.tsx와 달리 특정 reading에
 * 종속되지 않는다(이메일 자체가 단위, saju-letter-backend의 MarketingSiteEmailLead 참고).
 * 나이 확인 체크박스가 없다 — 별도 개인정보 수집 단계가 없어 게이트할 대상 자체가 없다
 * (신년운세 캠페인의 리딩 폼과의 차이).
 *
 * Turnstile(2026-08-21, "리드 캡처·궁합 제출에 Turnstile이 없음" 감사 대응) — 이 폼은 모바일
 * 앱에서 호출하는 경로가 없어(마케팅 사이트 전용) 데모/신년운세와 완전히 같은 방식으로 붙일 수
 * 있다. `NEXT_PUBLIC_TURNSTILE_SITE_KEY`가 없으면 `Turnstile` 컴포넌트가 아무것도 렌더하지
 * 않고, 백엔드도 로컬(시크릿 없음)에서는 토큰 없이 통과시킨다 — 운영에서만 실질적으로 강제된다.
 */
export function LeadCaptureForm({
  language,
  dict,
  initialAvailability,
  context = 'home',
  heading,
}: {
  language: LaunchContentLanguage;
  dict: MarketingDictionary['leadCapture'];
  /**
   * 선착순 현황(전체 캡/현재 발급 수/잔여 인원) — 관리자 패널에서 캡을 조정할 수 있어 하드코딩하지 않는다. 2026-08-26부터
   * capacity/issued도 함께 보여 준다. **초기값은 홈 서버 컴포넌트가 넘기고**(ISR과 같은 주기, 2026-10-06 전체 점검 9차 →
   * 10차), 마운트되면 같은 사이트 `/api/coupon-availability`(60초 캐시)로 한 번 다시 받아 바꾼다 — ISR HTML이나 콜드
   * 스타트 인스턴스의 빌드 때 값이 오래돼 있어도 바로잡힌다. 브라우저는 백엔드를 직접 부르지 않는다(리드 제출과 같은
   * 백엔드 IP 한도를 쓰지 않게). 다시 받기가 실패하면 초기값을 그대로 두고, 초기값도 null이면 문구를 숨긴다.
   */
  initialAvailability: CouponAvailability | null;
  /**
   * 어디에 놓인 폼인가(2026-10-10 전체 점검 14차) — GA `lead_submit`의 `context`로 실린다(식별 값 아님). 홈 아래 `home`(기본),
   * 데모 결과 아래 `demo_result`. 백엔드로는 보내지 않는다(같은 리드 등록).
   */
  context?: 'home' | 'demo_result';
  /** 제목·부제를 바꿀 때(데모 결과 아래 — iOS 출시 알림 안내). 없으면 `dict.title`/`dict.subtitle`. */
  heading?: { title: string; subtitle: string };
}) {
  const [availability, setAvailability] = useState(initialAvailability);
  useEffect(() => {
    const controller = new AbortController();
    void fetchFreshCouponAvailability(controller.signal).then((fresh) => {
      if (fresh) setAvailability(fresh);
    });
    return () => controller.abort();
  }, []);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  // 폼이 사라지고 완료 문구로 바뀌므로, 화면 낭독기가 새 영역을 놓치지 않게 초점을 옮긴다(2026-10-06 전체 점검 11차 R11-6-8).
  useEffect(() => {
    if (success) successRef.current?.focus();
  }, [success]);

  const wakeTurnstile = () => turnstileRef.current?.execute();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_REGEX.test(email)) {
      setError(dict.errors.email);
      return;
    }
    if (!consent) {
      setError(dict.errors.consent);
      return;
    }
    if (TURNSTILE_ENABLED && !turnstileToken) return;

    setIsSubmitting(true);
    try {
      await subscribeLead({ email, language, consent, turnstileToken });
      trackEvent('lead_submit', { language, context });
      setSuccess(true);
    } catch (err) {
      // 리드 폼엔 나이·생년월일 입력이 없어 underage/date도 일반 문구로 둔다.
      setError(
        mapPublicFormError(err, {
          underage: dict.errors.generic,
          date: dict.errors.generic,
          generic: dict.errors.generic,
          rateLimited: dict.errors.rateLimited,
          byReason: { already_subscribed: dict.errors.already },
        }),
      );
      // Turnstile 토큰은 1회용이라, 실패한 시도에 쓰인 토큰을 그대로 두면 재제출도 항상 403으로
      // 막힌다(2026-09-03, 종합 버그 점검으로 발견) — 이 폼은 실패해도 언마운트되지 않으므로
      // 새 토큰을 명시적으로 요청한다.
      setTurnstileToken(undefined);
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="letter-surface rounded-sm p-6 text-center outline-none sm:p-7"
      >
        <p className="font-medium text-accent-warm">{dict.success}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      // 보안 확인은 폼을 처음 건드릴 때 시작한다(2026-10-10 전체 점검 14차, Turnstile `lazy`).
      onFocusCapture={wakeTurnstile}
      onPointerDownCapture={wakeTurnstile}
      onKeyDownCapture={wakeTurnstile}
      className="letter-surface flex flex-col gap-3 rounded-sm p-6 sm:p-7"
    >
      <h3 className="font-display text-lg font-semibold">{heading?.title ?? dict.title}</h3>
      <p className="text-sm text-foreground/70">{heading?.subtitle ?? dict.subtitle}</p>
      {availability !== null &&
        availability.capacity !== null &&
        availability.remaining !== null &&
        (availability.remaining > 0 ? (
          <p className="text-sm font-medium text-accent-warm">
            {/* 신청 수가 적을 때 "100명 중 2명"은 희소성이 아니라 "아무도 안 쓴다"로 읽힌다(2026-10-03, 디자인 감사 P1) —
                절반이 찰 때까지는 정원만 보여 준다. */}
            {(availability.issued ?? 0) * 2 >= availability.capacity
              ? dict.remainingSlots
                  .replace('{capacity}', String(availability.capacity))
                  .replace('{issued}', String(availability.issued))
                  .replace('{remaining}', String(availability.remaining))
              : dict.limitedSlots.replace('{capacity}', String(availability.capacity))}
          </p>
        ) : (
          <p className="text-sm text-foreground/60">{dict.soldOut}</p>
        ))}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={dict.emailPlaceholder}
        aria-label={dict.emailLabel}
        className="rounded-lg border border-foreground/15 bg-white px-3 py-2.5 transition focus-visible:border-accent-warm"
      />
      <label className="flex items-start gap-2 text-sm text-foreground/70">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-accent-warm" />
        <span>{dict.consentLabel}</span>
      </label>
      <Turnstile ref={turnstileRef} onVerify={setTurnstileToken} lazy />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting || (TURNSTILE_ENABLED && !turnstileToken)}
        className="rounded-full bg-accent-warm px-6 py-3 font-medium text-white transition hover:bg-accent-warm/90 disabled:pointer-events-none disabled:bg-foreground/10 disabled:text-foreground/45"
      >
        {isSubmitting ? dict.submitting : dict.submitButton}
      </button>
    </form>
  );
}
