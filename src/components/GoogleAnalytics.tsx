import Script from 'next/script';
import { GA_MEASUREMENT_ID, CONSENT_STORAGE_KEY } from '@/lib/analytics';

/**
 * gtag.js 로더 — `[lang]/layout.tsx`(서버 컴포넌트)에 그대로 얹는다. `next/script`는 서버
 * 컴포넌트 안에서도 공식적으로 지원되는 패턴이라 이 컴포넌트 자체에 'use client'가 필요 없다
 * (`src/lib/analytics.ts` 참고 — 실제 이벤트 전송은 각 클라이언트 컴포넌트에서 `trackEvent()`로).
 * 측정 ID가 없으면(로컬 개발 기본값) 아무 스크립트도 렌더링하지 않는다.
 *
 * **쿠키/추적 동의(2026-09-08, 3차 종합 버그 점검 항목 3) — Google Consent Mode v2.** 이
 * 스크립트가 로드되기 *전에* `gtag('consent', 'default', ...)`로 모든 저장소를 `denied`로
 * 시작한다(GA4 자체 로드는 막지 않는다 — Consent Mode는 "동의 전엔 쿠키 없이 익명화된 신호만
 * 보낸다"는 방식이라, 스크립트를 통째로 빼는 것보다 이쪽이 Google 권장 패턴에 더 가깝다).
 * 이미 저장된 선택(`localStorage`, `CONSENT_STORAGE_KEY`)이 있으면 이 초기화 스크립트 안에서
 * 바로 그 값으로 갱신한다 — `ConsentBanner`(클라이언트 컴포넌트, 마운트 후에야 실행)를 기다리면
 * 재방문자도 매번 짧게 `denied` 상태로 첫 이벤트가 나갈 수 있어, 여기서 동기적으로 한 번 더
 * 반영한다(1년 TTL 판정은 `analytics.ts`의 `CONSENT_TTL_MS`와 값을 맞춰야 한다).
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <Script id="ga4-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          try {
            var stored = JSON.parse(window.localStorage.getItem('${CONSENT_STORAGE_KEY}') || 'null');
            var oneYearMs = 365 * 24 * 60 * 60 * 1000;
            if (stored && stored.choice === 'granted' && (Date.now() - stored.storedAt) <= oneYearMs) {
              gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
              });
            }
          } catch (e) {}
        `}
      </Script>
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
