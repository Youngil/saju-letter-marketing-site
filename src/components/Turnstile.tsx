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
 * 위젯. NEXT_PUBLIC_TURNSTILE_SITE_KEY가 없으면 렌더링하지 않는다 — 사이트 키 없이 위젯을
 * 그리면 에러만 난다. 로컬 백엔드는 시크릿이 없을 때 토큰 없이 통과하고, 운영은 토큰·시크릿이
 * 없으면 거부한다(`saju-letter-backend` `newYearCampaign/turnstile.ts`).
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
