'use client';

import { useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { MarketingLanguage } from '@/lib/languages';
import { calculateSaju } from '@/lib/saju';
import { isOldEnough } from '@/lib/age';
import { ApiError, getDemoReading, type DemoReadingResponse } from '@/lib/api';
import { Turnstile } from './Turnstile';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * 신년운세 캠페인의 ReadingForm.tsx보다 가볍다 — 이름/사연은 받지 않는다. 생년월일은 로컬에서
 * 사주를 계산하고, 만 16세 확인용 양력 년/월/일도 서버로 보낸다(저장되지 않음). 결과는 실제
 * 앱의 무료 티어 편지와 완전히 같은 구성(hook+interpretation+closing)이라 출생 시간은 결과에
 * 전혀 영향을 주지 않는다(2026-08-22 개편 — 그래서 출생 시간 입력 자체를 없앴다, 예전엔
 * hourPillar를 받았지만 그 값은 무료 티어 화면에 아예 반영되지 않는 프리미엄 전용 보너스에만
 * 쓰이던 값이었다).
 */
export function DemoForm({ language, dict }: { language: MarketingLanguage; dict: MarketingDictionary['demo'] }) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DemoReadingResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const yearNum = Number(year);
    const monthNum = Number(month);
    const dayNum = Number(day);
    if (!Number.isInteger(yearNum) || !Number.isInteger(monthNum) || !Number.isInteger(dayNum) || yearNum < 1900 || yearNum > CURRENT_YEAR) {
      setError(dict.errors.date);
      return;
    }
    if (!isOldEnough(yearNum, monthNum, dayNum)) {
      setError(dict.errors.underage);
      return;
    }

    setIsSubmitting(true);
    try {
      const chart = calculateSaju({ calendarType: 'solar', year: yearNum, month: monthNum, day: dayNum });

      const reading = await getDemoReading({
        language,
        dayPillar: chart.dayPillar,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        birthYear: yearNum,
        birthMonth: monthNum,
        birthDay: dayNum,
        turnstileToken,
      });

      setResult(reading);
    } catch (err) {
      if (err instanceof ApiError && (err.reason === 'underage' || err.reason === 'birth_date_required')) {
        setError(err.reason === 'underage' ? dict.errors.underage : dict.errors.date);
      } else if (err instanceof ApiError && err.status === 429) {
        setError(dict.errors.rateLimited);
      } else {
        setError(dict.errors.generic);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="card-surface flex flex-col gap-4 rounded-2xl border border-accent/20 p-6 sm:p-7">
        <h3 className="text-xs font-semibold tracking-wide text-accent uppercase">{dict.resultTitle}</h3>
        <div className="flex flex-col gap-3 text-lg leading-relaxed">
          <p className="font-medium">{result.hook}</p>
          <p>{result.interpretation}</p>
          <p className="text-foreground/70 italic">{result.closing}</p>
        </div>
        <a
          href={process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 rounded-full bg-accent px-6 py-3 text-center font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
        >
          {dict.resultCta}
        </a>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="text-sm text-foreground/60 underline underline-offset-2 hover:text-foreground"
        >
          {dict.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface flex flex-col gap-5 rounded-2xl border border-foreground/10 p-6 sm:p-7">
      <div>
        <span className="mb-1.5 block text-sm font-medium">{dict.dateLabel}</span>
        <div className="flex gap-1.5 sm:gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={dict.yearLabel}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-20 min-w-0 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent sm:w-24 sm:px-3"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={dict.monthLabel}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            min={1}
            max={12}
            className="w-16 min-w-0 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent sm:w-20 sm:px-3"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={dict.dayLabel}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            min={1}
            max={31}
            className="w-16 min-w-0 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent sm:w-20 sm:px-3"
          />
        </div>
      </div>

      <Turnstile onVerify={setTurnstileToken} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
      >
        {isSubmitting ? dict.submitting : dict.submitButton}
      </button>
    </form>
  );
}
