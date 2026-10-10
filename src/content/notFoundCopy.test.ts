import { describe, expect, it } from 'vitest';
import { MARKETING_LANGUAGES } from '@/lib/languages';
import { NOT_FOUND_COPY, notFoundCopyFor } from './notFoundCopy';

describe('notFoundCopy', () => {
  it.each(MARKETING_LANGUAGES)('%s: 404 문구가 다 있다', (lang) => {
    const copy = NOT_FOUND_COPY[lang]!;
    for (const value of Object.values(copy)) expect(value.trim()).not.toBe('');
    expect(notFoundCopyFor(lang).lang).toBe(lang);
  });

  it('모르는 언어·빈 값은 영어', () => {
    expect(notFoundCopyFor('xx').lang).toBe('en');
    expect(notFoundCopyFor(null).copy).toBe(NOT_FOUND_COPY.en);
  });
});
