import { Solar } from 'lunar-javascript';
import { detectDeviceTimeZone, resolveBirthClocks, type WallClock } from './birthClock';
import { getKoreanLunarDaysInMonth, getKoreanLunarLeapMonth, koreanLunarToSolar } from './koreanLunar';
import { isEarthlyBranch, isHeavenlyStem, type EarthlyBranch, type HeavenlyStem } from './sajuVocabulary';

/**
 * saju-letter-mobile/src/domain/saju/calculateSaju.ts를 그대로 옮긴 것 — saju-letter-newyear-campaign/src/lib/saju.ts에
 * 이은 세 번째 포팅이다. 이 사이트도 사주 계산을 브라우저에서 직접 한다("이 백엔드는 계산을
 * 하지 않는다" 원칙, saju-letter-backend/CLAUDE.md §2). 백엔드로는 계산 결과(천간/지지)만
 * 전송한다. 만 16세 확인용 양력 년/월/일은 서버로 보내지만 저장하지 않는다.
 *
 * 음력 입력(calendarType: 'lunar')은 2026-08-12에 궁합 공유 웹페이지 이관과 함께 추가됐다 —
 * 원래 이 파일은 홈 미니 데모용으로 양력만 지원했지만(데모는 양력만으로 충분), 옛
 * saju-letter-backend/public/js/guest-day-master.js(궁합 공유 게스트 입력 폼)는 음력 토글을
 * 지원했었다 — 기능 축소를 피하기 위해 mobile의 resolveLunar를 그대로 포팅했다.
 *
 * 2026-10-07 전체 점검 13차(모바일 1.1.4와 같은 변경):
 * - F1 음력은 **한국 음력**(KASI 표, `koreanLunar.ts`)으로 양력 날짜를 구한다 — lunar-javascript는 중국 음력이라 1900~2050년
 *   64개 남짓한 달에서 하루 어긋났다(음력 1997-01-01 → 02-07, 정답 02-08). 기둥은 그 양력 날짜로 lunar-javascript가 계산.
 * - F2 `timeZone`이 있으면 년주·월주는 출생 순간의 베이징 시각(절기 표 기준), 일주·시주는 서머타임을 뺀 현지 표준시
 *   (`birthClock.ts`). 이 사이트엔 출생 타임존 입력이 없어 `assumedBirthTimeZone(language)`로 정한다(ko는 Asia/Seoul,
 *   그 외는 브라우저 타임존). 진태양시 보정 없음, 야자시(sect 2) 그대로.
 */
export interface SajuFormInput {
  calendarType: 'solar' | 'lunar';
  year: number;
  month: number;
  day: number;
  /** 0~23. 모르면 undefined — "출생 시간 모름"을 그대로 표현한다. */
  hour?: number;
  minute?: number;
  /** calendarType이 'lunar'일 때만 의미가 있다. */
  isLeapMonth?: boolean;
  /** 출생 타임존(IANA). 없거나 알 수 없으면 예전처럼 입력한 시각을 그대로 쓴다(13차 F2). */
  timeZone?: string;
}

export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
}

export interface SajuChart {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  /** 출생 시간을 몰랐으면 null — "아는 만큼만" 반영한다. */
  hourPillar: Pillar | null;
}

/**
 * 출생 시간을 모를 때 일주(日柱) 계산용으로 쓰는 자리표시 시각 — 일주는 자시(23:00~00:59)
 * 경계에서만 흔들릴 수 있는데, 정오는 그 경계에서 가장 먼 지점이라 안전하다.
 */
const UNKNOWN_TIME_PLACEHOLDER = { hour: 12, minute: 0 } as const;

function toPillar(stem: string, branch: string): Pillar {
  if (!isHeavenlyStem(stem)) throw new Error(`Unexpected heavenly stem from lunar-javascript: ${stem}`);
  if (!isEarthlyBranch(branch)) throw new Error(`Unexpected earthly branch from lunar-javascript: ${branch}`);
  return { stem, branch };
}

/**
 * 출생 타임존을 묻지 않는 이 사이트의 가정(13차 F2) — 한국어 페이지는 한국 출생으로 보고 Asia/Seoul, 그 외 언어는 브라우저
 * 타임존(사는 곳 = 태어난 곳이라는 가정, 앱 온보딩 기본값과 같다). 못 읽으면 undefined(예전 계산).
 */
