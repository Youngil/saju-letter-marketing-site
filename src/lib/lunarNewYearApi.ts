import type { NonKoreanLanguage } from './languages';
import type { Pillar } from './saju';
import { ApiError, request } from './apiClient';

/**
 * saju-letter-newyear-campaign 이관분(2026-08-07) — 백엔드는 무변경이라 기존 `/newyear-campaign/*`
 * 라우트를 그대로 호출한다(meta 저장소 CLAUDE.md §9 참고). 이 파일은 그 저장소의 `src/lib/api.ts`를
 * 그대로 옮긴 것이고, 이 사이트 자체의 `api.ts`(마케팅 리드/데모용)와는 대상 라우트가 완전히
 * 달라 섞지 않았다 — 공용 fetch/에러 처리(`apiClient.ts`)만 공유한다.
 */
export interface CampaignWindowStatus {
  active: boolean;
  startsAt?: { year: number; month: number; day: number };
  endsAt?: { year: number; month: number; day: number };
  lunarNewYear?: { year: number; month: number; day: number };
  nextStartsAt?: { year: number; month: number; day: number };
}

export function getCampaignWindow(): Promise<CampaignWindowStatus> {
  return request('/newyear-campaign/window');
}

export interface CreateReadingInput {
  name: string;
  language: NonKoreanLanguage;
  yearPillar?: Pillar;
  monthPillar?: Pillar;
  dayPillar: Pillar;
  hourPillar?: Pillar | null;
  memorableEvent: string;
  ageConfirmed: boolean;
  /** 만 16세 확인용 양력 생년월일 — 서버가 저장하지 않는다. 체크박스만으로는 부족하다. */
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  turnstileToken?: string;
}

export interface ReadingContent {
  title: string;
  greeting: string;
  overview: string;
  highlight: string;
  closing: string;
}

export interface CreateReadingResponse {
  readingId: string;
  content: ReadingContent;
}

export function createReading(input: CreateReadingInput): Promise<CreateReadingResponse> {
  return request('/newyear-campaign/readings', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      language: input.language,
      yearStem: input.yearPillar?.stem,
      yearBranch: input.yearPillar?.branch,
      monthStem: input.monthPillar?.stem,
      monthBranch: input.monthPillar?.branch,
      dayStem: input.dayPillar.stem,
      dayBranch: input.dayPillar.branch,
      hourStem: input.hourPillar?.stem,
      hourBranch: input.hourPillar?.branch,
      memorableEvent: input.memorableEvent,
      ageConfirmed: input.ageConfirmed,
      birthYear: input.birthYear,
      birthMonth: input.birthMonth,
      birthDay: input.birthDay,
      turnstileToken: input.turnstileToken,
    }),
  });
}

export interface ReadingView {
  id: string;
  name: string;
  language: NonKoreanLanguage;
  dayStem: string;
  content: ReadingContent;
  hasEmailSubscription: boolean;
}

/**
 * 404뿐 아니라 어떤 ApiError든(429 rate-limit, 5xx 등) null로 흡수한다(2026-08-17) —
 * compatApi.ts의 getCompatInvite와 같은 이유·같은 수정. 이 함수도 generateMetadata/
 * opengraph-image.tsx/페이지 컴포넌트 세 곳에서 서버사이드로 호출된다.
 */
export async function getReading(id: string): Promise<ReadingView | null> {
  try {
    return await request<ReadingView>(`/newyear-campaign/readings/${id}`);
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}

export interface SubscribeInput {
  readingId: string;
  email: string;
  consent: boolean;
}

export function subscribeForDrip(input: SubscribeInput): Promise<{ subscriptionId: string }> {
  return request('/newyear-campaign/subscriptions', { method: 'POST', body: JSON.stringify(input) });
}

export function unsubscribeFromCampaign(token: string): Promise<{ status: string }> {
  return request('/newyear-campaign/unsubscribe', { method: 'POST', body: JSON.stringify({ token }) });
}

/**
 * 퍼널 전환 추적 — 결과 조회 / 드립 마지막날 CTA 클릭처럼 클라이언트에서만 관측 가능한
 * 이벤트를 기록한다(결과 생성/이메일 등록은 각 API 라우트가 서버 쪽에서 이미 직접 기록).
 * 실패해도 사용자 경험을 막지 않도록 항상 조용히 무시한다.
 */
export function logCampaignEvent(
  type: string,
  params: { readingId?: string; subscriptionId?: string; metadata?: Record<string, unknown> } = {},
): void {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  fetch(`${API_BASE_URL}/newyear-campaign/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...params }),
    keepalive: true,
  }).catch((error) => {
    console.warn('logCampaignEvent failed', error);
  });
}
