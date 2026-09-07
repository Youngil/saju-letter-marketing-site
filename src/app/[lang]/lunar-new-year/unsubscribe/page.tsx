import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, isLaunchContentLanguage, LAUNCH_CONTENT_LANGUAGES, type LaunchContentLanguage } from '@/lib/languages';
import { UnsubscribeStatus } from '@/components/lunar-new-year/UnsubscribeStatus';
import { NOINDEX_ROBOTS } from '@/lib/seo';

/** 서비스 언어 통합 관리(2026-09-07) — lunar-new-year/page.tsx와 같은 이유로 ko 포함
 * `LAUNCH_CONTENT_LANGUAGES`를 그대로 따른다. */
export async function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  if (!dict.lunarNewYear) return {};
  return { title: dict.lunarNewYear.unsubscribe.title, robots: NOINDEX_ROBOTS };
}

export default async function LunarNewYearUnsubscribePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
  const language: LaunchContentLanguage = rawLang;
  const dict = await getDictionary(language);
  if (!dict.lunarNewYear) notFound();

  return (
    <Suspense fallback={null}>
      <UnsubscribeStatus dict={dict.lunarNewYear.unsubscribe} />
    </Suspense>
  );
}
