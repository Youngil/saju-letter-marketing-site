'use client';

import { useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { MarketingLanguage } from '@/lib/languages';
import { ApiError, subscribeLead } from '@/lib/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 홈 화면 하단 이메일 리드 캡처 — 신년운세 캠페인의 EmailSignupForm.tsx와 달리 특정 reading에
 * 종속되지 않는다(이메일 자체가 단위, saju-letter-backend의 MarketingSiteEmailLead 참고).
 * 나이 확인 체크박스가 없다 — 별도 개인정보 수집 단계가 없어 게이트할 대상 자체가 없다
 * (신년운세 캠페인의 리딩 폼과의 차이).
 */
export function LeadCaptureForm({ language, dict }: { language: MarketingLanguage; dict: MarketingDictionary['leadCapture'] }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    setIsSubmitting(true);
    try {
      await subscribeLead({ email, language, consent });
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
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
        <p className="font-medium text-accent">{dict.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-white/60 p-6">
      <h3 className="text-lg font-semibold">{dict.title}</h3>
      <p className="text-sm text-foreground/70">{dict.subtitle}</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={dict.emailPlaceholder}
        className="rounded-lg border border-foreground/20 bg-white px-3 py-2"
      />
      <label className="flex items-start gap-2 text-sm text-foreground/70">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>{dict.consentLabel}</span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? dict.submitting : dict.submitButton}
      </button>
    </form>
  );
}
