'use client';

import Script from 'next/script';
import { useId } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => void;
    };
  }
}

/**
 * saju-letter-newyear-campaign/src/components/Turnstile.tsx와 동일 — Cloudflare Turnstile
 * 위젯. NEXT_PUBLIC_TURNSTILE_SITE_KEY가 없으면(계정 연동 전) 아예 렌더링하지 않는다
 * (백엔드 fail-open과 짝을 이루는 프론트 쪽 처리).
 */
export function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerId = useId().replace(/:/g, '');

  if (!SITE_KEY) return null;

  return (
    <>
      <div id={containerId} />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.turnstile?.render(`#${containerId}`, { sitekey: SITE_KEY, callback: onVerify });
        }}
      />
    </>
  );
}
