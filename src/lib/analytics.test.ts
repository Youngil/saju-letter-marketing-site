import { afterEach, describe, expect, it, vi } from 'vitest';
import { readStoredConsent, storeConsent, CONSENT_STORAGE_KEY } from './analytics';

/**
 * 2026-09-08 3차 종합 버그 점검(항목 3) 회귀 테스트 — GA4가 방문자 동의 없이 항상 발화하던
 * 문제를 최소 동의 배너 + Google Consent Mode로 고쳤다. 이 저장소는 jsdom/happy-dom을 쓰지
 * 않으므로(vitest 기본 node 환경), `window`를 `vi.stubGlobal`로 최소한만 흉내내 검증한다.
 */
afterEach(() => {
  vi.unstubAllGlobals();
});

function stubWindow(overrides: { localStorage?: Partial<Storage>; gtag?: (...args: unknown[]) => void } = {}) {
  const store = new Map<string, string>();
  const localStorage: Storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: () => null,
    length: 0,
    ...overrides.localStorage,
  };
  vi.stubGlobal('window', { localStorage, gtag: overrides.gtag });
  return { store, localStorage };
}

describe('readStoredConsent', () => {
  it('window가 없으면(SSR) null을 반환한다', () => {
    expect(readStoredConsent()).toBeNull();
  });

  it('저장된 값이 없으면 null을 반환한다', () => {
    stubWindow();
    expect(readStoredConsent()).toBeNull();
  });

  it('1년 이내에 저장된 granted 선택을 그대로 돌려준다', () => {
    const { store } = stubWindow();
    store.set(CONSENT_STORAGE_KEY, JSON.stringify({ choice: 'granted', storedAt: Date.now() }));
    expect(readStoredConsent()).toBe('granted');
  });

  it('1년 이내에 저장된 denied 선택도 그대로 돌려준다(배너를 다시 안 띄운다)', () => {
    const { store } = stubWindow();
    store.set(CONSENT_STORAGE_KEY, JSON.stringify({ choice: 'denied', storedAt: Date.now() }));
    expect(readStoredConsent()).toBe('denied');
  });

  it('1년 넘게 지난 선택은 만료로 취급해 null(=배너 재노출)을 반환한다', () => {
    const { store } = stubWindow();
    const twoYearsAgo = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
    store.set(CONSENT_STORAGE_KEY, JSON.stringify({ choice: 'granted', storedAt: twoYearsAgo }));
    expect(readStoredConsent()).toBeNull();
  });

  it('저장된 값이 깨진 JSON이어도 예외를 던지지 않고 null을 반환한다', () => {
    const { store } = stubWindow();
    store.set(CONSENT_STORAGE_KEY, '{not json');
    expect(readStoredConsent()).toBeNull();
  });
});

describe('storeConsent', () => {
  it('선택을 localStorage에 저장한다', () => {
    const { store } = stubWindow();
    storeConsent('granted');
    const saved = JSON.parse(store.get(CONSENT_STORAGE_KEY)!);
    expect(saved.choice).toBe('granted');
    expect(typeof saved.storedAt).toBe('number');
  });

  it('granted를 고르면 4개 저장소 전부 granted로 Consent Mode를 갱신한다', () => {
    const gtag = vi.fn();
    stubWindow({ gtag });
    storeConsent('granted');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('denied를 고르면 4개 저장소 전부 denied로 유지한다', () => {
    const gtag = vi.fn();
    stubWindow({ gtag });
    storeConsent('denied');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('window가 없어도(SSR) 예외를 던지지 않는다', () => {
    expect(() => storeConsent('granted')).not.toThrow();
  });

  it('gtag가 아직 로드 전(함수가 아님)이어도 예외를 던지지 않는다', () => {
    stubWindow();
    expect(() => storeConsent('granted')).not.toThrow();
  });
});
