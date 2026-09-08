import type { MetadataRoute } from 'next';
import {
  LAUNCH_CONTENT_LANGUAGES,
  MARKETING_LANGUAGES,
  DEFAULT_LANGUAGE,
  type MarketingLanguage,
  type LaunchContentLanguage,
} from '@/lib/languages';
import { BLOG_LANGUAGES, getAllPostSummaries } from '@/lib/posts';
import { WEB_BASE_URL, languageAlternates } from '@/lib/seo';

// DEFAULT_LANGUAGE('en')는 항상 모든 언어 부분집합 안에 있지만, languages.ts에서 더 넓은
// MarketingLanguage로 선언돼 있어(호출부마다 다시 캐스팅하지 않도록) 여기서 한 번만 좁힌다.
const DEFAULT_BLOG_LANGUAGE = DEFAULT_LANGUAGE as LaunchContentLanguage;

// 2026-09-08 3차 종합 버그 점검(항목 1) — `[lang]/page.tsx`/`blog/page.tsx`/`blog/[slug]/page.tsx`가
// 2026-09-06 블로그 DB 하이브리드 전환 때 "이게 없으면 DB에 새로 발행한 글이 다음 배포 전까지
// 사이트에 안 나타난다"는 이유로 이미 `revalidate = 3600`을 붙였는데, 같은 DB(`getAllPostSummaries`)를
// 조회하는 이 sitemap.ts에는 그때 빠져 있었다 — 그 결과 DB로 발행된 새 글이 검색엔진용
// sitemap.xml에는 다음 코드 배포 전까지 영원히 안 올라갈 수 있었다(라우트 자체는 ISR로 바로
// 보였지만 sitemap은 무기한 캐시). 위 세 파일과 같은 값(1시간)으로 맞춘다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 2026-09-07 — "모든 서비스를 1차 출시 4개 언어로 좁힌다"는 결정에 따라 홈도
  // MARKETING_LANGUAGES(6) 대신 LAUNCH_CONTENT_LANGUAGES(4)만 사이트맵에 올린다 — pt/vi는
  // 이제 [lang]/layout.tsx 게이트에서 404가 나므로 사이트맵에 올려봐야 죽은 링크다.
  const homePath = (lang: MarketingLanguage) => `/${lang}`;
  const homeEntries = LAUNCH_CONTENT_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${homePath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(LAUNCH_CONTENT_LANGUAGES, homePath, DEFAULT_LANGUAGE) },
  }));

  // 블로그/compare는 1차 출시 타겟 언어(ko/en/ja/es)에만 존재한다(languages.ts의
  // LAUNCH_CONTENT_LANGUAGES, posts.ts의 BLOG_LANGUAGES 참고 — pt/vi는 1차 출시 이후 추가 예정).
  const blogIndexPath = (lang: (typeof BLOG_LANGUAGES)[number]) => `/${lang}/blog`;
  const blogIndexEntries = BLOG_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${blogIndexPath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(BLOG_LANGUAGES, blogIndexPath, DEFAULT_BLOG_LANGUAGE) },
  }));
  // 2026-09-06부터 slug 목록이 코드 상수(POST_SLUGS)만으로 안 끝난다 — DB 저장 글(코드 배포
  // 없이 발행)이 언어별로 다른 조합으로 존재할 수 있어, 언어마다 실제 발행된 글을 직접 조회해
  // slug→가능한 언어 집합을 구성한다(각 slug가 실제로 번역된 언어에만 alternates를 건다).
  const summariesByLanguage = await Promise.all(
    BLOG_LANGUAGES.map(async (lang) => ({ lang, slugs: (await getAllPostSummaries(lang)).map((post) => post.slug) })),
  );
  const languagesBySlug = new Map<string, (typeof BLOG_LANGUAGES)[number][]>();
  for (const { lang, slugs } of summariesByLanguage) {
    for (const slug of slugs) {
      languagesBySlug.set(slug, [...(languagesBySlug.get(slug) ?? []), lang]);
    }
  }
  const blogPostPath = (slug: string) => (lang: (typeof BLOG_LANGUAGES)[number]) => `/${lang}/blog/${slug}`;
  const blogPostEntries = Array.from(languagesBySlug.entries()).flatMap(([slug, availableLangs]) =>
    availableLangs.map((lang) => ({
      url: `${WEB_BASE_URL}${blogPostPath(slug)(lang)}`,
      lastModified: new Date(),
      alternates: {
        languages: languageAlternates(
          availableLangs,
          blogPostPath(slug),
          availableLangs.includes(DEFAULT_BLOG_LANGUAGE) ? DEFAULT_BLOG_LANGUAGE : availableLangs[0]!,
        ),
      },
    })),
  );
  const comparePath = (lang: (typeof BLOG_LANGUAGES)[number]) => `/${lang}/compare`;
  const compareEntries = BLOG_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${comparePath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(BLOG_LANGUAGES, comparePath, DEFAULT_BLOG_LANGUAGE) },
  }));

  // 신년운세 캠페인(2026-08-07 이관) — 2026-09-08 3차 종합 버그 점검(항목 1)으로
  // `MARKETING_LANGUAGES`(6)로 되돌렸다. 2026-09-07 커밋이 ko를 포함시키며 `LAUNCH_CONTENT_
  // LANGUAGES`(4)로 좁혔는데, 그 과정에서 원래 있던 pt/vi가 실수로 함께 빠져 sitemap도 그
  // 4개만 올리고 있었다 — `lunar-new-year/page.tsx`/`r/[id]/page.tsx`/`unsubscribe/page.tsx`가
  // 전부 6개 언어로 복원됐으므로 sitemap도 실제 라우팅과 다시 맞춘다.
  const lunarNewYearPath = (lang: MarketingLanguage) => `/${lang}/lunar-new-year`;
  const lunarNewYearEntries = MARKETING_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${lunarNewYearPath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(MARKETING_LANGUAGES, lunarNewYearPath, DEFAULT_LANGUAGE) },
  }));

  // 개인정보처리방침(2026-08-12, saju-letter-backend에서 이관) — 2026-09-08 3차 종합 버그
  // 점검(항목 2)으로 `MARKETING_LANGUAGES`(6)로 되돌렸다. 2026-09-07 커밋이 홈/블로그와 같이
  // `LAUNCH_CONTENT_LANGUAGES`(4개)로 좁혔었지만, `privacy/page.tsx`의 게이트 자체는 같은 날
  // 이어진 점검(항목 2 앞서 처리된 3차 점검 1건)으로 이미 6개 언어로 원복됐다 — 법적 고지
  // 문서는 1차 출시 언어 축과 무관해야 한다는 원래 원칙 그대로. sitemap만 그 원복을 놓치고
  // 있었다(`/pt/privacy`·`/vi/privacy`가 실제로 정상 응답하는데 sitemap엔 안 실림).
  const privacyPath = (lang: MarketingLanguage) => `/${lang}/privacy`;
  const privacyEntries = MARKETING_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${privacyPath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(MARKETING_LANGUAGES, privacyPath, DEFAULT_LANGUAGE) },
  }));

  // 서비스 이용 안내(2026-09-02, 오락 목적 고지)도 privacy와 같은 이유로 4개 언어 대상.
  const disclaimerPath = (lang: MarketingLanguage) => `/${lang}/disclaimer`;
  const disclaimerEntries = LAUNCH_CONTENT_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${disclaimerPath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(LAUNCH_CONTENT_LANGUAGES, disclaimerPath, DEFAULT_LANGUAGE) },
  }));

  return [
    ...homeEntries,
    ...blogIndexEntries,
    ...blogPostEntries,
    ...compareEntries,
    ...lunarNewYearEntries,
    ...privacyEntries,
    ...disclaimerEntries,
  ];
}
