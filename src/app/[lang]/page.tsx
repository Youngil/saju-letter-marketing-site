import type { Metadata } from 'next';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  isLaunchContentLanguage,
  MARKETING_LANGUAGES,
  DEFAULT_LANGUAGE,
  type MarketingLanguage,
} from '@/lib/languages';
import { DemoForm } from '@/components/DemoForm';
// LeadCaptureForm import는 아래 렌더링과 함께 잠시 꺼뒀다(2026-09-02) — §leadCapture 참고.
import { AppDownloadLinks } from '@/components/AppDownloadLinks';
import { DainHomeMark } from '@/components/DainHomeMark';
import { BlogByline, categoryLabelFor } from '@/components/BlogByline';
import { getLatestPostSummary } from '@/lib/posts';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  const path = (lang: MarketingLanguage) => `/${lang}`;

  return {
    title: dict.hero.title,
    description: dict.hero.subtitle,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: languageAlternates(MARKETING_LANGUAGES, path, DEFAULT_LANGUAGE),
    },
    ...buildSocialMetadata({
      title: dict.hero.title,
      description: dict.hero.subtitle,
      url: `${WEB_BASE_URL}${path(rawLang)}`,
    }),
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
  const dict = await getDictionary(lang);
  const showContentLinks = isLaunchContentLanguage(lang);
  const latestPost = showContentLinks ? await getLatestPostSummary(lang) : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16 px-4 py-14 sm:gap-20 sm:py-20">
      {/* 한 장의 편지처럼 읽히도록 히어로+데모를 좁은 폭으로 묶는다(Phase 3). */}
      <section className="letter-surface flex flex-col items-center gap-6 rounded-sm px-6 py-10 text-center sm:px-10 sm:py-12">
        <DainHomeMark
          name={dict.hero.dainName}
          role={dict.hero.dainRole}
          learnAboutLabel={showContentLinks ? dict.hero.learnAboutDain : undefined}
          learnAboutHref={showContentLinks ? `/${lang}/blog/who-writes-your-letter` : undefined}
        />
        <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {dict.hero.title}
        </h1>
        <p className="max-w-xl text-lg text-foreground/70">{dict.hero.subtitle}</p>
        <a
          href="#demo"
          className="rounded-full bg-accent-warm px-8 py-3 font-medium text-white transition hover:bg-accent-warm/90"
        >
          {dict.hero.ctaDemo}
        </a>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground/40">{dict.appLinks.sectionLabel}</span>
          <AppDownloadLinks dict={dict.appLinks} />
        </div>
        {showContentLinks ? (
          <p className="max-w-md text-sm text-foreground/55">
            {dict.hero.compareHint}{' '}
            <Link href={`/${lang}/compare`} className="font-medium text-accent-warm underline-offset-2 hover:underline">
              {dict.hero.compareLink}
            </Link>
          </p>
        ) : null}
      </section>

      <section id="demo" className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-display mb-2 text-2xl font-semibold sm:text-3xl">{dict.demo.title}</h2>
          <p className="mx-auto max-w-xl text-foreground/70">{dict.demo.subtitle}</p>
        </div>
        <div className="mx-auto w-full max-w-md">
          <DemoForm language={lang} dict={dict.demo} appLinksDict={dict.appLinks} />
        </div>
      </section>

      {latestPost ? (
        <section className="mx-auto w-full max-w-md">
          <p className="mb-3 text-center text-xs font-medium tracking-wide text-foreground/45 uppercase">
            {dict.blog.thisWeekLabel}
          </p>
          <article className="letter-surface rounded-sm px-5 py-6 text-left sm:px-6">
            <BlogByline
              byLabel={dict.blog.byLabel}
              dateIso={latestPost.date}
              lang={lang}
              categoryLabel={categoryLabelFor(latestPost.category, dict.blog.categories)}
            />
            <h2 className="font-display mt-3 text-xl font-semibold leading-snug">
              <Link href={`/${lang}/blog/${latestPost.slug}`} className="hover:text-accent-warm">
                {latestPost.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-foreground/70">{latestPost.description}</p>
            <Link
              href={`/${lang}/blog/${latestPost.slug}`}
              className="mt-4 inline-block text-sm font-medium text-accent-warm underline-offset-2 hover:underline"
            >
              {dict.blog.thisWeekCta} →
            </Link>
          </article>
        </section>
      ) : null}

      {/* 리드 캡처("다인의 짧은 소개 편지 받기 — 30일 체험 포함")를 잠시 화면에서 뺐다
          (2026-09-02, 사용자 요청: "쿠폰과 코드와 관련해서 개념을 새롭게 만들어가려고 한다,
          그동안 화면에 표시하지 않도록 처리") — 30일 체험 쿠폰 개념 자체를 재검토 중이라, 그
          개념이 정리될 때까지 노출을 멈추는 임시 조치다. 컴포넌트(LeadCaptureForm.tsx)와
          문구(dict.leadCapture)는 그대로 남겨뒀다 — 재개할 때 이 주석을 걷어내고 아래 줄만
          되살리면 된다.
      <section className="mx-auto w-full max-w-md">
        <LeadCaptureForm language={lang} dict={dict.leadCapture} />
      </section>
      */}
    </div>
  );
}
