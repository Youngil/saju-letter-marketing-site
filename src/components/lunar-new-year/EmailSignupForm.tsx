'use client';

import { useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import { subscribeForDrip, logCampaignEvent } from '@/lib/lunarNewYearApi';
import { ApiError } from '@/lib/apiClient';

type ResultDict = NonNullable<MarketingDictionary['lunarNewYear']>['result'];

export function EmailSignupForm({
  readingId,
  dict: t,
  alreadySubscribed,
}: {
  readingId: string;
  dict: ResultDict;
  alreadySubscribed: boolean;
}) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(alreadySubscribed);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    setIsSubmitting(true);
    try {
      const result = await subscribeForDrip({ readingId, email, consent: true });
      setSubscribed(true);
      logCampaignEvent('email_registered_client_confirmed', { readingId, subscriptionId: result.subscriptionId });
    } catch (err) {
      if (err instanceof ApiError && err.reason === 'already_subscribed') {
        setSubscribed(true);
      } else {
        setError(t.errors.generic);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (subscribed) {
    return <p className="rounded-lg bg-emerald-50 p-4 text-emerald-800">{t.subscribed}</p>;
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-amber-800 px-6 py-2.5 font-medium text-white transition hover:bg-amber-900 disabled:opacity-50"
      >
        {isSubmitting ? t.subscribing : t.subscribeButton}
      </button>
    </form>
  );
}
