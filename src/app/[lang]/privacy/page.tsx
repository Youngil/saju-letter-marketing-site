import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMarketingLanguage, isLaunchContentLanguage, LAUNCH_CONTENT_LANGUAGES, DEFAULT_LANGUAGE, type MarketingLanguage } from '@/lib/languages';
import { PRIVACY_POLICY_CONTENT } from '@/content/privacyPolicy';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';

/**
 * saju-letter-backend/public/privacy.html에서 이관(2026-08-12) — 원래는 법적 고지 문서라 1차
 * 출시 언어 축과 무관하게 앱이 지원하는 언어 전부(6개)에서 열어뒀지만, **2026-09-07 "모든
 * 서비스를 1차 출시 4개 언어로 좁힌다"는 결정에 따라 LAUNCH_CONTENT_LANGUAGES(4)로 좁혔다** —
 * 이제 pt/vi는 부모 레이아웃(`[lang]/layout.tsx`)의 게이트에서 이미 404가 나므로 이 페이지
 * 자체의 게이트는 사실상 이중 방어다. `PRIVACY_POLICY_CONTENT`는 6개 언어 콘텐츠를 그대로
 * 유지한다(삭제 아님) — 나중에 재개하면 이 배열에 언어만 추가하면 된다.
 */
export async function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang) || !isLaunchContentLanguage(lang)) return {};
  const policy = PRIVACY_POLICY_CONTENT[lang];
  const path = (l: MarketingLanguage) => `/${l}/privacy`;
  return {
    title: policy.title,
    description: policy.intro,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(lang)}`,
      languages: languageAlternates(LAUNCH_CONTENT_LANGUAGES, path, DEFAULT_LANGUAGE),
    },
    ...buildSocialMetadata({
      title: policy.title,
      description: policy.intro,
      url: `${WEB_BASE_URL}${path(lang)}`,
      images: [`${WEB_BASE_URL}/${lang}/opengraph-image`],
    }),
  };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
  const policy = PRIVACY_POLICY_CONTENT[lang];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <article className="card-surface rounded-2xl border border-foreground/10 p-6 sm:p-10">
        <h1 className="mb-1 text-2xl font-bold sm:text-3xl">{policy.title}</h1>
        <p className="mb-8 text-sm text-foreground/50">{policy.effectiveDate}</p>
        <p className="mb-10 text-foreground/80">{policy.intro}</p>

        {policy.sections.map((section, index) => (
          <section key={section.heading} className={index > 0 ? 'mt-8 border-t border-foreground/10 pt-8' : ''}>
            <h2 className="mb-3 text-lg font-semibold">{section.heading}</h2>
            <div
              className="privacy-body text-foreground/80"
              // 원문은 이 저장소가 직접 작성/관리하는 정적 문구(ul/li/strong/a만 사용)이며 사용자
              // 입력이 아니다 — privacy.js가 innerHTML로 렌더링하던 것과 동일한 신뢰 수준.
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </section>
        ))}
      </article>
    </div>
  );
}
