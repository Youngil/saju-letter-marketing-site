import { describe, expect, it } from 'vitest';
import { calculateAge, isOldEnough, MINIMUM_AGE } from './age';

describe('calculateAge', () => {
  it('생일이 이미 지난 경우 만 나이를 정확히 계산한다', () => {
    expect(calculateAge(2000, 5, 15, new Date(2026, 6, 29))).toBe(26);
  });

  it('생일이 아직 안 지난 경우 1을 뺀다', () => {
    expect(calculateAge(2000, 8, 15, new Date(2026, 6, 29))).toBe(25);
  });

  it('오늘이 생일 당일이면 이미 생일이 지난 것으로 계산한다', () => {
    expect(calculateAge(2010, 7, 29, new Date(2026, 6, 29))).toBe(16);
  });
});

describe('isOldEnough', () => {
  it(`정확히 ${MINIMUM_AGE}세면 통과한다`, () => {
    const birthYear = 2026 - MINIMUM_AGE;
    expect(isOldEnough(birthYear, 7, 29, new Date(2026, 6, 29))).toBe(true);
  });

  it(`${MINIMUM_AGE}세보다 하루라도 어리면 통과하지 못한다`, () => {
    const birthYear = 2026 - MINIMUM_AGE;
    expect(isOldEnough(birthYear, 7, 30, new Date(2026, 6, 29))).toBe(false);
  });
});
