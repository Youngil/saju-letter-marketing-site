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

/**
 * 리드 폼이 놓인 곳(2026-10-11 전체 점검 15차, 계약 C1) — 백엔드가 새 등록 때만 `marketing_site_email_leads.signup_source`에
 * 저장한다(재등록·이미 등록은 기존 값 유지). 데모 결과 아래 폼(아이폰·데스크톱 방문자, iOS 출시 알림 약속)과 홈 하단 폼을
 * 나눠 보려고. 백엔드 규칙은 `^[a-z_]{1,32}$`이고 그 밖의 값은 무시하므로 새 위치를 만들면 그 모양으로 이름을 짓는다.
 */
export const LEAD_SIGNUP_SOURCES = ['home', 'demo_result'] as const;
export type LeadSignupSource = (typeof LEAD_SIGNUP_SOURCES)[number];

export interface SubscribeLeadInput {
  email: string;
  language: LaunchContentLanguage;
  consent: boolean;
  turnstileToken?: string;
  /** 폼 위치 — GA `lead_submit`의 `context`와 같은 값(식별 값 아님). */
  source?: LeadSignupSource;
}

export function subscribeLead(input: SubscribeLeadInput): Promise<{ leadId: string }> {
  return request('/marketing-site/leads', { method: 'POST', body: JSON.stringify(input) });
}

export function unsubscribeLead(token: string): Promise<{ status: string }> {
  return request('/marketing-site/unsubscribe', { method: 'POST', body: JSON.stringify({ token }) });
}

