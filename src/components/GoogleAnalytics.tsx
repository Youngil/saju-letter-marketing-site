import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

/**
 * gtag.js 로더 — `[lang]/layout.tsx`(서버 컴포넌트)에 그대로 얹는다. `next/script`는 서버
 * 컴포넌트 안에서도 공식적으로 지원되는 패턴이라 이 컴포넌트 자체에 'use client'가 필요 없다
 * (`src/lib/analytics.ts` 참고 — 실제 이벤트 전송은 각 클라이언트 컴포넌트에서 `trackEvent()`로).
 * 측정 ID가 없으면(로컬 개발 기본값) 아무 스크립트도 렌더링하지 않는다.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
