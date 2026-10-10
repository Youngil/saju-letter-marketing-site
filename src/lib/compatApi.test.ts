import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, isRetryableApiError } from './apiClient';
import { COMPAT_READING_RETRY_DELAYS_MS, getCompatInvite } from './compatApi';
import { getReading } from './lunarNewYearApi';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isRetryableApiError', () => {
  it('429·408·5xx만 다시 시도할 만한 실패로 본다', () => {
    expect(isRetryableApiError(new ApiError('x', 429))).toBe(true);
    expect(isRetryableApiError(new ApiError('x', 408))).toBe(true);
    expect(isRetryableApiError(new ApiError('x', 503))).toBe(true);
    expect(isRetryableApiError(new ApiError('x', 404))).toBe(false);
    expect(isRetryableApiError(new ApiError('x', 400))).toBe(false);
  });
});

// 2026-10-06 전체 점검 3차 — 예전엔 모든 ApiError를 "없음"으로 흡수해, 조회 한도(429)에 잠깐 걸린 멀쩡한
// 초대·결과가 "찾을 수 없음"으로 보였다.
describe('getCompatInvite — 404만 not_found, 일시 오류는 던진다', () => {
  it('404는 not_found 뷰', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { error: 'Invite not found' })));
    await expect(getCompatInvite('t', 'en')).resolves.toEqual({ status: 'not_found' });
  });

  it('429는 not_found로 바꾸지 않고 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(429, { error: 'Too many requests' })));
    await expect(getCompatInvite('t', 'en')).rejects.toBeInstanceOf(ApiError);
  });

  it('5xx도 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(500, { error: 'boom' })));
    await expect(getCompatInvite('t', 'en')).rejects.toMatchObject({ status: 500 });
  });

  it('정상 응답은 그대로', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { status: 'pending', requesterName: 'A' })));
    await expect(getCompatInvite('t', 'en')).resolves.toEqual({ status: 'pending', requesterName: 'A' });
  });
});

describe('getReading — 404만 null, 일시 오류는 던진다', () => {
  it('404는 null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { error: 'Reading not found' })));
    await expect(getReading('r1')).resolves.toBeNull();
  });

  it('429는 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(429, { error: 'Too many requests' })));
    await expect(getReading('r1')).rejects.toMatchObject({ status: 429 });
  });
});

describe('COMPAT_READING_RETRY_DELAYS_MS', () => {
  // 2026-10-10 전체 점검 14차 — reading: null이면 점점 늘린 간격으로 몇 번만 다시 묻고 "곧 도착해요"로 넘어간다(무한 대기 금지).
  it('점점 늘어나고 합이 1분을 넘지 않는다', () => {
    const delays = [...COMPAT_READING_RETRY_DELAYS_MS];
    expect(delays.length).toBeGreaterThanOrEqual(3);
    delays.slice(1).forEach((delay, i) => expect(delay).toBeGreaterThan(delays[i]!));
    expect(delays.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(60_000);
  });
});
