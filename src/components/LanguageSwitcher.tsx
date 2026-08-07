'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MARKETING_LANGUAGES, type MarketingLanguage } from '@/lib/languages';

const LANGUAGE_LABELS: Record<MarketingLanguage, string> = {
  ko: '한국어',
  en: 'English',
  es: 'Español',
  pt: 'Português',
  ja: '日本語',
  vi: 'Tiếng Việt',
};

/** 좁은 화면에서 버튼이 넘치지 않도록 — "Português"/"Tiếng Việt"처럼 긴 이름 대신 2글자 코드만 보여준다. */
const LANGUAGE_CODES: Record<MarketingLanguage, string> = {
  ko: 'KO',
  en: 'EN',
  es: 'ES',
  pt: 'PT',
  ja: 'JA',
  vi: 'VI',
};

/**
 * saju-letter-newyear-campaign의 LanguageSwitcher.tsx는 localStorage에 쓰고 synthetic
 * StorageEvent를 dispatch하는 방식이었다 — 이 사이트는 URL이 언어를 들고 다니므로, 그냥
 * 현재 pathname의 언어 세그먼트만 바꿔치기한 새 경로로 이동하면 된다.
 */
export function LanguageSwitcher({ current }: { current: MarketingLanguage }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function pathForLanguage(lang: MarketingLanguage): string {
    const rest = pathname.replace(new RegExp(`^/${current}`), '');
    return `/${lang}${rest}`;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-foreground/15 px-2.5 py-1 text-sm font-medium text-foreground/70 hover:text-foreground sm:border-0 sm:px-0 sm:py-0"
      >
        <span className="sm:hidden">{LANGUAGE_CODES[current]}</span>
        <span className="hidden sm:inline">{LANGUAGE_LABELS[current]}</span>
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-36 rounded-lg border border-foreground/10 bg-background py-1 shadow-lg z-50">
          {MARKETING_LANGUAGES.map((lang) => (
            <li key={lang}>
              <Link
                href={pathForLanguage(lang)}
                onClick={() => setOpen(false)}
                className={`block px-3 py-1.5 text-sm hover:bg-foreground/5 ${lang === current ? 'font-semibold' : ''}`}
              >
                {LANGUAGE_LABELS[lang]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
