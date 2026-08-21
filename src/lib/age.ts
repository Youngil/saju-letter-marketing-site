/**
 * 최소 이용 연령 게이트 — 모바일 `src/domain/age.ts`와 같은 값·같은 만 나이 계산.
 * 개인정보처리방침 §8과 반드시 같아야 한다.
 */
export const MINIMUM_AGE = 16;

/** 만 나이를 계산한다 — 생일이 아직 안 지났으면 1을 뺀다(한국 나이 아님, 국제 통용 만 나이). */
export function calculateAge(birthYear: number, birthMonth: number, birthDay: number, today: Date = new Date()): number {
  let age = today.getFullYear() - birthYear;
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > birthMonth || (today.getMonth() + 1 === birthMonth && today.getDate() >= birthDay);
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function isOldEnough(birthYear: number, birthMonth: number, birthDay: number, today: Date = new Date()): boolean {
  return calculateAge(birthYear, birthMonth, birthDay, today) >= MINIMUM_AGE;
}
