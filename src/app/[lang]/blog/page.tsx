import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  isLaunchContentLanguage,
  LAUNCH_CONTENT_LANGUAGES,
  type LaunchContentLanguage,
} from '@/lib/languages';
import { activeContentLanguages, fetchActiveServiceLanguages } from '@/lib/serviceLanguagesApi';
import { getAllPostSummaries } from '@/lib/posts';
import { WEB_BASE_URL, activeLanguageAlternates, buildSocialMetadata, NOINDEX_ROBOTS } from '@/lib/seo';
import { BlogByline, categoryLabelFor } from '@/components/BlogByline';

export async function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.map((lang) => ({ lang }));
}

/** DB 저장 글(2026-09-06)이 코드 배포 없이 이 목록에 나타나려면 정기 재검증이 필요하다 —
 * `blog/[slug]/page.tsx`와 같은 주기(1시간). */
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  const path = (lang: LaunchContentLanguage) => `/${lang}/blog`;
  // hreflang은 지금 켠 콘텐츠 언어끼리만(sitemap.ts와 같은 계산, 2026-10-06 전체 점검 3차 후속).
  const serviceLanguages = await fetchActiveServiceLanguages();
  const contentLanguages = activeContentLanguages(serviceLanguages);
  // 관리자가 이 언어를 껐으면 홈([lang]/page.tsx)과 같이 noindex — hreflang·sitemap에서 빠진 페이지가 색인에 남지 않게
  // (2026-10-06 전체 점검 5차).
  const isActive = contentLanguages.includes(rawLang);

  return {
    title: dict.blog.title,
    description: dict.blog.subtitle,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: activeLanguageAlternates(contentLanguages, path, serviceLanguages.default),
    },
    ...(isActive ? {} : { robots: NOINDEX_ROBOTS }),
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
