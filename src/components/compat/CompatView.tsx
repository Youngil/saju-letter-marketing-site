'use client';

import { useEffect, useState } from 'react';
import type { MarketingLanguage } from '@/lib/languages';
import type { MarketingDictionary } from '@/dictionaries/types';
import { COMPAT_CONTENT, type CompatContent } from '@/content/compatContent';
import type { InviteView } from '@/lib/compatApi';
import { logCompatEvent, submitGuestInvite } from '@/lib/compatApi';
import { ApiError } from '@/lib/apiClient';
import { DISCLAIMER_CONTENT } from '@/content/disclaimer';
import { calculateSaju, resolveSolarBirthDate } from '@/lib/saju';
import { isOldEnough } from '@/lib/age';
import { Turnstile, TURNSTILE_ENABLED } from '../Turnstile';
import { AppDownloadLinks } from '../AppDownloadLinks';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * saju-letter-backend/public/compat.js + guest-day-master.js를 포팅한 클라이언트 컴포넌트
 * (2026-08-12). 서버 컴포넌트(page.tsx)가 이미 한 번 fetch한 초기 상태를 prop으로 받아
 * 첫 렌더부터 로딩 깜빡임 없이 보여준다 — 옛 페이지는 항상 "불러오는 중…"을 먼저 그렸지만
 * 이제 그럴 필요가 없다. 인터랙션(폼 제출)이 필요한 부분만 이 컴포넌트가 담당한다.
 *
 * `content`(COMPAT_CONTENT[language])는 서버 컴포넌트로부터 prop으로 받지 않고 이 클라이언트
 * 컴포넌트가 직접 `COMPAT_CONTENT`를 import해 `language`(순수 문자열, 직렬화 가능)로 조회한다
 * (2026-09-02, 사용자 리포트: "Functions cannot be passed directly to Client Components" 런타임
 * 에러) — `CompatContent`에 함수 필드(`pairLine`, `og.completed.titleFor`)가 있어서, page.tsx가
 * 이 객체를 통째로 prop으로 넘기면 서버→클라이언트 RSC 경계를 함수가 못 건너가 항상(상태와
 * 무관하게) 크래시했다. `generateMetadata`(page.tsx, 완전히 서버 전용)는 이 함수들을 그 자리에서
 * 호출해 문자열 결과만 쓰므로 그대로 둬도 문제없다 — 이 컴포넌트 트리로 prop 전달되는 경로만
 * 문제였다.
 */
export function CompatView({
  token,
  language,
  initialView,
  appLinksDict,
}: {
  token: string;
  language: MarketingLanguage;
  initialView: InviteView;
  appLinksDict: MarketingDictionary['appLinks'];
}) {
  const content = COMPAT_CONTENT[language];
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

  return (
    <CompletedResult
      content={content}
      requesterName={view.requesterName}
      reading={view.reading}
      token={token}
      language={language}
      appLinksDict={appLinksDict}
    />
  );
}

function CompletedResult({
  content,
  requesterName,
  reading,
  token,
  language,
  appLinksDict,
}: {
  content: CompatContent;
  requesterName: string | null;
  reading: { title: string; body: string } | null;
  token: string;
  language: MarketingLanguage;
  appLinksDict: MarketingDictionary['appLinks'];
}) {
  const logInstallClick = () => logCompatEvent(token, 'install_cta_clicked', 'guest');

  return (
    <div className="card-surface flex flex-col gap-4 rounded-2xl border border-foreground/10 p-6 sm:p-7">
      {/* 이 화면은 항상 게스트(링크를 받은 친구)만 보므로, 상단엔 방금 자기가 입력한 이름이
          아니라 링크를 보낸 회원의 이름을 보여줘야 한다(2026-09-02, 사용자 리포트: "OOO님과의
          궁합에서 마케팅 사이트에서 입력한 이름이 출력된다"). */}
      <p className="text-sm font-medium text-accent-warm">{content.pairLine(requesterName)}</p>
      {reading ? (
        <>
          <h1 className="text-xl font-semibold">{reading.title}</h1>
          <p className="text-foreground/80">{reading.body}</p>
          <p className="text-xs text-foreground/50">{DISCLAIMER_CONTENT[language].short}</p>
        </>
      ) : (
        <p className="text-foreground/60">{content.loading}</p>
      )}
      <div className="mt-2 flex flex-col items-center gap-3">
        <p className="text-center text-sm font-medium text-foreground/70">{content.cta}</p>
        <AppDownloadLinks dict={appLinksDict} onAndroidClick={logInstallClick} onIosClick={logInstallClick} emphasized />
      </div>
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
        onSubmitted({ status: 'completed', guestName: result.guestName, requesterName: result.requesterName, reading: result.reading });
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
          className="w-full rounded-lg border border-foreground/15 bg-white px-3 py-2.5 transition focus-visible:border-accent-warm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={calendarType === 'solar'}
          onClick={() => setCalendarType('solar')}
          className={`rounded-full border px-4 py-1.5 text-sm ${calendarType === 'solar' ? 'border-accent-warm bg-accent-warm text-white' : 'border-foreground/15 text-foreground/70'}`}
        >
          {content.calendarSolar}
        </button>
        <button
          type="button"
          aria-pressed={calendarType === 'lunar'}
          onClick={() => setCalendarType('lunar')}
          className={`rounded-full border px-4 py-1.5 text-sm ${calendarType === 'lunar' ? 'border-accent-warm bg-accent-warm text-white' : 'border-foreground/15 text-foreground/70'}`}
        >
          {content.calendarLunar}
        </button>
      </div>

      {/* 예전엔 각 입력칸이 고정폭(w-20/w-16 등)이라 카드 폭 전체를 못 채우고 왼쪽에 몰려 붙어
       * 보였다(DemoForm.tsx와 같은 패턴이 복사돼 있었음, 2026-08-26 사용자 지적으로 함께 수정) —
       * flex-1로 바꿔 세 칸이 폭을 균등하게 나눠 쓰도록 고쳤다. */}
      <div className="flex gap-1.5 sm:gap-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder={content.yearLabel}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min={1900}
          max={CURRENT_YEAR}
          className="min-w-0 flex-1 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent-warm sm:px-3"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder={content.monthLabel}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          min={1}
          max={12}
          className="min-w-0 flex-1 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent-warm sm:px-3"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder={content.dayLabel}
          value={day}
          onChange={(e) => setDay(e.target.value)}
          min={1}
          max={31}
          className="min-w-0 flex-1 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent-warm sm:px-3"
        />
      </div>

      {calendarType === 'lunar' && (
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input type="checkbox" checked={isLeapMonth} onChange={(e) => setIsLeapMonth(e.target.checked)} className="accent-accent-warm" />
          {content.leapMonthLabel}
        </label>
      )}

      <Turnstile onVerify={setTurnstileToken} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || (TURNSTILE_ENABLED && !turnstileToken)}
        className="rounded-full bg-accent-warm px-6 py-3 font-medium text-white transition hover:bg-accent-warm/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? content.submitting : content.submit}
      </button>
    </form>
  );
}

