'use client';

import { useEffect } from 'react';

/**
 * 언어 경로 아래 페이지가 렌더 중 실패했을 때(2026-10-06) — 예전엔 error.tsx가 없어 기본 500 화면이 떴다.
 * 레이아웃(헤더·언어)은 그대로 두고 본문 자리에만 다시 시도 버튼을 보여 준다. 문구는 사전 없이 짧게 여러 언어로.
 */
export default function LangError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="text-lg font-semibold">Something went wrong · 잠시 문제가 생겼어요</p>
      <p className="text-sm text-foreground/60">Please try again in a moment.</p>
      <button type="button" onClick={reset} className="rounded-full border border-foreground/20 px-5 py-2 text-sm">
        Try again · 다시 시도
      </button>
    </div>
  );
}
