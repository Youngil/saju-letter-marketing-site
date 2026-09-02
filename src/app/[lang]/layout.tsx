import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Noto_Serif_JP, Noto_Serif_KR, Playfair_Display } from 'next/font/google';
import '../globals.css';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, MARKETING_LANGUAGES, type MarketingLanguage } from '@/lib/languages';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { WEB_BASE_URL } from '@/lib/seo';
import { organizationJsonLd } from '@/lib/structuredData';
import { notFound } from 'next/navigation';

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
 */
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
  if (!isMarketingLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`h-full antialiased ${playfair.variable} ${notoSerifKr.variable} ${notoSerifJp.variable}`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
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
              <Link href={`/${lang}/blog`} className="text-sm font-medium text-foreground/70 hover:text-foreground">
                {dict.nav.blog}
              </Link>
              <Link href={`/${lang}/compare`} className="text-sm font-medium text-foreground/70 hover:text-foreground">
                {dict.nav.compare}
              </Link>
              <LanguageSwitcher current={lang} />
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
