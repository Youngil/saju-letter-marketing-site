import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { isMarketingLanguage, type MarketingLanguage } from '@/lib/languages';
import { getDictionary } from '@/dictionaries';
import { getReading } from '@/lib/lunarNewYearApi';
import { DISCLAIMER_CONTENT } from '@/content/disclaimer';
import { EmailSignupForm } from '@/components/lunar-new-year/EmailSignupForm';
import { ShareButton } from '@/components/lunar-new-year/ShareButton';
import { AppDownloadLinks } from '@/components/AppDownloadLinks';
import { WEB_BASE_URL, NOINDEX_ROBOTS } from '@/lib/seo';
import { readOwnerToken } from '@/lib/readingOwner';
import { isValidReadingId } from '@/lib/routeParams';

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

/**
 * 이 결과를 만든 브라우저면 httpOnly 쿠키에 소유자 토큰이 있다(2026-10-07 전체 점검 7차 항목 1, `lib/readingOwner.ts`).
 * 메타데이터와 본문이 같은 인자로 `getReading`을 불러야 `cache()`가 한 번으로 묶는다.
 */
async function ownerTokenFor(id: string): Promise<string | undefined> {
  return readOwnerToken(id, await cookies());
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
  // 모양부터 틀린 id는 백엔드를 부르지 않는다(2026-10-06 전체 점검 11차 R11-6-1) — 본문은 404.
  if (!isValidReadingId(id)) return { robots: NOINDEX_ROBOTS };
  // 일시 오류면 메타데이터만 비운다 — 본문은 페이지가 같은 오류로 다시 시도 화면을 그린다.
  const reading = await getReading(id, await ownerTokenFor(id)).catch(() => null);
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
  // 모양부터 틀린 id(백엔드 결과 id는 UUID)는 백엔드를 부르기 전에 404(2026-10-06 전체 점검 11차 R11-6-1).
  if (!isValidReadingId(id)) notFound();

  // 일시 오류(429·5xx)는 던져 [lang]/error.tsx의 "다시 시도"로 — 404는 정말 없는 결과일 때만.
  const ownerToken = await ownerTokenFor(id);
  const reading = await getReading(id, ownerToken);
  if (!reading) notFound();

  const dict = await getDictionary(language);
  if (!dict.lunarNewYear) notFound();
  const t = dict.lunarNewYear.result;

  // 공유 링크는 만든 사람과 받은 사람이 같은 주소를 연다 — 메일 구독 폼·구독 상태는 백엔드가 소유자 토큰을 확인해 준
  // 사람(isOwner)에게만(2026-10-07). 예전엔 링크를 받은 친구가 자기 이메일로 구독해 주인의 사연으로 쓴 메일을 받아 갔다.
  // 위기 신호로 대체된 결과(subscriptionAvailable === false)는 주인에게도 폼을 보이지 않는다.
  const isOwner = reading.isOwner === true && ownerToken !== undefined;
  // 위기 신호로 대체된 결과(주인에게만 알려진다) — 도움 안내 글이라 공유 버튼·앱 홍보도 보이지 않는다(2026-10-06 전체 점검 8차).
  const isCrisisSubstitute = isOwner && reading.subscriptionAvailable === false;
  const showSignup = isOwner && !isCrisisSubstitute;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{reading.content.title}</h1>
        <p className="mt-3 text-stone-700">{reading.content.greeting}</p>
        <p className="mt-3 text-stone-700">{reading.content.overview}</p>
        <p className="mt-3 text-stone-700">{reading.content.highlight}</p>
        <p className="mt-4 text-sm text-stone-500">{reading.content.closing}</p>
        <p className="mt-4 text-xs text-stone-500">{DISCLAIMER_CONTENT[language].short}</p>
      </article>

      {!isCrisisSubstitute && (
        <div className="flex justify-center">
          <ShareButton
            url={`${WEB_BASE_URL}/${language}/lunar-new-year/r/${id}`}
            title={reading.content.title}
            shareLabel={t.shareButton}
            copiedLabel={t.shareCopied}
          />
        </div>
      )}

      {showSignup && ownerToken ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold">{t.emailSectionTitle}</h2>
          <p className="mt-1 text-sm text-stone-600">{t.emailSectionSubtitle}</p>
          <div className="mt-4">
            <EmailSignupForm
              readingId={id}
              ownerToken={ownerToken}
              language={language}
              dict={t}
              alreadySubscribed={reading.hasEmailSubscription === true}
            />
          </div>
        </section>
      ) : !isOwner ? (
        // 공유 링크로 연 사람 — 자기 신년운세를 만들어 보도록 랜딩으로.
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h2 className="font-semibold">{t.publicCtaTitle}</h2>
          <p className="text-sm text-stone-600">{t.publicCtaBody}</p>
          <Link
            href={`/${language}/lunar-new-year`}
            className="rounded-full bg-amber-800 px-6 py-2.5 font-medium text-white transition hover:bg-amber-900"
          >
            {t.publicCtaButton}
          </Link>
        </section>
      ) : null}

      {/* Phase 6 soft connect — 캠페인 본문과 분리된 아침 편지/앱 안내. 다인 초상 없음. 위기 대체 결과엔 없음. */}
      {!isCrisisSubstitute && (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 text-center">
          <h2 className="text-base font-semibold text-stone-800">{t.appBridgeTitle}</h2>
          <p className="text-sm text-stone-600">{t.appBridgeBody}</p>
          <AppDownloadLinks dict={dict.appLinks} language={language} context="newyear_result" />
        </section>
      )}
    </div>
  );
}
