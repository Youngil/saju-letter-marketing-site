import { IANAZone } from 'luxon';
import { LunarYear, Solar } from 'lunar-javascript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveBirthClocks, standardOffsetMinutes } from './birthClock';
import { getKoreanLunarDaysInMonth, getKoreanLunarLeapMonth, koreanLunarToSolar } from './koreanLunar';
import { assumedBirthTimeZone, calculateSaju, getLunarDaysInMonth, getLunarLeapMonth, resolveSolarBirthDate, type Pillar } from './saju';

/** 2026-10-07 전체 점검 13차 F1·F2 — saju-letter-mobile `koreanLunar.test.ts`·`birthClock.test.ts`와 같은 기준값. */
const pillar = (p: Pillar | null) => (p ? `${p.stem}${p.branch}` : null);

describe('한국 음력(F1)', () => {
  it('음력 1997-01-01 = 양력 1997-02-08(일주 辛巳), 1988-01-01 = 02-18, 1988-01-15 일간 丁', () => {
    expect(resolveSolarBirthDate({ calendarType: 'lunar', year: 1997, month: 1, day: 1 })).toEqual({ year: 1997, month: 2, day: 8 });
    expect(pillar(calculateSaju({ calendarType: 'lunar', year: 1997, month: 1, day: 1 }).dayPillar)).toBe('辛巳');
    expect(koreanLunarToSolar(1988, 1, 1, false)).toEqual({ year: 1988, month: 2, day: 18 });
    expect(calculateSaju({ calendarType: 'lunar', year: 1988, month: 1, day: 15 }).dayPillar.stem).toBe('丁');
  });

  it('1996 음력 12월은 30일, 윤달은 한국 역서 기준(2012 윤3월·2017 윤5월)', () => {
    expect(getLunarDaysInMonth(1996, 12, false)).toBe(30);
    expect(getLunarLeapMonth(2012)).toBe(3);
    expect(getLunarLeapMonth(2017)).toBe(5);
    expect(getLunarLeapMonth(1988)).toBe(0);
    expect(getLunarDaysInMonth(1988, 7, true)).toBeNull();
  });

  it('없는 음력 날짜는 RangeError', () => {
    expect(() => calculateSaju({ calendarType: 'lunar', year: 1996, month: 11, day: 30 })).toThrow(RangeError);
    expect(() => resolveSolarBirthDate({ calendarType: 'lunar', year: 1988, month: 7, day: 9, isLeapMonth: true })).toThrow(RangeError);
  });

  it('한·중 음력이 같은 달은 1900~2050년 모든 날이 라이브러리와 같은 양력 날짜다', () => {
    let agreeing = 0;
    let differing = 0;
    const DAY_MS = 86_400_000;
    for (let year = 1900; year <= 2050; year += 1) {
      const chineseYear = LunarYear.fromYear(year);
      const koreanLeap = getKoreanLunarLeapMonth(year);
      for (let month = 1; month <= 12; month += 1) {
        if (year === 2050 && month >= 11) continue;
        for (const isLeap of [false, true]) {
          if (isLeap && koreanLeap !== month) continue;
          const chineseMonth = chineseYear.getMonth(isLeap ? -month : month);
          const days = getKoreanLunarDaysInMonth(year, month, isLeap);
          if (!chineseMonth || days === null) continue;
          const first = Solar.fromJulianDay(chineseMonth.getFirstJulianDay());
          const chineseFirstMs = Date.UTC(first.getYear(), first.getMonth() - 1, first.getDay());
          const koreanFirst = koreanLunarToSolar(year, month, 1, isLeap)!;
          if (Date.UTC(koreanFirst.year, koreanFirst.month - 1, koreanFirst.day) !== chineseFirstMs || chineseMonth.getDayCount() !== days) {
            differing += 1;
            continue;
          }
          agreeing += 1;
          for (let day = 1; day <= days; day += 1) {
            const expected = new Date(chineseFirstMs + (day - 1) * DAY_MS);
            expect(koreanLunarToSolar(year, month, day, isLeap)).toEqual({
              year: expected.getUTCFullYear(),
              month: expected.getUTCMonth() + 1,
              day: expected.getUTCDate(),
            });
          }
        }
      }
    }
    expect(agreeing).toBeGreaterThan(1700);
    expect(differing).toBeGreaterThan(50);
    expect(differing).toBeLessThan(200);
  });
});

describe('출생 타임존(F2)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('표준시 판정 — 서울 1988 서머타임은 +9, 1958은 +8:30, 표준시 변경 해는 서머타임 아님', () => {
    const at = (zone: string, iso: string) => standardOffsetMinutes(IANAZone.create(zone), Date.parse(iso));
    expect(at('Asia/Seoul', '1988-07-15T12:00:00Z')).toBe(540);
    expect(at('Asia/Seoul', '1958-07-01T12:00:00Z')).toBe(510);
    expect(at('Asia/Seoul', '1954-01-15T12:00:00Z')).toBe(540);
    expect(at('America/New_York', '2000-07-01T12:00:00Z')).toBe(-300);
    expect(at('Australia/Sydney', '2020-01-15T12:00:00Z')).toBe(600);
    expect(resolveBirthClocks({ year: 2000, month: 2, day: 4, hour: 21, minute: 0 }, 'Nowhere/Zone')).toBeNull();
  });

  it('KST 2000-02-04 21:00은 입춘 전(己卯/丁丑), 타임존이 없으면 예전 계산(庚辰/戊寅)', () => {
    const base = { calendarType: 'solar' as const, year: 2000, month: 2, day: 4, hour: 21, minute: 0 };
    const seoul = calculateSaju({ ...base, timeZone: 'Asia/Seoul' });
    expect(pillar(seoul.yearPillar)).toBe('己卯');
    expect(pillar(seoul.monthPillar)).toBe('丁丑');
    const legacy = calculateSaju(base);
    expect(pillar(legacy.yearPillar)).toBe('庚辰');
    expect(pillar(legacy.monthPillar)).toBe('戊寅');
  });

  it('뉴욕 2000-02-04 10:00 EST는 입춘 뒤(庚辰/戊寅)', () => {
    const chart = calculateSaju({ calendarType: 'solar', year: 2000, month: 2, day: 4, hour: 10, minute: 0, timeZone: 'America/New_York' });
    expect(pillar(chart.yearPillar)).toBe('庚辰');
    expect(pillar(chart.monthPillar)).toBe('戊寅');
  });

  it('1988-07-15 00:30 KDT → 표준시 07-14 23:30(야자시 관례 그대로) 일간 庚, 15:10 KDT → 시지 未', () => {
    const midnight = calculateSaju({ calendarType: 'solar', year: 1988, month: 7, day: 15, hour: 0, minute: 30, timeZone: 'Asia/Seoul' });
    expect(midnight.dayPillar.stem).toBe('庚');
    expect(midnight.hourPillar?.branch).toBe('子');
    const afternoon = calculateSaju({ calendarType: 'solar', year: 1988, month: 7, day: 15, hour: 15, minute: 10, timeZone: 'Asia/Seoul' });
    expect(afternoon.hourPillar?.branch).toBe('未');
  });

  it('출생 타임존 가정 — ko는 Asia/Seoul, 그 외는 브라우저 타임존', () => {
    expect(assumedBirthTimeZone('ko')).toBe('Asia/Seoul');
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone: 'America/New_York',
    } as Intl.ResolvedDateTimeFormatOptions);
    expect(assumedBirthTimeZone('en')).toBe('America/New_York');
    expect(assumedBirthTimeZone('ko')).toBe('Asia/Seoul');
  });
});
