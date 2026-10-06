import type { MarketingLanguage } from './languages';
import type { PostCategory } from './posts';
import { ApiError, request } from './apiClient';
import { isBuildPhase } from './buildPhase';
import { isValidBlogSlug } from './routeParams';

/**
 * saju-letter-backend의 블로그 글 DB 조회 API — 2026-09-06, 사용자 요청("블로그를 매번 작성하여
 * 배포해야 한다면, 자동화를 위해서라도 데이터베이스를 이용하도록 변경")에 따른 하이브리드 구조의
 * 절반이다. 기존 content-posts/*.mdx(git 커밋)는 그대로 두고, 새 글부터는 이 API가 반환하는
 * DB 글을 posts.ts가 병합한다 — compatApi.ts/lunarNewYearApi.ts와 같은 얇은 래퍼 패턴.
 */
export interface DbBlogPostSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: PostCategory | null;
}

export interface DbBlogPostDetail extends DbBlogPostSummary {
  bodyMdx: string;
}

/**
 * 오류는 **빌드 중에만** 흡수한다(빈 목록/null) — `next build` 시점엔 백엔드가 떠 있지 않을 수 있고(`fetch failed`/ECONNREFUSED),
 * 여기서 던지면 블로그 글 하나 때문에 사이트 전체 빌드가 실패한다. 정적 파일 글은 이 실패와 무관하게 계속 보인다.
 * 실행 중에는 404만 "없음"으로 보고 나머지(429·5xx·시간 초과·네트워크)는 던진다(2026-10-06) — 흡수하면 ISR 재검증이 그
 * 결과(빈 목록·notFound)를 1시간 캐시해, 백엔드가 잠깐 느렸을 뿐인데 공개된 글이 404가 되거나 목록에서 사라졌다. 던지면
 * Next가 직전에 잘 만든 페이지를 계속 보여 준다.
 */
function shouldSwallow(): boolean {
  return isBuildPhase();
}

export async function listDbBlogPosts(language: MarketingLanguage): Promise<DbBlogPostSummary[]> {
  try {
    const result = await request<{ posts: DbBlogPostSummary[] }>(`/marketing-site/blog-posts?language=${encodeURIComponent(language)}`);
    return result.posts;
  } catch (error) {
    if (!shouldSwallow()) throw error;
    console.warn('listDbBlogPosts failed', error);
    return [];
  }
}

export async function getDbBlogPost(language: MarketingLanguage, slug: string): Promise<DbBlogPostDetail | null> {
  // 모양부터 틀린 slug는 백엔드를 부르지 않는다(2026-10-06 전체 점검 11차 R11-6-1, `routeParams.ts`).
  if (!isValidBlogSlug(slug)) return null;
  try {
    return await request<DbBlogPostDetail>(`/marketing-site/blog-posts/${encodeURIComponent(slug)}?language=${encodeURIComponent(language)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (!shouldSwallow()) throw error;
    console.warn('getDbBlogPost failed', error);
    return null;
  }
}
