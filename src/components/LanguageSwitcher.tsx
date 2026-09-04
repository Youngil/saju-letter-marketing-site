'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { availableSwitcherLanguages, type MarketingLanguage } from '@/lib/languages';

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
 *
 * 드롭다운에는 MARKETING_LANGUAGES(6개) 전부가 아니라 LAUNCH_CONTENT_LANGUAGES(ko/en/ja/es)만
 * 보여준다(2026-08-08, 사용자 결정) — pt/vi는 홈/데모/리드캡처는 이미 열려 있지만 블로그/compare
 * 는 아직 없어서, 스위처로 노출하면 pt/vi로 바꾼 뒤 블로그/compare 내비게이션을 누르면 404가
 * 나는 어중간한 경험이 된다. 라우트 자체는 안 건드렸으므로 직접 링크(예: 신년운세 캠페인의
 * pt/vi 지원)는 그대로 동작한다 — 여기서는 "발견 가능성"만 숨긴다.
 */
export function LanguageSwitcher({ current }: { current: MarketingLanguage }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const rest = pathname.replace(new RegExp(`^/${current}`), '');

  function pathForLanguage(lang: MarketingLanguage): string {
    return `/${lang}${rest}`;
  }

  // 신년운세 캠페인 등 ko 미지원 경로에서는 드롭다운에서도 ko를 뺀다(2026-09-04, 종합 버그
  // 점검 2회차 — 상세 근거는 availableSwitcherLanguages doc 참고).
  const availableLanguages = availableSwitcherLanguages(rest);

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
          {availableLanguages.map((lang) => (
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
