'use client';

import { openConsentSettings } from '@/lib/analytics';

/**
 * 푸터 "쿠키 설정"(2026-10-06 전체 점검 8차) — 동의 배너를 다시 열어 방문 통계 쿠키 동의를 언제든 바꾸거나 철회하게 한다
 * (GDPR 7(3)). 철회(`denied`)는 배너의 기존 경로(`storeConsent`)라 보관된 유입 정보·GA 쿠키도 함께 지운다. 배너와 같은
 * 조건(측정 ID가 있을 때)에서만 레이아웃이 렌더한다.
 */
export function ConsentSettingsLink({ label }: { label: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className="w-fit underline hover:text-foreground/70">
      {label}
    </button>
  );
}
