import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMarketingLanguage, type MarketingLanguage } from '@/lib/languages';
import { getDictionary } from '@/dictionaries';
import { getReading } from '@/lib/lunarNewYearApi';
import { DISCLAIMER_CONTENT } from '@/content/disclaimer';
import { EmailSignupForm } from '@/components/lunar-new-year/EmailSignupForm';
import { ShareButton } from '@/components/lunar-new-year/ShareButton';
import { AppDownloadLinks } from '@/components/AppDownloadLinks';
import { WEB_BASE_URL, NOINDEX_ROBOTS } from '@/lib/seo';

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

/**
 * 2026-09-08 3차 종합 버그 점검(항목 1) — 이 라우트는 이미 발급된 신년운세 결과/공유 링크를
 * 여는 트랜잭션 축이라(`compat/[token]`/`privacy`와 같은 축, `saju-letter-backend/CLAUDE.md`
 * §9 참고), `getReadingById`(백엔드)에도 언어 게이트가 없다 — 2026-09-07 커밋이 이 페이지
 * 게이트에 `isLaunchContentLanguage`(4)를 추가로 얹어 pt/vi로 발급된 기존 링크를 전부 404
 * 처리했던 회귀를 `isMarketingLanguage`(6)로 되돌려 잡는다. `page.tsx`(랜딩 폼)와 같은
 * `MARKETING_LANGUAGES` 복원과 짝을 이룬다.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang, id } = await params;
  if (!isMarketingLanguage(rawLang)) return {};
  const reading = await getReading(id);
  if (!reading) return {};

  return {
    title: `${reading.content.title} — Saju Letter`,
    description: reading.content.greeting,
    // 방문자 개인의 신년운세 결과라 검색결과 색인 대상이 아니다 — 카카오톡/트위터 공유 미리보기용
    // OG 태그는 그대로 유지한다.
    robots: NOINDEX_ROBOTS,
    openGraph: {
      title: reading.content.title,
      description: reading.content.greeting,
      url: `${WEB_BASE_URL}/${rawLang}/lunar-new-year/r/${id}`,
    },
    twitter: { card: 'summary', title: reading.content.title, description: reading.content.greeting },
  };
}

export default async function LunarNewYearResultPage({ params }: PageProps) {
  const { lang: rawLang, id } = await params;
  if (!isMarketingLanguage(rawLang)) notFound();
  const language: MarketingLanguage = rawLang;

  const reading = await getReading(id);
  if (!reading) notFound();

  const dict = await getDictionary(language);
  if (!dict.lunarNewYear) notFound();
  const t = dict.lunarNewYear.result;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{reading.content.title}</h1>
        <p className="mt-3 text-stone-700">{reading.content.greeting}</p>
        <p className="mt-3 text-stone-700">{reading.content.overview}</p>
        <p className="mt-3 text-stone-700">{reading.content.highlight}</p>
        <p className="mt-4 text-sm italic text-stone-500">{reading.content.closing}</p>
        <p className="mt-4 text-xs text-stone-400">{DISCLAIMER_CONTENT[language].short}</p>
      </article>

      <div className="flex justify-center">
        <ShareButton
          url={`${WEB_BASE_URL}/${language}/lunar-new-year/r/${id}`}
          title={reading.content.title}
          shareLabel={t.shareButton}
          copiedLabel={t.shareCopied}
        />
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-semibold">{t.emailSectionTitle}</h2>
        <p className="mt-1 text-sm text-stone-600">{t.emailSectionSubtitle}</p>
        <div className="mt-4">
          <EmailSignupForm readingId={id} dict={t} alreadySubscribed={reading.hasEmailSubscription} />
        </div>
      </section>

      {/* Phase 6 soft connect — 캠페인 본문과 분리된 아침 편지/앱 안내. 다인 초상 없음. */}
      <section className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 text-center">
        <h2 className="text-base font-semibold text-stone-800">{t.appBridgeTitle}</h2>
        <p className="text-sm text-stone-600">{t.appBridgeBody}</p>
        <AppDownloadLinks dict={dict.appLinks} context="newyear_result" />
      </section>
    </main>
  );
}
