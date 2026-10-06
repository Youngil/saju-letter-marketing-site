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
import { isBuildPhase } from '@/lib/buildPhase';

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

/**
 * 캠페인 기간은 5분마다 다시 읽는다(2026-10-06 — 랜딩을 서버에서 그리면서). 활성 언어는 이 주기와 별개로
 * `fetchActiveServiceLanguages`의 데이터 캐시(최대 1시간, 레이아웃 언어 스위처와 같은 값)를 따른다 — 관리자가 언어를
 * 끄면 이 랜딩이 최대 1시간 더 열려 있을 수 있지만, 새 결과 생성은 백엔드가 자기 활성 언어 목록(주기 갱신)으로 거절한다(`unsupported_language`
 * → 일반 오류 문구). 2026-10-07 전체 점검 7차에서 "5분마다 활성 언어도 다시 읽는다"던 예전 주석을 바로잡았다.
 */
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

  // 기간 조회가 실패하면 "폼 열림"으로 그리지 않는다(2026-10-06 전체 점검 11차 R11-6-3) — 예전엔 폼을 그려 ISR이 그 페이지를
  // 5분간 굳혔고, 비시즌에도 폼이 열려 이름·사연을 다 적은 뒤에야 "기간이 아님"을 받았다. 실행 중엔 던져 Next가 직전에 잘
  // 만든 페이지를 계속 보여 주게 하고(직전 페이지가 없으면 [lang]/error.tsx의 다시 시도), 백엔드가 없을 수 있는 빌드 중에만
  // null로 넘겨 폼 대신 중립 안내를 그린다(다음 재검증이 실제 값으로 바꾼다).
  let windowStatus: CampaignWindowStatus | null;
  try {
    windowStatus = await getCampaignWindow();
  } catch (error) {
    if (!isBuildPhase()) throw error;
    console.warn('getCampaignWindow failed during build', error);
    windowStatus = null;
  }

  return (
    <LunarNewYearHome language={language} dict={dict.lunarNewYear} appLinksDict={dict.appLinks} windowStatus={windowStatus} />
  );
}
