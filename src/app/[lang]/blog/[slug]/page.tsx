import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  isLaunchContentLanguage,
  LAUNCH_CONTENT_LANGUAGES,
  DEFAULT_LANGUAGE,
  type LaunchContentLanguage,
} from '@/lib/languages';
import { BLOG_LANGUAGES, getPostContent, POST_SLUGS } from '@/lib/posts';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';
import { articleJsonLd } from '@/lib/structuredData';
import { BlogByline, categoryLabelFor } from '@/components/BlogByline';
import { blogMdxComponents } from '@/components/blog/BlogDiagrams';

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
  const content = await getPostContent(rawLang, slug);
  if (!content) return {};
  const path = (lang: LaunchContentLanguage) => `/${lang}/blog/${slug}`;

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: languageAlternates(LAUNCH_CONTENT_LANGUAGES, path, DEFAULT_LANGUAGE as LaunchContentLanguage),
    },
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
  const content = await getPostContent(lang, slug);
  if (!content) notFound();
  const dict = await getDictionary(lang);
  const { meta } = content;

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              title: meta.title,
              description: meta.description,
              datePublished: meta.date,
              url: `${WEB_BASE_URL}/${lang}/blog/${slug}`,
              brand: dict.brand,
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
            <MDXRemote source={content.bodyMdx} components={blogMdxComponents} />
          )}
        </div>
      </div>
      <Link href={`/${lang}/blog`} className="mt-8 inline-block text-accent-warm underline-offset-2 hover:underline">
        ← {dict.blog.title}
      </Link>
    </article>
  );
}
