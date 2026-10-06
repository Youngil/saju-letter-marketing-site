import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './apiClient';
import {
  COUPON_AVAILABILITY_REVALIDATE_SECONDS,
  COUPON_AVAILABILITY_ROUTE_PATH,
  fetchFreshCouponAvailability,
  loadCouponAvailability,
  parseCouponAvailability,
} from './api';
import { mapPublicFormError } from './publicForm';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// 쿠폰 현황(2026-10-06 전체 점검 9차 → 10차) — 홈 서버는 ISR과 같은 주기로 초기값만, 브라우저는 같은 사이트 라우트로 최신 값.
describe('loadCouponAvailability', () => {
  it('홈 ISR(3600초)과 같은 재검증 주기로 조회한다 — 라우트 재검증을 더 짧게 내리지 않게', async () => {
    const body = { capacity: 100, issued: 10, remaining: 90 };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadCouponAvailability()).resolves.toEqual(body);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain('/marketing-site/coupon-availability');
    expect(init.next).toEqual({ revalidate: COUPON_AVAILABILITY_REVALIDATE_SECONDS });
    expect(COUPON_AVAILABILITY_REVALIDATE_SECONDS).toBe(3600);
  });

  it('실패(네트워크·5xx)·모양 틀림은 null로 흡수한다 — 폼은 문구 없이 그대로', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(loadCouponAvailability()).resolves.toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('oops', { status: 503 })));
    await expect(loadCouponAvailability()).resolves.toBeNull();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ issued: 'many' }), { status: 200, headers: { 'content-type': 'application/json' } }),
      ),
    );
    await expect(loadCouponAvailability()).resolves.toBeNull();
  });
});

describe('parseCouponAvailability', () => {
  it('세 필드만 골라 돌려준다(캡 없음 null 허용)', () => {
    expect(parseCouponAvailability({ capacity: 100, issued: 3, remaining: 97, extra: 'x' })).toEqual({
      capacity: 100,
      issued: 3,
      remaining: 97,
    });
    expect(parseCouponAvailability({ capacity: null, issued: 0, remaining: null })).toEqual({
      capacity: null,
      issued: 0,
      remaining: null,
    });
  });

  it('모양이 틀리면 null', () => {
    expect(parseCouponAvailability(null)).toBeNull();
    expect(parseCouponAvailability('x')).toBeNull();
    expect(parseCouponAvailability({ capacity: 100, remaining: 90 })).toBeNull();
    expect(parseCouponAvailability({ capacity: '100', issued: 1, remaining: 99 })).toBeNull();
    expect(parseCouponAvailability({ capacity: 100, issued: -1, remaining: 99 })).toBeNull();
    expect(parseCouponAvailability({ capacity: 100, issued: 1, remaining: Number.NaN })).toBeNull();
    expect(parseCouponAvailability({ capacity: 100, issued: 1 })).toBeNull();
  });
});

describe('fetchFreshCouponAvailability', () => {
  it('같은 사이트 라우트를 부른다(백엔드 직접 호출 아님)', async () => {
    const body = { capacity: 100, issued: 60, remaining: 40 };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchFreshCouponAvailability()).resolves.toEqual(body);
    expect(fetchMock.mock.calls[0]![0]).toBe(COUPON_AVAILABILITY_ROUTE_PATH);
    expect(COUPON_AVAILABILITY_ROUTE_PATH).toBe('/api/coupon-availability');
  });

  it('503·네트워크 오류·중단·모양 틀림은 null — 호출부는 초기값을 그대로 둔다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 })));
    await expect(fetchFreshCouponAvailability()).resolves.toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(fetchFreshCouponAvailability()).resolves.toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError')));
    await expect(fetchFreshCouponAvailability(AbortSignal.abort())).resolves.toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 200 })));
    await expect(fetchFreshCouponAvailability()).resolves.toBeNull();
  });
});

describe('리드 폼 오류 문구(mapPublicFormError)', () => {
  const messages = {
    underage: 'generic',
    date: 'generic',
    generic: 'generic',
    rateLimited: 'slow down',
    byReason: { already_subscribed: 'already' },
  };

  it('429는 rateLimited, already_subscribed는 already, 그 밖엔 generic', () => {
    expect(mapPublicFormError(new ApiError('x', 429, 'rate_limited'), messages)).toBe('slow down');
    expect(mapPublicFormError(new ApiError('x', 409, 'already_subscribed'), messages)).toBe('already');
    expect(mapPublicFormError(new ApiError('x', 500), messages)).toBe('generic');
    expect(mapPublicFormError(new Error('network'), messages)).toBe('generic');
  });
});
