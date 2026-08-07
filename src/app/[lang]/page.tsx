import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, TONE_GROUP, type MarketingLanguage } from '@/lib/languages';
import { AstrologyInfographic } from '@/components/AstrologyInfographic';
import { DemoForm } from '@/components/DemoForm';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { notFound } from 'next/navigation';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
  const dict = await getDictionary(lang);
  const toneGroup = TONE_GROUP[lang];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-12">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">{dict.hero.title}</h1>
        <p className="max-w-2xl text-lg text-foreground/70">{dict.hero.subtitle}</p>
        <a
          href="#demo"
          className="rounded-full bg-accent px-8 py-3 font-medium text-white transition hover:opacity-90"
        >
          {dict.hero.ctaDemo}
        </a>
      </section>

      <AstrologyInfographic dict={dict.infographic} toneGroup={toneGroup} />

      <section id="demo" className="flex flex-col gap-4">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold">{dict.demo.title}</h2>
          <p className="mx-auto max-w-xl text-foreground/70">{dict.demo.subtitle}</p>
        </div>
        <div className="mx-auto w-full max-w-md">
          <DemoForm language={lang} dict={dict.demo} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-md">
        <LeadCaptureForm language={lang} dict={dict.leadCapture} />
      </section>
    </div>
  );
}
