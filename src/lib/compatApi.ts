import type { MarketingLanguage } from './languages';
import type { EarthlyBranch, HeavenlyStem } from './sajuVocabulary';
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
  | {
      status: 'completed';
      guestName: string | null;
      /** 초대를 보낸 회원의 실제 이름(2026-09-02) — 이 사이트는 항상 게스트(링크를 받은
       *  친구)만 이 화면을 보므로, 화면 상단 "OOO님과의 궁합"은 항상 이 값을 써야 한다.
       *  `guestName`(친구 본인이 방금 이 화면에 입력한 이름)을 그 자리에 쓰면 "내 이름과의
       *  궁합"처럼 보이는 버그가 났었다 — saju-letter-backend/CLAUDE.md 참고. */
      requesterName: string | null;
      reading: CompatReading | null;
    };

/**
 * 404뿐 아니라 어떤 ApiError든(429 rate-limit, 5xx 등) not_found 뷰로 흡수한다(2026-08-17) —
 * lunarNewYearApi.ts의 getReading과 같은 패턴. 이 함수는 generateMetadata/opengraph-image.tsx/
 * 페이지 컴포넌트 세 곳 모두에서 서버사이드로 호출되므로, 여기서 흡수하지 않으면 일시적인
 * 429/5xx 하나가 SSR 렌더/메타데이터/OG 이미지 생성 전체를 그대로 크래시시킨다 — "초대를 못
 * 찾음"으로 보이는 게 흰 화면보다 낫다는 판단(진짜 원인은 새로고침하면 대부분 사라지는 일시적
 * 상태이므로, 완전히 잘못된 안내는 아니다).
 */
export async function getCompatInvite(token: string, language: MarketingLanguage): Promise<InviteView> {
  try {
    return await request<InviteView>(`/compatibility-invites/${encodeURIComponent(token)}?language=${encodeURIComponent(language)}`);
  } catch (error) {
    if (error instanceof ApiError) return { status: 'not_found' };
    throw error;
  }
}

export interface SubmitGuestInviteInput {
  name: string;
  dayMaster: HeavenlyStem;
  language: MarketingLanguage;
  /**
   * 억부 엔진 연동 3단계(2026-08-16) — 브라우저가 이미 계산해둔 연주/월주/일지를 함께 보내면
   * 백엔드가 이 값들로 친구 쪽 강약(强弱)을 직접 계산해 반영한다(새 입력 필드 아님, 계산된
   * 값을 더 많이 전송하는 것뿐 — saju-letter-backend/CLAUDE.md §2 참고). 넷 다 있어야
   * 계산되므로 전부 optional.
   */
  yearStem?: HeavenlyStem;
  yearBranch?: EarthlyBranch;
  monthStem?: HeavenlyStem;
  monthBranch?: EarthlyBranch;
  dayBranch?: EarthlyBranch;
  /** 만 16세 확인용 양력 생년월일 — 서버가 저장하지 않는다. */
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  /**
   * 2026-08-21, "리드 캡처·궁합 제출에 Turnstile이 없음" 감사 대응 — 이 웹 폼은 항상 채워
   * 보낸다. 백엔드는 토큰이 아예 없을 때만(모바일 앱의 딥링크 화면, Cloudflare 위젯을 못 쓰는
   * 경로) 검증을 건너뛰므로 optional로 둔다.
   */
  turnstileToken?: string;
}

export type SubmitGuestInviteResult =
  | { status: 'ok'; guestName: string | null; requesterName: string | null; reading: CompatReading | null }
  | { status: 'expired' }
  | { status: 'not_found' };

/**
 * 초대가 로드된 시점과 제출 시점 사이에 만료되거나(410) 삭제될(404) 수 있으므로 — 옛
 * compat.js가 두 상태 코드를 각각 별도 메시지로 처리했던 것과 동일하게, 예외가 아니라
 * 판별 유니언으로 흡수한다.
 */
export async function submitGuestInvite(token: string, input: SubmitGuestInviteInput): Promise<SubmitGuestInviteResult> {
  try {
    const result = await request<{ status: 'ok'; guestName: string | null; requesterName: string | null; reading: CompatReading | null }>(
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
