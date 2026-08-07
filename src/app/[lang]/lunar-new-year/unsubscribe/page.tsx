import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, isNonKoreanLanguage, NON_KOREAN_LANGUAGES, type NonKoreanLanguage } from '@/lib/languages';
import { UnsubscribeStatus } from '@/components/lunar-new-year/UnsubscribeStatus';

export async function generateStaticParams() {
  return NON_KOREAN_LANGUAGES.map((lang) => ({ lang }));
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
