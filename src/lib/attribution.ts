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
 * 메모리에 들고 있다가 버린다(처음 들어온 홈에서 바로 배지를 누르는 흔한 경로는 그대로 잡힌다). 진입 뒤에 배너에서
 * 동의하면 그때 메모리 값을 보관한다(`persistAttributionTouch`). 동의를 거부로 바꾸면 보관된 값도 지운다(`analytics.ts`의 `storeConsent`). 마지막
 * 유입(last touch)이 이긴다. 30일은 GA4 기본 캠페인 기간과 비슷한 관용치다.
 */
export interface AttributionTouch {
  source: string;
  medium: string;
  campaign: string;
  /**
   * 들고 온 `utm_content`(2026-10-07 콘텐츠 게시 파이프라인) — 게시물마다 다른 추적 코드(`p`+8자, 관리자 패널 "게시 준비"가 만든다)라
   * 설치까지 이어 붙이면 주간 보고서가 게시물별 설치를 센다. 없으면 생략(그 전 저장 값과 호환).
   */
  content?: string;
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
    const content = sanitizeTag(url.searchParams.get('utm_content'));
    return {
      source,
      medium: sanitizeTag(url.searchParams.get('utm_medium')) || 'unknown',
      campaign: sanitizeTag(url.searchParams.get('utm_campaign')) || 'none',
      ...(content ? { content } : {}),
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
/** 이 문서(전체 페이지 로드)에서 진입 유입을 이미 뽑았는가 — 사이트 안 이동마다 다시 뽑지 않게(2026-10-07). */
let landingCaptured = false;

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
  landingCaptured = false;
}

/**
 * 진입 유입을 뽑아 저장하고, 현재 유효한 유입을 돌려준다. **문서(전체 페이지 로드)당 처음 한 번만 뽑는다**(2026-10-07 전체
 * 점검 7차) — 클라이언트 이동은 `document.referrer`를 바꾸지 않아서, 예전엔 배지를 누를 때마다 다시 뽑으며 "지금 주소(UTM
 * 없음) + 처음 referrer"로 진입 UTM을 덮어썼다(`?utm_source=tiktok&utm_campaign=bio`로 들어와 다른 페이지로 옮긴 뒤 누르면
 * `tiktok/social/none`, 웹메일로 연 뉴스레터 UTM은 `mail.google.com` referral). 두 번째부터는 저장된 값만 읽는다. 언어를
 * 바꿔 레이아웃이 다시 마운트돼도 마찬가지.
 */
export function captureAttribution(now: number = Date.now()): AttributionTouch | null {
  if (typeof window === 'undefined') return null;
  if (landingCaptured) return readStoredTouch(now);
  landingCaptured = true;
  const touch = deriveTouch(window.location.href, typeof document !== 'undefined' ? document.referrer : '', now);
  if (touch) {
    inMemoryTouch = touch;
    if (readStoredConsent() === 'granted') writeTouch(touch);
    return touch;
  }
  return readStoredTouch(now);
}

function writeTouch(touch: AttributionTouch): void {
  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(touch));
  } catch {
    // 프라이빗 브라우징 등 — 저장 못 해도 이번 페이지에서는 메모리 값으로 쓴다.
  }
}

/**
 * 진입 뒤에 동의한 방문자의 유입을 그때 보관한다(2026-10-06 전체 점검 8차) — `captureAttribution`은 진입 순간 한 번만
 * 돌아서, 처음 온 방문자(아직 동의 전 → 메모리에만)가 배너에서 "동의"를 눌러도 유입이 브라우저에 남지 않았다. 그러면 다른
 * 날 다시 와서 배지를 누르거나, 언어를 바꿔 문서가 새로 로드되기만 해도 30일 귀속이 끊겼다. 동의 배너가 `granted`를
 * 저장한 직후 부른다. 이 문서에서 뽑은 유입이 없으면(직접 방문 등) 이전에 보관된 값을 건드리지 않는다.
 */
export function persistAttributionTouch(now: number = Date.now()): void {
  if (typeof window === 'undefined') return;
  if (readStoredConsent() !== 'granted') return;
  if (!inMemoryTouch || now - inMemoryTouch.storedAt > ATTRIBUTION_TTL_MS) return;
  writeTouch(inMemoryTouch);
}

/**
 * Play 스토어 링크에 `referrer`(Install Referrer)를 붙인다. 유입 정보가 없으면 사이트 자체
 * 유입(`marketing_site / website / direct`)으로 기록해, 적어도 "사이트를 거쳐 설치"는 구분되게 한다.
 * 유입에 `utm_content`(게시물 추적 코드)가 있으면 그것을 `utm_content`로 넘기고 어느 화면의 배지였는지는 `utm_term`으로
 * 옮긴다(2026-10-07) — 게시물별 설치가 배지 위치보다 쓸모 있다. 없으면 예전처럼 배지 위치가 `utm_content`.
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
  const badge = sanitizeTag(context);
  const postCode = sanitizeTag(touch?.content);
  if (postCode) {
    inner.set('utm_content', postCode);
    if (badge) inner.set('utm_term', badge);
  } else if (badge) {
    inner.set('utm_content', badge);
  }
  url.searchParams.set('referrer', inner.toString());
  return url.toString();
}
