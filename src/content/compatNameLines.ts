import type { MarketingLanguage } from '@/lib/languages';

/**
 * 궁합 화면에서 보낸 사람 이름이 들어가는 두 줄(2026-10-06 전체 점검 9차, `compatContent.ts`에서 분리). 함수라 서버 컴포넌트가
 * prop으로 넘길 수 없어(RSC 경계) 클라이언트 `CompatView`가 `language`로 직접 고른다 — 나머지 문구(6개 언어 전체)까지
 * 클라이언트 번들에 싣지 않으려고 이 두 줄만 따로 둔다. `COMPAT_CONTENT`도 같은 함수를 그대로 참조한다.
 */
export interface CompatNameLines {
  /** 링크를 보낸 회원의 이름을 받는다(2026-09-02) — 이 화면은 항상 게스트만 보므로 "OOO님과의
   *  궁합"의 OOO은 게스트 자신이 아니라 초대를 보낸 사람이어야 한다. */
  pairLine: (requesterName: string | null) => string;
  /** 2026-10-02 편지 세계로 재구성 — 대기 화면 제목에 보낸 사람 이름(없으면 일반 문구). */
  pendingTitleFor: (requesterName: string | null) => string;
}

export const COMPAT_NAME_LINES: Record<MarketingLanguage, CompatNameLines> = {
  ko: {
    pairLine: (requesterName) => (requesterName ? `${requesterName}님과의 궁합` : '친구와의 궁합'),
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName}님이 궁합 편지를 보냈어요` : '궁합 편지가 도착했어요'),
  },
  en: {
    pairLine: (requesterName) => `Compatibility with ${requesterName || 'a friend'}`,
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName} sent you a compatibility letter` : 'A compatibility letter for you'),
  },
  ja: {
    pairLine: (requesterName) => (requesterName ? `${requesterName}さんとの相性` : '友達との相性'),
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName}さんから相性の手紙が届きました` : '相性の手紙が届きました'),
  },
  es: {
    pairLine: (requesterName) => `Compatibilidad con ${requesterName || 'un amigo'}`,
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName} te envió una carta de compatibilidad` : 'Tienes una carta de compatibilidad'),
  },
  pt: {
    pairLine: (requesterName) => `Compatibilidade com ${requesterName || 'um amigo'}`,
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName} te enviou uma carta de compatibilidade` : 'Você recebeu uma carta de compatibilidade'),
  },
  vi: {
    pairLine: (requesterName) => `Mức độ hợp nhau với ${requesterName || 'một người bạn'}`,
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName} đã gửi bạn một lá thư hợp nhau` : 'Bạn có một lá thư hợp nhau'),
  },
};
