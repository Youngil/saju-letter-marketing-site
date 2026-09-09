import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMarketingLanguage, MARKETING_LANGUAGES, DEFAULT_LANGUAGE, type MarketingLanguage } from '@/lib/languages';
import { DISCLAIMER_CONTENT } from '@/content/disclaimer';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';

/**
 * 서비스 이용 안내(오락 목적 고지) 전용 페이지(2026-09-02) — `/[lang]/privacy`와 같은 이유로
 * 법적/안전 고지 문서라 6개 언어(MARKETING_LANGUAGES) 전부에서 연다.
 *
 * **2026-09-07 커밋이 "모든 서비스를 1차 출시 4개 언어로 좁힌다"는 결정에 따라 이 페이지도
 * `LAUNCH_CONTENT_LANGUAGES`(4)로 좁혔었는데, 2026-09-09 5차 종합 버그 점검으로 되돌렸다.**
 * `[lang]/layout.tsx`의 헤더/푸터 링크(로고·"서비스 이용 안내")는 이미 6개 언어(`isMarketingLanguage`)
 * 전부에서 렌더되는데(privacy/compat/lunar-new-year 같은 트랜잭션 페이지에 정당하게 도달한
 * pt/vi 방문자를 위해서다), 이 페이지만 4개로 좁아진 채 남아 있어 그 방문자가 푸터 링크를 누르면
 * 404를 만났다 — `DISCLAIMER_CONTENT`는 애초에 6개 언어 콘텐츠를 그대로 갖고 있었으므로
 * (`content/disclaimer.ts`, 삭제된 적 없음) 게이트만 원복하면 된다. `privacy/page.tsx`가 3차
 * 점검에서 겪은 것과 같은 패턴.
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
