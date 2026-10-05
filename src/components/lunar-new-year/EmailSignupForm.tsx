'use client';

import { useRef, useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import { subscribeForDrip, logCampaignEvent } from '@/lib/lunarNewYearApi';
import { ApiError } from '@/lib/apiClient';
import { Turnstile, TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/Turnstile';
import { EMAIL_REGEX } from '@/lib/publicForm';

type ResultDict = NonNullable<MarketingDictionary['lunarNewYear']>['result'];

/**
 * Turnstile(2026-08-23, "신년운세 드립 구독에 Turnstile이 없다" 감사 대응) — 리딩 생성(위
 * ReadingForm.tsx)은 이미 Turnstile로 막혀 있었지만, 그 readingId로 임의의 제3자 이메일을 12일
 * 드립에 등록하는 이 폼에는 검증이 전혀 없었다. LeadCaptureForm.tsx와 같은 패턴(사이트 키 없으면
 * 위젯을 렌더하지 않고 버튼도 잠그지 않음 — 로컬 개발 대응).
 *
 * 결과를 만든 사람에게만 렌더된다(2026-10-07 전체 점검 7차 항목 1) — 결과 페이지(서버)가 httpOnly 쿠키의 소유자 토큰을
 * 백엔드에 확인받은 뒤에만 이 폼과 그 토큰을 넘긴다. 공유 링크로 연 사람은 이 폼을 보지 않는다.
 */
export function EmailSignupForm({
  readingId,
  ownerToken,
  dict: t,
  alreadySubscribed,
}: {
  readingId: string;
  ownerToken: string;
  dict: ResultDict;
  alreadySubscribed: boolean;
}) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(alreadySubscribed);
  /** 다시 보내도 소용없는 거절(소유자 아님·구독 불가) — 폼 대신 안내만 남긴다. */
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_REGEX.test(email)) {
      setError(t.errors.email);
      return;
    }
    if (!consent) {
      setError(t.errors.consent);
      return;
    }
    if (TURNSTILE_ENABLED && !turnstileToken) return;

    setIsSubmitting(true);
    try {
      const result = await subscribeForDrip({ readingId, ownerToken, email, consent: true, turnstileToken });
      setSubscribed(true);
      logCampaignEvent('email_registered_client_confirmed', { readingId, subscriptionId: result.subscriptionId });
    } catch (err) {
      if (err instanceof ApiError && err.reason === 'already_subscribed') {
        setSubscribed(true);
      } else if (err instanceof ApiError && err.reason === 'not_reading_owner') {
        setBlockedMessage(t.errors.notOwner);
      } else if (err instanceof ApiError && err.reason === 'subscription_unavailable') {
        setBlockedMessage(t.errors.unavailable);
      } else {
        setError(t.errors.generic);
        // Turnstile 토큰은 1회용이라, 실패한 시도에 쓰인 토큰을 그대로 두면 재제출도 항상
        // 403으로 막힌다(2026-09-03, 종합 버그 점검으로 발견) — 이 분기는 폼이 그대로 남으므로
        // 새 토큰을 명시적으로 요청한다.
        setTurnstileToken(undefined);
        turnstileRef.current?.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (subscribed) {
    return <p className="rounded-lg bg-emerald-50 p-4 text-emerald-800">{t.subscribed}</p>;
  }
  if (blockedMessage) {
    return (
      <p role="alert" className="rounded-lg bg-stone-100 p-4 text-sm text-stone-700">
        {blockedMessage}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.emailPlaceholder}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
      />
      <label className="flex items-start gap-2 text-sm text-stone-600">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>{t.consentLabel}</span>
      </label>
      <Turnstile ref={turnstileRef} onVerify={setTurnstileToken} />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting || (TURNSTILE_ENABLED && !turnstileToken)}
        className="rounded-full bg-amber-800 px-6 py-2.5 font-medium text-white transition hover:bg-amber-900 disabled:opacity-50"
      >
        {isSubmitting ? t.subscribing : t.subscribeButton}
      </button>
    </form>
  );
}
