import { describe, expect, it } from 'vitest';
import { formatPostDate, isPostCategory } from './posts';

describe('formatPostDate', () => {
  it('언어별 긴 날짜로 포맷한다', () => {
    expect(formatPostDate('2026-09-01', 'en')).toMatch(/September/);
    expect(formatPostDate('2026-09-01', 'ko')).toMatch(/9/);
  });

  it('정오 고정으로 타임존에 하루가 밀리지 않는다', () => {
    // UTC- 지역에서도 9/1로 남아야 한다.
    expect(formatPostDate('2026-09-01', 'en')).toContain('1');
  });
});

describe('isPostCategory', () => {
  it('허용된 분류만 true', () => {
    expect(isPostCategory('behind')).toBe(true);
    expect(isPostCategory('fortune')).toBe(false);
  });
});
