/**
 * Google Analytics 4(gtag.js) — 마케팅 사이트 전용 웹 스트림(2026-09-07 도입).
 *
 * `saju-letter-mobile`의 Firebase Analytics(GA4 for Firebase, `../mobile CLAUDE.md` §12)와 같은
 * GA4 프로퍼티(`saju-letter-20575`)에 별도 "웹" 데이터 스트림으로 연결돼 있어, BigQuery export
 * (이미 연동된 `analytics_547122318` 데이터셋)에서 앱/웹 이벤트를 한 곳에서 함께 조회할 수 있다.
 *
 * Firebase JS SDK(`firebase/analytics`)를 새로 들이는 대신 Google 표준 gtag.js를 직접 쓴다 — 이
 * 사이트는 Firebase Auth/Firestore 등 다른 Firebase 서비스를 쓰지 않아, 분석만을 위해 SDK 전체를
 * 새 의존성으로 추가할 이유가 없다(`<script>` 두 개로 동일한 결과를 낸다).
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/**
 * 커스텀 이벤트 기록 — 측정 ID가 없거나(로컬 개발 기본값) gtag.js가 아직 로드되지 않았으면
 * 조용히 무시한다(Turnstile의 "사이트 키 없으면 위젯 자체를 렌더링하지 않는다"와 같은 fail-open
 * 원칙). SSR 중에도 안전하게 호출할 수 있도록 `window` 존재 여부부터 확인한다.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
