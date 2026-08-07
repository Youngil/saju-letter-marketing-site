import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, isLaunchContentLanguage, type LaunchContentLanguage } from '@/lib/languages';
import { BLOG_LANGUAGES, getPostModule, POST_SLUGS, type PostSlug } from '@/lib/posts';

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
  return { title: mod.meta.title, description: mod.meta.description };
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
      <h1 className="mb-2 text-3xl font-bold">{meta.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{meta.date}</p>
      <Component />
      <Link href={`/${lang}/blog`} className="mt-8 inline-block text-accent hover:underline">
        ← {dict.blog.title}
      </Link>
    </article>
  );
}
