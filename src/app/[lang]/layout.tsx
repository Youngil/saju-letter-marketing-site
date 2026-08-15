import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import '../globals.css';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, MARKETING_LANGUAGES, type MarketingLanguage } from '@/lib/languages';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { notFound } from 'next/navigation';

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
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-4">
            <Link href={`/${lang}`} className="flex shrink-0 items-center gap-2 text-base font-semibold sm:text-lg">
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
            <span className="font-medium text-foreground/70">{dict.brand}</span>
            <p>{dict.footer.privacyNote}</p>
            <Link href={`/${lang}/privacy`} className="mt-2 w-fit underline hover:text-foreground/70">
              {dict.footer.privacyLinkLabel}
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
