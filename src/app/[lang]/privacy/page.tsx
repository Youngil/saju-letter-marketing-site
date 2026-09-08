import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMarketingLanguage, MARKETING_LANGUAGES, DEFAULT_LANGUAGE, type MarketingLanguage } from '@/lib/languages';
import { PRIVACY_POLICY_CONTENT } from '@/content/privacyPolicy';
import { WEB_BASE_URL, languageAlternates, buildSocialMetadata } from '@/lib/seo';

/**
 * saju-letter-backend/public/privacy.html에서 이관(2026-08-12) — 법적 고지 문서라 1차 출시
 * 언어 축과 무관하게 이 사이트가 지원하는 언어 전부(6개)에서 열어둔다. `saju-letter-mobile`의
 * `buildPrivacyPolicyUrl(language)`가 앱의 현재 언어(6개 중 하나, 모바일은 서비스 언어
 * 통합관리를 따르지 않고 계속 6개 언어를 서비스한다)로 이 URL을 직접 구성해 설정 화면에서
 * 링크하므로, pt/vi 앱 사용자가 이 URL을 열 때 404가 나면 안 된다.
 *
 * **2026-09-07 커밋이 "모든 서비스를 1차 출시 4개 언어로 좁힌다"는 결정을 이 페이지에도
 * 적용해 LAUNCH_CONTENT_LANGUAGES(4)로 좁혔었는데, 2026-09-08 3차 종합 버그 점검(항목 2)으로
 * 되돌렸다** — 그 결정은 새로 만드는 콘텐츠(블로그/compare 등)의 번역 비용을 줄이려는 취지였지,
 * 이미 6개 언어로 존재하던 법적 문서의 접근성을 좁히려던 게 아니었다. `PRIVACY_POLICY_CONTENT`는
 * 애초에 6개 언어 콘텐츠를 그대로 갖고 있었으므로(삭제된 적 없음) 게이트만 원복하면 된다.
 */
export async function generateStaticParams() {
  return MARKETING_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) return {};
  const policy = PRIVACY_POLICY_CONTENT[lang];
  const path = (l: MarketingLanguage) => `/${l}/privacy`;
  return {
    title: policy.title,
    description: policy.intro,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(lang)}`,
      languages: languageAlternates(MARKETING_LANGUAGES, path, DEFAULT_LANGUAGE),
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
  if (!isMarketingLanguage(rawLang)) notFound();
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
