import { MINIMUM_AGE } from './age';

/**
 * 공개 폼(데모·신년운세·궁합)의 양력 생년월일 입력 검증(2026-10-06 공용화 — 세 폼이 같은 검사를 각자 했고, 2월 30일 같은
 * 없는 날짜는 일부만 막았다).
 *
 * "올해"는 모듈을 불러온 시점에 고정하지 않는다(2026-10-06 전체 점검 3차) — 서버 인스턴스는 해를 넘겨 살아 있을 수 있어
 * 서버와 브라우저의 값이 갈렸다(연도 목록 하이드레이션 불일치).
 */
export const MIN_BIRTH_YEAR = 1900;

/** 정수이고 1900년~올해 안의 실제 있는 날짜면 true. */
export function isValidBirthDate(year: number, month: number, day: number, currentYear: number = new Date().getFullYear()): boolean {
  if (![year, month, day].every(Number.isInteger) || year < MIN_BIRTH_YEAR || year > currentYear) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * 선택형 연도 목록(최근 해부터) — 만 16세 미만은 어차피 막히지만(isOldEnough) 목록에서 미리 빼 두면 고르기 쉽다.
 * `currentYear`는 서버 페이지가 정해 넘긴다(서버·브라우저가 같은 목록을 그리게).
 */
export function birthYearOptions(currentYear: number): number[] {
  const newest = currentYear - MINIMUM_AGE;
  return Array.from({ length: Math.max(0, newest - MIN_BIRTH_YEAR + 1) }, (_, i) => newest - i);
}

/**
 * 신년운세 폼의 출생 시각 — 모르면(또는 시를 비우면) 시각 없음. 시는 0~23, 분은 0~59 정수만(분을 비우면 0).
 * 예전엔 24시·7.5·75분이 그대로 사주 계산으로 가 일반 오류가 났고, 1회용 Turnstile 토큰까지 버려졌다(2026-10-06).
 */
export function parseBirthTime(
  timeKnown: boolean,
  hour: string,
  minute: string,
): { hour?: number; minute?: number } | 'invalid' {
  if (!timeKnown || hour.trim() === '') return {};
  const hourNum = Number(hour);
  const minuteNum = minute.trim() === '' ? 0 : Number(minute);
  if (!Number.isInteger(hourNum) || hourNum < 0 || hourNum > 23) return 'invalid';
  if (!Number.isInteger(minuteNum) || minuteNum < 0 || minuteNum > 59) return 'invalid';
  return { hour: hourNum, minute: minuteNum };
}
