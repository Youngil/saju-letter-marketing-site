'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { MarketingLanguage } from '@/lib/languages';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { CompatViewCopy } from '@/content/compatContent';
import { COMPAT_NAME_LINES, type CompatNameLines } from '@/content/compatNameLines';
import type { InviteView } from '@/lib/compatApi';
import { logCompatEvent, submitGuestInvite } from '@/lib/compatApi';
import { isOldEnough } from '@/lib/age';
import { Turnstile, TURNSTILE_ENABLED, type TurnstileHandle } from '../Turnstile';
import { AppDownloadLinks } from '../AppDownloadLinks';
import { trackEvent } from '@/lib/analytics';
import { mapPublicFormError } from '@/lib/publicForm';
import { birthYearOptions } from '@/lib/birthDate';

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * 사주 계산 라이브러리(lunar-javascript, 수백 KB)는 필요할 때만 받는다(2026-10-06 전체 점검 3차, DemoForm과 같은 방식) —
 * 예전엔 정적 import라 궁합 링크 첫 화면 JS에 통째로 실렸다. 음력을 고르는 순간(윤달 판정) 또는 제출할 때 받는다.
 */
type SajuModule = typeof import('@/lib/saju');
let sajuModulePromise: Promise<SajuModule> | null = null;
function loadSaju(): Promise<SajuModule> {
  sajuModulePromise ??= import('@/lib/saju').catch((error: unknown) => {
    sajuModulePromise = null; // 청크 로드 실패는 다음 시도에서 다시 받는다.
    throw error;
  });
  return sajuModulePromise;
}

/**
 * saju-letter-backend/public/compat.js + guest-day-master.js를 포팅한 클라이언트 컴포넌트
 * (2026-08-12). 서버 컴포넌트(page.tsx)가 이미 한 번 fetch한 초기 상태를 prop으로 받아
 * 첫 렌더부터 로딩 깜빡임 없이 보여준다 — 옛 페이지는 항상 "불러오는 중…"을 먼저 그렸지만
 * 이제 그럴 필요가 없다. 인터랙션(폼 제출)이 필요한 부분만 이 컴포넌트가 담당한다.
 *
 * 문구: 서버 페이지가 현재 언어의 **문자열 필드만**(`pickCompatViewCopy` → `copy`) 넘기고, 이름이 들어가는 함수 두 줄은
 * 이 컴포넌트가 작은 `COMPAT_NAME_LINES`에서 `language`로 고른다(2026-10-06 전체 점검 9차 — 예전엔 6개 언어 전체
 * `COMPAT_CONTENT`·`DISCLAIMER_CONTENT`를 직접 import해 번들에 통째로 실렸다). `CompatContent` 객체를 통째로 prop으로
 * 넘기면 함수 필드(`pairLine`, `og.completed.titleFor`)가 RSC 경계를 못 건너 항상 크래시한다(2026-09-02 사용자 리포트:
 * "Functions cannot be passed directly to Client Components").
 *
 * **2026-10-02 다인의 편지 세계로 재구성** — 흰 카드 위 일반 웹 폼이라 앱을 모르는 친구에게 이 서비스가
 * 무엇인지 전혀 전달되지 않았고(이 페이지가 앱보다 더 많은 사람의 첫인상이다), 누가 보냈는지도 안 보였다.
 * 이제 대기·결과 모두 다인의 편지 한 장(`LetterSheet`)이고, 대기 제목에 보낸 사람 이름, 날짜는 선택형,
 * 결과 뒤에는 앱에서 할 수 있는 일(매일 편지 + 누구에게나 궁합 편지)을 먼저 말하고 설치로 잇는다.
 */
/** 화면 안 하위 컴포넌트가 쓰는 문구 — 서버가 넘긴 문자열 + 클라이언트가 고른 이름 줄 함수. */
type CompatViewContent = CompatViewCopy & CompatNameLines;

