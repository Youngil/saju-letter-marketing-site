'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { MarketingLanguage, SwitcherPathLimit } from '@/lib/languages';

/**
 * 언어 스위처는 레이아웃에 있어 하위 페이지가 무엇인지 모른다 — 블로그 글처럼 언어마다 있는지가 다른 페이지가
 * 이 컴포넌트를 그려 "이 경로는 이 언어들에만 있다"를 알려 준다(2026-10-06 전체 점검 3차, 없는 언어로 바꾸면
 * 404가 나던 문제). 레이아웃 트리를 감싸는 Provider 대신 작은 모듈 저장소 하나로 충분하다(스위처가 유일한 소비처).
 * 서버 스냅샷은 늘 null이라 하이드레이션 결과는 같고, 적용 여부는 `restOfPath`로 다시 확인하므로 정리가 한 박자
 * 늦어도 다른 페이지에 새지 않는다.
 */
let currentLimit: SwitcherPathLimit | null = null;
const listeners = new Set<() => void>();

function setLimit(next: SwitcherPathLimit | null) {
  currentLimit = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSwitcherPathLimit(): SwitcherPathLimit | null {
  return useSyncExternalStore(
    subscribe,
    () => currentLimit,
    () => null,
  );
}

export function SwitcherLanguageLimit({
  restOfPath,
  languages,
  fallbackRestOfPath,
}: {
  restOfPath: string;
  languages: MarketingLanguage[];
  fallbackRestOfPath: string;
}) {
  // 서버에서 매번 새 배열로 오므로 내용으로 비교한다.
  const languagesKey = languages.join(',');
  useEffect(() => {
    const limit: SwitcherPathLimit = {
      restOfPath,
      languages: languagesKey.split(',').filter(Boolean) as MarketingLanguage[],
      fallbackRestOfPath,
    };
    setLimit(limit);
    return () => {
      if (currentLimit === limit) setLimit(null);
    };
  }, [restOfPath, languagesKey, fallbackRestOfPath]);
  return null;
}
