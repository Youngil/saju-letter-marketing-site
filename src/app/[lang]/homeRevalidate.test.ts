import { describe, expect, it, vi } from 'vitest';
import { COUPON_AVAILABILITY_REVALIDATE_SECONDS } from '@/lib/api';

// import만 — 페이지를 그리지 않으므로 백엔드·MDX 로더가 필요 없게 글 조회 모듈을 막아 둔다.
vi.mock('@/lib/posts', () => ({
  getLatestPostSummary: vi.fn().mockResolvedValue(null),
}));

/**
 * 2026-10-06 전체 점검 10차 — 홈 안의 fetch 중 가장 짧은 `revalidate`가 홈 라우트 전체의 재검증 주기가 된다. 쿠폰 현황
 * 초기값 fetch가 홈 ISR보다 짧으면(9차의 120초) 홈 전체가 그 주기로 다시 그려진다 — 숫자의 신선도는 리드 폼이
 * `/api/coupon-availability`로 맞추므로, 초기값 주기는 홈 ISR보다 짧으면 안 된다.
 */
describe('홈 ISR 주기', () => {
  it('쿠폰 현황 초기값 fetch가 홈 재검증 주기를 더 짧게 내리지 않는다', async () => {
    const { revalidate } = await import('./page');
    expect(revalidate).toBe(3600);
    expect(COUPON_AVAILABILITY_REVALIDATE_SECONDS).toBeGreaterThanOrEqual(revalidate);
  }, 20_000);
});
