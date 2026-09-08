import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, MARKETING_LANGUAGES, type MarketingLanguage } from '@/lib/languages';
import { UnsubscribeStatus } from '@/components/lunar-new-year/UnsubscribeStatus';
import { NOINDEX_ROBOTS } from '@/lib/seo';

/**
 * 2026-09-08 3차 종합 버그 점검(항목 1)으로 `MARKETING_LANGUAGES`(6)로 되돌렸다 — 이미 발송된
 * 드립 이메일의 수신거부 링크는 언어와 무관하게 계속 열려야 하는 트랜잭션 축이다(사이트 자체의
 * `/[lang]/unsubscribe`와 같은 원칙). `lunar-new-year/page.tsx`와 같은 이유로 ko를 포함하되,
 * 2026-09-07 커밋이 함께 빠뜨렸던 pt/vi도 되살렸다. */
export async function generateStaticParams() {
  return MARKETING_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  if (!dict.lunarNewYear) return {};
  return { title: dict.lunarNewYear.unsubscribe.title, robots: NOINDEX_ROBOTS };
}

export default async function LunarNewYearUnsubscribePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) notFound();
  const language: MarketingLanguage = rawLang;
  const dict = await getDictionary(language);
  if (!dict.lunarNewYear) notFound();

  return (
    <Suspense fallback={null}>
      <UnsubscribeStatus dict={dict.lunarNewYear.unsubscribe} />
    </Suspense>
  );
}
