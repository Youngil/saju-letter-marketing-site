import type { MetadataRoute } from 'next';
import { MARKETING_LANGUAGES, DEFAULT_LANGUAGE, type MarketingLanguage } from '@/lib/languages';
import { BLOG_LANGUAGES, getSlugLanguageMap } from '@/lib/posts';
import { WEB_BASE_URL, activeLanguageAlternates, languageAlternates } from '@/lib/seo';
import { activeContentLanguages, fetchActiveServiceLanguages } from '@/lib/serviceLanguagesApi';

// 2026-09-08 3차 종합 버그 점검(항목 1) — `[lang]/page.tsx`/`blog/page.tsx`/`blog/[slug]/page.tsx`가
// 2026-09-06 블로그 DB 하이브리드 전환 때 "이게 없으면 DB에 새로 발행한 글이 다음 배포 전까지
// 사이트에 안 나타난다"는 이유로 이미 `revalidate = 3600`을 붙였는데, 같은 DB(`getAllPostSummaries`)를
// 조회하는 이 sitemap.ts에는 그때 빠져 있었다 — 그 결과 DB로 발행된 새 글이 검색엔진용
// sitemap.xml에는 다음 코드 배포 전까지 영원히 안 올라갈 수 있었다(라우트 자체는 ISR로 바로
// 보였지만 sitemap은 무기한 캐시). 위 세 파일과 같은 값(1시간)으로 맞춘다.
export const revalidate = 3600;

// `lastModified`(2026-10-06 전체 점검 3차): 예전엔 모든 항목에 `new Date()`를 넣어 sitemap을 만들 때마다 전부 "방금
// 바뀜"으로 보였다(검색엔진이 신호를 무시하게 된다). 블로그 글은 그 언어판의 글 날짜를 쓰고, 정적 페이지는 뺀다.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 관리자가 켠 언어(2026-10-06 전체 점검 3차 후속) — 홈·블로그·compare도 콘텐츠 축(ko/en/ja/es) 중 지금 켠 언어만 올리고
  // hreflang도 그 언어끼리만 건다. 예전엔 정적 4개 언어를 그대로 써, 관리자가 언어를 꺼도(홈은 데모·링크를 숨긴 noindex
  // 상태) sitemap은 계속 그 언어판을 알렸다. x-default는 관리자가 정한 기본 언어(middleware 자동 감지 폴백과 같다).
  const serviceLanguages = await fetchActiveServiceLanguages();
  const { active: activeLanguages, default: activeDefault } = serviceLanguages;
  const contentLanguages = activeContentLanguages(serviceLanguages, BLOG_LANGUAGES);

  // pt/vi는 홈·블로그·compare가 없다(콘텐츠 축 밖, [lang]/page.tsx 등이 404) — 올려 봐야 죽은 링크다.
  const homePath = (lang: MarketingLanguage) => `/${lang}`;
  const homeEntries = contentLanguages.map((lang) => ({
    url: `${WEB_BASE_URL}${homePath(lang)}`,
    alternates: { languages: activeLanguageAlternates(contentLanguages, homePath, activeDefault) },
  }));

  const blogIndexPath = (lang: (typeof BLOG_LANGUAGES)[number]) => `/${lang}/blog`;
  const blogIndexEntries = contentLanguages.map((lang) => ({
    url: `${WEB_BASE_URL}${blogIndexPath(lang)}`,
    alternates: { languages: activeLanguageAlternates(contentLanguages, blogIndexPath, activeDefault) },
  }));
  // 2026-09-06부터 slug 목록이 코드 상수(POST_SLUGS)만으로 안 끝난다 — DB 저장 글(코드 배포
  // 없이 발행)이 언어별로 다른 조합으로 존재할 수 있어, 언어마다 실제 발행된 글을 직접 조회해
  // slug→가능한 언어 집합을 구성한다(각 slug가 실제로 번역된 언어에만 alternates를 건다).
  const languagesBySlug = await getSlugLanguageMap();
  const blogPostPath = (slug: string) => (lang: (typeof BLOG_LANGUAGES)[number]) => `/${lang}/blog/${slug}`;
  // 글도 켠 언어판만(글이 그 언어로 발행됐고 + 그 언어가 켜져 있어야).
  const blogPostEntries = Array.from(languagesBySlug.entries()).flatMap(([slug, entries]) => {
    const activeEntries = entries.filter((entry) => contentLanguages.includes(entry.lang));
    const availableLangs = activeEntries.map((entry) => entry.lang);
    return activeEntries.map(({ lang, date }) => ({
      url: `${WEB_BASE_URL}${blogPostPath(slug)(lang)}`,
      lastModified: date,
      alternates: { languages: activeLanguageAlternates(availableLangs, blogPostPath(slug), activeDefault) },
    }));
  });
  const comparePath = (lang: (typeof BLOG_LANGUAGES)[number]) => `/${lang}/compare`;
  const compareEntries = contentLanguages.map((lang) => ({
    url: `${WEB_BASE_URL}${comparePath(lang)}`,
    alternates: { languages: activeLanguageAlternates(contentLanguages, comparePath, activeDefault) },
  }));

  // 신년운세 캠페인(2026-08-07 이관) — 2026-09-08 3차 종합 버그 점검(항목 1)으로
  // `MARKETING_LANGUAGES`(6)로 되돌렸다. 2026-09-07 커밋이 ko를 포함시키며 `LAUNCH_CONTENT_
  // LANGUAGES`(4)로 좁혔는데, 그 과정에서 원래 있던 pt/vi가 실수로 함께 빠져 sitemap도 그
  // 4개만 올리고 있었다 — `lunar-new-year/page.tsx`/`r/[id]/page.tsx`/`unsubscribe/page.tsx`가
  // 전부 6개 언어로 복원됐으므로 sitemap도 실제 라우팅과 다시 맞춘다.
  // 2026-10-06: 랜딩은 지금 서비스 중인 언어만 열리므로(비활성 언어는 기본 언어로 리다이렉트) sitemap도 그 언어만 올린다.
  const lunarNewYearPath = (lang: MarketingLanguage) => `/${lang}/lunar-new-year`;
  const lunarNewYearEntries = activeLanguages.map((lang) => ({
    url: `${WEB_BASE_URL}${lunarNewYearPath(lang)}`,
    alternates: { languages: languageAlternates(activeLanguages, lunarNewYearPath, activeDefault) },
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
    alternates: { languages: languageAlternates(MARKETING_LANGUAGES, privacyPath, DEFAULT_LANGUAGE) },
  }));

  // 서비스 이용 안내(2026-09-02, 오락 목적 고지) — 2026-09-09 5차 종합 버그 점검으로
  // `disclaimer/page.tsx`의 게이트를 `MARKETING_LANGUAGES`(6)로 되돌렸으므로(privacy와 같은
  // 이유로 법적/안전 고지 문서라 1차 출시 언어 축과 무관해야 함) sitemap도 함께 맞춘다.
  const disclaimerPath = (lang: MarketingLanguage) => `/${lang}/disclaimer`;
  const disclaimerEntries = MARKETING_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${disclaimerPath(lang)}`,
    alternates: { languages: languageAlternates(MARKETING_LANGUAGES, disclaimerPath, DEFAULT_LANGUAGE) },
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
