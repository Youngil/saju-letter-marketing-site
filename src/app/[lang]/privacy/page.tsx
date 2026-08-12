import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMarketingLanguage, MARKETING_LANGUAGES, type MarketingLanguage } from '@/lib/languages';
import { PRIVACY_POLICY_CONTENT } from '@/content/privacyPolicy';

/**
 * saju-letter-backend/public/privacy.html에서 이관(2026-08-12) — 모든 마케팅 언어(6개)에서
 * 열려 있다. LAUNCH_CONTENT_LANGUAGES로 좁히는 블로그/compare와 다르게, 법적 고지 문서라
 * 1차 출시 언어 축과 무관하게 앱이 지원하는 언어 전부에서 접근 가능해야 한다 — 콘텐츠 자체는
 * 이관 시점에 이미 6개 언어 모두 채워져 있었다.
 */
export async function generateStaticParams() {
  return MARKETING_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) return {};
  const policy = PRIVACY_POLICY_CONTENT[lang];
  return {
    title: policy.title,
    description: policy.intro,
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
