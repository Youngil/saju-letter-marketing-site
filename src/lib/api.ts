import type { MarketingLanguage } from './languages';
import type { Pillar } from './saju';
import { request } from './apiClient';

export { ApiError } from './apiClient';

export interface DemoReadingInput {
  language: MarketingLanguage;
  yearPillar?: Pillar;
  monthPillar?: Pillar;
  dayPillar: Pillar;
  hourPillar?: Pillar | null;
  turnstileToken?: string;
}

export interface DemoReadingResponse {
  teaser: string;
}

/** 미니 데모 — 원본 생년월일은 절대 보내지 않고 계산된 천간/지지만 전송한다(src/lib/saju.ts 참고). */
export function getDemoReading(input: DemoReadingInput): Promise<DemoReadingResponse> {
  return request('/marketing-site/demo-readings', {
    method: 'POST',
    body: JSON.stringify({
      language: input.language,
      yearStem: input.yearPillar?.stem,
      yearBranch: input.yearPillar?.branch,
      monthStem: input.monthPillar?.stem,
      monthBranch: input.monthPillar?.branch,
      dayStem: input.dayPillar.stem,
      dayBranch: input.dayPillar.branch,
      hourStem: input.hourPillar?.stem,
      hourBranch: input.hourPillar?.branch,
      turnstileToken: input.turnstileToken,
    }),
  });
}

export interface SubscribeLeadInput {
  email: string;
  language: MarketingLanguage;
  consent: boolean;
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
