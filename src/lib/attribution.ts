/**
 * 유입 채널 → Play 스토어 설치까지 이어 붙이기(2026-10-01).
 *
 * 틱톡·인스타 등은 프로필 링크 하나만 허용해서 방문자가 `?utm_source=tiktok…`을 달고 이 사이트로
 * 먼저 들어온 뒤, 사이트의 Google Play 배지를 눌러 설치한다. 그런데 배지 링크가 고정 URL이라
 * 설치 시점에 원래 채널 정보가 끊겨, 앱의 Firebase Analytics(같은 GA4 프로퍼티, `sign_up`/
 * `trial_start`/`purchase`)에서 이 경로로 온 설치가 전부 "출처 없음"으로 잡혔다. 이 파일은
 * 방문자가 들고 온 UTM(없으면 외부 referrer)을 기억해 두었다가, Play 링크의 `referrer`
 * 파라미터(Google Play Install Referrer — Firebase가 설치 직후 자동으로 읽어 캠페인으로 기록)에
 * 그대로 실어 보낸다. `utm_content`에는 어느 화면의 배지였는지(`context`)를 담는다.
 *
 * 저장 값은 채널 이름 같은 캠페인 꼬리표뿐이고 방문자 식별자는 없다. 그래도 기기에 정보를
 * 남기는 일이라(EU ePrivacy 기준 비필수 저장), **브라우저 보관(localStorage, 최대 30일)은 분석
 * 쿠키에 동의한 방문자에게만** 한다 — 동의하지 않은 방문자는 이 페이지를 떠나기 전까지만
 * 메모리에 들고 있다가 버린다(처음 들어온 홈에서 바로 배지를 누르는 흔한 경로는 그대로 잡힌다).
 * 동의를 거부로 바꾸면 보관된 값도 지운다(`analytics.ts`의 `storeConsent`). 마지막
 * 유입(last touch)이 이긴다. 30일은 GA4 기본 캠페인 기간과 비슷한 관용치다.
 */
export interface AttributionTouch {
  source: string;
  medium: string;
  campaign: string;
  storedAt: number;
}

import { ATTRIBUTION_STORAGE_KEY, readStoredConsent } from './analytics';

export { ATTRIBUTION_STORAGE_KEY };
const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const OWN_HOSTS = ['saju-letter.com', 'www.saju-letter.com'];

/** 꼬리표 값은 짧은 안전 문자만 남긴다(임의 문자열이 스토어 링크로 흘러가지 않게). */
export function sanitizeTag(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_').slice(0, 64);
}

const KNOWN_REFERRERS: Array<{ match: RegExp; source: string; medium: string }> = [
  { match: /(^|\.)google\./, source: 'google', medium: 'organic' },
  { match: /(^|\.)bing\.com$/, source: 'bing', medium: 'organic' },
  { match: /(^|\.)naver\.com$/, source: 'naver', medium: 'organic' },
  { match: /(^|\.)tiktok\.com$/, source: 'tiktok', medium: 'social' },
  { match: /(^|\.)instagram\.com$/, source: 'instagram', medium: 'social' },
  { match: /(^|\.)(youtube\.com|youtu\.be)$/, source: 'youtube', medium: 'social' },
  { match: /(^|\.)reddit\.com$/, source: 'reddit', medium: 'community' },
  { match: /(^|\.)(t\.co|x\.com|twitter\.com)$/, source: 'x', medium: 'social' },
  { match: /(^|\.)threads\.(net|com)$/, source: 'threads', medium: 'social' },
  { match: /(^|\.)pinterest\./, source: 'pinterest', medium: 'social' },
  { match: /(^|\.)facebook\.com$/, source: 'facebook', medium: 'social' },
  { match: /(^|\.)producthunt\.com$/, source: 'producthunt', medium: 'referral' },
];

