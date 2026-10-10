import { WEB_BASE_URL } from './seo';

/**
 * 구조화 데이터 로고 — 512px로 줄인 사본(2026-10-10 전체 점검 14차). 원본 `logo-icon.png`는 1024² 1.45MB라 검색엔진이
 * 받아 가기엔 무거웠다(Google 로고 권장은 112px 이상이면 충분).
 */
export const LOGO_URL = `${WEB_BASE_URL}/logo-512.png`;

/** 사이트 전역 Organization 구조화 데이터 — `[lang]/layout.tsx`가 모든 페이지에서 렌더한다. */
export function organizationJsonLd(brand: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand,
    url: WEB_BASE_URL,
    logo: LOGO_URL,
  };
}

/**
 * 블로그 글 Article 구조화 데이터. 저자는 "다인(Dain)" 캐릭터가 아니라 브랜드(Organization)로
 * 표기한다 — 가상 인물을 machine-readable Person 스키마로 실존 인물처럼 마크업하면 블로그
 * 바이라인/소개 글에서 이미 내린 "구체적 개인 전기를 사실처럼 서술하지 않는다"는 판단(§CLAUDE.md
 * 참고)과 같은 위험을 구조화 데이터에서 새로 만드는 셈이라 의도적으로 피했다.
 *
 * `author`도 같은 이유로 Organization(2026-10-10 전체 점검 14차 — 예전엔 author·image가 없어 Google 리치 결과 권장 항목이
 * 비어 있었다). `image`는 그 언어의 기본 OG 이미지(1200×630) 주소.
 */
export function articleJsonLd(params: {
  title: string;
  description: string;
  datePublished: string;
  url: string;
  brand: string;
  image: string;
}) {
  const { title, description, datePublished, url, brand, image } = params;
  const organization = { '@type': 'Organization', name: brand, url: WEB_BASE_URL };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished,
    url,
    image: [image],
    author: organization,
    publisher: {
      ...organization,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
  };
}

/**
 * `<script type="application/ld+json">`에 넣을 문자열(2026-10-06). JSON.stringify만으로는 AI가 쓴 제목에 `</script>`가
 * 들어가면 태그를 빠져나갈 수 있어 `<`를 이스케이프한다(JSON으로는 같은 값).
 */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
