'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { MarketingLanguage } from '@/lib/languages';
import { isOldEnough } from '@/lib/age';
import { createReading, rememberReadingOwner, type ReadingContent } from '@/lib/lunarNewYearApi';
import { Turnstile, TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/Turnstile';
import { isValidBirthDate, parseBirthTime } from '@/lib/birthDate';
import { mapPublicFormError } from '@/lib/publicForm';
import { shouldShowCreatedResultInPlace } from '@/lib/readingOwner';

const MEMORABLE_EVENT_MAX_LENGTH = 300;

type LandingDict = NonNullable<MarketingDictionary['lunarNewYear']>['landing'];

export function ReadingForm({
  language,
  dict: t,
  offSeasonMessage,
  disclaimerShort,
}: {
  language: MarketingLanguage;
  dict: LandingDict;
  /** 제출 시점에 기간이 끝났다고 서버가 답하면(campaign_not_active) 보여 줄 문구. */
  offSeasonMessage: string;
  /** 결과 아래 면책 한 줄 — 서버가 현재 언어 문자열만 넘긴다(6개 언어 문구 객체를 번들에 싣지 않게). */
  disclaimerShort: string;
}) {
  const router = useRouter();
  const dateLabelId = useId();

  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [timeKnown, setTimeKnown] = useState(false);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('0');
  const [memorableEvent, setMemorableEvent] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** 위기 신호로 대체된 결과를 결과 페이지로 넘어가지 않고 이 자리에서 보여 줄 때(아래 handleSubmit 참고). */
  const [inPlaceCrisisResult, setInPlaceCrisisResult] = useState<ReadingContent | null>(null);
  const crisisHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (inPlaceCrisisResult) crisisHeadingRef.current?.focus();
  }, [inPlaceCrisisResult]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length === 0) {
      setError(t.errors.name);
      return;
    }
    const yearNum = Number(year);
    const monthNum = Number(month);
    const dayNum = Number(day);
    if (!isValidBirthDate(yearNum, monthNum, dayNum)) {
      setError(t.errors.date);
      return;
    }
    if (!isOldEnough(yearNum, monthNum, dayNum)) {
      setError(t.errors.underage);
      return;
    }
    // 시 0~23·분 0~59 정수만 — 예전엔 24시·75분이 사주 계산에서 예외가 나 일반 오류와 함께 1회용 Turnstile 토큰까지
    // 버려졌다(2026-10-06 전체 점검 3차).
    const birthTime = parseBirthTime(timeKnown, hour, minute);
    if (birthTime === 'invalid') {
      setError(t.errors.time);
      return;
    }
    if (memorableEvent.trim().length === 0 || memorableEvent.length > MEMORABLE_EVENT_MAX_LENGTH) {
      setError(t.errors.memorableEvent);
      return;
    }
    if (!ageConfirmed) {
      setError(t.errors.age);
      return;
    }

    setIsSubmitting(true);
    try {
      // 사주 계산 라이브러리(lunar-javascript, 수백 KB)는 제출할 때만 받는다 — 랜딩 첫 화면 JS에서 뺐다(DemoForm과 같은 방식).
      const { assumedBirthTimeZone, calculateSaju } = await import('@/lib/saju');
      // 출생 타임존은 묻지 않는다 — ko는 Asia/Seoul, 그 외는 브라우저 타임존으로 가정(13차 F2). 년주·월주는 출생 순간의
      // 베이징 시각(절기 표 기준), 일주·시주는 서머타임을 뺀 현지 표준시로 계산한다.
      const chart = calculateSaju({
        calendarType: 'solar',
        year: yearNum,
        month: monthNum,
        day: dayNum,
        hour: birthTime.hour,
        minute: birthTime.minute,
        timeZone: assumedBirthTimeZone(language),
      });

      const result = await createReading({
        name: name.trim(),
        language,
        yearPillar: chart.yearPillar,
        monthPillar: chart.monthPillar,
        dayPillar: chart.dayPillar,
        hourPillar: chart.hourPillar,
        memorableEvent: memorableEvent.trim(),
        ageConfirmed,
        birthYear: yearNum,
        birthMonth: monthNum,
        birthDay: dayNum,
        turnstileToken,
      });

      // 위기 신호로 대체된 결과(도움 안내 글)는 결과 페이지로 넘어가지 않고 항상 이 자리에서 결과만 보여 준다(2026-10-07 전체
      // 점검 12차) — 그 페이지는 소유자 쿠키가 있어야 위기 대체 결과로 알아보는데, 쿠키를 막은 브라우저에선 쿠키 저장 라우트가
      // 성공해도 쿠키가 없어 공개 화면(공유 버튼·앱 안내·"나도 해 보기")으로 그려졌다. 구독할 수 없는 결과라 소유자 쿠키도 남기지 않는다.
      if (shouldShowCreatedResultInPlace(result.subscriptionAvailable)) {
        setInPlaceCrisisResult(result.content);
        return;
      }
      // 만든 사람만 메일 구독을 할 수 있게 소유자 토큰을 이 브라우저의 httpOnly 쿠키로 남긴 뒤 넘어간다(2026-10-07) —
      // 주소에는 절대 넣지 않는다(공유 링크·GA로 샌다). 저장에 실패해도 결과는 보여 준다(구독 폼만 안 보인다).
      if (result.ownerToken) await rememberReadingOwner(result.readingId, result.ownerToken);
      router.push(`/${language}/lunar-new-year/r/${result.readingId}`);
    } catch (err) {
      setError(
        mapPublicFormError(err, {
          underage: t.errors.underage,
          date: t.errors.date,
          rateLimited: t.errors.rateLimited,
          byReason: { campaign_not_active: offSeasonMessage },
          generic: t.errors.generic,
        }),
      );
      // Turnstile 토큰은 1회용이라, 실패한 시도에 쓰인 토큰을 그대로 두면 재제출도 항상 403으로
      // 막힌다(2026-09-03, 종합 버그 점검으로 발견) — 이 폼은 실패해도 언마운트되지 않으므로
      // 새 토큰을 명시적으로 요청한다.
      setTurnstileToken(undefined);
      turnstileRef.current?.reset();
      setIsSubmitting(false);
    }
  }

  if (inPlaceCrisisResult) {
    // 결과 페이지(r/[id])의 위기 대체 결과와 같은 모양 — 공유 버튼·앱 안내·메일 구독 없이 글과 면책 한 줄만.
    return (
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 ref={crisisHeadingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
          {inPlaceCrisisResult.title}
        </h2>
        <p className="mt-3 text-stone-700">{inPlaceCrisisResult.greeting}</p>
        <p className="mt-3 text-stone-700">{inPlaceCrisisResult.overview}</p>
        <p className="mt-3 text-stone-700">{inPlaceCrisisResult.highlight}</p>
        <p className="mt-4 text-sm text-stone-600">{inPlaceCrisisResult.closing}</p>
        <p className="mt-4 text-xs text-stone-500">{disclaimerShort}</p>
      </article>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="name">
          {t.nameLabel}
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          maxLength={60}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
        />
      </div>

      <div>
        {/* 세 칸은 자리표시자로만 이름이 붙어 있었다(2026-10-07) — 묶음 이름은 위 라벨, 칸마다 연/월/일 aria-label. */}
        <span id={dateLabelId} className="mb-1 block text-sm font-medium">
          {t.dateLabel}
        </span>
        {/* 고정폭(w-24/w-20)이라 카드 폭을 못 채우고 왼쪽에 몰려 붙어 보이던 것을 DemoForm.tsx/
         * CompatView.tsx와 같은 방식(flex-1 균등 분할)으로 맞췄다(2026-08-26). */}
        <div role="group" aria-labelledby={dateLabelId} className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={t.yearLabel}
            aria-label={t.yearLabel}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={t.monthLabel}
            aria-label={t.monthLabel}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            min={1}
            max={12}
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={t.dayLabel}
            aria-label={t.dayLabel}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            min={1}
            max={31}
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" checked={!timeKnown} onChange={(e) => setTimeKnown(!e.target.checked)} />
          {t.timeUnknownLabel}
        </label>
        {timeKnown && (
          <div role="group" aria-label={t.timeLabel} className="mt-2 flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder={t.hourLabel}
              aria-label={t.hourLabel}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              min={0}
              max={23}
              className="w-20 rounded-lg border border-stone-300 bg-white px-3 py-2"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder={t.minuteLabel}
              aria-label={t.minuteLabel}
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              min={0}
              max={59}
              className="w-20 rounded-lg border border-stone-300 bg-white px-3 py-2"
            />
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="memorableEvent">
          {t.memorableEventLabel}
        </label>
        <textarea
          id="memorableEvent"
          value={memorableEvent}
          onChange={(e) => setMemorableEvent(e.target.value)}
          placeholder={t.memorableEventPlaceholder}
          maxLength={MEMORABLE_EVENT_MAX_LENGTH}
          rows={2}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
        />
        <div className="mt-1 text-right text-xs text-stone-600">
          {memorableEvent.length}/{MEMORABLE_EVENT_MAX_LENGTH}
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-1" />
        <span>{t.ageConfirmLabel}</span>
      </label>
      <p className="text-xs text-stone-600">{t.consentPreviewNote}</p>

      <Turnstile ref={turnstileRef} onVerify={setTurnstileToken} />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || (TURNSTILE_ENABLED && !turnstileToken)}
        className="rounded-full bg-amber-800 px-6 py-3 font-medium text-white transition hover:bg-amber-900 disabled:opacity-50"
      >
        {isSubmitting ? t.submitting : t.submitButton}
      </button>
    </form>
  );
}
