import { describe, expect, it } from 'vitest';
import {
  addOwnerEntry,
  isValidOwnerToken,
  isValidReadingId,
  legacyOwnerCookieName,
  MAX_OWNER_ENTRIES,
  OWNER_COOKIE_MAX_AGE_SECONDS,
  OWNER_COOKIE_NAME,
  ownerCookieOptions,
  parseOwnerCookie,
  readOwnerToken,
  shouldShowCreatedResultInPlace,
} from './readingOwner';

const READING_ID = '3F2B8C1E-4D5A-4B6C-8D7E-9F0A1B2C3D4E';

describe('readingOwner', () => {
  it('결과 id는 UUID 모양만, 토큰은 base64url 모양만 받는다', () => {
    expect(isValidReadingId(READING_ID)).toBe(true);
    expect(isValidReadingId('../admin')).toBe(false);
    expect(isValidOwnerToken('abcDEF0123456789_-xyz')).toBe(true);
    expect(isValidOwnerToken('short')).toBe(false);
    expect(isValidOwnerToken('has space in it 12345')).toBe(false);
    expect(isValidOwnerToken('a'.repeat(257))).toBe(false);
  });

  it('예전 결과별 쿠키 이름(읽기 호환)은 소문자 id', () => {
    expect(legacyOwnerCookieName(READING_ID)).toBe('nyo_3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e');
  });

  it('쿠키는 httpOnly·SameSite=Lax·90일, 운영에서만 Secure', () => {
    expect(ownerCookieOptions(true)).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: OWNER_COOKIE_MAX_AGE_SECONDS,
    });
    expect(OWNER_COOKIE_MAX_AGE_SECONDS).toBe(90 * 24 * 60 * 60);
    expect(ownerCookieOptions(false).secure).toBe(false);
  });

  it('예전 결과별 쿠키에서도 이 결과의 토큰만 꺼내고, 모양이 틀리면 없는 것으로 본다', () => {
    const jar = new Map([[legacyOwnerCookieName(READING_ID), 'abcDEF0123456789_-xyz']]);
    const store = { get: (name: string) => (jar.has(name) ? { value: jar.get(name)! } : undefined) };
    expect(readOwnerToken(READING_ID, store)).toBe('abcDEF0123456789_-xyz');
    expect(readOwnerToken('not-a-uuid', store)).toBeUndefined();
    jar.set(legacyOwnerCookieName(READING_ID), 'bad value');
    expect(readOwnerToken(READING_ID, store)).toBeUndefined();
  });
});

/** 2026-10-06 전체 점검 8차 항목 8 — 결과마다 쿠키를 따로 심어 헤더가 계속 커지던 것을 쿠키 하나(최근 N개)로. */
describe('readingOwner — 쿠키 하나에 최근 결과 여러 개', () => {
  const NOW = 1_800_000_000;
  const TOKEN = 'abcDEF0123456789_-xyz';
  const id = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;
  const storeOf = (value: string) => ({ get: (name: string) => (name === OWNER_COOKIE_NAME ? { value } : undefined) });

  it('새 결과를 더해도 앞서 만든 결과의 토큰이 남는다', () => {
    let value = addOwnerEntry(undefined, id(1), `${TOKEN}1`, NOW);
    value = addOwnerEntry(value, id(2), `${TOKEN}2`, NOW + 10);
    expect(readOwnerToken(id(1), storeOf(value), NOW + 20)).toBe(`${TOKEN}1`);
    expect(readOwnerToken(id(2), storeOf(value), NOW + 20)).toBe(`${TOKEN}2`);
    expect(readOwnerToken(id(3), storeOf(value), NOW + 20)).toBeUndefined();
  });

  it('최근 MAX_OWNER_ENTRIES개만 남기고 가장 오래된 결과부터 뺀다', () => {
    let value: string | undefined;
    for (let n = 1; n <= MAX_OWNER_ENTRIES + 2; n += 1) value = addOwnerEntry(value, id(n), TOKEN, NOW + n);
    const entries = parseOwnerCookie(value, NOW + 100);
    expect(entries).toHaveLength(MAX_OWNER_ENTRIES);
    expect(entries[0]!.readingId).toBe(id(3));
    expect(entries.at(-1)!.readingId).toBe(id(MAX_OWNER_ENTRIES + 2));
  });

  it('토큰이 최대 길이여도 쿠키 한도(4KB) 안에 든다', () => {
    let value: string | undefined;
    for (let n = 1; n <= MAX_OWNER_ENTRIES + 5; n += 1) value = addOwnerEntry(value, id(n), 'a'.repeat(256), NOW);
    expect(`${OWNER_COOKIE_NAME}=${value}`.length).toBeLessThan(4000);
    expect(parseOwnerCookie(value, NOW).at(-1)!.readingId).toBe(id(MAX_OWNER_ENTRIES + 5));
  });

  it('같은 결과를 다시 심으면 새 토큰으로 바꾸고 맨 뒤로 옮긴다', () => {
    let value = addOwnerEntry(undefined, id(1), `${TOKEN}old`, NOW);
    value = addOwnerEntry(value, id(2), TOKEN, NOW);
    value = addOwnerEntry(value, id(1), `${TOKEN}new`, NOW + 5);
    expect(parseOwnerCookie(value, NOW + 5).map((e) => e.readingId)).toEqual([id(2), id(1)]);
    expect(readOwnerToken(id(1), storeOf(value), NOW + 5)).toBe(`${TOKEN}new`);
  });

  it('결과마다 90일이 지나면 버린다(쿠키는 마지막으로 심은 때부터 90일이라 항목별로 본다)', () => {
    let value = addOwnerEntry(undefined, id(1), TOKEN, NOW);
    value = addOwnerEntry(value, id(2), TOKEN, NOW + 80 * 24 * 60 * 60);
    const later = NOW + OWNER_COOKIE_MAX_AGE_SECONDS + 1;
    expect(readOwnerToken(id(1), storeOf(value), later)).toBeUndefined();
    expect(readOwnerToken(id(2), storeOf(value), later)).toBe(TOKEN);
    expect(parseOwnerCookie(addOwnerEntry(value, id(3), TOKEN, later), later).map((e) => e.readingId)).toEqual([id(2), id(3)]);
  });

  it('모양이 틀린 항목은 건너뛰고 나머지는 읽는다', () => {
    const good = addOwnerEntry(undefined, id(1), TOKEN, NOW);
    const value = `garbage~../x.${TOKEN}.abc~${id(2)}.bad token.abc~${good}`;
    expect(parseOwnerCookie(value, NOW).map((e) => e.readingId)).toEqual([id(1)]);
  });
});

describe('shouldShowCreatedResultInPlace — 위기 대체 결과를 공개 화면으로 보내지 않기(전체 점검 12차)', () => {
  it('위기 대체 결과는 소유자 쿠키 여부와 무관하게 항상 이 자리에서 보여 준다(쿠키를 막은 브라우저도)', () => {
    expect(shouldShowCreatedResultInPlace(false)).toBe(true);
  });

  it('일반 결과(또는 구 백엔드 — 필드 없음)는 결과 페이지로', () => {
    expect(shouldShowCreatedResultInPlace(true)).toBe(false);
    expect(shouldShowCreatedResultInPlace(undefined)).toBe(false);
  });
});
