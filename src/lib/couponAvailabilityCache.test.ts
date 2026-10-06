import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCouponAvailabilityCache, loadCouponAvailabilityFromBackend } from './couponAvailabilityCache';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const A = { capacity: 100, issued: 10, remaining: 90 };
const B = { capacity: 100, issued: 55, remaining: 45 };

function setup(load: () => Promise<typeof A>) {
  let t = 0;
  const loadMock = vi.fn(load);
  const cache = createCouponAvailabilityCache({ load: loadMock, ttlMs: 60_000, failureTtlMs: 15_000, now: () => t });
  return { cache, loadMock, advance: (ms: number) => (t += ms) };
}

describe('createCouponAvailabilityCache', () => {
  it('ttl 안에서는 백엔드를 다시 부르지 않고, 지나면 새로 받은 값을 기다려 준다(만료 값을 내주지 않음)', async () => {
    const values = [A, B];
    const { cache, loadMock, advance } = setup(async () => values.shift()!);

    await expect(cache.get()).resolves.toEqual(A);
    advance(59_999);
    await expect(cache.get()).resolves.toEqual(A);
    expect(loadMock).toHaveBeenCalledTimes(1);

    advance(1);
    await expect(cache.get()).resolves.toEqual(B);
    expect(loadMock).toHaveBeenCalledTimes(2);
  });

  it('동시에 들어온 요청은 조회 하나를 공유한다', async () => {
    let resolve!: (value: typeof A) => void;
    const { cache, loadMock } = setup(() => new Promise((r) => (resolve = r)));
    const results = Promise.all([cache.get(), cache.get(), cache.get()]);
    await vi.waitFor(() => expect(loadMock).toHaveBeenCalled()); // load는 다음 마이크로태스크에서 불린다
    resolve(A);
    await expect(results).resolves.toEqual([A, A, A]);
    expect(loadMock).toHaveBeenCalledTimes(1);
  });

  it('실패하면 null을 failureTtl 동안 기억하고(백엔드를 두드리지 않음), 그 뒤 다시 시도한다', async () => {
    let fail = true;
    const { cache, loadMock, advance } = setup(async () => {
      if (fail) throw new Error('backend down');
      return A;
    });

    await expect(cache.get()).resolves.toBeNull();
    advance(14_999);
    await expect(cache.get()).resolves.toBeNull();
    expect(loadMock).toHaveBeenCalledTimes(1);

    fail = false;
    advance(1);
    await expect(cache.get()).resolves.toEqual(A);
    expect(loadMock).toHaveBeenCalledTimes(2);
  });

  it('동기 예외도 실패로 처리한다', async () => {
    const cache = createCouponAvailabilityCache({
      load: () => {
        throw new Error('sync');
      },
      ttlMs: 60_000,
      failureTtlMs: 15_000,
    });
    await expect(cache.get()).resolves.toBeNull();
  });
});

describe('loadCouponAvailabilityFromBackend', () => {
  it('Next 데이터 캐시 없이(no-store) 내부 키를 붙여 백엔드를 부르고 세 필드만 돌려준다', async () => {
    vi.stubEnv('MARKETING_INTERNAL_KEY', 'internal-secret');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ...A, extra: 1 }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadCouponAvailabilityFromBackend()).resolves.toEqual(A);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain('/marketing-site/coupon-availability');
    expect(init.cache).toBe('no-store');
    expect(init.headers['X-Marketing-Internal-Key']).toBe('internal-secret');
  });

  it('5xx·모양 틀림은 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('oops', { status: 502 })));
    await expect(loadCouponAvailabilityFromBackend()).rejects.toThrow();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ capacity: 1 }), { status: 200, headers: { 'content-type': 'application/json' } }),
      ),
    );
    await expect(loadCouponAvailabilityFromBackend()).rejects.toThrow(/unexpected response shape/);
  });
});
