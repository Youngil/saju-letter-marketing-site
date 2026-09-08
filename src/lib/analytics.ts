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

/**
 * 쿠키/추적 동의(2026-09-08, 3차 종합 버그 점검 항목 3) — 완전한 CMP(Consent Management
 * Platform) 대신 최소한의 동의 배너 + Google Consent Mode v2로 구현한다(사용자가 명시적으로
 * 이 절충안을 선택했다). `localStorage` 키 하나(`CONSENT_STORAGE_KEY`)에 선택+시각을 저장해
 * 다음 방문 시 배너를 다시 안 띄운다 — 1년 지나면 다시 물어본다(개인정보 관행 변경 가능성을
 * 감안한 관용적 유효기간, GDPR이 명시적으로 요구하는 숫자는 아니다).
 */
export const CONSENT_STORAGE_KEY = 'saju-letter-consent';
const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export type ConsentChoice = 'granted' | 'denied';

interface StoredConsent {
  choice: ConsentChoice;
  storedAt: number;
}

/** 저장된 선택이 없거나 만료됐으면 null — 배너를 다시 보여줘야 한다는 신호. */
export function readStoredConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (Date.now() - parsed.storedAt > CONSENT_TTL_MS) return null;
    return parsed.choice === 'granted' || parsed.choice === 'denied' ? parsed.choice : null;
  } catch {
    // 프라이빗 브라우징 등에서 localStorage 접근 자체가 던질 수 있다 — 배너를 다시 보여주는
    // 쪽으로 안전하게 흡수한다(artifact 스토리지 가이드와 같은 fail-open 원칙).
    return null;
  }
}

/** 방문자의 선택을 저장하고, GA4가 이미 로드돼 있으면 Consent Mode 상태를 즉시 갱신한다. */
export function storeConsent(choice: ConsentChoice): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ choice, storedAt: Date.now() } satisfies StoredConsent));
    } catch {
      // 저장 실패해도 이번 세션의 Consent Mode 갱신 자체는 계속 진행한다.
    }
  }
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  });
}
