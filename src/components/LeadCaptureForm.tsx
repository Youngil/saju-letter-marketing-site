'use client';

import { useEffect, useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { MarketingLanguage } from '@/lib/languages';
import { ApiError, getCouponAvailability, subscribeLead } from '@/lib/api';
import { Turnstile, TURNSTILE_ENABLED } from './Turnstile';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
export function LeadCaptureForm({ language, dict }: { language: MarketingLanguage; dict: MarketingDictionary['leadCapture'] }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // 선착순 잔여 인원 — 관리자 패널에서 캡을 조정할 수 있어(saju-letter-admin-panel "설정" 화면)
  // 하드코딩하지 않고 매번 조회한다. 조회 실패해도 폼 자체는 그대로 쓸 수 있어야 하므로 조용히
  // 무시한다(null로 남겨두면 문구 자체를 숨긴다).
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCouponAvailability()
      .then((availability) => {
        if (!cancelled) setRemaining(availability.remaining);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.reason === 'already_subscribed') {
        setError(dict.errors.already);
      } else {
        setError(dict.errors.generic);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card-surface rounded-2xl border border-accent/20 p-6 text-center sm:p-7">
        <p className="font-medium text-accent">{dict.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface flex flex-col gap-3 rounded-2xl border border-accent-warm/20 p-6 sm:p-7">
      <h3 className="text-lg font-semibold">{dict.title}</h3>
      <p className="text-sm text-foreground/70">{dict.subtitle}</p>
      {remaining !== null &&
        (remaining > 0 ? (
          <p className="text-sm font-medium text-accent-warm">{dict.remainingSlots.replace('{count}', String(remaining))}</p>
        ) : (
          <p className="text-sm text-foreground/60">{dict.soldOut}</p>
        ))}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={dict.emailPlaceholder}
        className="rounded-lg border border-foreground/15 bg-white px-3 py-2.5 transition focus-visible:border-accent"
      />
      <label className="flex items-start gap-2 text-sm text-foreground/70">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-accent" />
        <span>{dict.consentLabel}</span>
      </label>
      <Turnstile onVerify={setTurnstileToken} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting || (TURNSTILE_ENABLED && !turnstileToken)}
        className="rounded-full bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
      >
        {isSubmitting ? dict.submitting : dict.submitButton}
      </button>
    </form>
  );
}
