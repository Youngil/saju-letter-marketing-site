import type { LaunchContentLanguage } from './languages';
import type { Pillar } from './saju';
import { request } from './apiClient';

export { ApiError } from './apiClient';

export interface DemoReadingInput {
  language: LaunchContentLanguage;
  dayPillar: Pillar;
  /** 방문자 브라우저의 IANA 타임존 — "오늘의 일진"이 실제 무료 편지와 같도록 서버가 이 타임존
   * 기준 로컬 캘린더 날짜로 계산한다(2026-08-22, meta CLAUDE.md §4와 동일 원칙). */
  timezone: string;
  /** 만 16세 확인용 양력 생년월일 — 서버가 저장하지 않는다. */
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  turnstileToken?: string;
}

/**
 * 실제 무료 티어 편지(saju-letter-backend의 truncateForFreeTier)와 정확히 같은 3필드
 * (2026-08-22 개편 — "가입하면 이런 걸 매일 받는다"를 정확히 보여주기 위해 한 줄 티저에서 변경).
 */
export interface DemoReadingResponse {
  hook: string;
  interpretation: string;
  closing: string;
}

/** 미니 데모 — 사주 계산은 브라우저에서 하고, 만 16세 확인용 양력 년/월/일만 함께 보낸다(저장되지 않음). */
export function getDemoReading(input: DemoReadingInput): Promise<DemoReadingResponse> {
  return request('/marketing-site/demo-readings', {
    method: 'POST',
    body: JSON.stringify({
      language: input.language,
      dayStem: input.dayPillar.stem,
      dayBranch: input.dayPillar.branch,
      timezone: input.timezone,
      birthYear: input.birthYear,
      birthMonth: input.birthMonth,
      birthDay: input.birthDay,
      turnstileToken: input.turnstileToken,
    }),
  });
}

export interface SubscribeLeadInput {
  email: string;
  language: LaunchContentLanguage;
  consent: boolean;
  turnstileToken?: string;
}

export function subscribeLead(input: SubscribeLeadInput): Promise<{ leadId: string }> {
  return request('/marketing-site/leads', { method: 'POST', body: JSON.stringify(input) });
}

export function unsubscribeLead(token: string): Promise<{ status: string }> {
  return request('/marketing-site/unsubscribe', { method: 'POST', body: JSON.stringify({ token }) });
}

export interface CouponAvailability {
  capacity: number | null;
  issued: number;
  remaining: number | null;
}

/**
 * 홈이 처음 그릴 때 넣는 쿠폰 현황(초기 prop)의 재검증 주기(초) — 홈 라우트 ISR(3600)과 같게 둔다(2026-10-06 전체 점검
 * 10차). Next는 라우트 안 fetch 중 가장 짧은 `revalidate`를 라우트 전체에 쓰므로, 9차처럼 120초로 두면 홈 전체가 2분마다
 * 다시 그려졌다. 이제 숫자의 신선도는 리드 폼이 마운트 때 같은 사이트 `/api/coupon-availability`(60초 캐시)로 다시 받아
 * 맞춘다 — 초기 prop은 JS 전·조회 실패 때 보여 줄 값일 뿐이다.
 */
export const COUPON_AVAILABILITY_REVALIDATE_SECONDS = 3600;

/** 같은 사이트 Route Handler 경로 — 브라우저는 백엔드가 아니라 이 주소를 부른다(백엔드 공개 IP 한도를 쓰지 않게). */
export const COUPON_AVAILABILITY_ROUTE_PATH = '/api/coupon-availability';

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * 쿠폰 현황 응답 모양 검사 — 백엔드 응답(Route Handler)과 Route Handler 응답(브라우저) 양쪽에 쓴다. 세 필드만 골라
 * 새 객체로 돌려주고(다른 필드는 흘리지 않는다), 모양이 틀리면 null.
 */
export function parseCouponAvailability(body: unknown): CouponAvailability | null {
  if (!body || typeof body !== 'object') return null;
  const { capacity, issued, remaining } = body as Record<string, unknown>;
  if (!isCount(issued)) return null;
  if (capacity !== null && !isCount(capacity)) return null;
  if (remaining !== null && !isCount(remaining)) return null;
  return { capacity, issued, remaining };
}

/**
 * 30일 체험 쿠폰 현황 — 홈 서버 컴포넌트가 리드 캡처 폼의 **초기값**으로 조회한다(2026-10-06 전체 점검 9차 → 10차). Next
 * 데이터 캐시로 `COUPON_AVAILABILITY_REVALIDATE_SECONDS`마다 한 번(서버 요청이라 내부 키 헤더도 붙는다). 실패하면 null —
 * 폼은 문구 없이 그대로 쓸 수 있어야 한다.
 */
export async function loadCouponAvailability(): Promise<CouponAvailability | null> {
  try {
    const body = await request<unknown>('/marketing-site/coupon-availability', {
      next: { revalidate: COUPON_AVAILABILITY_REVALIDATE_SECONDS },
    });
    return parseCouponAvailability(body);
  } catch (error) {
    console.warn('loadCouponAvailability failed', error);
    return null;
  }
}

/**
 * 브라우저에서 최신 쿠폰 현황 받기(2026-10-06 전체 점검 10차) — 리드 폼이 마운트될 때 부른다. ISR HTML(최대 1시간,
 * 콜드 스타트 인스턴스면 빌드 때 값)에 박힌 숫자를 바로잡는다. 같은 사이트 Route Handler가 60초 캐시로 백엔드를 대신
 * 불러 주므로 방문마다 백엔드를 치지 않는다. 실패(503·네트워크·중단·모양 틀림)는 null — 호출부는 초기값을 그대로 둔다.
 */
export async function fetchFreshCouponAvailability(signal?: AbortSignal): Promise<CouponAvailability | null> {
  try {
    const response = await fetch(COUPON_AVAILABILITY_ROUTE_PATH, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    return parseCouponAvailability(await response.json());
  } catch {
    return null;
  }
}
