import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, type MarketingLanguage } from '@/lib/languages';
import { UnsubscribeStatus } from '@/components/UnsubscribeStatus';

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
