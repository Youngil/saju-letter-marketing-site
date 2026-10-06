import { NextResponse } from 'next/server';
import {
  COUPON_AVAILABILITY_ROUTE_FAILURE_TTL_SECONDS,
  COUPON_AVAILABILITY_ROUTE_TTL_SECONDS,
  createCouponAvailabilityCache,
  loadCouponAvailabilityFromBackend,
} from '@/lib/couponAvailabilityCache';

/**
 * 30일 체험 쿠폰 현황 — 리드 폼이 마운트될 때 브라우저가 부르는 같은 사이트 라우트(2026-10-06 전체 점검 10차). 홈 HTML은
 * ISR(3600초)이고 콜드 스타트 인스턴스는 빌드 때 그린 값을 내줄 수 있어, 그 숫자를 폼이 이 라우트로 바로잡는다.
 *
 * 브라우저가 백엔드를 직접 부르지 않는다 — 백엔드의 공개 IP 한도(리드 제출과 같은 버킷)를 방문마다 쓰지 않게, 이 서버가
 * 내부 키를 붙여 인스턴스당 60초에 한 번만 부른다. 실패면 503(`no-store`) — 폼은 서버가 넣어 준 초기값을 그대로 둔다.
 *
 * 매 요청 실행(빌드 때 정적으로 굳으면 백엔드 없는 빌드의 503이 박힌다) — 캐시는 아래 메모리 캐시와 `s-maxage`가 맡는다.
 */
export const dynamic = 'force-dynamic';

const cache = createCouponAvailabilityCache({
  load: loadCouponAvailabilityFromBackend,
  ttlMs: COUPON_AVAILABILITY_ROUTE_TTL_SECONDS * 1000,
  failureTtlMs: COUPON_AVAILABILITY_ROUTE_FAILURE_TTL_SECONDS * 1000,
  onError: (error) => console.warn('coupon-availability route: backend fetch failed', error),
});

export async function GET() {
  const availability = await cache.get();
  if (!availability) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json(availability, {
    headers: { 'Cache-Control': `public, s-maxage=${COUPON_AVAILABILITY_ROUTE_TTL_SECONDS}` },
  });
}
