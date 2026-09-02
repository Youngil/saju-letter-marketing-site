import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMarketingLanguage, MARKETING_LANGUAGES, DEFAULT_LANGUAGE, type MarketingLanguage } from '@/lib/languages';
import { getDictionary } from '@/dictionaries';
import { getCompatInvite } from '@/lib/compatApi';
import { COMPAT_CONTENT } from '@/content/compatContent';
import { CompatView } from '@/components/compat/CompatView';
import { WEB_BASE_URL, languageAlternates, NOINDEX_ROBOTS } from '@/lib/seo';

interface PageProps {
  params: Promise<{ lang: string; token: string }>;
}

/**
 * 궁합 공유 웹페이지(2026-08-12, saju-letter-backend/public/compat.html에서 이관). 옛
 * saju-letter.com/compat/:token은 언어 세그먼트가 없었고 방문자 브라우저 언어를 자동감지했다 —
 * 이 사이트의 middleware.ts가 언어 프리픽스 없는 요청을 이미 Accept-Language 기준으로
 * /{lang}/... 로 리다이렉트해주므로, 공유 URL 자체는 여전히 언어 없이
 * (COMPAT_SHARE_BASE_URL/compat/{token}) 만들고 이 라우트가 그 리다이렉트를 받는다. 미들웨어의
 * 자동감지 후보가 LAUNCH_CONTENT_LANGUAGES(4개)로 한정된 건 이 사이트 전체(홈 포함)에 이미
 * 적용 중인 기존 정책이라 이 페이지만 따로 손대지 않는다 — 다만 이 라우트 자체(및
 * generateMetadata)는 privacy처럼 6개 언어 전부에서 직접 열린다(직접 링크로는 pt/vi도 접근 가능).
 *
 * generateStaticParams를 두지 않는다 — 토큰은 런타임에 계속 새로 생성되므로
 * lunar-new-year/r/[id]와 동일하게 완전 동적 라우트로 둔다.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang, token } = await params;
  if (!isMarketingLanguage(rawLang)) return {};
  const content = COMPAT_CONTENT[rawLang];
  const view = await getCompatInvite(token, rawLang);

  const og =
    view.status === 'completed'
      ? { title: content.og.completed.titleFor(view.guestName), description: content.og.completed.description }
      : content.og[view.status];
  const path = (lang: MarketingLanguage) => `/${lang}/compat/${token}`;

  return {
    title: og.title,
    description: og.description,
    // 유저 개인 궁합 결과 페이지라 검색결과에 노출될 이유가 없다 — 카카오톡/트위터 등 크롤러가
    // OG 태그를 읽어 미리보기 카드를 만드는 목적(og 항목들)과는 무관하게 색인만 막는다.
    robots: NOINDEX_ROBOTS,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: languageAlternates(MARKETING_LANGUAGES, path, DEFAULT_LANGUAGE),
    },
    openGraph: { title: og.title, description: og.description, url: `${WEB_BASE_URL}${path(rawLang)}` },
    twitter: { card: 'summary', title: og.title, description: og.description },
  };
}

export default async function CompatPage({ params }: PageProps) {
  const { lang: rawLang, token } = await params;
  if (!isMarketingLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;

  const view = await getCompatInvite(token, lang);
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <CompatView token={token} language={lang} initialView={view} appLinksDict={dict.appLinks} />
    </div>
  );
}
