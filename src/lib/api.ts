import type { MarketingLanguage } from './languages';
import type { Pillar } from './saju';
import { request } from './apiClient';

export { ApiError } from './apiClient';

export interface DemoReadingInput {
  language: MarketingLanguage;
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
  language: MarketingLanguage;
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

/** 30일 체험 쿠폰 잔여 인원 — 리드 캡처 폼이 "OO명 남음" 문구를 보여줄 때 조회한다. */
export function getCouponAvailability(): Promise<CouponAvailability> {
  return request('/marketing-site/coupon-availability');
}
