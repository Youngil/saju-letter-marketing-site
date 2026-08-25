import Image from 'next/image';
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
import { getAllPostSummaries } from '@/lib/posts';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  const path = (lang: LaunchContentLanguage) => `/${lang}/blog`;

  return {
    title: dict.blog.title,
    description: dict.blog.subtitle,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      // DEFAULT_LANGUAGE('en')는 항상 LAUNCH_CONTENT_LANGUAGES 안에 있지만, languages.ts에서
      // 더 넓은 MarketingLanguage로 선언돼 있어 여기서만 좁혀 넘긴다.
      languages: languageAlternates(LAUNCH_CONTENT_LANGUAGES, path, DEFAULT_LANGUAGE as LaunchContentLanguage),
    },
    ...buildSocialMetadata({
      title: dict.blog.title,
      description: dict.blog.subtitle,
      url: `${WEB_BASE_URL}${path(rawLang)}`,
      images: [`${WEB_BASE_URL}/${rawLang}/opengraph-image`],
    }),
  };
}

export default async function BlogIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
  const lang: LaunchContentLanguage = rawLang;
  const dict = await getDictionary(lang);
  const posts = await getAllPostSummaries(lang);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">{dict.blog.title}</h1>
      <p className="mb-10 text-foreground/70">{dict.blog.subtitle}</p>

      {posts.length === 0 ? (
        <p className="text-foreground/60">{dict.blog.empty}</p>
      ) : (
        <ul className="flex flex-col gap-8">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-foreground/10 pb-8">
              <Link href={`/${lang}/blog/${post.slug}`} className="text-xl font-semibold hover:text-accent">
                {post.title}
              </Link>
              <p className="mt-2 text-foreground/70">{post.description}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-foreground/50">
                <Image src="/dain-avatar.png" alt="" width={20} height={20} className="rounded-full" />
                <span>{dict.blog.byLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{post.date}</span>
              </div>
              <Link href={`/${lang}/blog/${post.slug}`} className="mt-2 inline-block text-sm font-medium text-accent hover:underline">
                {dict.blog.readMore} →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
