import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const READING_ID = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
const OWNER_TOKEN = 'b3duZXItdG9rZW4tZXhhbXBsZS12YWx1ZQ';

function post(body: unknown, headers: Record<string, string> = { 'content-type': 'application/json' }) {
  return POST(
    new NextRequest('https://www.saju-letter.com/api/lunar-new-year/owner-token', {
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );
}

describe('POST /api/lunar-new-year/owner-token', () => {
  it('맞는 모양이면 결과별 httpOnly 쿠키를 심는다', async () => {
    const response = await post({ readingId: READING_ID, ownerToken: OWNER_TOKEN });
    expect(response.status).toBe(204);
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`nyo_${READING_ID}=${OWNER_TOKEN}`);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Max-Age=7776000/);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('id·토큰 모양이 틀리면 400, 쿠키 없음', async () => {
    const response = await post({ readingId: '../x', ownerToken: OWNER_TOKEN });
    expect(response.status).toBe(400);
    expect(response.headers.get('set-cookie')).toBeNull();
    expect((await post({ readingId: READING_ID, ownerToken: 'x' })).status).toBe(400);
    expect((await post('not json')).status).toBe(400);
  });

  it('JSON이 아닌 본문(다른 사이트의 form 제출)과 cross-site 요청은 거절한다', async () => {
    const form = await post(`readingId=${READING_ID}&ownerToken=${OWNER_TOKEN}`, {
      'content-type': 'application/x-www-form-urlencoded',
    });
    expect(form.status).toBe(415);
    const crossSite = await post(
      { readingId: READING_ID, ownerToken: OWNER_TOKEN },
      { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
    );
    expect(crossSite.status).toBe(403);
    expect(crossSite.headers.get('set-cookie')).toBeNull();
  });
});
