'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { MarketingLanguage } from '@/lib/languages';
import type { MarketingDictionary } from '@/dictionaries/types';
import { COMPAT_CONTENT, type CompatContent } from '@/content/compatContent';
import type { InviteView } from '@/lib/compatApi';
import { logCompatEvent, submitGuestInvite } from '@/lib/compatApi';
import { ApiError } from '@/lib/apiClient';
import { DISCLAIMER_CONTENT } from '@/content/disclaimer';
import { calculateSaju, getLunarLeapMonth, resolveSolarBirthDate } from '@/lib/saju';
import { isOldEnough } from '@/lib/age';
import { Turnstile, TURNSTILE_ENABLED, type TurnstileHandle } from '../Turnstile';
import { AppDownloadLinks } from '../AppDownloadLinks';
import { trackEvent } from '@/lib/analytics';

const CURRENT_YEAR = new Date().getFullYear();
/** 선택형 연도 목록 — 만 16세 미만은 어차피 막히지만(isOldEnough) 목록에서 미리 빼 두면 고르기 쉽다. */
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 16 - 1920 + 1 }, (_, i) => CURRENT_YEAR - 16 - i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

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
 * 무관하게) 크래시했다.
 *
 * **2026-10-02 다인의 편지 세계로 재구성** — 흰 카드 위 일반 웹 폼이라 앱을 모르는 친구에게 이 서비스가
 * 무엇인지 전혀 전달되지 않았고(이 페이지가 앱보다 더 많은 사람의 첫인상이다), 누가 보냈는지도 안 보였다.
 * 이제 대기·결과 모두 다인의 편지 한 장(`LetterSheet`)이고, 대기 제목에 보낸 사람 이름, 날짜는 선택형,
 * 결과 뒤에는 앱에서 할 수 있는 일(매일 편지 + 누구에게나 궁합 편지)을 먼저 말하고 설치로 잇는다.
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
      // GA4에도 함께 남긴다(2026-09-07) — 토큰은 넣지 않는다(평문 식별자를 애널리틱스에 남기지 않는 원칙).
      trackEvent('compat_result_view', { language });
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
    return (
      <PendingForm
        token={token}
        language={language}
        content={content}
        requesterName={view.requesterName ?? null}
        onSubmitted={setView}
      />
    );
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

/** 다인이 보낸 편지 한 장 — 발신자 줄 + 종이 면. 대기 폼과 결과가 같은 셸을 쓴다. */
function LetterSheet({ content, children }: { content: CompatContent; children: ReactNode }) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
        <Image
          src="/dain-portrait.png"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded-full border border-foreground/15 bg-[#F3EBDC] object-cover"
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold">{content.fromName}</div>
          <div className="text-xs text-foreground/55">{content.fromRole}</div>
        </div>
      </div>
      {children}
    </>
  );
}

const SHEET_CLASS = 'letter-surface flex flex-col gap-5 rounded-sm p-6 sm:p-8';

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
    <div className="flex flex-col gap-6">
      <div className={SHEET_CLASS}>
        <LetterSheet content={content}>
          {/* 이 화면은 항상 게스트만 보므로 보낸 회원의 이름을 쓴다(2026-09-02). 사람 이름 줄은 붉은 계열을
              피한다(이름에 붉은 색은 금기) — 중립 색 유지. */}
          <p className="text-sm font-medium text-foreground/70">{content.pairLine(requesterName)}</p>
          {reading ? (
            <>
              <h1 className="font-display text-2xl leading-snug text-balance">{reading.title}</h1>
              <p className="whitespace-pre-line leading-relaxed text-foreground/85">{reading.body}</p>
              <p className="self-end font-display text-lg">{content.signature}</p>
              <p className="text-xs text-foreground/50">{DISCLAIMER_CONTENT[language].short}</p>
            </>
          ) : (
            <p className="text-foreground/60">{content.loading}</p>
          )}
        </LetterSheet>
      </div>

      {/* 결과 다음의 고리 — 예전엔 작은 한 줄 + 배지뿐이라 입소문이 여기서 끝났다. */}
      <section className="flex flex-col items-center gap-3 rounded-sm border border-accent-warm/30 bg-accent-warm-soft/60 p-6 text-center">
        <h2 className="font-display text-xl text-balance">{content.ctaTitle}</h2>
        <p className="max-w-[46ch] text-sm leading-relaxed text-foreground/75">{content.ctaBody}</p>
        <AppDownloadLinks
          dict={appLinksDict}
          language={language}
          onAndroidClick={logInstallClick}
          onIosClick={logInstallClick}
          emphasized
          context="compat_result"
        />
      </section>
    </div>
  );
}

