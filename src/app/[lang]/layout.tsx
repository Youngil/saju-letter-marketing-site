import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Noto_Serif_JP, Noto_Serif_KR, Playfair_Display } from 'next/font/google';
import '../globals.css';
import { getDictionary } from '@/dictionaries';
import { isLaunchContentLanguage, isMarketingLanguage, MARKETING_LANGUAGES, type MarketingLanguage } from '@/lib/languages';
import { fetchActiveServiceLanguages } from '@/lib/serviceLanguagesApi';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { WEB_BASE_URL } from '@/lib/seo';
import { organizationJsonLd } from '@/lib/structuredData';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { ConsentBanner } from '@/components/ConsentBanner';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';
import { notFound } from 'next/navigation';

/**
 * 서비스 언어 통합 관리(2026-09-07) — saju-letter-backend/marketing-site 공유 활성 언어 목록을
 * 최대 1시간 캐시로 재검증한다(ISR, 2026-09-06 블로그 DB 이관 때 이미 같은 이유로 도입한
 * `revalidate=3600` 패턴 재사용 — `generateStaticParams`는 정적 배열을 그대로 쓰고, 이 값은
 * 런타임 UI 게이팅(LanguageSwitcher 드롭다운)에만 쓴다).
 */
export const revalidate = 3600;

/**
 * 앱 `use-serif-font-family`와 같은 언어별 디스플레이 세리프(Phase 3).
 * 세 폰트 모두 로드하되 CSS `html[lang]`로 실제로 쓰는 패밀리만 고른다.
 */
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-noto-kr',
  display: 'swap',
});
const notoSerifJp = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-noto-ja',
  display: 'swap',
});

/**
 * app/[lang]/layout.tsx가 이 사이트의 실질적인 루트 레이아웃이다 — Next.js App Router는
 * 트리 전체에 <html>/<body>가 정확히 한 번만 있어야 하므로, 별도의 app/layout.tsx를 두지
 * 않는다(공식 i18n 라우팅 예제와 같은 패턴). middleware.ts가 언어 세그먼트 없는 요청을
 * 전부 여기로 리다이렉트하므로 이 레이아웃은 항상 유효한 lang을 받는다.
 *
 * **2026-09-07 — "모든 서비스를 1차 출시 4개 언어로 좁힌다"는 결정에 따라 한때 MARKETING_LANGUAGES(6)
 * 대신 LAUNCH_CONTENT_LANGUAGES(4)로 이 레이아웃의 게이트를 좁혔었다.** 이 레이아웃이 사이트
 * 전체의 실질적 루트이자 `[lang]` 세그먼트의 유일한 유효성 검증 지점이다 보니, 그 좁힘 하나로
 * 콘텐츠 축(홈/블로그/compare 등, 4개 언어가 맞음)뿐 아니라 **트랜잭션/기존 데이터 접근 축
 * (궁합 공유 결과 조회 `/compat/[token]`, 개인정보처리방침 `/privacy`, 이메일 수신거부
 * `/unsubscribe` — 이미 발급된 링크/구독이 언어와 무관하게 계속 동작해야 하는 페이지들로,
 * 원래 6개 언어 전부를 지원하도록 설계돼 있었다)까지 전부 pt/vi에 대해 404가 나버렸다 —
 * 이미 발송된 웰컴 드립 메일의 pt/vi 수신거부 링크, 이미 공유된 pt/vi 궁합 링크가 이 게이트
 * 하나 때문에 조용히 깨진 상태였다(2026-09-08 3차 종합 버그 점검 항목 2로 발견).
 *
 * **그래서 이 레이아웃 자체의 게이트는 두 축의 합집합인 `isMarketingLanguage`(6)로 되돌리고,
 * 축을 가르는 책임은 각 페이지(`page.tsx`)에 맡긴다** — 콘텐츠 축 페이지들(홈/블로그/
 * blog/[slug]/compare/disclaimer/lunar-new-year)은 이미 자기 자신의 `generateMetadata`/기본
 * export에서 `isLaunchContentLanguage`를 직접 검사하고 있으므로(레이아웃 게이트를 완화해도
 * pt/vi 요청은 각 페이지 자신의 검사에서 여전히 404), 트랜잭션 축 페이지들(`unsubscribe`/
 * `compat/[token]`/`privacy`)만 `isMarketingLanguage`(6)를 쓰도록 되돌리면 전체가 다시
 * 일관된다. 이 레이아웃 아래 어떤 하위 경로인지는 이 파일이 알 수 없으므로(App Router
 * 레이아웃은 자신의 동적 세그먼트 `lang`만 받고 하위 pathname은 받지 않는다) 여기서 라우트별
 * 분기를 하는 대신, 이 레이아웃은 항상 두 축의 합집합만 통과시키고 세부 판정은 리프
 * 페이지에게 위임하는 구조로 정리했다. */
