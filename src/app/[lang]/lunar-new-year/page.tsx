import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  isNonKoreanLanguage,
  NON_KOREAN_LANGUAGES,
  DEFAULT_LANGUAGE,
  type NonKoreanLanguage,
} from '@/lib/languages';
import { LunarNewYearHome } from '@/components/lunar-new-year/LunarNewYearHome';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';

/** ko는 원래 이 캠페인이 지원하지 않던 언어라(languages.ts의 NonKoreanLanguage) 빌드 시점에
 * 아예 대상에서 뺀다 — 레이아웃의 기본 generateStaticParams(6개 언어 전부)를 여기서 덮어쓴다. */
export async function generateStaticParams() {
  return NON_KOREAN_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isNonKoreanLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  if (!dict.lunarNewYear) return {};
  const path = (lang: NonKoreanLanguage) => `/${lang}/lunar-new-year`;

  return {
    title: dict.lunarNewYear.landing.title,
    description: dict.lunarNewYear.landing.subtitle,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: languageAlternates(NON_KOREAN_LANGUAGES, path, DEFAULT_LANGUAGE as NonKoreanLanguage),
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
  if (!isMarketingLanguage(rawLang) || !isNonKoreanLanguage(rawLang)) notFound();
  const language: NonKoreanLanguage = rawLang;
  const dict = await getDictionary(language);
  if (!dict.lunarNewYear) notFound();

  return <LunarNewYearHome language={language} dict={dict.lunarNewYear} />;
}
