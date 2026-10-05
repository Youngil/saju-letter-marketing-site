import { afterEach, describe, expect, it, vi } from 'vitest';
import { ATTRIBUTION_STORAGE_KEY, buildPlayStoreUrl, captureAttribution, deriveTouch, persistAttributionTouch, readStoredTouch, resetAttributionMemoryForTest, sanitizeTag } from './attribution';
import { CONSENT_STORAGE_KEY, storeConsent } from './analytics';

const NOW = 1_800_000_000_000;
const PLAY = 'https://play.google.com/store/apps/details?id=com.sajuletter.app';

afterEach(() => {
  vi.unstubAllGlobals();
  resetAttributionMemoryForTest();
});

function stubBrowser(href: string, referrer = '', consent: 'granted' | 'denied' | null = 'granted') {
  const store = new Map<string, string>();
  if (consent) store.set(CONSENT_STORAGE_KEY, JSON.stringify({ choice: consent, storedAt: Date.now() }));
  const localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  vi.stubGlobal('window', { location: { href }, localStorage });
  vi.stubGlobal('document', { referrer });
  return store;
}

function referrerParams(url: string): URLSearchParams {
  return new URLSearchParams(new URL(url).searchParams.get('referrer') ?? '');
}

describe('deriveTouch', () => {
  it('URL의 UTM을 그대로 쓴다', () => {
    const t = deriveTouch('https://www.saju-letter.com/en?utm_source=TikTok&utm_medium=social&utm_campaign=tiktok_en', '', NOW);
    expect(t).toEqual({ source: 'tiktok', medium: 'social', campaign: 'tiktok_en', storedAt: NOW });
  });

  it('궁합 공유 페이지로 직접 들어오면 compat_share로 기록한다', () => {
    const t = deriveTouch('https://www.saju-letter.com/ko/compat/abc123', '', NOW);
    expect(t?.source).toBe('compat_share');
  });

  it('외부 referrer를 알려진 채널로 매핑한다', () => {
    expect(deriveTouch('https://www.saju-letter.com/en', 'https://www.google.com/', NOW)).toMatchObject({ source: 'google', medium: 'organic' });
    expect(deriveTouch('https://www.saju-letter.com/en', 'https://old.reddit.com/r/x', NOW)).toMatchObject({ source: 'reddit' });
  });

  it('사이트 안 이동이나 직접 방문은 새 유입이 아니다', () => {
    expect(deriveTouch('https://www.saju-letter.com/en/blog', 'https://www.saju-letter.com/en', NOW)).toBeNull();
    expect(deriveTouch('https://www.saju-letter.com/en', '', NOW)).toBeNull();
  });
});

describe('sanitizeTag', () => {
  it('안전하지 않은 문자를 치환하고 길이를 자른다', () => {
    expect(sanitizeTag('a b&c=d')).toBe('a_b_c_d');
    expect(sanitizeTag('x'.repeat(100))).toHaveLength(64);
  });
});

describe('buildPlayStoreUrl', () => {
  it('유입 정보와 화면(context)을 referrer에 싣는다', () => {
    const url = buildPlayStoreUrl(PLAY, { source: 'tiktok', medium: 'social', campaign: 'tiktok_en', storedAt: NOW }, 'home_hero');
    expect(new URL(url).searchParams.get('id')).toBe('com.sajuletter.app');
    const r = referrerParams(url);
    expect(r.get('utm_source')).toBe('tiktok');
    expect(r.get('utm_campaign')).toBe('tiktok_en');
    expect(r.get('utm_content')).toBe('home_hero');
  });

  it('유입 정보가 없으면 사이트 자체 유입으로 기록한다', () => {
    const r = referrerParams(buildPlayStoreUrl(PLAY, null));
    expect(r.get('utm_source')).toBe('marketing_site');
    expect(r.get('utm_medium')).toBe('website');
    expect(r.has('utm_content')).toBe(false);
  });

  it('잘못된 base URL은 그대로 돌려준다', () => {
    expect(buildPlayStoreUrl('not a url', null)).toBe('not a url');
  });
});