export async function generateStaticParams() {
  return MARKETING_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    // 상대경로 metadata(OG 이미지 등)를 절대 URL로 해석하는 기준점 — 이 사이트의 실질적인 루트
    // 레이아웃(파일 상단 주석 참고)이라 이 파일 한 곳에서만 설정하면 전체에 적용된다.
    metadataBase: new URL(WEB_BASE_URL),
    // 페이지별 generateMetadata가 없는 세그먼트를 위한 폴백 기본값 — 실제로 이 값이 그대로
    // 쓰이는 페이지가 남지 않도록 각 page.tsx에 고유 title/description을 채워가는 중이다.
    title: dict.hero.title,
    description: dict.hero.subtitle,
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  // 6개 언어(콘텐츠 축 + 트랜잭션 축 합집합)까지만 여기서 걸러내고, 콘텐츠 축(4개)으로의
  // 추가 제한은 각 하위 page.tsx가 스스로 한다(파일 상단 주석의 2026-09-08 결정 참고).
  if (!isMarketingLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
  const dict = await getDictionary(lang);
  const { active: activeLanguages } = await fetchActiveServiceLanguages();

  return (
    <html
      lang={lang}
      className={`h-full antialiased ${playfair.variable} ${notoSerifKr.variable} ${notoSerifJp.variable}`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(dict.brand)) }}
        />
        <header className="sticky top-0 z-10 border-b border-foreground/10 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-4">
            <Link href={`/${lang}`} className="font-display flex shrink-0 items-center gap-2 text-base font-semibold sm:text-lg">
              <Image src="/logo-icon.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-md" />
              <span className="truncate">{dict.brand}</span>
            </Link>
            <nav className="flex items-center gap-3 sm:gap-5">
              {/* Blog/compare는 LAUNCH_CONTENT_LANGUAGES(ko/en/ja/es)만 지원한다 — pt/vi
                  방문자(신년운세 캠페인이 지원하는 언어라 실제로 존재)에게 무조건 노출하면
                  눌렀을 때 404가 난다(2026-09-03, 종합 버그 점검으로 발견). LanguageSwitcher.tsx가
                  드롭다운에서 이미 같은 이유로 pt/vi를 뺀 것과 같은 원칙을 여기 헤더 내비에도
                  적용한다. */}
              {isLaunchContentLanguage(lang) && (
                <>
                  <Link href={`/${lang}/blog`} className="text-sm font-medium text-foreground/70 hover:text-foreground">
                    {dict.nav.blog}
                  </Link>
                  <Link href={`/${lang}/compare`} className="text-sm font-medium text-foreground/70 hover:text-foreground">
                    {dict.nav.compare}
                  </Link>
                </>
              )}
              <LanguageSwitcher current={lang} activeLanguages={activeLanguages} />
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-foreground/10">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-10 text-sm text-foreground/50">
            <span className="font-display font-medium text-foreground/70">{dict.brand}</span>
            <p>{dict.footer.privacyNote}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <Link href={`/${lang}/privacy`} className="w-fit underline hover:text-foreground/70">
                {dict.footer.privacyLinkLabel}
              </Link>
              <Link href={`/${lang}/disclaimer`} className="w-fit underline hover:text-foreground/70">
                {dict.footer.disclaimerLinkLabel}
              </Link>
            </div>
          </div>
        </footer>
        {/* GA_MEASUREMENT_ID가 없으면(로컬 개발 기본값) GoogleAnalytics 자체가 아무것도 안
            띄우므로, 동의를 물을 추적 자체가 없는 배너도 함께 숨긴다. */}
        {GA_MEASUREMENT_ID && <ConsentBanner dict={dict.consent} />}
      </body>
    </html>
  );
}
