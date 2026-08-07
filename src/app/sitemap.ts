import type { MetadataRoute } from 'next';
import { MARKETING_LANGUAGES } from '@/lib/languages';
import { BLOG_LANGUAGES, POST_SLUGS } from '@/lib/posts';

const WEB_BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? 'http://localhost:3200';

export default function sitemap(): MetadataRoute.Sitemap {
  const homeEntries = MARKETING_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}/${lang}`,
    lastModified: new Date(),
  }));

  // 블로그/compare는 ko를 제외한 SEO 대상 5개 언어에만 존재한다(languages.ts, posts.ts 참고 — ko는 PR/QA 전용).
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

  // 신년운세 캠페인(2026-08-07 이관)도 ko를 지원하지 않던 원래 캠페인과 같은 5개 언어만 대상이다.
  const lunarNewYearEntries = BLOG_LANGUAGES.map((lang) => ({
    url: `${WEB_BASE_URL}/${lang}/lunar-new-year`,
    lastModified: new Date(),
  }));

  return [...homeEntries, ...blogIndexEntries, ...blogPostEntries, ...compareEntries, ...lunarNewYearEntries];
}
