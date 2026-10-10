import { cache } from 'react';
import type { MarketingLanguage } from './languages';
import type { EarthlyBranch, HeavenlyStem } from './sajuVocabulary';
import { ApiError, isRetryableApiError, request, sendBeaconJson } from './apiClient';

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
  /** 2026-10-02부터 백엔드가 대기 중에도 보낸 사람 이름을 준다(구 백엔드면 없음 → optional). */
  | { status: 'pending'; requesterName?: string | null }
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
 * 404(없는 토큰) 같은 영구 실패만 not_found 뷰로 바꾸고, 429·5xx·시간 초과는 그대로 던진다(2026-10-06 전체 점검 3차). 예전엔
 * 모든 ApiError를 not_found로 흡수해, 백엔드의 IP당 조회 한도(분당 300, 이 서버 전체가 한 IP로 보인다)에 잠깐
 * 걸리기만 해도 멀쩡한 초대가 "찾을 수 없음"으로 보였다. 페이지는 던진 오류를 [lang]/error.tsx(다시 시도)로
 * 넘기고, 메타데이터·OG 이미지는 각자 잡아 일반 문구로 그린다.
 *
 * React `cache()`로 한 번의 요청 안에서 한 번만 부른다 — apiClient의 시간 제한 signal 때문에 Next의 fetch
 * 중복 제거가 꺼져, generateMetadata와 페이지가 같은 초대를 두 번씩 조회하며 위 한도를 두 배로 썼다.
 *
 * `visitorIp`(서버 전용, 2026-10-07 전체 점검 12차) — 이 조회를 일으킨 방문자 IP. 내부 키와 함께 `X-Visitor-Ip`로 넘겨 백엔드가
 * 방문자별로 센다(`apiClient.ts::internalKeyHeaders`). `cache()` 키에 들어가므로 한 요청 안에선 같은 값(`getRequestVisitorIp()`)을 넘길 것.
 */
export const getCompatInvite = cache(async (token: string, language: MarketingLanguage, visitorIp?: string): Promise<InviteView> => {
  try {
    return await request<InviteView>(`/compatibility-invites/${encodeURIComponent(token)}?language=${encodeURIComponent(language)}`, {
      visitorIp,
    });
  } catch (error) {
    if (error instanceof ApiError && !isRetryableApiError(error)) return { status: 'not_found' };
    throw error;
  }
});

/**
 * 브라우저에서 같은 초대를 다시 묻는다(2026-10-10 전체 점검 14차) — 결과는 완료인데 궁합 글(배치 캐시)이 아직 없을 때
 * (`reading: null`) `CompatView`가 몇 번 다시 확인한다. 서버 전용 `cache()`·방문자 IP 없이 그냥 부른다(브라우저 요청은 방문자
 * 자신의 IP로 백엔드 한도를 쓴다). 실패는 그대로 던진다 — 호출부가 다음 시도로 넘긴다.
 */
export function refetchCompatInvite(token: string, language: MarketingLanguage): Promise<InviteView> {
  return request<InviteView>(`/compatibility-invites/${encodeURIComponent(token)}?language=${encodeURIComponent(language)}`);
}

/**
 * `reading: null`일 때 다시 물어보는 간격(밀리초) — 점점 늘려 네 번(약 45초). 그 뒤엔 "곧 도착해요" 안내와 새로고침 버튼.
 * 궁합 글은 백엔드가 미리 만든 공용 캐시에서 고르므로 보통 첫 응답에 있고, 없는 건 캐시가 막 비었을 때뿐이다.
 */
export const COMPAT_READING_RETRY_DELAYS_MS = [3_000, 6_000, 12_000, 24_000] as const;

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
  sendBeaconJson(`/compatibility-invites/${encodeURIComponent(token)}/events`, { type, actor });
}
