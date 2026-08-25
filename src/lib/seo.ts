import type { Metadata } from 'next';

export const WEB_BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? 'http://localhost:3200';

/**
 * hreflang(`alternates.languages`) 빌더 — 이 사이트는 페이지마다 지원 언어 집합이 다르다(홈/
 * 개인정보처리방침 6개, 블로그/compare 4개, 신년운세 5개). 'x-default'는 middleware.ts가 언어
 * 자동감지에 실패했을 때 실제로 떨어지는 DEFAULT_LANGUAGE 경로를 가리킨다 — 그 경로가 항상
 * 대상 언어 목록 안에 있어야 한다(호출부가 그 언어를 defaultLang으로 넘긴다).
 */
export function languageAlternates<L extends string>(
  languages: readonly L[],
  pathFor: (lang: L) => string,
  defaultLang: L,
): Record<string, string> {
  return {
    ...Object.fromEntries(languages.map((lang) => [lang, `${WEB_BASE_URL}${pathFor(lang)}`])),
    'x-default': `${WEB_BASE_URL}${pathFor(defaultLang)}`,
  };
}

/** 검색결과에 노출될 필요 없는 개인화/트랜잭션 페이지(궁합 공유·신년운세 결과·수신거부 등)에 쓴다. */
export const NOINDEX_ROBOTS: Metadata['robots'] = { index: false, follow: true };

/**
 * openGraph/twitter를 항상 같은 값으로 나란히 채우는 헬퍼 — Next.js는 `twitter` 필드를 아예
 * 생략하면 twitter:* 메타 태그 자체를 렌더링하지 않으므로, openGraph를 쓰는 모든 페이지에서
 * 매번 같은 title/description/images를 두 번 타이핑하는 대신 이 헬퍼로 통일한다.
 */
export function buildSocialMetadata(params: {
  title: string;
  description: string;
  url?: string;
  images?: string[];
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  const { title, description, url, images } = params;
  return {
    openGraph: {
      title,
      description,
      ...(url ? { url } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}
