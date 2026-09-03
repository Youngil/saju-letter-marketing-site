'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { NonKoreanLanguage } from '@/lib/languages';
import { calculateSaju } from '@/lib/saju';
import { isOldEnough } from '@/lib/age';
import { createReading } from '@/lib/lunarNewYearApi';
import { ApiError } from '@/lib/apiClient';
import { Turnstile, TURNSTILE_ENABLED, type TurnstileHandle } from '@/components/Turnstile';

const MEMORABLE_EVENT_MAX_LENGTH = 300;
const CURRENT_YEAR = new Date().getFullYear();

type LandingDict = NonNullable<MarketingDictionary['lunarNewYear']>['landing'];

export function ReadingForm({ language, dict: t }: { language: NonKoreanLanguage; dict: LandingDict }) {
  const router = useRouter();

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
    if (!Number.isInteger(yearNum) || !Number.isInteger(monthNum) || !Number.isInteger(dayNum) || yearNum < 1900 || yearNum > CURRENT_YEAR) {
      setError(t.errors.date);
      return;
    }
    if (!isOldEnough(yearNum, monthNum, dayNum)) {
      setError(t.errors.underage);
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
      const hourNum = timeKnown && hour !== '' ? Number(hour) : undefined;
      const chart = calculateSaju({
        calendarType: 'solar',
        year: yearNum,
        month: monthNum,
        day: dayNum,
        hour: hourNum,
        minute: hourNum !== undefined ? Number(minute) : undefined,
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

      router.push(`/${language}/lunar-new-year/r/${result.readingId}`);
    } catch (err) {
      if (err instanceof ApiError && (err.reason === 'underage' || err.reason === 'birth_date_required')) {
        setError(err.reason === 'underage' ? t.errors.underage : t.errors.date);
      } else if (err instanceof ApiError && err.status === 429) {
        setError(t.errors.rateLimited);
      } else {
        setError(t.errors.generic);
      }
      // Turnstile 토큰은 1회용이라, 실패한 시도에 쓰인 토큰을 그대로 두면 재제출도 항상 403으로
      // 막힌다(2026-09-03, 종합 버그 점검으로 발견) — 이 폼은 실패해도 언마운트되지 않으므로
      // 새 토큰을 명시적으로 요청한다.
      setTurnstileToken(undefined);
      turnstileRef.current?.reset();
      setIsSubmitting(false);
    }
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
        <span className="mb-1 block text-sm font-medium">{t.dateLabel}</span>
        {/* 고정폭(w-24/w-20)이라 카드 폭을 못 채우고 왼쪽에 몰려 붙어 보이던 것을 DemoForm.tsx/
         * CompatView.tsx와 같은 방식(flex-1 균등 분할)으로 맞췄다(2026-08-26). */}
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={t.yearLabel}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={t.monthLabel}
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
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder={t.hourLabel}
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
        <div className="mt-1 text-right text-xs text-stone-400">
          {memorableEvent.length}/{MEMORABLE_EVENT_MAX_LENGTH}
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-1" />
        <span>{t.ageConfirmLabel}</span>
      </label>
      <p className="text-xs text-stone-400">{t.consentPreviewNote}</p>

      <Turnstile ref={turnstileRef} onVerify={setTurnstileToken} />

      {error && <p className="text-sm text-red-600">{error}</p>}

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