export function assumedBirthTimeZone(language: string): string | undefined {
  if (language === 'ko') return 'Asia/Seoul';
  return detectDeviceTimeZone() || undefined;
}

/**
 * 음력 입력이라도 만 16세 검사용으로는 양력 생년월일 하나로 정규화한다. 음력은 한국 음력 표로(13차 F1), 없는 날짜면 RangeError.
 * 양력은 입력한 날짜 그대로.
 */
export function resolveSolarBirthDate(input: SajuFormInput): { year: number; month: number; day: number } {
  if (input.calendarType === 'solar') {
    const valid =
      Number.isInteger(input.year) &&
      Number.isInteger(input.month) &&
      input.month >= 1 &&
      input.month <= 12 &&
      Number.isInteger(input.day) &&
      input.day >= 1 &&
      input.day <= new Date(input.year, input.month, 0).getDate();
    if (!valid) throw new RangeError(`nonexistent solar date ${input.year}-${input.month}-${input.day}`);
    return { year: input.year, month: input.month, day: input.day };
  }
  const solar = koreanLunarToSolar(input.year, input.month, input.day, input.isLeapMonth === true);
  if (!solar) {
    throw new RangeError(`nonexistent Korean lunar date ${input.year}-${input.isLeapMonth ? 'L' : ''}${input.month}-${input.day}`);
  }
  return solar;
}

/**
 * 그 해 한국 음력에 윤달이 있으면 해당 월(1-12)을, 없으면 0을 반환 — `CompatView.tsx`의 게스트 폼이 연/월/양음력 변경 시
 * `isLeapMonth`를 리셋하는 데 쓴다(2026-09-04). 13차부터 한국 음력 기준(2012 윤3월·2017 윤5월).
 */
export function getLunarLeapMonth(year: number): number {
  return getKoreanLunarLeapMonth(year);
}

/** 한국 음력 연/월(윤달 포함)의 일수(29/30), 없는 조합이면 null(13차 — 궁합 폼의 일 목록). */
export function getLunarDaysInMonth(year: number, month: number, isLeapMonth: boolean): number | null {
  return getKoreanLunarDaysInMonth(year, month, isLeapMonth);
}

function eightCharAt(clock: WallClock) {
  return Solar.fromYmdHms(clock.year, clock.month, clock.day, clock.hour, clock.minute, 0).getLunar().getEightChar();
}

export function calculateSaju(input: SajuFormInput): SajuChart {
  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) {
    throw new RangeError(`month must be an integer between 1 and 12, got ${input.month}`);
  }
  if (!Number.isInteger(input.day) || input.day < 1 || input.day > 31) {
    throw new RangeError(`day must be an integer between 1 and 31, got ${input.day}`);
  }
  if (input.hour !== undefined && (!Number.isInteger(input.hour) || input.hour < 0 || input.hour > 23)) {
    throw new RangeError(`hour must be an integer between 0 and 23, got ${input.hour}`);
  }

  const timeKnown = input.hour !== undefined;
  const wall: WallClock = {
    ...resolveSolarBirthDate(input),
    hour: timeKnown ? input.hour! : UNKNOWN_TIME_PLACEHOLDER.hour,
    minute: timeKnown ? (input.minute ?? 0) : UNKNOWN_TIME_PLACEHOLDER.minute,
  };
  const clocks = resolveBirthClocks(wall, input.timeZone);
  const yearMonthChar = eightCharAt(clocks ? clocks.solarTermClock : wall);
  const dayHourChar = clocks ? eightCharAt(clocks.dayClock) : yearMonthChar;

  return {
    yearPillar: toPillar(yearMonthChar.getYearGan(), yearMonthChar.getYearZhi()),
    monthPillar: toPillar(yearMonthChar.getMonthGan(), yearMonthChar.getMonthZhi()),
    dayPillar: toPillar(dayHourChar.getDayGan(), dayHourChar.getDayZhi()),
    hourPillar: timeKnown ? toPillar(dayHourChar.getTimeGan(), dayHourChar.getTimeZhi()) : null,
  };
}
