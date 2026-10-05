'use client';

import { useState } from 'react';

export function ShareButton({
  url,
  title,
  shareLabel,
  copiedLabel,
}: {
  url: string;
  title: string;
  shareLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // 사용자가 공유 시트를 취소한 경우 등 — 조용히 무시하고 아래 클립보드 폴백은 시도하지 않는다.
        return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch (error) {
        // 권한 거부·비보안 문맥 등(2026-10-06 전체 점검 8차) — 예전엔 처리되지 않은 rejection이었다. "복사됨"을 띄우지 않는다.
        console.warn('clipboard write failed', error);
        return;
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium transition hover:bg-stone-100"
    >
      {copied ? copiedLabel : shareLabel}
    </button>
  );
}
