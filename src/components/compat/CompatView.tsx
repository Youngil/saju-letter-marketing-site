'use client';

import { useEffect, useState } from 'react';
import type { MarketingLanguage } from '@/lib/languages';
import type { CompatContent } from '@/content/compatContent';
import type { InviteView } from '@/lib/compatApi';
import { logCompatEvent, submitGuestInvite } from '@/lib/compatApi';
import { ApiError } from '@/lib/apiClient';
import { calculateSaju, resolveSolarBirthDate } from '@/lib/saju';
import { isOldEnough } from '@/lib/age';
import { Turnstile, TURNSTILE_ENABLED } from '../Turnstile';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * saju-letter-backend/public/compat.js + guest-day-master.js를 포팅한 클라이언트 컴포넌트
 * (2026-08-12). 서버 컴포넌트(page.tsx)가 이미 한 번 fetch한 초기 상태를 prop으로 받아
 * 첫 렌더부터 로딩 깜빡임 없이 보여준다 — 옛 페이지는 항상 "불러오는 중…"을 먼저 그렸지만
 * 이제 그럴 필요가 없다. 인터랙션(폼 제출)이 필요한 부분만 이 컴포넌트가 담당한다.
 */
export function CompatView({
  token,
  language,
  initialView,
  content,
}: {
  token: string;
  language: MarketingLanguage;
  initialView: InviteView;
  content: CompatContent;
}) {
  const [view, setView] = useState<InviteView>(initialView);

  useEffect(() => {
    if (view.status === 'completed') {
      logCompatEvent(token, 'result_viewed', 'guest');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.status]);

  if (view.status === 'not_found') {
    return <p className="text-red-600">{content.notFound}</p>;
  }
  if (view.status === 'expired') {
    return <p className="text-red-600">{content.expired}</p>;
  }
  if (view.status === 'pending') {
    return <PendingForm token={token} language={language} content={content} onSubmitted={setView} />;
  }

  return <CompletedResult content={content} guestName={view.guestName} reading={view.reading} token={token} />;
}

function CompletedResult({
  content,
  guestName,
  reading,
  token,
}: {
  content: CompatContent;
  guestName: string | null;
  reading: { title: string; body: string } | null;
  token: string;
}) {
  return (
    <div className="card-surface flex flex-col gap-4 rounded-2xl border border-foreground/10 p-6 sm:p-7">
      <p className="text-sm font-medium text-accent">{content.pairLine(guestName)}</p>
      {reading ? (
        <>
          <h1 className="text-xl font-semibold">{reading.title}</h1>
          <p className="text-foreground/80">{reading.body}</p>
        </>
      ) : (
        <p className="text-foreground/60">{content.loading}</p>
      )}
      <a
        href={process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => logCompatEvent(token, 'install_cta_clicked', 'guest')}
        className="mt-2 rounded-full bg-accent px-6 py-3 text-center font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
      >
        {content.cta}
      </a>
    </div>
  );
}

function PendingForm({
  token,
  language,
  content,
  onSubmitted,
}: {
  token: string;
  language: MarketingLanguage;
  content: CompatContent;
  onSubmitted: (view: InviteView) => void;
}) {
  const [name, setName] = useState('');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const yearNum = Number(year);
    const monthNum = Number(month);
    const dayNum = Number(day);

    if (!trimmedName || !Number.isInteger(yearNum) || !Number.isInteger(monthNum) || !Number.isInteger(dayNum)) {
      setError(content.formError);
      return;
    }

    let chart;
    let solar;
    try {
      const input = { calendarType, year: yearNum, month: monthNum, day: dayNum, isLeapMonth };
      chart = calculateSaju(input);
      solar = resolveSolarBirthDate(input);
    } catch {
      setError(content.calcError);
      return;
    }
    if (!isOldEnough(solar.year, solar.month, solar.day)) {
      setError(content.underageError);
      return;
    }
    if (TURNSTILE_ENABLED && !turnstileToken) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const result = await submitGuestInvite(token, {
        name: trimmedName,
        dayMaster: chart.dayPillar.stem,
        language,
        yearStem: chart.yearPillar.stem,
        yearBranch: chart.yearPillar.branch,
        monthStem: chart.monthPillar.stem,
        monthBranch: chart.monthPillar.branch,
        dayBranch: chart.dayPillar.branch,
        birthYear: solar.year,
        birthMonth: solar.month,
        birthDay: solar.day,
        turnstileToken,
      });
      if (result.status === 'ok') {
        onSubmitted({ status: 'completed', guestName: result.guestName, reading: result.reading });
      } else if (result.status === 'expired') {
        onSubmitted({ status: 'expired' });
      } else {
        onSubmitted({ status: 'not_found' });
      }
    } catch (err) {
      if (err instanceof ApiError && (err.reason === 'underage' || err.reason === 'birth_date_required')) {
        setError(err.reason === 'underage' ? content.underageError : content.formError);
      } else {
        setError(content.submitError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface flex flex-col gap-5 rounded-2xl border border-foreground/10 p-6 sm:p-7">
      <div>
        <h1 className="text-xl font-semibold">{content.pendingTitle}</h1>
        <p className="mt-1 text-sm text-foreground/70">{content.pendingIntro}</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="guest-name">
          {content.nameLabel}
        </label>
        <input
          id="guest-name"
          type="text"
          maxLength={60}
          placeholder={content.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-foreground/15 bg-white px-3 py-2.5 transition focus-visible:border-accent"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={calendarType === 'solar'}
          onClick={() => setCalendarType('solar')}
          className={`rounded-full border px-4 py-1.5 text-sm ${calendarType === 'solar' ? 'border-accent bg-accent text-white' : 'border-foreground/15 text-foreground/70'}`}
        >
          {content.calendarSolar}
        </button>
        <button
          type="button"
          aria-pressed={calendarType === 'lunar'}
          onClick={() => setCalendarType('lunar')}
          className={`rounded-full border px-4 py-1.5 text-sm ${calendarType === 'lunar' ? 'border-accent bg-accent text-white' : 'border-foreground/15 text-foreground/70'}`}
        >
          {content.calendarLunar}
        </button>
      </div>

      <div className="flex gap-1.5 sm:gap-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder={content.yearLabel}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={1900}
          max={CURRENT_YEAR}
          className="w-20 min-w-0 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent sm:w-24 sm:px-3"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder={content.monthLabel}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          min={1}
          max={12}
          className="w-16 min-w-0 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent sm:w-20 sm:px-3"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder={content.dayLabel}
          value={day}
          onChange={(e) => setDay(e.target.value)}
          min={1}
          max={31}
          className="w-16 min-w-0 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent sm:w-20 sm:px-3"
        />
      </div>

      {calendarType === 'lunar' && (
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input type="checkbox" checked={isLeapMonth} onChange={(e) => setIsLeapMonth(e.target.checked)} className="accent-accent" />
          {content.leapMonthLabel}
        </label>
      )}

      <Turnstile onVerify={setTurnstileToken} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || (TURNSTILE_ENABLED && !turnstileToken)}
        className="rounded-full bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
      >
        {isSubmitting ? content.submitting : content.submit}
      </button>
    </form>
  );
}

