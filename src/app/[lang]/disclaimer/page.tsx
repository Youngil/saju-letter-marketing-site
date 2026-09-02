import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMarketingLanguage, MARKETING_LANGUAGES, DEFAULT_LANGUAGE, type MarketingLanguage } from '@/lib/languages';
import { DISCLAIMER_CONTENT } from '@/content/disclaimer';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';

/**
 * 서비스 이용 안내(오락 목적 고지) 전용 페이지(2026-09-02) — `/[lang]/privacy`와 같은 이유·같은
 * 패턴이다: 법적/안전 고지 문서라 1차 출시 언어(LAUNCH_CONTENT_LANGUAGES)가 아니라 앱이
 * 지원하는 6개 언어(MARKETING_LANGUAGES) 전부에서 열려 있어야 한다. 상세 배경은
 * `content/disclaimer.ts` 참고.
 */
export async function generateStaticParams() {
  return MARKETING_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) return {};
  const content = DISCLAIMER_CONTENT[lang];
  const path = (l: MarketingLanguage) => `/${l}/disclaimer`;
  return {
    title: content.title,
    description: content.short,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(lang)}`,
      languages: languageAlternates(MARKETING_LANGUAGES, path, DEFAULT_LANGUAGE),
    },
    ...buildSocialMetadata({
      title: content.title,
      description: content.short,
      url: `${WEB_BASE_URL}${path(lang)}`,
      images: [`${WEB_BASE_URL}/${lang}/opengraph-image`],
    }),
  };
}

export default async function DisclaimerPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
  const content = DISCLAIMER_CONTENT[lang];
  // body는 앱(disclaimer.tsx)과 마찬가지로 신뢰된 정적 문자열(사용자 입력 아님)이라 그대로
  // \n\n 기준으로 문단을 나눠 렌더한다 — privacy.tsx와 달리 서식이 없는 순수 텍스트라
  // dangerouslySetInnerHTML이 필요 없다.
  const paragraphs = content.body.split('\n\n');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <article className="card-surface rounded-2xl border border-foreground/10 p-6 sm:p-10">
        <h1 className="mb-8 text-2xl font-bold sm:text-3xl">{content.title}</h1>
        <div className="flex flex-col gap-4 text-foreground/80">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
