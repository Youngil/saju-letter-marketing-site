import { afterEach, describe, expect, it, vi } from 'vitest';
import { INTERNAL_KEY_HEADER, request } from './apiClient';

function okResponse(): Response {
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
}

function sentHeaders(fetchMock: ReturnType<typeof vi.fn>): Record<string, string> {
  return fetchMock.mock.calls[0]![1].headers as Record<string, string>;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('request — 서버 내부 호출 키(X-Marketing-Internal-Key)', () => {
  it('서버에서 키가 있으면 헤더를 붙인다', async () => {
    vi.stubEnv('MARKETING_INTERNAL_KEY', 'secret-value');
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await request('/marketing-site/service-languages');

    expect(sentHeaders(fetchMock)[INTERNAL_KEY_HEADER]).toBe('secret-value');
  });

  it('키가 없거나 비어 있으면 붙이지 않는다', async () => {
    vi.stubEnv('MARKETING_INTERNAL_KEY', '  ');
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await request('/marketing-site/service-languages');

    expect(sentHeaders(fetchMock)).not.toHaveProperty(INTERNAL_KEY_HEADER);
  });

  it('브라우저(window 있음)에선 키가 있어도 절대 붙이지 않는다', async () => {
    vi.stubEnv('MARKETING_INTERNAL_KEY', 'secret-value');
    vi.stubGlobal('window', {});
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await request('/marketing-site/compat/abc', { method: 'POST', body: '{}' });

    expect(sentHeaders(fetchMock)).not.toHaveProperty(INTERNAL_KEY_HEADER);
    expect(sentHeaders(fetchMock)['Content-Type']).toBe('application/json');
  });
});