function PendingForm({
  token,
  language,
  content,
  requesterName,
  onSubmitted,
}: {
  token: string;
  language: MarketingLanguage;
  content: CompatContent;
  requesterName: string | null;
  onSubmitted: (view: InviteView) => void;
}) {
  const [name, setName] = useState('');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  // 연/월/양음력 변경 시 isLeapMonth를 리셋한다(2026-09-04) — 윤달 선택 후 다른 월/연도로 바꿔도 내부
  // 상태가 남아 존재하지 않는 (연,월,윤달) 조합으로 제출이 계속 실패하던 문제.
  function parseIntOrNull(value: string): number | null {
    if (value.trim() === '') return null;
    const n = Number(value);
    return Number.isInteger(n) ? n : null;
  }

  function canBeLeapMonth(nextCalendarType: 'solar' | 'lunar', yearStr: string, monthStr: string): boolean {
    if (nextCalendarType !== 'lunar') return false;
    const y = parseIntOrNull(yearStr);
    const m = parseIntOrNull(monthStr);
    if (y === null || m === null) return false;
    return getLunarLeapMonth(y) === m;
  }

  // 일 목록은 고른 달의 날 수만큼(음력은 최대 30일). 고른 날이 그 달에 없으면(31일 → 2월) 비운다.
  function maxDayFor(nextCalendarType: 'solar' | 'lunar', yearStr: string, monthStr: string): number {
    if (nextCalendarType === 'lunar') return 30;
    const y = parseIntOrNull(yearStr);
    const m = parseIntOrNull(monthStr);
    return y !== null && m !== null ? new Date(y, m, 0).getDate() : 31;
  }

  function clampDay(nextCalendarType: 'solar' | 'lunar', yearStr: string, monthStr: string) {
    setDay((prev) => (prev && Number(prev) > maxDayFor(nextCalendarType, yearStr, monthStr) ? '' : prev));
  }

  function handleCalendarTypeChange(next: 'solar' | 'lunar') {
    setCalendarType(next);
    setIsLeapMonth((prev) => (canBeLeapMonth(next, year, month) ? prev : false));
    clampDay(next, year, month);
  }

  function handleYearChange(nextYear: string) {
    setYear(nextYear);
    setIsLeapMonth((prev) => (canBeLeapMonth(calendarType, nextYear, month) ? prev : false));
    clampDay(calendarType, nextYear, month);
  }

  function handleMonthChange(nextMonth: string) {
    setMonth(nextMonth);
    setIsLeapMonth((prev) => (canBeLeapMonth(calendarType, year, nextMonth) ? prev : false));
    clampDay(calendarType, year, nextMonth);
  }

  const dayOptions = Array.from({ length: maxDayFor(calendarType, year, month) }, (_, i) => i + 1);

  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const yearNum = Number(year);
    const monthNum = Number(month);
    const dayNum = Number(day);

    if (!trimmedName || !year || !month || !day || !Number.isInteger(yearNum) || !Number.isInteger(monthNum) || !Number.isInteger(dayNum)) {
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
      // Turnstile 토큰은 1회용이라 실패한 시도의 토큰을 그대로 두면 재제출도 막힌다(2026-09-03).
      setTurnstileToken(undefined);
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-xs tracking-wide text-foreground/55">{content.aboutLine}</p>
      <form onSubmit={handleSubmit} className={SHEET_CLASS}>
        <LetterSheet content={content}>
          <div>
            {/* 누가 보냈는지를 제목에(2026-10-02) — 모르는 링크에 생년월일을 넣게 하는 화면이라 보낸 사람이
                가장 먼저 보여야 한다. 백엔드가 이름을 주지 않으면(구 백엔드) 일반 문구로 떨어진다. */}
            <h1 className="font-display text-2xl leading-snug text-balance">{content.pendingTitleFor(requesterName)}</h1>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{content.pendingIntroLetter}</p>
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
              onClick={() => handleCalendarTypeChange('solar')}
              className={`rounded-full border px-4 py-1.5 text-sm ${calendarType === 'solar' ? 'border-accent-warm bg-accent-warm text-white' : 'border-foreground/15 text-foreground/70'}`}
            >
              {content.calendarSolar}
            </button>
            <button
              type="button"
              aria-pressed={calendarType === 'lunar'}
              onClick={() => handleCalendarTypeChange('lunar')}
              className={`rounded-full border px-4 py-1.5 text-sm ${calendarType === 'lunar' ? 'border-accent-warm bg-accent-warm text-white' : 'border-foreground/15 text-foreground/70'}`}
            >
              {content.calendarLunar}
            </button>
          </div>

          {/* 연·월·일을 고르는 목록으로(2026-10-02) — 숫자 입력칸 셋은 휴대폰에서 키보드가 올라오며 화면이
              밀려 입력이 엉키기 쉬웠다. */}
          <div className="flex gap-1.5 sm:gap-2">
            <DateSelect id="guest-year" label={content.yearLabel} value={year} onChange={handleYearChange} options={YEAR_OPTIONS} />
            <DateSelect id="guest-month" label={content.monthLabel} value={month} onChange={handleMonthChange} options={MONTH_OPTIONS} />
            <DateSelect id="guest-day" label={content.dayLabel} value={day} onChange={setDay} options={dayOptions} />
          </div>

          {calendarType === 'lunar' && (
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              <input type="checkbox" checked={isLeapMonth} onChange={(e) => setIsLeapMonth(e.target.checked)} className="accent-accent-warm" />
              {content.leapMonthLabel}
            </label>
          )}

          <Turnstile ref={turnstileRef} onVerify={setTurnstileToken} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || (TURNSTILE_ENABLED && !turnstileToken)}
            className="rounded-full bg-accent-warm px-6 py-3 font-medium text-white transition hover:bg-accent-warm/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? content.submitting : content.submit}
          </button>
        </LetterSheet>
      </form>
    </div>
  );
}

function DateSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: number[];
}) {
  return (
    <select
      id={id}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`min-w-0 flex-1 rounded-lg border border-foreground/15 bg-white px-2 py-2.5 transition focus-visible:border-accent-warm sm:px-3 ${value ? '' : 'text-foreground/45'}`}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={String(option)}>
          {option}
        </option>
      ))}
    </select>
  );
}
