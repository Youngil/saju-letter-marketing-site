import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { NotFoundView } from '@/components/NotFoundView';
import { notFoundCopyFor } from '@/content/notFoundCopy';
import { SITE_LANGUAGE_HEADER } from '@/lib/languages';

/**
 * 어느 라우트에도 맞지 않는 주소·레이아웃이 낸 404(잘못된 언어 코드 등)의 화면(2026-10-10 전체 점검 14차,
 * `experimental.globalNotFound`). 이 사이트의 루트 레이아웃은 `[lang]/layout.tsx`(최상위 동적 세그먼트)라 그 위에서 404를
 * 조립할 레이아웃이 없다 — 예전엔 Next 기본 영어 404가 떴다. 레이아웃을 거치지 않으므로 `<html>`/`<body>`와 전역 CSS를 직접
 * 싣는다. 언어는 proxy가 요청 헤더로 넘긴 주소의 언어 마디(`SITE_LANGUAGE_HEADER`)로 고른다 — 없으면 영어.
 */
async function pickCopy() {
  return notFoundCopyFor((await headers()).get(SITE_LANGUAGE_HEADER));
}

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await pickCopy();
  return { title: `404 — ${copy.title}` };
}

export default async function GlobalNotFound() {
  const { lang, copy } = await pickCopy();
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <main className="flex flex-1 flex-col">
          <NotFoundView lang={lang} copy={copy} />
        </main>
      </body>
    </html>
  );
}
