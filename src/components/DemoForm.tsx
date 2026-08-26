'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { MarketingLanguage } from '@/lib/languages';
import { calculateSaju } from '@/lib/saju';
import { isOldEnough } from '@/lib/age';
import { ApiError, getDemoReading, type DemoReadingResponse } from '@/lib/api';
import { Turnstile, TURNSTILE_ENABLED } from './Turnstile';
import { AppDownloadLinks } from './AppDownloadLinks';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * 신년운세 캠페인의 ReadingForm.tsx보다 가볍다 — 이름/사연은 받지 않는다. 생년월일은 로컬에서
 * 사주를 계산하고, 만 16세 확인용 양력 년/월/일도 서버로 보낸다(저장되지 않음). 결과는 실제
 * 앱의 무료 티어 편지와 완전히 같은 구성(hook+interpretation+closing)이라 출생 시간은 결과에
 * 전혀 영향을 주지 않는다(2026-08-22 개편 — 그래서 출생 시간 입력 자체를 없앴다, 예전엔
 * hourPillar를 받았지만 그 값은 무료 티어 화면에 아예 반영되지 않는 프리미엄 전용 보너스에만
 * 쓰이던 값이었다).
 */
export function DemoForm({
  language,
  dict,
  appLinksDict,
}: {
  language: MarketingLanguage;
  dict: MarketingDictionary['demo'];
  appLinksDict: MarketingDictionary['appLinks'];
}) {
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
    if (TURNSTILE_ENABLED && !turnstileToken) {
      // 보안 위젯이 아직 토큰을 발급하기 전에 제출 버튼(또는 Enter 키)으로 넘어온 경우 — 버튼
      // disabled 조건이 정상 동작하면 거의 발생하지 않지만, 이 요청은 서버가 어차피 403으로
      // 거부할 게 확실하므로 API를 호출하지 않고 조용히 막는다.
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
      <div className="letter-surface flex flex-col gap-4 rounded-sm p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <Image
            src="/dain-portrait.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-foreground/15 bg-[#F3EBDC] object-cover"
          />
          <div className="min-w-0 text-left">
            <div className="text-sm font-semibold text-foreground">{dict.resultFromName}</div>
            <div className="text-xs text-foreground/55">{dict.resultFromRole}</div>
          </div>
        </div>
        <h3 className="text-xs font-semibold tracking-wide text-accent-warm uppercase">{dict.resultTitle}</h3>
        <div className="flex flex-col gap-3 text-lg leading-relaxed">
          <p className="font-medium">{result.hook}</p>
          <p>{result.interpretation}</p>
          <p className="text-foreground/70 italic">{result.closing}</p>
        </div>
        <div className="mt-2 flex flex-col items-center gap-3">
          <p className="text-center text-sm font-medium text-foreground/70">{dict.resultCta}</p>
          <AppDownloadLinks dict={appLinksDict} emphasized />
        </div>
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
    <form onSubmit={handleSubmit} className="letter-surface flex flex-col gap-5 rounded-sm p-6 sm:p-7">
      <div>
        <span className="mb-1.5 block text-sm font-medium">{dict.dateLabel}</span>
        {/* 예전엔 각 입력칸을 고정폭(w-20/w-16 등)으로 줘서 카드 폭 전체를 못 채우고 왼쪽에만
         * 몰려 붙어 보였다(2026-08-26, 사용자가 "생년월일 입력이 좌측으로 치우쳐보인다"고 지적해
         * 발견) — flex-1로 바꿔 세 칸이 카드 폭을 균등하게 나눠 쓰도록 고쳤다. */}
        <div className="flex gap-1.5 sm:gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={dict.yearLabel}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent-warm sm:px-3"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={dict.monthLabel}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            min={1}
            max={12}
            className="min-w-0 flex-1 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent-warm sm:px-3"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={dict.dayLabel}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            min={1}
            max={31}
            className="min-w-0 flex-1 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent-warm sm:px-3"
          />
        </div>
      </div>

      <Turnstile onVerify={setTurnstileToken} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || (TURNSTILE_ENABLED && !turnstileToken)}
        className="rounded-full bg-accent-warm px-6 py-3 font-medium text-white transition hover:bg-accent-warm/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? dict.submitting : dict.submitButton}
      </button>
    </form>
  );
}
