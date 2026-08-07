import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMarketingLanguage, isNonKoreanLanguage, type NonKoreanLanguage } from '@/lib/languages';
import { getDictionary } from '@/dictionaries';
import { getReading } from '@/lib/lunarNewYearApi';
import { EmailSignupForm } from '@/components/lunar-new-year/EmailSignupForm';
import { ShareButton } from '@/components/lunar-new-year/ShareButton';

const WEB_BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? 'http://localhost:3200';

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang, id } = await params;
  if (!isMarketingLanguage(rawLang) || !isNonKoreanLanguage(rawLang)) return {};
  const reading = await getReading(id);
  if (!reading) return {};

  return {
    title: `${reading.content.title} — Saju Letter`,
    description: reading.content.greeting,
    openGraph: {
      title: reading.content.title,
      description: reading.content.greeting,
      url: `${WEB_BASE_URL}/${rawLang}/lunar-new-year/r/${id}`,
    },
  };
}

export default async function LunarNewYearResultPage({ params }: PageProps) {
  const { lang: rawLang, id } = await params;
  if (!isMarketingLanguage(rawLang) || !isNonKoreanLanguage(rawLang)) notFound();
  const language: NonKoreanLanguage = rawLang;

  const reading = await getReading(id);
  if (!reading) notFound();

  const dict = await getDictionary(language);
  if (!dict.lunarNewYear) notFound();
  const t = dict.lunarNewYear.result;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{reading.content.title}</h1>
        <p className="mt-3 text-stone-700">{reading.content.greeting}</p>
        <p className="mt-3 text-stone-700">{reading.content.overview}</p>
        <p className="mt-3 text-stone-700">{reading.content.highlight}</p>
        <p className="mt-4 text-sm italic text-stone-500">{reading.content.closing}</p>
      </article>

      <div className="flex justify-center">
        <ShareButton
          url={`${WEB_BASE_URL}/${language}/lunar-new-year/r/${id}`}
          title={reading.content.title}
          shareLabel={t.shareButton}
          copiedLabel={t.shareCopied}
        />
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-semibold">{t.emailSectionTitle}</h2>
        <p className="mt-1 text-sm text-stone-600">{t.emailSectionSubtitle}</p>
        <div className="mt-4">
          <EmailSignupForm readingId={id} dict={t} alreadySubscribed={reading.hasEmailSubscription} />
        </div>
      </section>
    </main>
  );
}
