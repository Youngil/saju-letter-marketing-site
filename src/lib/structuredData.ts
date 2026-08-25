import { WEB_BASE_URL } from './seo';

/** 사이트 전역 Organization 구조화 데이터 — `[lang]/layout.tsx`가 모든 페이지에서 렌더한다. */
export function organizationJsonLd(brand: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand,
    url: WEB_BASE_URL,
    logo: `${WEB_BASE_URL}/logo-icon.png`,
  };
}

/**
 * 블로그 글 Article 구조화 데이터. 저자는 "다인(Dain)" 캐릭터가 아니라 브랜드(Organization)로
 * 표기한다 — 가상 인물을 machine-readable Person 스키마로 실존 인물처럼 마크업하면 블로그
 * 바이라인/소개 글에서 이미 내린 "구체적 개인 전기를 사실처럼 서술하지 않는다"는 판단(§CLAUDE.md
 * 참고)과 같은 위험을 구조화 데이터에서 새로 만드는 셈이라 의도적으로 피했다.
 */
export function articleJsonLd(params: { title: string; description: string; datePublished: string; url: string; brand: string }) {
  const { title, description, datePublished, url, brand } = params;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished,
    url,
    publisher: {
      '@type': 'Organization',
      name: brand,
      logo: { '@type': 'ImageObject', url: `${WEB_BASE_URL}/logo-icon.png` },
    },
  };
}
