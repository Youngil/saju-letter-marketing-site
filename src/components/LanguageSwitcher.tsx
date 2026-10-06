'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useId, useRef, useState, type Ref } from 'react';
import { availableSwitcherLanguages, resolveLanguageSwitchPath, type MarketingLanguage } from '@/lib/languages';
import { useSwitcherPathLimit } from './SwitcherLanguageLimit';

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
 * 드롭다운 언어는 경로별로 정한다(`availableSwitcherLanguages`, 2026-10-06 전체 점검 3차) — 홈·블로그·compare는
 * 콘텐츠 축(ko/en/ja/es) 중 켠 언어만(pt/vi는 블로그/compare가 없어 404가 난다, 2026-08-08 결정), 신년운세·궁합·
 * 개인정보처리방침 같은 6개 언어 트랜잭션 페이지는 켠 언어 그대로. 블로그 글은 그 글이 없는 언어를 고르면
 * 그 언어의 블로그 목록으로 보낸다(`SwitcherLanguageLimit`).
 *
 * `activeLanguages`(2026-09-07, 서비스 언어 통합 관리)는 관리자 패널에서 실시간으로 켜고 끄는
 * 값이다 — `[lang]/layout.tsx`(서버 컴포넌트)가 `fetchActiveServiceLanguages()`로 최대 1시간
 * 캐시(ISR) 조회한 뒤 이 컴포넌트에 직접 prop으로 내려준다. 이 컴포넌트는 layout.tsx가 직접
 * 렌더하는 유일한 소비처라 별도 React Context 없이 prop 하나로 충분하다(과설계 방지 — 이
 * 저장소 전반의 관례).
 *
 * **`useSearchParams()`는 Suspense 경계가 필요하다(2026-09-09, 쿼리스트링 보존 수정과 함께
 * 도입)** — 이 훅을 쓰는 클라이언트 컴포넌트를 Suspense로 감싸지 않으면 이 컴포넌트를 포함한
 * 정적 페이지 전체가 정적 렌더링에서 제외된다(Next.js App Router 공식 제약). 이 사이트는
 * `generateStaticParams`로 대부분의 `[lang]/...` 페이지를 정적 생성하므로, `usePathname()`만
 * 쓰던 예전 버전과 달리 이번엔 반드시 감싸야 한다 — 열려있지 않은 드롭다운 버튼과 똑같이 보이는
 * `LanguageSwitcherFallback`을 폴백으로 둔다(정적 셸에 잠깐 보일 뿐, 하이드레이션 후 곧바로
 * 실제 컴포넌트로 교체된다).
 */
/**
 * 펼침 상태는 공개(disclosure) 패턴으로 알린다(2026-10-06 전체 점검 3차 후속, 접근성) — `aria-expanded` + `aria-controls`.
 * `aria-haspopup`은 붙이지 않는다: 그 값(true=menu)은 화살표 키로 움직이는 `role="menu"`를 약속하는데, 이 목록은
 * 평범한 링크 목록이라 탭 키로 움직인다(W3C APG가 사이트 내비게이션에 menu 역할 대신 권하는 방식).
 */
function LanguageSwitcherButton({
  current,
  onClick,
  expanded,
  controls,
  buttonRef,
}: {
  current: MarketingLanguage;
  onClick?: () => void;
  expanded?: boolean;
  controls?: string;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-expanded={expanded ?? false}
      aria-controls={expanded ? controls : undefined}
      className="rounded-full border border-foreground/15 px-2.5 py-1 text-sm font-medium text-foreground/70 hover:text-foreground sm:border-0 sm:px-0 sm:py-0"
    >
      <span className="sm:hidden">{LANGUAGE_CODES[current]}</span>
      <span className="hidden sm:inline">{LANGUAGE_LABELS[current]}</span>
    </button>
  );
}

function LanguageSwitcherFallback({ current }: { current: MarketingLanguage }) {
  return (
    <div className="relative">
      <LanguageSwitcherButton current={current} />
    </div>
  );
}

function LanguageSwitcherInner({ current, activeLanguages }: { current: MarketingLanguage; activeLanguages: MarketingLanguage[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const pathLimit = useSwitcherPathLimit();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 열려 있을 때만 — Escape로 닫고 초점을 버튼으로 돌려주며, 목록 바깥을 누르면 닫는다(접근성, 2026-10-06 전체 점검 3차 후속).
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) return;
      setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  const rest = pathname.replace(new RegExp(`^/${current}`), '');
  const queryString = searchParams.toString();

  function pathForLanguage(lang: MarketingLanguage): string {
    return resolveLanguageSwitchPath(rest, lang, queryString, pathLimit);
  }

  const availableLanguages = availableSwitcherLanguages(rest, activeLanguages);

  return (
    <div ref={containerRef} className="relative">
      <LanguageSwitcherButton
        current={current}
        onClick={() => setOpen((v) => !v)}
        expanded={open}
        controls={listId}
        buttonRef={buttonRef}
      />
      {open && (
        <ul id={listId} className="absolute right-0 mt-2 w-36 rounded-lg border border-foreground/10 bg-background py-1 shadow-lg z-50">
          {availableLanguages.map((lang) => (
            <li key={lang}>
              <Link
                href={pathForLanguage(lang)}
                // 언어 이름은 그 언어로 읽혀야 한다 — 페이지 lang(예: ko)으로 "日本語"를 읽지 않게(2026-10-06 전체 점검 11차 R11-6-8).
                lang={lang}
                hrefLang={lang}
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

/** `activeLanguages`는 관리자가 켠 언어 원본(6개 축) — 경로별로 좁히는 일은 이 컴포넌트가 한다. */
export function LanguageSwitcher({ current, activeLanguages }: { current: MarketingLanguage; activeLanguages: MarketingLanguage[] }) {
  return (
    <Suspense fallback={<LanguageSwitcherFallback current={current} />}>
      <LanguageSwitcherInner current={current} activeLanguages={activeLanguages} />
    </Suspense>
  );
}
