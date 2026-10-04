import type { MarketingLanguage } from './languages';
import type { PostCategory } from './posts';
import { ApiError, request } from './apiClient';

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
 * 어떤 실패든(429/5xx 같은 `ApiError`뿐 아니라, 빌드 시점에 백엔드가 아직 안 떠 있어 나는
 * `fetch failed`/ECONNREFUSED 같은 네트워크 레벨 예외까지) DB 글이 아예 없는 것으로 조용히
 * 흡수한다 — compatApi.ts/lunarNewYearApi.ts보다 한 단계 더 넓게 잡는 이유는, 그 두 라우트는
 * 방문 시점에만(동적 렌더) 호출되지만 이 함수는 블로그 목록/상세 페이지의 `generateStaticParams`
 * 없는 슬롯에도 정적 빌드 시점(`next build`)에 호출될 수 있어서다 — 여기서 예외를 다시 던지면
 * 블로그 글 하나 때문에 사이트 전체 빌드가 실패한다. 정적 파일 글은 이 실패와 무관하게 계속 보인다.
 */
/**
 * 빌드 중(백엔드가 없을 수 있음)에만 오류를 흡수한다. 실행 중에는 404만 "없음"으로 보고 나머지(429·5xx·시간 초과)는
 * 던진다(2026-10-06) — 흡수하면 ISR 재검증이 그 결과(빈 목록·notFound)를 1시간 캐시해, 백엔드가 잠깐 느렸을 뿐인데
 * 공개된 글이 404가 되거나 목록에서 사라졌다. 던지면 Next가 직전에 잘 만든 페이지를 계속 보여 준다.
 */
function shouldSwallow(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
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
  try {
    return await request<DbBlogPostDetail>(`/marketing-site/blog-posts/${encodeURIComponent(slug)}?language=${encodeURIComponent(language)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (!shouldSwallow()) throw error;
    console.warn('getDbBlogPost failed', error);
    return null;
  }
}
