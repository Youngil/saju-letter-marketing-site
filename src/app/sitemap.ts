import type { MetadataRoute } from 'next';
import {
  MARKETING_LANGUAGES,
  NON_KOREAN_LANGUAGES,
  DEFAULT_LANGUAGE,
  type MarketingLanguage,
  type NonKoreanLanguage,
  type LaunchContentLanguage,
} from '@/lib/languages';
import { BLOG_LANGUAGES, POST_SLUGS, type PostSlug } from '@/lib/posts';
import { WEB_BASE_URL, languageAlternates } from '@/lib/seo';

// DEFAULT_LANGUAGE('en')는 항상 모든 언어 부분집합 안에 있지만, languages.ts에서 더 넓은
// MarketingLanguage로 선언돼 있어(호출부마다 다시 캐스팅하지 않도록) 여기서 한 번만 좁힌다.
const DEFAULT_BLOG_LANGUAGE = DEFAULT_LANGUAGE as LaunchContentLanguage;
const DEFAULT_LUNAR_LANGUAGE = DEFAULT_LANGUAGE as NonKoreanLanguage;

export default function sitemap(): MetadataRoute.Sitemap {
  const homePath = (lang: MarketingLanguage) => `/${lang}`;
  const homeEntries = MARKETING_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${homePath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(MARKETING_LANGUAGES, homePath, DEFAULT_LANGUAGE) },
  }));

  // 블로그/compare는 1차 출시 타겟 언어(ko/en/ja/es)에만 존재한다(languages.ts의
  // LAUNCH_CONTENT_LANGUAGES, posts.ts의 BLOG_LANGUAGES 참고 — pt/vi는 1차 출시 이후 추가 예정).
  const blogIndexPath = (lang: (typeof BLOG_LANGUAGES)[number]) => `/${lang}/blog`;
  const blogIndexEntries = BLOG_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${blogIndexPath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(BLOG_LANGUAGES, blogIndexPath, DEFAULT_BLOG_LANGUAGE) },
  }));
  const blogPostPath = (slug: PostSlug) => (lang: (typeof BLOG_LANGUAGES)[number]) => `/${lang}/blog/${slug}`;
  const blogPostEntries = BLOG_LANGUAGES.flatMap((lang) =>
    POST_SLUGS.map((slug) => ({
      url: `${WEB_BASE_URL}${blogPostPath(slug)(lang)}`,
      lastModified: new Date(),
      alternates: { languages: languageAlternates(BLOG_LANGUAGES, blogPostPath(slug), DEFAULT_BLOG_LANGUAGE) },
    })),
  );
  const comparePath = (lang: (typeof BLOG_LANGUAGES)[number]) => `/${lang}/compare`;
  const compareEntries = BLOG_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${comparePath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(BLOG_LANGUAGES, comparePath, DEFAULT_BLOG_LANGUAGE) },
  }));

  // 신년운세 캠페인(2026-08-07 이관)은 위 1차 출시 언어 축과 무관하게, 원래 캠페인이 지원하던
  // 5개 언어(ko 제외)를 그대로 유지한다 — languages.ts의 NON_KOREAN_LANGUAGES 참고.
  const lunarNewYearPath = (lang: NonKoreanLanguage) => `/${lang}/lunar-new-year`;
  const lunarNewYearEntries = NON_KOREAN_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${lunarNewYearPath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(NON_KOREAN_LANGUAGES, lunarNewYearPath, DEFAULT_LUNAR_LANGUAGE) },
  }));

  // 개인정보처리방침(2026-08-12, saju-letter-backend에서 이관)은 법적 고지 문서라
  // LAUNCH_CONTENT_LANGUAGES가 아니라 홈과 같은 MARKETING_LANGUAGES(6개) 전체를 대상으로 한다.
  const privacyPath = (lang: MarketingLanguage) => `/${lang}/privacy`;
  const privacyEntries = MARKETING_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}${privacyPath(lang)}`,
    lastModified: new Date(),
    alternates: { languages: languageAlternates(MARKETING_LANGUAGES, privacyPath, DEFAULT_LANGUAGE) },
  }));

  return [...homeEntries, ...blogIndexEntries, ...blogPostEntries, ...compareEntries, ...lunarNewYearEntries, ...privacyEntries];
}
