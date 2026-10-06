import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 라우트 모듈에 인스턴스 메모리 캐시가 있으므로 테스트마다 모듈을 새로 불러온다.
async function loadRoute() {
  vi.resetModules();
  return import('./route');
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GET /api/coupon-availability', () => {
  it('백엔드 값을 세 필드로 돌려주고 공유 캐시 60초를 단다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ capacity: 100, issued: 70, remaining: 30, secret: 'x' }));
    vi.stubGlobal('fetch', fetchMock);
    const { GET } = await loadRoute();

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ capacity: 100, issued: 70, remaining: 30 });
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=60');
  });

  it('60초 안의 요청은 백엔드를 다시 부르지 않는다', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse({ capacity: 100, issued: 1, remaining: 99 }));
    vi.stubGlobal('fetch', fetchMock);
    const { GET } = await loadRoute();

    await GET();
    await GET();
    await GET();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('백엔드 실패·모양 틀림은 503 + no-store(폼은 초기값 유지)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('oops', { status: 500 })));
    let { GET } = await loadRoute();
    let response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    ({ GET } = await loadRoute());
    expect((await GET()).status).toBe(503);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ remaining: 'lots' })));
    ({ GET } = await loadRoute());
    response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'unavailable' });
  });

  it('매 요청 실행된다(빌드 때 정적으로 굳지 않게)', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const route = await loadRoute();
    expect(route.dynamic).toBe('force-dynamic');
  });
});
