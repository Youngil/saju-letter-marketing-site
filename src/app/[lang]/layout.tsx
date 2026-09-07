import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Noto_Serif_JP, Noto_Serif_KR, Playfair_Display } from 'next/font/google';
import '../globals.css';
import { getDictionary } from '@/dictionaries';
import { isLaunchContentLanguage, isMarketingLanguage, LAUNCH_CONTENT_LANGUAGES, type MarketingLanguage } from '@/lib/languages';
import { fetchActiveServiceLanguages } from '@/lib/serviceLanguagesApi';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { WEB_BASE_URL } from '@/lib/seo';
import { organizationJsonLd } from '@/lib/structuredData';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
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
 * **2026-09-07 — "모든 서비스를 1차 출시 4개 언어로 좁힌다"는 결정에 따라 MARKETING_LANGUAGES(6)
 * 대신 LAUNCH_CONTENT_LANGUAGES(4)로 좁혔다.** 이 레이아웃이 사이트 전체의 실질적 루트이자
 * `[lang]` 세그먼트의 유일한 유효성 검증 지점이라, 아래 `notFound()` 게이트 하나만 좁혀도
 * 홈/블로그/compare/개인정보처리방침/서비스 이용 안내/궁합 공유 등 이 레이아웃 아래 모든
 * 페이지가 pt/vi에 대해 일관되게 404를 반환한다(각 하위 페이지를 개별적으로 안 고쳐도 됨) —
 * 예전엔 블로그/compare만 이 4개로 좁혀져 있었고 홈/개인정보처리방침/궁합 공유는 여전히
 * MARKETING_LANGUAGES 6개 전부(URL 직접 입력 시) 렌더되고 있었다. */
export async function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isMarketingLanguage(lang) || !isLaunchContentLanguage(lang)) return {};
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
  // isMarketingLanguage로 먼저 string -> MarketingLanguage로 좁힌 뒤, isLaunchContentLanguage로
  // 다시 LAUNCH_CONTENT_LANGUAGES(4)만 통과시킨다 — isLaunchContentLanguage 자체가 MarketingLanguage를
  // 받는 타입이라 이 두 단계가 필요하다(파일 상단 주석의 2026-09-07 결정 참고).
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
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
      </body>
    </html>
  );
}
