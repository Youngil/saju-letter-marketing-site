import type { MarketingLanguage } from './languages';
import type { HeavenlyStem } from './sajuVocabulary';
import { ApiError, request } from './apiClient';

/**
 * 궁합 공유 웹페이지(2026-08-12, saju-letter-backend/public/compat.js에서 이관)가 호출하는
 * saju-letter-backend의 공개 API 3개 — compatibilityPublicRouter는 이 이관 후에도 백엔드에
 * 그대로 남아있고(HTML/OG 렌더링 계층만 옮겨왔다), 이 파일은 lunarNewYearApi.ts와 같은 얇은
 * 래퍼 패턴을 그대로 따른다.
 */

export type CompatReading = { title: string; body: string };

export type InviteView =
  | { status: 'not_found' }
  | { status: 'expired' }
  | { status: 'pending' }
  | { status: 'completed'; guestName: string | null; reading: CompatReading | null };

/** 404를 예외로 던지는 대신 not_found 뷰로 흡수한다 — lunarNewYearApi.ts의 getReading과 같은 패턴. */
export async function getCompatInvite(token: string, language: MarketingLanguage): Promise<InviteView> {
  try {
    return await request<InviteView>(`/compatibility-invites/${encodeURIComponent(token)}?language=${encodeURIComponent(language)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return { status: 'not_found' };
    throw error;
  }
}

export interface SubmitGuestInviteInput {
  name: string;
  dayMaster: HeavenlyStem;
  language: MarketingLanguage;
}

export type SubmitGuestInviteResult =
  | { status: 'ok'; guestName: string | null; reading: CompatReading | null }
  | { status: 'expired' }
  | { status: 'not_found' };

/**
 * 초대가 로드된 시점과 제출 시점 사이에 만료되거나(410) 삭제될(404) 수 있으므로 — 옛
 * compat.js가 두 상태 코드를 각각 별도 메시지로 처리했던 것과 동일하게, 예외가 아니라
 * 판별 유니언으로 흡수한다.
 */
export async function submitGuestInvite(token: string, input: SubmitGuestInviteInput): Promise<SubmitGuestInviteResult> {
  try {
    const result = await request<{ status: 'ok'; guestName: string | null; reading: CompatReading | null }>(
      `/compatibility-invites/${encodeURIComponent(token)}/submit`,
      { method: 'POST', body: JSON.stringify(input) },
    );
    return result;
  } catch (error) {
    if (error instanceof ApiError && error.status === 410) return { status: 'expired' };
    if (error instanceof ApiError && error.status === 404) return { status: 'not_found' };
    throw error;
  }
}

/**
 * 퍼널 전환 추적(결과 조회/설치 CTA 클릭) — lunarNewYearApi.ts의 logCampaignEvent와 같은
 * fire-and-forget 패턴(request()의 throw 동작을 쓰지 않고 keepalive raw fetch, 실패는 조용히
 * 무시). 실패해도 게스트 UX를 절대 막지 않는다.
 */
export function logCompatEvent(token: string, type: 'result_viewed' | 'install_cta_clicked', actor: 'guest'): void {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  fetch(`${API_BASE_URL}/compatibility-invites/${encodeURIComponent(token)}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, actor }),
    keepalive: true,
  }).catch((error) => {
    console.warn('logCompatEvent failed', error);
  });
}
