import type { Metadata } from 'next';
import Link from 'next/link';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  isLaunchContentLanguage,
  LAUNCH_CONTENT_LANGUAGES,
  DEFAULT_LANGUAGE,
  type MarketingLanguage,
} from '@/lib/languages';
// 홈 미니 데모·리드 캡처도 2026-09-05부터 LAUNCH_CONTENT_LANGUAGES(4개)로 제한됐고,
// 2026-09-07부터는 이 페이지 자체(부모 레이아웃 게이트 포함)도 6개 언어가 아니라 이 4개
// 언어에서만 렌더된다 — 아래 showContentLinks는 이제 사실상 항상 true이지만(도달했다는 것
// 자체가 이미 LAUNCH_CONTENT_LANGUAGES라는 뜻) 방어적으로 그대로 남겨뒀다.
import { fetchActiveServiceLanguages } from '@/lib/serviceLanguagesApi';
import { DemoForm } from '@/components/DemoForm';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { AppDownloadLinks } from '@/components/AppDownloadLinks';
import { DainHomeMark } from '@/components/DainHomeMark';
import { BlogByline, categoryLabelFor } from '@/components/BlogByline';
import { getLatestPostSummary } from '@/lib/posts';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

// "이번 주 다인의 글"이 DB 저장 글(2026-09-06)일 수도 있어, blog/page.tsx와 같은 주기로
// 재검증한다 — 없으면 새로 발행된 글이 코드 배포 없이는 여기 절대 안 나타난다.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  const path = (lang: MarketingLanguage) => `/${lang}`;

  return {
    title: dict.hero.title,
    description: dict.hero.subtitle,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: languageAlternates(LAUNCH_CONTENT_LANGUAGES, path, DEFAULT_LANGUAGE),
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
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
  const dict = await getDictionary(lang);
  // 서비스 언어 통합 관리(2026-09-07) — showContentLinks는 이제 "이 언어에 블로그/compare
  // 콘텐츠가 구조적으로 있는가"(isLaunchContentLanguage)뿐 아니라 "이 언어가 지금 관리자
  // 패널에서 활성 상태인가"(fetchActiveServiceLanguages, 최대 1시간 캐시)도 함께 본다 —
  // 관리자가 한 언어를 일시 중지하면 그 언어의 데모/블로그 CTA도 함께 조용히 숨는다.
  const { active: activeLanguages } = await fetchActiveServiceLanguages();
  const showContentLinks = isLaunchContentLanguage(lang) && activeLanguages.includes(lang);
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
        {showContentLinks ? (
          <a
            href="#demo"
            className="rounded-full bg-accent-warm px-8 py-3 font-medium text-white transition hover:bg-accent-warm/90"
          >
            {dict.hero.ctaDemo}
          </a>
        ) : null}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground/40">{dict.appLinks.sectionLabel}</span>
          <AppDownloadLinks dict={dict.appLinks} context="home_hero" />
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

      {showContentLinks ? (
        <section id="demo" className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="font-display mb-2 text-2xl font-semibold sm:text-3xl">{dict.demo.title}</h2>
            <p className="mx-auto max-w-xl text-foreground/70">{dict.demo.subtitle}</p>
          </div>
          <div className="mx-auto w-full max-w-md">
            <DemoForm language={lang} dict={dict.demo} appLinksDict={dict.appLinks} />
          </div>
        </section>
      ) : null}

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

      {/* 리드 캡처 재개(2026-09-08) — 2026-09-02에 "쿠폰과 코드 개념을 새로 정리하는 동안
          화면에서 빼달라"는 요청으로 잠시 꺼뒀던 것을, 그 개념 정리(2026-09-03 이벤트→쿠폰→
          코드 3단 리팩터링)가 끝나고 실제 서비스 출시 주간에 들어서면서 다시 켰다.
          showContentLinks 게이트 안에서만 렌더한다 — 데모 폼과 같은 이유(pt/vi는 개인화
          콘텐츠 서비스 대상이 아님)로 이 폼도 4개 언어로 제한한다. */}
      {showContentLinks ? (
        <section className="mx-auto w-full max-w-md">
          <LeadCaptureForm language={lang} dict={dict.leadCapture} />
        </section>
      ) : null}
    </div>
  );
}