export function CompatView({
  token,
  language,
  copy,
  initialView,
  appLinksDict,
  currentYear,
}: {
  token: string;
  language: MarketingLanguage;
  /** 현재 언어의 문자열 문구(`pickCompatViewCopy`) — 함수 필드 없음. */
  copy: CompatViewCopy;
  initialView: InviteView;
  appLinksDict: MarketingDictionary['appLinks'];
  /** 연도 목록 기준 — 서버 페이지가 정해 넘긴다(모듈에서 계산하면 서버·브라우저 값이 갈려 하이드레이션이 어긋났다). */
  currentYear: number;
}) {
  const content = useMemo<CompatViewContent>(() => ({ ...copy, ...COMPAT_NAME_LINES[language] }), [copy, language]);
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
        currentYear={currentYear}
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
function LetterSheet({ content, children }: { content: CompatViewContent; children: ReactNode }) {
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
  content: CompatViewContent;
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
              <p className="text-xs text-foreground/50">{content.disclaimerShort}</p>
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
  currentYear,
}: {
  token: string;
  language: MarketingLanguage;
  content: CompatViewContent;
  requesterName: string | null;
  onSubmitted: (view: InviteView) => void;
  currentYear: number;
}) {
  const yearOptions = useMemo(() => birthYearOptions(currentYear), [currentYear]);
  const [name, setName] = useState('');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  // 음력을 고르면 받아 두는 사주 모듈 — 윤달 판정(getLunarLeapMonth)에 쓴다. 받기 전엔 윤달 체크박스를 그리지 않는다.
  const [saju, setSaju] = useState<SajuModule | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (y === null || m === null || !saju) return false;
    return saju.getLunarLeapMonth(y) === m;
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
    if (next === 'lunar' && !saju) {
      // 받지 못하면 윤달 체크박스가 끝내 안 나타나므로 조용히 넘기지 않고 새로고침을 안내한다(2026-10-06 전체 점검 3차).
      loadSaju().then(
        (mod) => {
          setSaju(mod);
          setError((prev) => (prev === content.loadError ? null : prev));
        },
        (loadFailure: unknown) => {
          console.warn('saju module load failed', loadFailure);
          setError(content.loadError);
        },
      );
    }
    // 양력으로 돌아가면 음력 모듈이 필요 없다 — 받기 실패 안내가 남아 있으면 지운다(2026-10-06 전체 점검 3차 후속).
    if (next === 'solar') setError((prev) => (prev === content.loadError ? null : prev));
    clearLeapHint();
    setCalendarType(next);
    setIsLeapMonth((prev) => (canBeLeapMonth(next, year, month) ? prev : false));
    clampDay(next, year, month);
  }

  function handleYearChange(nextYear: string) {
    clearLeapHint();
    setYear(nextYear);
    setIsLeapMonth((prev) => (canBeLeapMonth(calendarType, nextYear, month) ? prev : false));
    clampDay(calendarType, nextYear, month);
  }

  function handleMonthChange(nextMonth: string) {
    clearLeapHint();
    setMonth(nextMonth);
    setIsLeapMonth((prev) => (canBeLeapMonth(calendarType, year, nextMonth) ? prev : false));
    clampDay(calendarType, year, nextMonth);
  }

  function handleDayChange(nextDay: string) {
    clearLeapHint();
    setDay(nextDay);
  }

  const dayOptions = Array.from({ length: maxDayFor(calendarType, year, month) }, (_, i) => i + 1);
  // 윤달 체크박스는 그해 윤달인 달에만(2026-10-06 전체 점검 3차) — 예전엔 음력이면 늘 보여, 윤달이 없는 달에 체크하면
  // 사주 계산이 예외를 던져 일반 계산 오류만 떴다. 제출 값도 지금 해당될 때만 true로 보낸다.
  const leapMonthApplies = canBeLeapMonth(calendarType, year, month);

  // "윤달인지 확인해 주세요" 안내가 뜨면 방금 나타난 윤달 체크박스로 초점을 옮긴다(접근성, 2026-10-06 전체 점검 3차 후속) —
  // 안내 문단만 읽히고 무엇을 확인해야 하는지 화면 낭독기 사용자가 찾아 헤매지 않게.
  // 옮기는 건 handleSubmit이 안내를 띄운 직후 **한 번만**(2026-10-06 전체 점검 5차) — 예전엔 "안내가 떠 있고 윤달인 달"이면
  // 언제든 다시 옮겨, 안내가 남은 채 연·월을 바꿔 윤달 여부가 뒤집힐 때마다 고르던 목록에서 초점을 빼앗았다. 날짜·양음력을
  // 바꾸면 안내 자체도 지운다(그 날짜에 대한 안내였다).
  const leapCheckboxRef = useRef<HTMLInputElement>(null);
  const focusLeapCheckboxPending = useRef(false);
  const showingLeapHint = error === content.leapMonthCheckHint;
  useEffect(() => {
    if (!focusLeapCheckboxPending.current || !showingLeapHint || !leapMonthApplies) return;
    focusLeapCheckboxPending.current = false;
    leapCheckboxRef.current?.focus();
  }, [showingLeapHint, leapMonthApplies]);

  function clearLeapHint() {
    focusLeapCheckboxPending.current = false;
    setError((prev) => (prev === content.leapMonthCheckHint ? null : prev));
  }

  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 같은 프레임의 두 번째 탭은 아직 isSubmitting(state)을 못 본다 — 동기적으로 막는 잠금(2026-10-06 전체 점검 3차).
  // 예전엔 모듈을 받는 await 뒤에야 제출 중 표시를 켜, 두 번 누르면 1회용 Turnstile 토큰으로 두 번 보내졌고
  // 두 번째 403이 진행 중인 첫 제출의 화면을 되돌렸다.
  const submittingRef = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;

    const trimmedName = name.trim();
    const yearNum = Number(year);
    const monthNum = Number(month);
    const dayNum = Number(day);

    if (!trimmedName || !year || !month || !day || !Number.isInteger(yearNum) || !Number.isInteger(monthNum) || !Number.isInteger(dayNum)) {
      setError(content.formError);
      return;
    }
    if (TURNSTILE_ENABLED && !turnstileToken) return;

    // 모듈을 받기 전부터 제출 중으로 — 아래의 모든 조기 return은 finally가 풀어 준다.
    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);
    focusLeapCheckboxPending.current = false;
    try {
      let sajuModule = saju;
      if (!sajuModule) {
        try {
          sajuModule = await loadSaju();
        } catch (loadFailure) {
          console.warn('saju module load failed', loadFailure);
          setError(content.loadError);
          return;
        }
        setSaju(sajuModule);
        // 모듈이 이제 막 도착해 윤달 체크박스를 한 번도 못 본 상태 — 고른 달이 그해 윤달인 달이면 평달로 계산해
        // 보내지 말고 멈춰서, 나타난 체크박스를 확인하게 한다(다시 누르면 그대로 진행된다).
        let leapMonth: number | null = null;
        try {
          leapMonth = calendarType === 'lunar' ? sajuModule.getLunarLeapMonth(yearNum) : null;
        } catch {
          // 판정이 안 되는 연도면 아래 계산이 calcError로 안내한다.
        }
        if (leapMonth === monthNum) {
          focusLeapCheckboxPending.current = true;
          setError(content.leapMonthCheckHint);
          return;
        }
      }

      let chart;
      let solar;
      try {
        // 모듈이 방금 도착했다면 leapMonthApplies·isLeapMonth 둘 다 false — 위에서 윤달인 달은 이미 멈췄으니 평달이 맞다.
        const input = { calendarType, year: yearNum, month: monthNum, day: dayNum, isLeapMonth: isLeapMonth && leapMonthApplies };
        chart = sajuModule.calculateSaju(input);
        solar = sajuModule.resolveSolarBirthDate(input);
      } catch {
        setError(content.calcError);
        return;
      }
      if (!isOldEnough(solar.year, solar.month, solar.day)) {
        setError(content.underageError);
        return;
      }

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
      // 429는 따로 안내하지 않는다(rateLimited 없음 → submitError).
      setError(mapPublicFormError(err, { underage: content.underageError, date: content.formError, generic: content.submitError }));
      // Turnstile 토큰은 1회용이라 실패한 시도의 토큰을 그대로 두면 재제출도 막힌다(2026-09-03).
      setTurnstileToken(undefined);
      turnstileRef.current?.reset();
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-xs tracking-wide text-foreground/55">{content.aboutLine}</p>
      {/* action은 토큰 없는 주소로(2026-10-07 전체 점검 7차) — 없으면 브라우저가 현재 주소(`/xx/compat/<토큰>`)를 action으로
          보고, GA4 향상된 측정의 "양식 상호작용"이 그 주소를 form_destination으로 보내 pageLocation.ts 다듬기를 우회한다.
          제출은 항상 onSubmit이 막으므로 하이드레이션 전에 눌렸을 때만 쓰인다(루트 → 미들웨어가 홈으로). */}
      <form onSubmit={handleSubmit} action="/" className={SHEET_CLASS}>
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
            <DateSelect id="guest-year" label={content.yearLabel} value={year} onChange={handleYearChange} options={yearOptions} />
            <DateSelect id="guest-month" label={content.monthLabel} value={month} onChange={handleMonthChange} options={MONTH_OPTIONS} />
            <DateSelect id="guest-day" label={content.dayLabel} value={day} onChange={handleDayChange} options={dayOptions} />
          </div>

          {leapMonthApplies && (
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              <input
                ref={leapCheckboxRef}
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)}
                className="accent-accent-warm"
              />
              {content.leapMonthLabel}
            </label>
          )}

          <Turnstile ref={turnstileRef} onVerify={setTurnstileToken} />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

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
