import { describe, expect, it } from 'vitest';
import { birthYearOptions, isValidBirthDate, MIN_BIRTH_YEAR, parseBirthTime } from './birthDate';

describe('isValidBirthDate', () => {
  it('없는 날짜·범위 밖 연도는 false', () => {
    expect(isValidBirthDate(2000, 2, 30, 2026)).toBe(false);
    expect(isValidBirthDate(1899, 1, 1, 2026)).toBe(false);
    expect(isValidBirthDate(2027, 1, 1, 2026)).toBe(false);
    expect(isValidBirthDate(2000, 2, 29, 2026)).toBe(true);
  });
});

describe('birthYearOptions — 서버가 넘긴 해 기준, 최근 해부터 1900년까지', () => {
  it('만 16세가 되는 해부터 MIN_BIRTH_YEAR까지 내림차순', () => {
    const options = birthYearOptions(2026);
    expect(options[0]).toBe(2010);
    expect(options.at(-1)).toBe(MIN_BIRTH_YEAR);
    expect(options).toHaveLength(2010 - MIN_BIRTH_YEAR + 1);
  });

  it('같은 해를 넣으면 같은 목록(서버·브라우저 하이드레이션 일치)', () => {
    expect(birthYearOptions(2027)).toEqual(birthYearOptions(2027));
    expect(birthYearOptions(2027)[0]).toBe(2011);
  });
});

describe('parseBirthTime — 신년운세 출생 시각', () => {
  it('모르거나 시를 비우면 시각 없음', () => {
    expect(parseBirthTime(false, '24', '75')).toEqual({});
    expect(parseBirthTime(true, '', '30')).toEqual({});
  });

  it('정상 범위는 숫자로, 분을 비우면 0', () => {
    expect(parseBirthTime(true, '0', '0')).toEqual({ hour: 0, minute: 0 });
    expect(parseBirthTime(true, '23', '59')).toEqual({ hour: 23, minute: 59 });
    expect(parseBirthTime(true, '7', '')).toEqual({ hour: 7, minute: 0 });
  });

  it('24시·소수·75분·음수는 invalid', () => {
    expect(parseBirthTime(true, '24', '0')).toBe('invalid');
    expect(parseBirthTime(true, '7.5', '0')).toBe('invalid');
    expect(parseBirthTime(true, '7', '75')).toBe('invalid');
    expect(parseBirthTime(true, '-1', '0')).toBe('invalid');
  });
});
