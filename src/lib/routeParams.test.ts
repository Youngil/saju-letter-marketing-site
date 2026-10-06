import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { isValidBlogSlug, isValidCompatToken, isValidReadingId } from './routeParams';
import { POST_SLUGS } from './posts';

describe('isValidBlogSlug', () => {
  it('파일 글 slug는 전부 통과한다', () => {
    for (const slug of POST_SLUGS) expect(isValidBlogSlug(slug)).toBe(true);
  });

  it('소문자 kebab-case 200자까지만', () => {
    expect(isValidBlogSlug('a'.repeat(200))).toBe(true);
    expect(isValidBlogSlug('a'.repeat(201))).toBe(false);
    expect(isValidBlogSlug('')).toBe(false);
    expect(isValidBlogSlug('Hello-World')).toBe(false);
    expect(isValidBlogSlug('../etc/passwd')).toBe(false);
    expect(isValidBlogSlug('a%2Fb')).toBe(false);
    expect(isValidBlogSlug('a b')).toBe(false);
    expect(isValidBlogSlug(undefined)).toBe(false);
  });
});

describe('isValidCompatToken', () => {
  it('백엔드가 만드는 형식(32바이트 base64url = 43자)을 통과시킨다', () => {
    for (let i = 0; i < 20; i += 1) {
      expect(isValidCompatToken(randomBytes(32).toString('base64url'))).toBe(true);
    }
  });

  it('길이·문자가 다르면 거른다', () => {
    const token = randomBytes(32).toString('base64url');
    expect(isValidCompatToken(token.slice(0, 42))).toBe(false);
    expect(isValidCompatToken(`${token}a`)).toBe(false);
    expect(isValidCompatToken(`${token.slice(0, 42)}=`)).toBe(false);
    expect(isValidCompatToken(`${token.slice(0, 42)}/`)).toBe(false);
    expect(isValidCompatToken('sample-token')).toBe(false);
    expect(isValidCompatToken(null)).toBe(false);
  });
});

describe('isValidReadingId', () => {
  it('UUID만 통과시킨다', () => {
    expect(isValidReadingId('3f2b8c1e-9d4a-4b7e-8c2f-1a2b3c4d5e6f')).toBe(true);
    expect(isValidReadingId('sample-reading-id')).toBe(false);
  });
});
