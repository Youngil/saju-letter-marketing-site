import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  isLaunchContentLanguage,
  type LaunchContentLanguage,
} from '@/lib/languages';
import { activeContentLanguages, fetchActiveServiceLanguages } from '@/lib/serviceLanguagesApi';
import { BLOG_LANGUAGES, getLanguagesForSlug, getPostContent, POST_SLUGS } from '@/lib/posts';
import { jsonLdScript } from '@/lib/structuredData';
import { isValidBlogSlug } from '@/lib/routeParams';
import { SafeMdx } from '@/components/blog/SafeMdx';
import { WEB_BASE_URL, activeLanguageAlternates, buildSocialMetadata, NOINDEX_ROBOTS } from '@/lib/seo';
import { articleJsonLd } from '@/lib/structuredData';
import { BlogByline, categoryLabelFor } from '@/components/BlogByline';
import { SwitcherLanguageLimit } from '@/components/SwitcherLanguageLimit';

// 정적 파일 글(POST_SLUGS)만 빌드 시점에 미리 만든다 — DB 저장 글(2026-09-06)은 이 목록에 없어도
// Next.js의 기본 `dynamicParams: true`가 최초 요청 시점에 렌더해준다(코드 배포 없이 발행하는
// 것이 이 기능의 목적이라, DB 글을 여기 추가로 나열할 방법 자체가 없다 — 빌드 시점엔 아직 모름).
// `export const revalidate` 없이는 이 페이지가 한 번 렌더된 뒤 무기한 캐시되므로, 아래에서
// ISR 재검증 주기를 함께 지정한다.
export async function generateStaticParams() {
  return BLOG_LANGUAGES.flatMap((lang) => POST_SLUGS.map((slug) => ({ lang, slug })));
}

/** 1시간마다 재검증 — DB에 새로 발행되거나 수정된 글이 코드 배포 없이도 최대 1시간 안에 반영된다. */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) return {};
  if (!isValidBlogSlug(slug)) return {};
  const content = await getPostContent(rawLang, slug);
  if (!content) return {};
  const path = (lang: LaunchContentLanguage) => `/${lang}/blog/${slug}`;
  // 실제로 공개됐고 + 지금 켠 언어만 hreflang에 건다(sitemap.ts와 같은 계산, 켠 언어 필터는 2026-10-06 전체 점검 3차 후속).
  const [available, serviceLanguages] = await Promise.all([getLanguagesForSlug(slug), fetchActiveServiceLanguages()]);
  const alternateLanguages = activeContentLanguages(serviceLanguages, available.length > 0 ? available : [rawLang]);
  // 관리자가 이 언어를 껐으면 홈([lang]/page.tsx)과 같이 noindex — 글이 있는지(available)와 무관하게 이 페이지 언어 자체를
  // 본다(2026-10-06 전체 점검 5차).
  const isActive = activeContentLanguages(serviceLanguages).includes(rawLang);

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: activeLanguageAlternates(alternateLanguages, path, serviceLanguages.default),
    },
    ...(isActive ? {} : { robots: NOINDEX_ROBOTS }),
    ...buildSocialMetadata({
      title: content.meta.title,
      description: content.meta.description,
      url: `${WEB_BASE_URL}${path(rawLang)}`,
      images: [`${WEB_BASE_URL}/${rawLang}/opengraph-image`],
    }),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
  const lang: LaunchContentLanguage = rawLang;
  // 모양부터 틀린 slug는 백엔드를 부르기 전에 404(2026-10-06 전체 점검 11차 R11-6-1).
  if (!isValidBlogSlug(slug)) notFound();
  const content = await getPostContent(lang, slug);
  if (!content) notFound();
  const dict = await getDictionary(lang);
  const { meta } = content;
  // 언어 스위처가 이 글이 없는 언어로 보내 404가 나지 않게(2026-10-06 전체 점검 3차) — 그런 언어는 블로그 목록으로.
  const available = await getLanguagesForSlug(slug);

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <SwitcherLanguageLimit
        restOfPath={`/blog/${slug}`}
        languages={available.length > 0 ? available : [lang]}
        fallbackRestOfPath="/blog"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            articleJsonLd({
              title: meta.title,
              description: meta.description,
              datePublished: meta.date,
              url: `${WEB_BASE_URL}/${lang}/blog/${slug}`,
              brand: dict.brand,
              image: `${WEB_BASE_URL}/${lang}/opengraph-image`,
            }),
          ),
        }}
      />
      <div className="letter-surface rounded-sm px-5 py-8 sm:px-8 sm:py-10">
        <BlogByline
          byLabel={dict.blog.byLabel}
          dateIso={meta.date}
          lang={lang}
          categoryLabel={categoryLabelFor(meta.category, dict.blog.categories)}
          size="md"
        />
        <h1 className="font-display mt-4 text-3xl font-semibold leading-tight">{meta.title}</h1>
        <p className="mt-3 text-lg text-foreground/65">{meta.description}</p>
        <div className="mt-8 border-t border-foreground/10 pt-8 text-[1.05rem] leading-relaxed text-foreground/85">
          {content.source === 'file' ? (
            <content.Component />
          ) : (
            <SafeMdx source={content.bodyMdx} slug={slug} />
          )}
        </div>
      </div>
      <Link href={`/${lang}/blog`} className="mt-8 inline-block text-accent-warm underline-offset-2 hover:underline">
        ← {dict.blog.title}
      </Link>
    </article>
  );
}
