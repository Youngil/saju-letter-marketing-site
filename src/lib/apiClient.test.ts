import { afterEach, describe, expect, it, vi } from 'vitest';
import { INTERNAL_KEY_HEADER, request } from './apiClient';
import { VISITOR_IP_HEADER } from './visitorIp';

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

describe('request — 방문자 IP(X-Visitor-Ip, 2026-10-07 전체 점검 12차)', () => {
  it('서버에서 내부 키를 보낼 때 넘겨받은 방문자 IP를 함께 보내고, fetch 옵션엔 섞지 않는다', async () => {
    vi.stubEnv('MARKETING_INTERNAL_KEY', 'secret-value');
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await request('/compatibility-invites/x', { visitorIp: '203.0.113.9' });

    expect(sentHeaders(fetchMock)[INTERNAL_KEY_HEADER]).toBe('secret-value');
    expect(sentHeaders(fetchMock)[VISITOR_IP_HEADER]).toBe('203.0.113.9');
    expect(fetchMock.mock.calls[0]![1]).not.toHaveProperty('visitorIp');
  });

  it('내부 키가 없으면 방문자 IP도 보내지 않는다(백엔드가 믿을 근거가 없다)', async () => {
    vi.stubEnv('MARKETING_INTERNAL_KEY', '');
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await request('/compatibility-invites/x', { visitorIp: '203.0.113.9' });

    expect(sentHeaders(fetchMock)).not.toHaveProperty(VISITOR_IP_HEADER);
  });

  it('없거나 IP 모양이 아니면 내부 키만 보낸다', async () => {
    vi.stubEnv('MARKETING_INTERNAL_KEY', 'secret-value');
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await request('/compatibility-invites/x');
    await request('/compatibility-invites/x', { visitorIp: 'not-an-ip' });

    for (const call of fetchMock.mock.calls) {
      const headers = call[1].headers as Record<string, string>;
      expect(headers[INTERNAL_KEY_HEADER]).toBe('secret-value');
      expect(headers).not.toHaveProperty(VISITOR_IP_HEADER);
    }
  });

  it('브라우저에선 방문자 IP를 넘겨도 보내지 않는다', async () => {
    vi.stubEnv('MARKETING_INTERNAL_KEY', 'secret-value');
    vi.stubGlobal('window', {});
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await request('/compatibility-invites/x', { visitorIp: '203.0.113.9' });

    expect(sentHeaders(fetchMock)).not.toHaveProperty(VISITOR_IP_HEADER);
  });
});
