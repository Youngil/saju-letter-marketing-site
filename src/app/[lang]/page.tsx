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
    <div className="mx-auto flex max-w-5xl flex-col gap-20 px-4 py-14 sm:py-20">
      <section className="relative flex flex-col items-center gap-6 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl sm:h-96 sm:w-96"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />
        <span className="rounded-full border border-accent/25 bg-accent/5 px-4 py-1 text-xs font-medium tracking-wide text-accent">
          {dict.brand}
        </span>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">{dict.hero.title}</h1>
        <p className="max-w-2xl text-lg text-foreground/70">{dict.hero.subtitle}</p>
        <a
          href="#demo"
          className="rounded-full bg-accent px-8 py-3.5 font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
        >
          {dict.hero.ctaDemo}
        </a>
      </section>

      <AstrologyInfographic
        dict={dict.infographic}
        toneGroup={toneGroup}
        pillarLabels={{ year: dict.demo.yearLabel, month: dict.demo.monthLabel, day: dict.demo.dayLabel, hour: dict.demo.hourLabel }}
      />

      <section id="demo" className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold sm:text-3xl">{dict.demo.title}</h2>
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
