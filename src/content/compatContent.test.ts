import { describe, expect, it } from 'vitest';
import { MARKETING_LANGUAGES } from '@/lib/languages';
import { COMPAT_CONTENT, pickCompatViewCopy } from './compatContent';
import { COMPAT_NAME_LINES } from './compatNameLines';
import { DISCLAIMER_CONTENT } from './disclaimer';

// 2026-10-06 전체 점검 9차 — 궁합 화면엔 현재 언어 문자열만 prop으로(RSC 경계 + 번들 크기), 이름 줄 함수는 클라이언트가 고른다.
describe('pickCompatViewCopy', () => {
  it.each(MARKETING_LANGUAGES)('%s: 함수 없이 문자열만 — RSC 직렬화 가능', (lang) => {
    const copy = pickCompatViewCopy(lang);
    for (const [key, value] of Object.entries(copy)) {
      expect(typeof value, key).toBe('string');
    }
    expect(copy).not.toHaveProperty('og');
    expect(copy).not.toHaveProperty('pairLine');
    expect(copy.disclaimerShort).toBe(DISCLAIMER_CONTENT[lang].short);
    expect(copy.notFound).toBe(COMPAT_CONTENT[lang].notFound);
  });

  it.each(MARKETING_LANGUAGES)('%s: COMPAT_CONTENT의 이름 줄은 COMPAT_NAME_LINES와 같은 함수', (lang) => {
    expect(COMPAT_CONTENT[lang].pairLine).toBe(COMPAT_NAME_LINES[lang].pairLine);
    expect(COMPAT_CONTENT[lang].pendingTitleFor).toBe(COMPAT_NAME_LINES[lang].pendingTitleFor);
  });
});
