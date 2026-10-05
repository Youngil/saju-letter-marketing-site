import { ApiError } from './apiClient';

/**
 * 공개 폼(데모·신년운세·궁합·리드·신년운세 드립)이 같이 쓰는 입력 검사와 오류 문구 고르기(2026-10-06 전체 점검 3차 공용화 —
 * 이메일 정규식이 두 곳에 따로 있었고, 하나는 렌더마다 다시 만들었다. 오류 분기도 세 폼이 같은 코드를 각자 갖고 있었다).
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PublicFormErrorMessages {
  /** 서버가 만 16세 미만이라고 거절(`underage`). */
  underage: string;
  /** 서버가 생년월일이 없거나 잘못됐다고 거절(`birth_date_required`). */
  date: string;
  /** 그 밖의 실패. */
  generic: string;
  /** 429 — 없으면 generic으로(궁합 폼은 따로 안내하지 않는다). */
  rateLimited?: string;
  /** 폼마다 따로 안내하는 서버 사유(예: 신년운세 `campaign_not_active`). 429 다음에 본다. */
  byReason?: Record<string, string>;
}

/**
 * 제출 실패를 화면 문구로 — 순서: underage/birth_date_required → 429 → 폼별 사유 → generic. Turnstile 토큰 리셋(1회용)은
 * 폼 상태라 호출부가 그대로 한다.
 */
export function mapPublicFormError(error: unknown, messages: PublicFormErrorMessages): string {
  if (!(error instanceof ApiError)) return messages.generic;
  if (error.reason === 'underage') return messages.underage;
  if (error.reason === 'birth_date_required') return messages.date;
  if (error.status === 429 && messages.rateLimited !== undefined) return messages.rateLimited;
  if (error.reason && messages.byReason && Object.hasOwn(messages.byReason, error.reason)) return messages.byReason[error.reason]!;
  return messages.generic;
}
