import { describe, expect, it } from 'vitest';
import { DAY_TYPE_NICKNAMES } from '@/content/dayTypeNicknames';
import { DAY_TYPE_SLUGS, dayTypeArtSvg, dayTypePath, dayTypeShareUrl, stemFromDayTypeSlug } from './dayType';
import { HEAVENLY_STEMS } from './sajuVocabulary';

describe('날 유형 페이지 주소(2026-10-31)', () => {
  it('주소 이름은 영어 별명과 같고, 10개가 서로 다르며 되돌릴 수 있다', () => {
    const slugs = HEAVENLY_STEMS.map((stem) => DAY_TYPE_SLUGS[stem]);
    expect(new Set(slugs).size).toBe(10);
    for (const stem of HEAVENLY_STEMS) {
      expect(DAY_TYPE_SLUGS[stem]).toBe(DAY_TYPE_NICKNAMES[stem].en);
      expect(DAY_TYPE_SLUGS[stem]).toMatch(/^[a-z]+$/);
      expect(stemFromDayTypeSlug(DAY_TYPE_SLUGS[stem])).toBe(stem);
    }
    expect(stemFromDayTypeSlug('candle')).toBeNull();
    expect(stemFromDayTypeSlug('')).toBeNull();
  });

  it('공유 주소에는 생일이 없고 유입 꼬리표만 붙는다', () => {
    expect(dayTypePath('ko', '丁')).toBe('/ko/type/flame');
    const url = new URL(dayTypeShareUrl('en', '甲'));
    expect(url.pathname).toBe('/en/type/tree');
    expect(Object.fromEntries(url.searchParams)).toEqual({ utm_source: 'friend_share', utm_medium: 'referral', utm_campaign: 'day_type' });
  });

  it('SVG는 배경 원 + 원으로 잘라 그린 도형이고 색 토큰이 남지 않는다', () => {
    for (const stem of HEAVENLY_STEMS) {
      const svg = dayTypeArtSvg(stem, 300);
      expect(svg).toMatch(/^<svg [^>]*width="300" height="300" viewBox="0 0 120 120">/);
      expect(svg).toContain('<clipPath id="c"><circle cx="60" cy="60" r="54"/></clipPath>');
      expect(svg).toContain('<g clip-path="url(#c)">');
      expect(svg).not.toMatch(/"(deep|main|soft|shine|undefined)"/);
    }
  });
});
