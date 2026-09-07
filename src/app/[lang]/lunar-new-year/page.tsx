import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  isLaunchContentLanguage,
  LAUNCH_CONTENT_LANGUAGES,
  DEFAULT_LANGUAGE,
  type LaunchContentLanguage,
} from '@/lib/languages';
import { LunarNewYearHome } from '@/components/lunar-new-year/LunarNewYearHome';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';

/**
 * 서비스 언어 통합 관리(2026-09-07) — 이 캠페인도 `LAUNCH_CONTENT_LANGUAGES`(ko 포함)를 그대로
 * 따른다(`saju-letter-backend`가 `CAMPAIGN_LANGUAGES` 독립 하드코딩을 폐기하고
 * `getActiveServiceLanguages()`를 쓰도록 뒤집은 것과 짝). 이전엔 ko를 원래 지원하지 않던
 * 언어라 별도 5개 언어 목록(`NON_KOREAN_LANGUAGES`)으로 빌드 시점에 뺐지만, 이제 레이아웃의
 * 기본 generateStaticParams(6개 언어 전부)를 이 4개로 좁히는 용도로만 이 오버라이드가 남는다.
 */
export async function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  if (!dict.lunarNewYear) return {};
  const path = (lang: LaunchContentLanguage) => `/${lang}/lunar-new-year`;

  return {
    title: dict.lunarNewYear.landing.title,
    description: dict.lunarNewYear.landing.subtitle,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: languageAlternates(LAUNCH_CONTENT_LANGUAGES, path, DEFAULT_LANGUAGE as LaunchContentLanguage),
    },
    ...buildSocialMetadata({
      title: dict.lunarNewYear.landing.title,
      description: dict.lunarNewYear.landing.subtitle,
      url: `${WEB_BASE_URL}${path(rawLang)}`,
      images: [`${WEB_BASE_URL}/${rawLang}/opengraph-image`],
    }),
  };
}

export default async function LunarNewYearPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
  const language: LaunchContentLanguage = rawLang;
  const dict = await getDictionary(language);
  if (!dict.lunarNewYear) notFound();

  return <LunarNewYearHome language={language} dict={dict.lunarNewYear} appLinksDict={dict.appLinks} />;
}
