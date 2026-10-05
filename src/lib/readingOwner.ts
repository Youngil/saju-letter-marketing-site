/**
 * 신년운세 결과의 "만든 사람" 표시(2026-10-07 전체 점검 7차 항목 1).
 *
 * 공유 링크(`/[lang]/lunar-new-year/r/[id]`)는 만든 사람과 받은 사람이 같은 주소를 연다. 예전엔 그 페이지가 누구에게나 메일
 * 구독 폼과 구독 상태를 보여 줘서, 링크를 받은 친구가 자기 이메일로 구독하면 원래 주인의 이름·사연으로 쓴 12일 메일을 받아
 * 갔고 주인은 "이미 구독됨"만 보게 됐다. 이제 백엔드가 결과를 만들 때 비공개 소유자 토큰(`ownerToken`)을 한 번 내주고,
 * 구독·구독 상태 조회는 그 토큰이 있을 때만 된다.
 *
 * 토큰은 만든 사람 브라우저의 **httpOnly 쿠키**(`nyo_<readingId>`, 90일)에만 둔다 — 주소·GA로 새지 않게. 결과 생성은 방문자
 * IP 기준 한도·Turnstile 검증 때문에 브라우저가 백엔드를 직접 부르므로, 받은 토큰을 이 사이트의 `/api/lunar-new-year/owner-token`
 * 이 쿠키로 바꿔 심는다. 결과 페이지(서버)가 그 쿠키를 읽어 `X-Reading-Owner-Token` 헤더로 백엔드에 넘긴다.
 */
export const OWNER_COOKIE_PREFIX = 'nyo_';
export const OWNER_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
export const OWNER_TOKEN_HEADER = 'X-Reading-Owner-Token';

/** 쿠키 저장 라우트(같은 사이트) — 미들웨어의 언어 리다이렉트 대상에서 빠진 `/api` 아래. */
export const OWNER_TOKEN_ROUTE = '/api/lunar-new-year/owner-token';

const READING_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** 백엔드 토큰은 불투명한 base64url 문자열 — 길이는 넉넉히 받되 쿠키 한도(4KB)보다 한참 작게. */
const OWNER_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,256}$/;

/** 결과 id는 백엔드 UUID — 쿠키 이름에 그대로 넣으므로 모양을 먼저 확인한다. */
export function isValidReadingId(value: unknown): value is string {
  return typeof value === 'string' && READING_ID_PATTERN.test(value);
}

export function isValidOwnerToken(value: unknown): value is string {
  return typeof value === 'string' && OWNER_TOKEN_PATTERN.test(value);
}

export function ownerCookieName(readingId: string): string {
  return `${OWNER_COOKIE_PREFIX}${readingId.toLowerCase()}`;
}

export interface OwnerCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
}

/** 운영(https)에선 Secure. 로컬 `next dev`(http)에선 Safari가 Secure 쿠키를 받지 않아 끈다. */
export function ownerCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production'): OwnerCookieOptions {
  return { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/', maxAge: OWNER_COOKIE_MAX_AGE_SECONDS };
}

/** 요청 쿠키에서 이 결과의 소유자 토큰을 꺼낸다 — 모양이 틀린 값은 없는 것으로 본다. */
export function readOwnerToken(
  readingId: string,
  cookieStore: { get(name: string): { value: string } | undefined },
): string | undefined {
  if (!isValidReadingId(readingId)) return undefined;
  const value = cookieStore.get(ownerCookieName(readingId))?.value;
  return isValidOwnerToken(value) ? value : undefined;
}
