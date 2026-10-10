import Link from 'next/link';
import type { NotFoundCopy } from '@/content/notFoundCopy';
import { demoHref, homeHref } from '@/lib/homeLinks';

/** 404 본문(2026-10-10 전체 점검 14차) — 데모·홈으로 잇는다. 언어는 호출부가 고른다(`LangNotFoundView`/global-not-found). */
export function NotFoundView({ lang, copy }: { lang: string; copy: NotFoundCopy }) {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="font-display text-sm tracking-widest text-foreground/55">404</p>
      <h1 className="font-display text-2xl font-semibold text-balance">{copy.title}</h1>
      <p className="text-foreground/70">{copy.body}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={demoHref(lang)}
          className="rounded-full bg-accent-warm px-6 py-3 font-medium text-white transition hover:bg-accent-warm/90"
        >
          {copy.demoLink}
        </Link>
        <Link href={homeHref(lang)} className="rounded-full border border-foreground/20 px-5 py-3 text-sm transition hover:border-accent-warm">
          {copy.homeLink}
        </Link>
      </div>
    </div>
  );
}