describe('captureAttribution', () => {
  it('새 유입을 저장하고, 이후 페이지에서는 저장된 값을 돌려준다', () => {
    const store = stubBrowser('https://www.saju-letter.com/en?utm_source=instagram&utm_medium=social&utm_campaign=ig_en');
    expect(captureAttribution(NOW)?.source).toBe('instagram');
    expect(store.has(ATTRIBUTION_STORAGE_KEY)).toBe(true);

    vi.stubGlobal('window', { location: { href: 'https://www.saju-letter.com/en/blog' }, localStorage: (globalThis as { window: { localStorage: unknown } }).window.localStorage });
    expect(captureAttribution(NOW + 1000)?.source).toBe('instagram');
  });

  it('진입 유입은 문서당 한 번만 뽑는다 — 사이트 안 이동 뒤 다시 불러도 처음 referrer로 UTM을 덮어쓰지 않는다', () => {
    // tiktok.com에서 UTM을 달고 들어왔다가(진입) 클라이언트 이동으로 블로그로 — document.referrer는 그대로 tiktok.com.
    stubBrowser('https://www.saju-letter.com/en?utm_source=tiktok&utm_medium=social&utm_campaign=bio', 'https://www.tiktok.com/');
    expect(captureAttribution(NOW)).toMatchObject({ source: 'tiktok', campaign: 'bio' });

    (globalThis as unknown as { window: { location: { href: string } } }).window.location.href = 'https://www.saju-letter.com/en/blog';
    expect(captureAttribution(NOW + 1000)).toMatchObject({ source: 'tiktok', campaign: 'bio' });
    expect(readStoredTouch(NOW + 1000)).toMatchObject({ source: 'tiktok', campaign: 'bio' });
  });

  it('웹메일에서 연 뉴스레터 UTM이 다음 호출에서 mail.google.com referral로 바뀌지 않는다', () => {
    stubBrowser('https://www.saju-letter.com/en?utm_source=newsletter&utm_medium=email', 'https://mail.google.com/');
    expect(captureAttribution(NOW)?.source).toBe('newsletter');
    (globalThis as unknown as { window: { location: { href: string } } }).window.location.href = 'https://www.saju-letter.com/ko';
    expect(captureAttribution(NOW + 1000)?.source).toBe('newsletter');
  });

  it('30일이 지난 값은 버린다', () => {
    stubBrowser('https://www.saju-letter.com/en?utm_source=x');
    captureAttribution(NOW);
    expect(readStoredTouch(NOW + 31 * 24 * 60 * 60 * 1000)).toBeNull();
  });

  it('분석 쿠키에 동의하지 않았으면 브라우저에 보관하지 않고 이 페이지 메모리에서만 쓴다', () => {
    const store = stubBrowser('https://www.saju-letter.com/en?utm_source=reddit', '', null);
    expect(captureAttribution(NOW)?.source).toBe('reddit');
    expect(store.has(ATTRIBUTION_STORAGE_KEY)).toBe(false);
    expect(readStoredTouch(NOW + 1000)?.source).toBe('reddit');
  });

  it('동의를 거부로 바꾸면 보관된 유입 정보를 지운다', () => {
    const store = stubBrowser('https://www.saju-letter.com/en?utm_source=tiktok');
    captureAttribution(NOW);
    expect(store.has(ATTRIBUTION_STORAGE_KEY)).toBe(true);
    storeConsent('denied');
    expect(store.has(ATTRIBUTION_STORAGE_KEY)).toBe(false);
  });

  it('SSR(window 없음)에서는 null', () => {
    expect(captureAttribution(NOW)).toBeNull();
  });
});

/**
 * 2026-10-06 전체 점검 8차 항목 2 — 처음 온 방문자는 진입 순간 아직 동의 전이라 유입이 메모리에만 있다. 예전엔 배너에서
 * 동의해도 보관하지 않아, 문서가 새로 로드되면(언어 전환·다음 방문) 30일 귀속이 끊겼다. 배너가 granted 직후 부른다.
 */
describe('persistAttributionTouch — 진입 뒤에 동의', () => {
  it('진입 때 메모리에만 있던 유입을 동의 직후 보관하고, 새 문서에서도 읽힌다', () => {
    const store = stubBrowser('https://www.saju-letter.com/en?utm_source=tiktok&utm_medium=social&utm_campaign=bio', '', null);
    captureAttribution(NOW);
    expect(store.has(ATTRIBUTION_STORAGE_KEY)).toBe(false);

    // 배너에서 "동의" → storeConsent('granted') → persistAttributionTouch()
    storeConsent('granted');
    persistAttributionTouch(NOW + 1000);
    expect(JSON.parse(store.get(ATTRIBUTION_STORAGE_KEY)!)).toMatchObject({ source: 'tiktok', medium: 'social', campaign: 'bio' });

    // 언어를 바꿔 문서가 새로 로드됨(모듈 메모리 초기화) — 유입 없는 같은 사이트 주소라도 보관된 값으로 이어진다.
    resetAttributionMemoryForTest();
    (globalThis as unknown as { window: { location: { href: string } } }).window.location.href = 'https://www.saju-letter.com/ko';
    expect(captureAttribution(NOW + 2000)).toMatchObject({ source: 'tiktok', campaign: 'bio' });
  });

  it('동의하지 않았으면(거부·미선택) 보관하지 않는다', () => {
    const store = stubBrowser('https://www.saju-letter.com/en?utm_source=reddit', '', null);
    captureAttribution(NOW);
    persistAttributionTouch(NOW);
    expect(store.has(ATTRIBUTION_STORAGE_KEY)).toBe(false);
    storeConsent('denied');
    persistAttributionTouch(NOW);
    expect(store.has(ATTRIBUTION_STORAGE_KEY)).toBe(false);
  });

  it('이 문서에서 뽑은 유입이 없으면 이전에 보관된 값을 건드리지 않는다', () => {
    const store = stubBrowser('https://www.saju-letter.com/en', '', 'granted');
    const earlier = { source: 'instagram', medium: 'social', campaign: 'ig', storedAt: NOW - 1000 };
    store.set(ATTRIBUTION_STORAGE_KEY, JSON.stringify(earlier));
    captureAttribution(NOW);
    persistAttributionTouch(NOW);
    expect(JSON.parse(store.get(ATTRIBUTION_STORAGE_KEY)!)).toEqual(earlier);
  });
});
