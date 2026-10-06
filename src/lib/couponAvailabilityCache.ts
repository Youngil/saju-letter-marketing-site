import { parseCouponAvailability, type CouponAvailability } from './api';
import { request } from './apiClient';

/**
 * `/api/coupon-availability` Route Handler의 인스턴스 메모리 캐시(2026-10-06 전체 점검 10차). 리드 폼이 마운트될 때마다
 * 이 라우트를 부르므로, 백엔드는 인스턴스마다 `ttlMs`에 한 번만 불린다.
 *
 * `staleWhileRevalidate.ts`와 달리 **만료된 값을 내주지 않는다** — 이 라우트의 존재 이유가 ISR HTML에 박힌 오래된 숫자를
 * 바로잡는 것이라, 한동안 조용하던 인스턴스가 한참 전 값을 돌려주면 의미가 없다. 만료되면 그 요청이 새 조회를 기다린다
 * (동시에 들어온 요청은 공유 promise 하나로). 실패하면 null을 `failureTtlMs` 동안 기억해 — 백엔드가 멈춘 동안 방문마다
 * 시간 제한(10초)까지 기다리며 백엔드를 두드리지 않게 — 라우트가 503을 주고, 폼은 초기값을 그대로 둔다.
 */
export interface CouponAvailabilityCacheOptions {
  load: () => Promise<CouponAvailability>;
  ttlMs: number;
  failureTtlMs: number;
  onError?: (error: unknown) => void;
  now?: () => number;
}

export interface CouponAvailabilityCache {
  get(): Promise<CouponAvailability | null>;
}

export function createCouponAvailabilityCache(options: CouponAvailabilityCacheOptions): CouponAvailabilityCache {
  const now = options.now ?? Date.now;
  let entry: { value: CouponAvailability | null; until: number } | null = null;
  let inFlight: Promise<CouponAvailability | null> | null = null;

  return {
    get() {
      if (entry && now() < entry.until) return Promise.resolve(entry.value);
      // 동기 예외도 같은 실패 경로로(Promise.resolve().then 안에서 부른다).
      inFlight ??= Promise.resolve()
        .then(() => options.load())
        .then(
          (value) => {
            entry = { value, until: now() + options.ttlMs };
            return value;
          },
          (error: unknown) => {
            options.onError?.(error);
            entry = { value: null, until: now() + options.failureTtlMs };
            return null;
          },
        )
        .finally(() => {
          inFlight = null;
        });
      return inFlight;
    },
  };
}

/** 라우트 캐시 신선도(초) — 메모리 캐시와 응답의 `s-maxage`에 같은 값을 쓴다. */
export const COUPON_AVAILABILITY_ROUTE_TTL_SECONDS = 60;
/** 백엔드 조회 실패를 기억하는 시간(초) — 이 동안은 백엔드를 다시 부르지 않고 503. */
export const COUPON_AVAILABILITY_ROUTE_FAILURE_TTL_SECONDS = 15;

/**
 * 백엔드에서 쿠폰 현황을 바로 받는다(Route Handler 전용, 서버에서만 — `request()`가 내부 키 헤더를 붙인다). 캐시는 위 메모리
 * 캐시가 맡으므로 Next 데이터 캐시는 쓰지 않는다(`no-store`). 실패·모양 틀림은 던진다.
 */
export async function loadCouponAvailabilityFromBackend(): Promise<CouponAvailability> {
  const body = await request<unknown>('/marketing-site/coupon-availability', { cache: 'no-store' });
  const parsed = parseCouponAvailability(body);
  if (!parsed) throw new Error('coupon-availability: unexpected response shape');
  return parsed;
}
