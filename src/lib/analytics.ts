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
/** 유입 채널 꼬리표 보관 키(`attribution.ts`) — 동의 거부 시 함께 지우려고 여기 둔다(순환 import 방지). */
export const ATTRIBUTION_STORAGE_KEY = 'saju-letter-attribution';
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

/**
 * Consent Mode에 넘길 저장소 상태(2026-10-06 전체 점검 8차, 사용자 결정) — **광고를 쓰지 않는 동안엔 `analytics_storage`만
 * 방문자의 선택을 따르고, 광고 저장소 3종(`ad_storage`·`ad_user_data`·`ad_personalization`)은 항상 `denied`.** 배너 문구는
 * "방문 통계 쿠키"만 묻는데 예전엔 동의하면 광고 저장소까지 함께 열었다. 인라인 기본값 스크립트(`GoogleAnalytics.tsx`)도
 * 같은 값을 쓴다 — 광고를 붙이게 되면 배너 문구·개인정보처리방침과 함께 이 함수를 바꿀 것.
 */
export function consentModeState(choice: ConsentChoice): Record<string, ConsentChoice> {
  return {
    analytics_storage: choice,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  };
}

/**
 * 동의를 철회하면 이미 심긴 GA 쿠키(`_ga`, `_ga_<스트림>`)도 지운다(2026-10-06 전체 점검 8차) — Consent Mode를 `denied`로
 * 바꾸면 gtag는 더 읽고 쓰지 않지만 쿠키 자체는 남는다. gtag는 기본(`cookie_domain: 'auto'`)으로 가장 넓은 도메인
 * (`.saju-letter.com`)에 심으므로, 현재 호스트와 그 상위 도메인마다 지운다(브라우저가 거부하는 공용 접미사는 무해하게 무시).
 */
export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  try {
    const names = String(document.cookie ?? '')
      .split(';')
      .map((part) => part.split('=')[0]!.trim())
      .filter((name) => name === '_ga' || name.startsWith('_ga_'));
    if (names.length === 0) return;
    const hostname = window.location?.hostname ?? '';
    const labels = hostname.split('.').filter(Boolean);
    const domains: Array<string | null> = [null];
    for (let i = 0; i < labels.length - 1; i += 1) domains.push(`.${labels.slice(i).join('.')}`);
    for (const name of names) {
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      }
    }
  } catch {
    // 쿠키 접근이 막힌 환경 — Consent Mode 갱신만으로도 더는 쓰이지 않는다.
  }
}

/**
 * 방문자의 선택을 저장하고, GA4가 이미 로드돼 있으면 Consent Mode 상태를 즉시 갱신한다. `denied`(처음 거부든, 동의했다가
 * 푸터 "쿠키 설정"으로 철회든)면 보관된 유입 정보와 GA 쿠키를 지운다.
 */
export function storeConsent(choice: ConsentChoice): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ choice, storedAt: Date.now() } satisfies StoredConsent));
      if (choice === 'denied') window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    } catch {
      // 저장 실패해도 이번 세션의 Consent Mode 갱신 자체는 계속 진행한다.
    }
  }
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') window.gtag('consent', 'update', consentModeState(choice));
  if (choice === 'denied') clearAnalyticsCookies();
}

/**
 * 푸터 "쿠키 설정"이 동의 배너를 다시 여는 신호(2026-10-06 전체 점검 8차) — 배너 문구가 "언제든 바꿀 수 있다"고 하는데
 * 한 번 고르면 다시 열 방법이 없었다(GDPR 7(3) 철회). 배너와 링크가 레이아웃의 서로 다른 클라이언트 섬이라 window 이벤트
 * 하나로 잇는다.
 */
export const OPEN_CONSENT_SETTINGS_EVENT = 'saju-letter:open-consent-settings';

export function openConsentSettings(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_CONSENT_SETTINGS_EVENT));
}
