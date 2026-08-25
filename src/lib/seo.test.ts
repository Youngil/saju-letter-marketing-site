import { describe, expect, it } from 'vitest';
import { languageAlternates, WEB_BASE_URL } from './seo';

describe('languageAlternates', () => {
  it('각 언어를 pathFor로 만든 절대 URL에 매핑하고, x-default를 defaultLang 경로로 채운다', () => {
    const result = languageAlternates(['ko', 'en', 'ja'] as const, (lang) => `/${lang}/blog`, 'en');

    expect(result).toEqual({
      ko: `${WEB_BASE_URL}/ko/blog`,
      en: `${WEB_BASE_URL}/en/blog`,
      ja: `${WEB_BASE_URL}/ja/blog`,
      'x-default': `${WEB_BASE_URL}/en/blog`,
    });
  });

  it('defaultLang이 languages 목록 밖이어도 x-default만 그 경로로 추가된다', () => {
    const result = languageAlternates(['ko', 'ja'] as const, (lang) => `/${lang}`, 'en' as 'ko' | 'ja');

    expect(result['x-default']).toBe(`${WEB_BASE_URL}/en`);
    expect(Object.keys(result)).toEqual(['ko', 'ja', 'x-default']);
  });
});
