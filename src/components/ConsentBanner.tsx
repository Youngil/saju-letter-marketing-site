'use client';

import { useEffect, useState } from 'react';
import { readStoredConsent, storeConsent } from '@/lib/analytics';
import type { MarketingDictionary } from '@/dictionaries/types';

/**
 * 쿠키/추적 동의 배너(2026-09-08, 3차 종합 버그 점검 항목 3) — GA4가 방문자 동의 없이 항상
 * 발화하던 문제에 대한 최소 대응. 완전한 CMP(Consent Management Platform) 대신 "허용/거부"
 * 두 버튼짜리 배너 + Google Consent Mode(`GoogleAnalytics.tsx`/`lib/analytics.ts`)로
 * 구현한다 — 사용자가 명시적으로 선택한 절충안(과설계 방지, 이 저장소 전반의 관례).
 *
 * ⚠️ 배너 문구(`dict.consent`, `dictionaries/*.ts`)는 AI가 작성한 초안이다 — 법적 효력이
 * 있는 표현으로 실제 게시 전 법률 전문가 검토가 필요하다(`content/privacyPolicy.ts` 상단
 * 주석과 동일한 검토 대상).
 *
 * `[lang]/layout.tsx`가 모든 페이지에 이 컴포넌트를 렌더하지만, 저장된 선택이 이미 있으면
 * (또는 만료 전이면) 아무것도 보여주지 않는다 — `readStoredConsent()`가 `GoogleAnalytics.tsx`의
 * 인라인 스크립트와 같은 `localStorage` 키/TTL을 공유한다.
 */
export function ConsentBanner({ dict }: { dict: MarketingDictionary['consent'] }) {
  // 서버 렌더 시점엔 localStorage에 접근할 수 없어 항상 숨김 상태로 시작하고, 마운트 후에만
  // 실제 저장 여부를 확인한다(hydration mismatch 방지 — 이 저장소의 다른 localStorage 소비처가
  // 없어 새로 세운 관례).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readStoredConsent() === null);
  }, []);

  function handleChoice(choice: 'granted' | 'denied') {
    storeConsent(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-foreground/10 bg-background/95 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-foreground/70">{dict.message}</p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => handleChoice('denied')}
            className="rounded-full border border-foreground/15 px-4 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            {dict.declineButton}
          </button>
          <button
            type="button"
            onClick={() => handleChoice('granted')}
            className="rounded-full bg-accent-warm px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            {dict.acceptButton}
          </button>
        </div>
      </div>
    </div>
  );
}
