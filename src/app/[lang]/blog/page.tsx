import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, MARKETING_LANGUAGES, type MarketingLanguage } from '@/lib/languages';
import { getAllPostSummaries } from '@/lib/posts';

export async function generateStaticParams() {
  return MARKETING_LANGUAGES.map((lang) => ({ lang }));
}

export default async function BlogIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
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
              <span className="mt-3 block text-sm text-foreground/50">{post.date}</span>
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
