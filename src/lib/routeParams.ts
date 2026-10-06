/**
 * 주소에서 받은 동적 세그먼트의 모양 검사(2026-10-06 전체 점검 11차 R11-6-1). 백엔드를 부르기 전에 걸러 `notFound()`로
 * 끝낸다 — 모양부터 틀린 값(긴 문자열·경로 조각·스캐너가 넣어 보는 값)까지 서버 렌더가 백엔드를 부르면, 방문자 전체가
 * 나눠 쓰는 서버 IP 한도를 그 요청들이 깎아 먹고 백엔드 로그·알림만 시끄러워진다.
 *
 * 모양은 백엔드가 실제로 만드는 값과 맞춘다 — 바꾸면 이미 발급된 링크가 404가 되므로, 백엔드 형식이 바뀔 때만 함께 고칠 것.
 */
export { isValidReadingId } from './readingOwner';

/**
 * 블로그 slug — 파일 글(`POST_SLUGS`)과 DB 글 모두 소문자 kebab-case. DB 글 발행 API
 * (`saju-letter-admin-backend` `routes/marketingSiteBlog.ts::handlePublishBlogPost`)가 `^[a-z0-9-]+$`·200자 이하만 받는다.
 */
const BLOG_SLUG_PATTERN = /^[a-z0-9-]{1,200}$/;

export function isValidBlogSlug(value: unknown): value is string {
  return typeof value === 'string' && BLOG_SLUG_PATTERN.test(value);
}

/**
 * 궁합 공유 토큰 — 백엔드 `compatibilityInviteService.ts::createInvite`가 `randomBytes(32).toString('base64url')`로 만든다
 * (32바이트 → 패딩 없는 base64url 43자, 2026-07-31 기능 도입 때부터 같은 형식).
 */
const COMPAT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function isValidCompatToken(value: unknown): value is string {
  return typeof value === 'string' && COMPAT_TOKEN_PATTERN.test(value);
}
