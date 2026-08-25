import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, type MarketingLanguage } from '@/lib/languages';
import { UnsubscribeStatus } from '@/components/UnsubscribeStatus';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) return {};
  const dict = await getDictionary(lang);
  // 트랜잭션 전용 페이지(수신거부 처리)라 검색결과에 노출될 이유가 없다.
  return { title: dict.unsubscribe.title, robots: NOINDEX_ROBOTS };
}

export default async function UnsubscribePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={null}>
      <UnsubscribeStatus dict={dict.unsubscribe} />
    </Suspense>
  );
}
