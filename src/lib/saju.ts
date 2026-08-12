import { Lunar, Solar } from 'lunar-javascript';
import { isEarthlyBranch, isHeavenlyStem, type EarthlyBranch, type HeavenlyStem } from './sajuVocabulary';

/**
 * saju-letter-mobile/src/domain/saju/calculateSaju.ts를 그대로 옮긴 것 — saju-letter-newyear-campaign/src/lib/saju.ts에
 * 이은 세 번째 포팅이다. 이 사이트도 사주 계산을 브라우저에서 직접 한다("이 백엔드는 계산을
 * 하지 않는다" 원칙, saju-letter-backend/CLAUDE.md §2). 백엔드로는 계산 결과(천간/지지)만
 * 전송하고, 원본 생년월일시는 절대 서버로 보내지 않는다.
 *
 * 음력 입력(calendarType: 'lunar')은 2026-08-12에 궁합 공유 웹페이지 이관과 함께 추가됐다 —
 * 원래 이 파일은 홈 미니 데모용으로 양력만 지원했지만(데모는 양력만으로 충분), 옛
 * saju-letter-backend/public/js/guest-day-master.js(궁합 공유 게스트 입력 폼)는 음력 토글을
 * 지원했었다 — 기능 축소를 피하기 위해 mobile의 resolveLunar를 그대로 포팅했다.
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

function resolveLunar(input: SajuFormInput, hour: number, minute: number) {
  if (input.calendarType === 'solar') {
    return Solar.fromYmdHms(input.year, input.month, input.day, hour, minute, 0).getLunar();
  }
  const lunarMonth = input.isLeapMonth ? -input.month : input.month;
  return Lunar.fromYmdHms(input.year, lunarMonth, input.day, hour, minute, 0);
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
  const hour = timeKnown ? input.hour! : UNKNOWN_TIME_PLACEHOLDER.hour;
  const minute = timeKnown ? (input.minute ?? 0) : UNKNOWN_TIME_PLACEHOLDER.minute;

  const eightChar = resolveLunar(input, hour, minute).getEightChar();

  return {
    yearPillar: toPillar(eightChar.getYearGan(), eightChar.getYearZhi()),
    monthPillar: toPillar(eightChar.getMonthGan(), eightChar.getMonthZhi()),
    dayPillar: toPillar(eightChar.getDayGan(), eightChar.getDayZhi()),
    hourPillar: timeKnown ? toPillar(eightChar.getTimeGan(), eightChar.getTimeZhi()) : null,
  };
}
