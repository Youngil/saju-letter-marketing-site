import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './apiClient';
import { COUPON_AVAILABILITY_REVALIDATE_SECONDS, loadCouponAvailability } from './api';
import { mapPublicFormError } from './publicForm';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// 2026-10-06 전체 점검 9차 — 쿠폰 현황은 홈 서버 컴포넌트가 짧은 재검증으로 조회한다(브라우저가 방문마다 부르지 않게).
describe('loadCouponAvailability', () => {
  it('Next 데이터 캐시 재검증 주기를 붙여 조회한다', async () => {
    const body = { capacity: 100, issued: 10, remaining: 90 };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadCouponAvailability()).resolves.toEqual(body);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain('/marketing-site/coupon-availability');
    expect(init.next).toEqual({ revalidate: COUPON_AVAILABILITY_REVALIDATE_SECONDS });
    expect(COUPON_AVAILABILITY_REVALIDATE_SECONDS).toBeGreaterThanOrEqual(60);
    expect(COUPON_AVAILABILITY_REVALIDATE_SECONDS).toBeLessThanOrEqual(300);
  });

  it('실패(네트워크·5xx)는 null로 흡수한다 — 폼은 문구 없이 그대로', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(loadCouponAvailability()).resolves.toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('oops', { status: 503 })));
    await expect(loadCouponAvailability()).resolves.toBeNull();
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
