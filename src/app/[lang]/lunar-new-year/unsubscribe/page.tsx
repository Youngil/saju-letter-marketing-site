import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, isNonKoreanLanguage, NON_KOREAN_LANGUAGES, type NonKoreanLanguage } from '@/lib/languages';
import { UnsubscribeStatus } from '@/components/lunar-new-year/UnsubscribeStatus';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export async function generateStaticParams() {
  return NON_KOREAN_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isNonKoreanLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  if (!dict.lunarNewYear) return {};
  return { title: dict.lunarNewYear.unsubscribe.title, robots: NOINDEX_ROBOTS };
}

export default async function LunarNewYearUnsubscribePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isNonKoreanLanguage(rawLang)) notFound();
  const language: NonKoreanLanguage = rawLang;
  const dict = await getDictionary(language);
  if (!dict.lunarNewYear) notFound();

  return (
    <Suspense fallback={null}>
      <UnsubscribeStatus dict={dict.lunarNewYear.unsubscribe} />
    </Suspense>
  );
}
