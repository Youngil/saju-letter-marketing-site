/**
 * 공개 폼(데모·신년운세·궁합)의 양력 생년월일 입력 검증(2026-10-06 공용화 — 세 폼이 같은 검사를 각자 했고, 2월 30일 같은
 * 없는 날짜는 일부만 막았다).
 */
export const CURRENT_YEAR = new Date().getFullYear();
export const MIN_BIRTH_YEAR = 1900;

/** 정수이고 1900년~올해 안의 실제 있는 날짜면 true. */
export function isValidBirthDate(year: number, month: number, day: number): boolean {
  if (![year, month, day].every(Number.isInteger) || year < MIN_BIRTH_YEAR || year > CURRENT_YEAR) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
