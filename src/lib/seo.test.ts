import { describe, expect, it } from 'vitest';
import { activeLanguageAlternates, buildSocialMetadata, languageAlternates, pickAlternateDefault, WEB_BASE_URL } from './seo';

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

describe('pickAlternateDefault — x-default 고르기', () => {
  it('관리자가 정한 기본 언어가 목록에 있으면 그것', () => {
    expect(pickAlternateDefault(['ko', 'en', 'ja'], 'ja')).toBe('ja');
  });

  it('기본 언어가 꺼져 있으면 en, en도 없으면 첫 언어', () => {
    expect(pickAlternateDefault(['ko', 'en'], 'pt')).toBe('en');
    expect(pickAlternateDefault(['ja', 'es'], 'pt')).toBe('ja');
  });

  it('목록이 비면 null', () => {
    expect(pickAlternateDefault([], 'en')).toBeNull();
  });
});

describe('activeLanguageAlternates — 켠 언어만으로 hreflang', () => {
  it('켠 언어끼리 hreflang을 걸고 x-default는 고른 기본 언어', () => {
    expect(activeLanguageAlternates(['ko', 'es'], (lang) => `/${lang}/compare`, 'en')).toEqual({
      ko: `${WEB_BASE_URL}/ko/compare`,
      es: `${WEB_BASE_URL}/es/compare`,
      'x-default': `${WEB_BASE_URL}/ko/compare`,
    });
  });

  it('켠 언어가 하나도 없으면 hreflang을 아예 걸지 않는다(undefined)', () => {
    expect(activeLanguageAlternates([], (lang: string) => `/${lang}`, 'en')).toBeUndefined();
  });
});

describe('buildSocialMetadata', () => {
  // 2026-10-10 전체 점검 14차 — 모든 페이지에 1200×630 OG 이미지가 있어(파일 규약 포함) X 카드는 항상 큰 이미지.
  it('images가 없어도 X 카드는 summary_large_image', () => {
    const meta = buildSocialMetadata({ title: 't', description: 'd' });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image', title: 't', description: 'd' });
    expect(buildSocialMetadata({ title: 't', description: 'd', images: ['x'] }).twitter).toMatchObject({ card: 'summary_large_image', images: ['x'] });
  });
});
