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
import { BlogByline, categoryLabelFor } from '@/components/BlogByline';

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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-10">
        <h1 className="font-display mb-2 text-3xl font-semibold">{dict.blog.title}</h1>
        <p className="text-foreground/70">{dict.blog.subtitle}</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-foreground/60">{dict.blog.empty}</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="letter-surface rounded-sm px-5 py-6 sm:px-7 sm:py-7">
                <BlogByline
                  byLabel={dict.blog.byLabel}
                  dateIso={post.date}
                  lang={lang}
                  categoryLabel={categoryLabelFor(post.category, dict.blog.categories)}
                />
                <h2 className="font-display mt-3 text-xl font-semibold leading-snug">
                  <Link href={`/${lang}/blog/${post.slug}`} className="hover:text-accent-warm">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-foreground/70">{post.description}</p>
                <Link
                  href={`/${lang}/blog/${post.slug}`}
                  className="mt-4 inline-block text-sm font-medium text-accent-warm underline-offset-2 hover:underline"
                >
                  {dict.blog.readMore} →
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
