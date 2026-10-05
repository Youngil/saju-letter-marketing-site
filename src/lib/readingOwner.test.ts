import { describe, expect, it } from 'vitest';
import {
  isValidOwnerToken,
  isValidReadingId,
  OWNER_COOKIE_MAX_AGE_SECONDS,
  ownerCookieName,
  ownerCookieOptions,
  readOwnerToken,
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

  it('쿠키 이름은 결과별(소문자 id)', () => {
    expect(ownerCookieName(READING_ID)).toBe('nyo_3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e');
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

  it('요청 쿠키에서 이 결과의 토큰만 꺼내고, 모양이 틀리면 없는 것으로 본다', () => {
    const jar = new Map([[ownerCookieName(READING_ID), 'abcDEF0123456789_-xyz']]);
    const store = { get: (name: string) => (jar.has(name) ? { value: jar.get(name)! } : undefined) };
    expect(readOwnerToken(READING_ID, store)).toBe('abcDEF0123456789_-xyz');
    expect(readOwnerToken('not-a-uuid', store)).toBeUndefined();
    jar.set(ownerCookieName(READING_ID), 'bad value');
    expect(readOwnerToken(READING_ID, store)).toBeUndefined();
  });
});
