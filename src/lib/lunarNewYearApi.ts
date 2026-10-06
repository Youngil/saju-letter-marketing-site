import { cache } from 'react';
import type { MarketingLanguage } from './languages';
import type { Pillar } from './saju';
import { ApiError, isRetryableApiError, request, sendBeaconJson } from './apiClient';
import { OWNER_TOKEN_HEADER, OWNER_TOKEN_ROUTE } from './readingOwner';

/**
 * saju-letter-newyear-campaign 이관분(2026-08-07) — 백엔드는 무변경이라 기존 `/newyear-campaign/*`
 * 라우트를 그대로 호출한다(meta 저장소 CLAUDE.md §9 참고). 이 파일은 그 저장소의 `src/lib/api.ts`를
 * 그대로 옮긴 것이고, 이 사이트 자체의 `api.ts`(마케팅 리드/데모용)와는 대상 라우트가 완전히
 * 달라 섞지 않았다 — 공용 fetch/에러 처리(`apiClient.ts`)만 공유한다.
 *
 * `language`는 `LaunchContentLanguage`(4)가 아니라 `MarketingLanguage`(6)다(2026-09-08 3차
 * 종합 버그 점검 항목 1) — 2026-09-07 커밋(`ff41953`)이 이 캠페인의 언어 집합을 원래의
 * `NON_KOREAN_LANGUAGES`(5, en/es/pt/ja/vi)에서 `LAUNCH_CONTENT_LANGUAGES`(4, ko/en/ja/es)로
 * 바꾸며 ko는 의도적으로 추가했지만 pt/vi를 실수로 함께 빠뜨려, 이미 발급된 pt/vi 결과·수신거부
 * 링크가 전부 깨졌다. ko 지원은 유지하고 pt/vi를 되살려 `MARKETING_LANGUAGES`(6) 전체로
 * 복원했다 — `src/dictionaries/pt.ts`/`vi.ts`에 `lunarNewYear` 콘텐츠가 이미 채워져 있다.
 */
export interface CampaignWindowStatus {
  active: boolean;
  startsAt?: { year: number; month: number; day: number };
  endsAt?: { year: number; month: number; day: number };
  lunarNewYear?: { year: number; month: number; day: number };
  nextStartsAt?: { year: number; month: number; day: number };
}

/** 서버 렌더용(2026-10-06) — 5분 캐시. 랜딩이 이 값으로 폼과 비시즌 화면을 서버에서 고른다. */
export function getCampaignWindow(): Promise<CampaignWindowStatus> {
  return request('/newyear-campaign/window', { next: { revalidate: 300 } });
}

export interface CreateReadingInput {
  name: string;
  language: MarketingLanguage;
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
  /** 만든 사람만 메일 구독을 할 수 있게 하는 비공개 토큰(2026-10-07) — 주소·GA에 절대 넣지 않는다(`readingOwner.ts`). */
  ownerToken?: string;
  /** false면 위기 신호로 대체된 결과라 메일 구독을 받지 않는다. */
  subscriptionAvailable?: boolean;
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
  language: MarketingLanguage;
  dayStem: string;
  content: ReadingContent;
  /**
   * 요청에 맞는 소유자 토큰이 있을 때만 true(2026-10-07) — 그때만 아래 두 값이 온다. 공유 링크로 연 사람은 false라 구독 폼도
   * 구독 상태도 보지 않는다(구 백엔드는 이 필드가 없다 → 공개 화면).
   */
  isOwner?: boolean;
  hasEmailSubscription?: boolean;
  subscriptionAvailable?: boolean;
}

/**
 * 404 같은 영구 실패만 null(없는 결과)로 보고, 429·5xx·시간 초과는 던진다(2026-10-06 전체 점검 3차) — compatApi.ts의
 * getCompatInvite와 같은 이유·같은 수정(예전엔 일시 오류도 404 화면이 됐다). 한 요청 안의 generateMetadata·
 * 페이지 호출은 `cache()`로 한 번에 묶는다.
 *
 * `visitorIp`(서버 전용, 2026-10-07 전체 점검 12차) — 내부 키와 함께 `X-Visitor-Ip`로 넘겨 백엔드가 방문자별로 센다
 * (`compatApi.ts::getCompatInvite`와 같은 계약).
 */
export const getReading = cache(async (id: string, ownerToken?: string, visitorIp?: string): Promise<ReadingView | null> => {
  try {
    // id는 주소에서 온 값이라 인코딩한다 — `..` 같은 값으로 다른 백엔드 경로를 부르지 못하게(2026-10-06).
    // 소유자 토큰은 만든 사람 브라우저의 httpOnly 쿠키에서만 온다(서버 렌더 전용, 2026-10-07).
    return await request<ReadingView>(`/newyear-campaign/readings/${encodeURIComponent(id)}`, {
      visitorIp,
      ...(ownerToken ? { headers: { [OWNER_TOKEN_HEADER]: ownerToken } } : {}),
    });
  } catch (error) {
    if (error instanceof ApiError && !isRetryableApiError(error)) return null;
    throw error;
  }
});

export interface SubscribeInput {
  readingId: string;
  /** 결과를 만든 사람의 비공개 토큰 — 없거나 틀리면 403 `not_reading_owner`(2026-10-07). */
  ownerToken: string;
  email: string;
  consent: boolean;
  turnstileToken?: string;
}

export function subscribeForDrip(input: SubscribeInput): Promise<{ subscriptionId: string }> {
  return request('/newyear-campaign/subscriptions', { method: 'POST', body: JSON.stringify(input) });
}

/**
 * 결과를 만든 브라우저에 소유자 토큰을 httpOnly 쿠키로 남긴다(2026-10-07, `readingOwner.ts`) — 이 사이트 자체 라우트를
 * 부른다(백엔드 아님). 실패해도 결과 화면으로는 넘어가야 하므로 던지지 않고 성공 여부만 돌려준다(한 번 다시 시도).
 */
export async function rememberReadingOwner(readingId: string, ownerToken: string): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(OWNER_TOKEN_ROUTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId, ownerToken }),
        credentials: 'same-origin',
        signal: AbortSignal.timeout(10_000),
      });
      if (response.ok) return true;
      // 4xx는 다시 보내도 같다.
      if (response.status < 500) break;
    } catch (error) {
      console.warn('rememberReadingOwner failed', error);
    }
  }
  return false;
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
  sendBeaconJson('/newyear-campaign/events', { type, ...params });
}
