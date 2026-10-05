import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { fetchActiveServiceLanguages } from '@/lib/serviceLanguagesApi';
import { getCampaignWindow, type CampaignWindowStatus } from '@/lib/lunarNewYearApi';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  MARKETING_LANGUAGES,
  type MarketingLanguage,
} from '@/lib/languages';
import { LunarNewYearHome } from '@/components/lunar-new-year/LunarNewYearHome';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';

/**
 * **2026-09-08 3차 종합 버그 점검(항목 1)으로 `MARKETING_LANGUAGES`(6)로 되돌렸다** — 2026-09-07
 * 커밋(`ff41953`, 서비스 언어 통합 관리)이 이 캠페인을 원래의 `NON_KOREAN_LANGUAGES`(5,
 * en/es/pt/ja/vi — ko 미지원)에서 `LAUNCH_CONTENT_LANGUAGES`(4, ko/en/ja/es)로 바꾸면서, ko
 * 지원 추가(사용자가 "한국도 포함한다"고 명시적으로 결정, `saju-letter-backend/CLAUDE.md` §9
 * 참고)는 의도한 대로였지만 원래 있던 pt/vi가 실수로 함께 빠졌다 — 이미 발급된 pt/vi 결과·
 * 수신거부 링크가 전부 깨졌다(`r/[id]/page.tsx`/`unsubscribe/page.tsx` 참고). ko를 뺄 이유는
 * 없으므로(의도된 결정) "ko 제외 5개로 원복" 대신 "6개 전부"로 복원해 ko+pt/vi 모두 살렸다 —
 * `src/dictionaries/pt.ts`/`vi.ts`에 `lunarNewYear` 콘텐츠가 이미 갖춰져 있어 되돌리는 데
 * 새 번역이 필요 없었다.
 */
export async function generateStaticParams() {
  return MARKETING_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  if (!dict.lunarNewYear) return {};
  const path = (lang: MarketingLanguage) => `/${lang}/lunar-new-year`;
  const { active, default: activeDefault } = await fetchActiveServiceLanguages();

  return {
    title: dict.lunarNewYear.landing.title,
    description: dict.lunarNewYear.landing.subtitle,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: languageAlternates(active, path, activeDefault),
    },
    ...buildSocialMetadata({
      title: dict.lunarNewYear.landing.title,
      description: dict.lunarNewYear.landing.subtitle,
      url: `${WEB_BASE_URL}${path(rawLang)}`,
      images: [`${WEB_BASE_URL}/${rawLang}/opengraph-image`],
    }),
  };
}

/** 기간·활성 언어를 5분마다 다시 읽는다(2026-10-06 — 랜딩을 서버에서 그리면서). */
export const revalidate = 300;

export default async function LunarNewYearPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang)) notFound();
  const language: MarketingLanguage = rawLang;
  const dict = await getDictionary(language);
  if (!dict.lunarNewYear) notFound();

  // 새 결과를 만드는 랜딩은 지금 서비스 중인 언어만 연다(2026-10-06) — 백엔드는 활성 언어로만 결과를 만들어,
  // 비활성 언어(pt/vi) 방문자는 폼을 끝까지 채운 뒤 400을 받았다. 기존 결과·수신거부 링크(r/[id], unsubscribe)는
  // 6개 언어 그대로 둔다. `active`는 6개 축 원본이라 관리자가 pt/vi를 켜면 바로 열린다(2026-10-06 전체 점검 3차).
  const { active, default: defaultLanguage } = await fetchActiveServiceLanguages();
  if (!active.includes(language)) redirect(`/${defaultLanguage}/lunar-new-year`);

  const windowStatus: CampaignWindowStatus | null = await getCampaignWindow().catch((error) => {
    console.warn('getCampaignWindow failed', error);
    return null;
  });

  return (
    <LunarNewYearHome language={language} dict={dict.lunarNewYear} appLinksDict={dict.appLinks} windowStatus={windowStatus} />
  );
}