/**
 * 현재 페이지 진입에서 새 유입 정보를 뽑는다. 새 정보가 없으면(사이트 안 이동·직접 방문) null —
 * 호출부는 이전에 저장된 값을 그대로 둔다.
 * 우선순위: URL의 UTM → 궁합 공유 페이지 직접 진입 → 외부 referrer.
 */
export function deriveTouch(href: string, referrer: string, now: number): AttributionTouch | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const source = sanitizeTag(url.searchParams.get('utm_source'));
  if (source) {
    return {
      source,
      medium: sanitizeTag(url.searchParams.get('utm_medium')) || 'unknown',
      campaign: sanitizeTag(url.searchParams.get('utm_campaign')) || 'none',
      storedAt: now,
    };
  }

  // 앱이 만드는 궁합 공유 링크(`/compat/{token}` → 미들웨어가 `/{lang}/compat/{token}`으로 보냄)는
  // UTM이 없다. 이 페이지로 들어온 사람은 친구 초대로 온 것이므로 그대로 채널로 기록한다.
  if (/^\/[a-z]{2}\/compat\/[^/]+/.test(url.pathname)) {
    return { source: 'compat_share', medium: 'referral', campaign: 'friend_invite', storedAt: now };
  }

  if (!referrer) return null;
  let refHost: string;
  try {
    refHost = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (!refHost || OWN_HOSTS.includes(refHost)) return null;
  const known = KNOWN_REFERRERS.find((r) => r.match.test(refHost));
  if (known) return { source: known.source, medium: known.medium, campaign: 'none', storedAt: now };
  return { source: sanitizeTag(refHost.replace(/^www\./, '')), medium: 'referral', campaign: 'none', storedAt: now };
}

/** 동의하지 않은 방문자용 — 이 페이지(탭)의 메모리에만 있는 유입 정보. */
let inMemoryTouch: AttributionTouch | null = null;

export function readStoredTouch(now: number = Date.now()): AttributionTouch | null {
  if (typeof window === 'undefined') return null;
  if (inMemoryTouch && now - inMemoryTouch.storedAt <= ATTRIBUTION_TTL_MS) return inMemoryTouch;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AttributionTouch;
    if (!parsed || typeof parsed.source !== 'string' || now - parsed.storedAt > ATTRIBUTION_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** 테스트 전용 — 모듈 메모리 상태 초기화. */
export function resetAttributionMemoryForTest(): void {
  inMemoryTouch = null;
}

/** 페이지 진입 시 한 번 호출 — 새 유입이면 저장하고, 현재 유효한 유입을 돌려준다. 여러 번 불러도 안전. */
export function captureAttribution(now: number = Date.now()): AttributionTouch | null {
  if (typeof window === 'undefined') return null;
  const touch = deriveTouch(window.location.href, typeof document !== 'undefined' ? document.referrer : '', now);
  if (touch) {
    inMemoryTouch = touch;
    if (readStoredConsent() === 'granted') {
      try {
        window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(touch));
      } catch {
        // 프라이빗 브라우징 등 — 저장 못 해도 이번 페이지에서는 메모리 값으로 쓴다.
      }
    }
    return touch;
  }
  return readStoredTouch(now);
}

/**
 * Play 스토어 링크에 `referrer`(Install Referrer)를 붙인다. 유입 정보가 없으면 사이트 자체
 * 유입(`marketing_site / website / direct`)으로 기록해, 적어도 "사이트를 거쳐 설치"는 구분되게 한다.
 */
export function buildPlayStoreUrl(base: string, touch: AttributionTouch | null, context?: string): string {
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return base;
  }
  const inner = new URLSearchParams({
    utm_source: touch?.source ?? 'marketing_site',
    utm_medium: touch?.medium ?? 'website',
    utm_campaign: touch?.campaign ?? 'direct',
  });
  const content = sanitizeTag(context);
  if (content) inner.set('utm_content', content);
  url.searchParams.set('referrer', inner.toString());
  return url.toString();
}
