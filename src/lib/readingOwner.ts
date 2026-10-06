/**
 * 신년운세 결과의 "만든 사람" 표시(2026-10-07 전체 점검 7차 항목 1).
 *
 * 공유 링크(`/[lang]/lunar-new-year/r/[id]`)는 만든 사람과 받은 사람이 같은 주소를 연다. 예전엔 그 페이지가 누구에게나 메일
 * 구독 폼과 구독 상태를 보여 줘서, 링크를 받은 친구가 자기 이메일로 구독하면 원래 주인의 이름·사연으로 쓴 12일 메일을 받아
 * 갔고 주인은 "이미 구독됨"만 보게 됐다. 이제 백엔드가 결과를 만들 때 비공개 소유자 토큰(`ownerToken`)을 한 번 내주고,
 * 구독·구독 상태 조회는 그 토큰이 있을 때만 된다.
 *
 * 토큰은 만든 사람 브라우저의 **httpOnly 쿠키** 하나(`nyo`, 최근 결과 최대 `MAX_OWNER_ENTRIES`개, 결과마다 90일)에만 둔다 —
 * 주소·GA로 새지 않게. 처음엔 결과마다 `nyo_<readingId>` 쿠키를 따로 심어(path=/, 90일) 결과를 여러 번 만든 브라우저는 이
 * 사이트의 모든 요청 헤더가 계속 커졌다(2026-10-06 전체 점검 8차) — 예전 쿠키는 읽기만 하고(스스로 만료) 더 만들지 않는다. 결과 생성은 방문자
 * IP 기준 한도·Turnstile 검증 때문에 브라우저가 백엔드를 직접 부르므로, 받은 토큰을 이 사이트의 `/api/lunar-new-year/owner-token`
 * 이 쿠키로 바꿔 심는다. 결과 페이지(서버)가 그 쿠키를 읽어 `X-Reading-Owner-Token` 헤더로 백엔드에 넘긴다.
 */
/** 소유자 토큰 쿠키(하나) — 값은 `<id>.<토큰>.<발급 초(36진)>`를 `~`로 이은 목록, 오래된 것부터. */
export const OWNER_COOKIE_NAME = 'nyo';
/** 예전(2026-10-07 전체 점검 7차) 결과별 쿠키 이름 접두사 — 읽기 전용 호환. */
export const LEGACY_OWNER_COOKIE_PREFIX = 'nyo_';
export const OWNER_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
/** 한 쿠키에 담는 최근 결과 수 — 토큰이 최대 길이(256자)여도 쿠키 한도(4KB) 안에 들게. */
export const MAX_OWNER_ENTRIES = 10;
/** 직렬화한 값의 상한 — 넘으면 오래된 결과부터 뺀다. */
const MAX_OWNER_COOKIE_VALUE_LENGTH = 3500;
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

/** 예전 결과별 쿠키 이름 — 읽기 호환용. */
export function legacyOwnerCookieName(readingId: string): string {
  return `${LEGACY_OWNER_COOKIE_PREFIX}${readingId.toLowerCase()}`;
}

export interface OwnerEntry {
  readingId: string;
  ownerToken: string;
  /** 발급 시각(유닉스 초) — 결과마다 90일을 넘기면 버린다(쿠키 자체의 Max-Age는 마지막으로 심은 때부터라). */
  issuedAt: number;
}

/** 쿠키 값 → 아직 유효한 항목(오래된 것부터). 모양이 틀리거나 90일이 지난 항목은 버린다. */
export function parseOwnerCookie(value: string | undefined, nowSeconds: number): OwnerEntry[] {
  if (!value) return [];
  const entries: OwnerEntry[] = [];
  for (const part of value.split('~')) {
    const [rawId, ownerToken, rawIssued, ...rest] = part.split('.');
    if (rest.length > 0 || !isValidReadingId(rawId) || !isValidOwnerToken(ownerToken)) continue;
    if (!rawIssued || !/^[0-9a-z]{1,10}$/.test(rawIssued)) continue;
    const issuedAt = parseInt(rawIssued, 36);
    if (nowSeconds - issuedAt > OWNER_COOKIE_MAX_AGE_SECONDS || issuedAt - nowSeconds > 60 * 60) continue;
    const readingId = rawId.toLowerCase();
    // 같은 결과가 두 번 있으면 나중 것만.
    const existing = entries.findIndex((entry) => entry.readingId === readingId);
    if (existing >= 0) entries.splice(existing, 1);
    entries.push({ readingId, ownerToken, issuedAt });
  }
  return entries;
}

export function serializeOwnerEntries(entries: readonly OwnerEntry[]): string {
  return entries.map((entry) => `${entry.readingId}.${entry.ownerToken}.${entry.issuedAt.toString(36)}`).join('~');
}

/** 새 결과를 맨 뒤(가장 최근)에 더하고, 개수·길이 상한을 넘으면 오래된 것부터 뺀 쿠키 값. */
export function addOwnerEntry(
  currentValue: string | undefined,
  readingId: string,
  ownerToken: string,
  nowSeconds: number,
): string {
  const id = readingId.toLowerCase();
  const entries = parseOwnerCookie(currentValue, nowSeconds).filter((entry) => entry.readingId !== id);
  entries.push({ readingId: id, ownerToken, issuedAt: nowSeconds });
  while (entries.length > MAX_OWNER_ENTRIES) entries.shift();
  let value = serializeOwnerEntries(entries);
  while (value.length > MAX_OWNER_COOKIE_VALUE_LENGTH && entries.length > 1) {
    entries.shift();
    value = serializeOwnerEntries(entries);
  }
  return value;
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

/**
 * 요청 쿠키에서 이 결과의 소유자 토큰을 꺼낸다 — 모양이 틀리거나 90일이 지난 값은 없는 것으로 본다. 새 쿠키(`nyo`)에 없으면
 * 예전 결과별 쿠키(`nyo_<id>`, 브라우저가 Max-Age로 스스로 지운다)를 본다.
 */
export function readOwnerToken(
  readingId: string,
  cookieStore: { get(name: string): { value: string } | undefined },
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string | undefined {
  if (!isValidReadingId(readingId)) return undefined;
  const id = readingId.toLowerCase();
  const entry = parseOwnerCookie(cookieStore.get(OWNER_COOKIE_NAME)?.value, nowSeconds).find((e) => e.readingId === id);
  if (entry) return entry.ownerToken;
  const legacy = cookieStore.get(legacyOwnerCookieName(readingId))?.value;
  return isValidOwnerToken(legacy) ? legacy : undefined;
}

/**
 * 결과를 만든 직후, 결과 페이지로 넘어가지 않고 폼 자리에서 결과를 보여 줘야 하는지(2026-10-06 전체 점검 11차 R11-6-2).
 * 위기 신호로 대체된 결과(`subscriptionAvailable === false`)는 결과 페이지가 소유자 쿠키로만 알아보므로, 쿠키를 못 남겼으면
 * 그 페이지가 공개 화면(공유 버튼·앱 안내·"나도 해 보기")으로 그려진다 — 그럴 땐 넘어가지 않는다. 일반 결과는 쿠키가 없어도
 * 넘어간다(메일 구독 폼만 안 보인다).
 */
export function shouldShowCreatedResultInPlace(subscriptionAvailable: boolean | undefined, ownerRemembered: boolean): boolean {
  return subscriptionAvailable === false && !ownerRemembered;
}
