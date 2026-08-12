import type { MetadataRoute } from 'next';
import { MARKETING_LANGUAGES, NON_KOREAN_LANGUAGES } from '@/lib/languages';
import { BLOG_LANGUAGES, POST_SLUGS } from '@/lib/posts';

const WEB_BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? 'http://localhost:3200';

export default function sitemap(): MetadataRoute.Sitemap {
  const homeEntries = MARKETING_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}/${lang}`,
    lastModified: new Date(),
  }));

  // 블로그/compare는 1차 출시 타겟 언어(ko/en/ja/es)에만 존재한다(languages.ts의
  // LAUNCH_CONTENT_LANGUAGES, posts.ts의 BLOG_LANGUAGES 참고 — pt/vi는 1차 출시 이후 추가 예정).
  const blogIndexEntries = BLOG_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}/${lang}/blog`,
    lastModified: new Date(),
  }));
  const blogPostEntries = BLOG_LANGUAGES.flatMap((lang) =>
    POST_SLUGS.map((slug) => ({
      url: `${WEB_BASE_URL}/${lang}/blog/${slug}`,
      lastModified: new Date(),
    })),
  );
  const compareEntries = BLOG_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}/${lang}/compare`,
    lastModified: new Date(),
  }));

  // 신년운세 캠페인(2026-08-07 이관)은 위 1차 출시 언어 축과 무관하게, 원래 캠페인이 지원하던
  // 5개 언어(ko 제외)를 그대로 유지한다 — languages.ts의 NON_KOREAN_LANGUAGES 참고.
  const lunarNewYearEntries = NON_KOREAN_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}/${lang}/lunar-new-year`,
    lastModified: new Date(),
  }));

  // 개인정보처리방침(2026-08-12, saju-letter-backend에서 이관)은 법적 고지 문서라
  // LAUNCH_CONTENT_LANGUAGES가 아니라 홈과 같은 MARKETING_LANGUAGES(6개) 전체를 대상으로 한다.
  const privacyEntries = MARKETING_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}/${lang}/privacy`,
    lastModified: new Date(),
  }));

  return [...homeEntries, ...blogIndexEntries, ...blogPostEntries, ...compareEntries, ...lunarNewYearEntries, ...privacyEntries];
}
