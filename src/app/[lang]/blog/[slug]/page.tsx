import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  isLaunchContentLanguage,
  LAUNCH_CONTENT_LANGUAGES,
  DEFAULT_LANGUAGE,
  type LaunchContentLanguage,
} from '@/lib/languages';
import { BLOG_LANGUAGES, getPostModule, POST_SLUGS, type PostSlug } from '@/lib/posts';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';
import { articleJsonLd } from '@/lib/structuredData';
import { BlogByline, categoryLabelFor } from '@/components/BlogByline';

export async function generateStaticParams() {
  return BLOG_LANGUAGES.flatMap((lang) => POST_SLUGS.map((slug) => ({ lang, slug })));
}

function isPostSlug(value: string): value is PostSlug {
  return (POST_SLUGS as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, slug: rawSlug } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang) || !isPostSlug(rawSlug)) return {};
  const mod = await getPostModule(rawLang, rawSlug);
  if (!mod) return {};
  const slug = rawSlug;
  const path = (lang: LaunchContentLanguage) => `/${lang}/blog/${slug}`;

  return {
    title: mod.meta.title,
    description: mod.meta.description,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: languageAlternates(LAUNCH_CONTENT_LANGUAGES, path, DEFAULT_LANGUAGE as LaunchContentLanguage),
    },
    ...buildSocialMetadata({
      title: mod.meta.title,
      description: mod.meta.description,
      url: `${WEB_BASE_URL}${path(rawLang)}`,
      images: [`${WEB_BASE_URL}/${rawLang}/opengraph-image`],
    }),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug: rawSlug } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang) || !isPostSlug(rawSlug)) notFound();
  const lang: LaunchContentLanguage = rawLang;
  const mod = await getPostModule(lang, rawSlug);
  if (!mod) notFound();
  const dict = await getDictionary(lang);
  const { Component, meta } = mod;

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
              url: `${WEB_BASE_URL}/${lang}/blog/${rawSlug}`,
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
          <Component />
        </div>
      </div>
      <Link href={`/${lang}/blog`} className="mt-8 inline-block text-accent-warm underline-offset-2 hover:underline">
        ← {dict.blog.title}
      </Link>
    </article>
  );
}
