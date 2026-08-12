'use client';

import { useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { MarketingLanguage } from '@/lib/languages';
import { calculateSaju } from '@/lib/saju';
import { ApiError, getDemoReading } from '@/lib/api';
import { Turnstile } from './Turnstile';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * 신년운세 캠페인의 ReadingForm.tsx보다 훨씬 가볍다 — 이름/사연/나이 확인이 없다(회원가입
 * 없는 "한 줄 티저" 스펙이라 개인 서사를 다루지 않음, 법적 민감도도 낮음). 생년월일(선택:
 * 시간)만 받아서 로컬로 계산하고, 계산된 천간/지지만 백엔드로 보낸다.
 */
export function DemoForm({ language, dict }: { language: MarketingLanguage; dict: MarketingDictionary['demo'] }) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [timeKnown, setTimeKnown] = useState(false);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('0');
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teaser, setTeaser] = useState<string | null>(null);

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

    setIsSubmitting(true);
    try {
      const hourNum = timeKnown && hour !== '' ? Number(hour) : undefined;
      const chart = calculateSaju({
        calendarType: 'solar',
        year: yearNum,
        month: monthNum,
        day: dayNum,
        hour: hourNum,
        minute: hourNum !== undefined ? Number(minute) : undefined,
      });

      const result = await getDemoReading({
        language,
        yearPillar: chart.yearPillar,
        monthPillar: chart.monthPillar,
        dayPillar: chart.dayPillar,
        hourPillar: chart.hourPillar,
        turnstileToken,
      });

      setTeaser(result.teaser);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(dict.errors.rateLimited);
      } else {
        setError(dict.errors.generic);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (teaser) {
    return (
      <div className="card-surface flex flex-col gap-4 rounded-2xl border border-accent/20 p-6 sm:p-7">
        <h3 className="text-xs font-semibold tracking-wide text-accent uppercase">{dict.resultTitle}</h3>
        <p className="text-lg leading-relaxed">{teaser}</p>
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
          onClick={() => setTeaser(null)}
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

      <div>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input type="checkbox" checked={!timeKnown} onChange={(e) => setTimeKnown(!e.target.checked)} className="accent-accent" />
          {dict.timeUnknownLabel}
        </label>
        {timeKnown && (
          <div className="mt-2 flex gap-1.5 sm:gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder={dict.hourLabel}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              min={0}
              max={23}
              className="w-16 min-w-0 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent sm:w-20 sm:px-3"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder={dict.minuteLabel}
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              min={0}
              max={59}
              className="w-16 min-w-0 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent sm:w-20 sm:px-3"
            />
          </div>
        )}
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
