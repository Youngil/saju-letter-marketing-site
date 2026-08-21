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
  /** 만 16세 확인용 양력 생년월일 — 서버가 저장하지 않는다. */
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  turnstileToken?: string;
}

export interface DemoReadingResponse {
  teaser: string;
}

/** 미니 데모 — 사주 계산은 브라우저에서 하고, 만 16세 확인용 양력 년/월/일만 함께 보낸다(저장되지 않음). */
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
