import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './apiClient';
import { LEAD_SIGNUP_SOURCES, subscribeLead } from './api';
import { mapPublicFormError } from './publicForm';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
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

// 계약 C1(15차) — 리드 등록에 폼 위치(source)를 함께 보낸다. 백엔드 규칙 ^[a-z_]{1,32}$ 안의 값만.
describe('subscribeLead', () => {
  it('source를 본문에 함께 보낸다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ leadId: 'x' }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await subscribeLead({ email: 'a@example.com', language: 'en', consent: true, source: 'demo_result' });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain('/marketing-site/leads');
    expect(JSON.parse(init.body)).toMatchObject({ source: 'demo_result' });
  });

  it('폼 위치 이름은 백엔드가 받는 모양이다', () => {
    for (const source of LEAD_SIGNUP_SOURCES) expect(source).toMatch(/^[a-z_]{1,32}$/);
  });
});
