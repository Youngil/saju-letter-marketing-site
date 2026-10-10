import { describe, expect, it } from 'vitest';
import { articleJsonLd, LOGO_URL, organizationJsonLd } from './structuredData';
import { WEB_BASE_URL } from './seo';

/** 2026-10-10 전체 점검 14차 — Article에 author·image, 로고는 512px 사본. 다인을 Person으로 마크업하지 않는다(CLAUDE.md §1). */
describe('structuredData', () => {
  it('로고는 가벼운 512px 사본을 가리킨다', () => {
    expect(LOGO_URL).toBe(`${WEB_BASE_URL}/logo-512.png`);
    expect(organizationJsonLd('Saju Letter').logo).toBe(LOGO_URL);
  });

  it('Article은 author(Organization)와 image(그 언어 OG)를 가진다', () => {
    const image = `${WEB_BASE_URL}/en/opengraph-image`;
    const ld = articleJsonLd({ title: 't', description: 'd', datePublished: '2026-10-10', url: 'u', brand: 'Saju Letter', image });
    expect(ld.image).toEqual([image]);
    expect(ld.author).toMatchObject({ '@type': 'Organization', name: 'Saju Letter' });
    expect(ld.publisher).toMatchObject({ '@type': 'Organization', logo: { url: LOGO_URL } });
    expect(JSON.stringify(ld)).not.toContain('Person');
  });
});
