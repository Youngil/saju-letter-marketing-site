import { describe, expect, it } from 'vitest';
import { LAUNCH_CONTENT_LANGUAGES } from '@/lib/languages';
import { HEAVENLY_STEMS } from '@/lib/sajuVocabulary';
import { DAY_TYPE_COPY, oneLine, pickDayTypeResultCopy } from './dayTypeCopy';
import { dayTypeTrait } from './dayTypeTraits';

describe('날 유형 문구(2026-10-31)', () => {
  it('별명이 들어갈 자리가 있고, 가격·오행 이름·"당신"·독점 표현이 없다', () => {
    for (const lang of LAUNCH_CONTENT_LANGUAGES) {
      const copy = DAY_TYPE_COPY[lang];
      for (const key of ['resultTitle', 'shareText', 'pageTitle', 'heading'] as const) expect(copy[key]).toContain('{name}');
      const all = Object.values(copy).join(' ');
      expect(all).not.toMatch(/[$₩¥€]\s*\d|\d+\s*(won|yen|dollars?)/i);
      expect(all).not.toMatch(/\b(fire|water|wood|metal|earth|fuego|agua|madera|metal|tierra)\b/i);
      expect(all).not.toMatch(/오행|일간|천간|五行|日干|天干/);
      expect(all).not.toMatch(/just for you|only for you|나만을|당신만을/i);
    }
    expect(Object.values(DAY_TYPE_COPY.ko).join(' ')).not.toContain('당신');
  });

  it('결과 카드에는 현재 언어 문자열과 10개 한 줄만 넘긴다', () => {
    const copy = pickDayTypeResultCopy('ja');
    expect(Object.keys(copy.traits)).toHaveLength(10);
    expect(copy.traits['丁']).toBe(dayTypeTrait('丁', 'ja'));
    for (const value of Object.values(copy)) if (typeof value === 'string') expect(value).not.toMatch(/[가-힣]/);
  });

  it('한 줄로 펼칠 때 일본어는 띄우지 않는다', () => {
    expect(oneLine('곧게 자라고,\n곁에', 'ko')).toBe('곧게 자라고, 곁에');
    expect(oneLine('伸びて、\nまわり', 'ja')).toBe('伸びて、まわり');
    for (const stem of HEAVENLY_STEMS) expect(oneLine(dayTypeTrait(stem, 'en'), 'en')).not.toContain('\n');
  });
});
