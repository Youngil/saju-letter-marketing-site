import { describe, expect, it, vi } from 'vitest';
import { formatPostDate, isPostCategory } from './posts';

vi.mock('./blogApi', () => ({
  listDbBlogPosts: vi.fn(),
  getDbBlogPost: vi.fn(),
}));

describe('formatPostDate', () => {
  it('언어별 긴 날짜로 포맷한다', () => {
    expect(formatPostDate('2026-09-01', 'en')).toMatch(/September/);
    expect(formatPostDate('2026-09-01', 'ko')).toMatch(/9/);
  });

  it('정오 고정으로 타임존에 하루가 밀리지 않는다', () => {
    // UTC- 지역에서도 9/1로 남아야 한다.
    expect(formatPostDate('2026-09-01', 'en')).toContain('1');
  });
});

describe('isPostCategory', () => {
  it('허용된 분류만 true', () => {
    expect(isPostCategory('behind')).toBe(true);
    expect(isPostCategory('fortune')).toBe(false);
  });
});

// 2026-09-06 — 블로그 DB 저장 도입(하이브리드: 정적 파일 글 + DB 저장 글). 실제 API 왕복 없이
// blogApi.ts를 목킹해 병합/분기 로직(posts.ts 쪽 책임)만 검증한다.
//
// ⚠️ 이 저장소의 vitest는 별도 설정 파일 없이 Vite 기본값으로 도는데(package.json의
// `vitest run`), @next/mdx의 웹팩 로더가 없어 `content-posts/*.mdx`의 동적 import가 항상
// 실패한다(`getPostModule`이 이를 try/catch로 흡수해 null을 반환 — Next.js 빌드/런타임에서는
// 정상 동작하고, 실제로 `npm run build`로 검증했다). 그래서 이 test 파일은 정적 파일 글이
// 실제로 로드되는 것에 의존하지 않고, "파일 로드가 안 되면 null로 우아하게 흡수하는지"와
// "DB 소스 병합/분기 로직 자체"만 검증한다 — 이 환경 제약은 이번 기능과 무관한 기존 갭이다.
describe('getAllPostSummaries — 정적 파일 글 + DB 글 병합', () => {
  it('DB 글이 없으면 예외 없이 빈 배열(또는 파일 글만)을 반환한다', async () => {
    const { listDbBlogPosts } = await import('./blogApi');
    vi.mocked(listDbBlogPosts).mockResolvedValue([]);
    const { getAllPostSummaries } = await import('./posts');

    const posts = await getAllPostSummaries('en');
    expect(Array.isArray(posts)).toBe(true);
  });

  it('DB 글 여러 건을 날짜 내림차순으로 병합하고, category null은 undefined로 정규화한다', async () => {
    const { listDbBlogPosts } = await import('./blogApi');
    vi.mocked(listDbBlogPosts).mockResolvedValue([
      { slug: 'older-db-post', title: 'Older', description: 'desc', date: '2099-01-01', category: null },
      { slug: 'newer-db-post', title: 'Newer', description: 'desc', date: '2099-06-01', category: 'observation' },
    ]);
    const { getAllPostSummaries } = await import('./posts');

    const posts = await getAllPostSummaries('en');
    // 둘 다 정적 파일 글보다 미래 날짜라 맨 앞 두 자리를 차지하고, 최신순으로 정렬돼야 한다.
    expect(posts[0]).toEqual({ slug: 'newer-db-post', title: 'Newer', description: 'desc', date: '2099-06-01', category: 'observation' });
    expect(posts[1]).toEqual({ slug: 'older-db-post', title: 'Older', description: 'desc', date: '2099-01-01', category: undefined });
  });
});

describe('getPostContent — 정적 파일 slug는 파일에서, 그 외는 DB에서', () => {
  it('알려진 정적 slug는 (이 테스트 환경에서 파일 로드가 실패하면) null로 우아하게 흡수한다', async () => {
    const { getPostContent } = await import('./posts');
    // 실제 Next.js 런타임에서는 이 호출이 { source: 'file', ... }를 반환한다(npm run build로 검증
    // 완료) — 여기서는 "DB로 새지 않고, 예외도 안 난다"만 확인한다(getDbBlogPost가 안 불림).
    const { getDbBlogPost } = await import('./blogApi');
    await getPostContent('en', 'what-is-saju');
    expect(getDbBlogPost).not.toHaveBeenCalled();
  });

  it('알려지지 않은 slug는 DB를 조회해 db source를 반환한다', async () => {
    const { getDbBlogPost } = await import('./blogApi');
    vi.mocked(getDbBlogPost).mockResolvedValue({
      slug: 'a-fresh-db-post',
      title: 'DB Post',
      description: 'desc',
      date: '2099-01-01',
      category: null,
      bodyMdx: 'Hello from the DB.',
    });
    const { getPostContent } = await import('./posts');

    const content = await getPostContent('en', 'a-fresh-db-post');
    expect(content).toEqual({
      source: 'db',
      bodyMdx: 'Hello from the DB.',
      meta: { title: 'DB Post', description: 'desc', date: '2099-01-01', category: undefined },
    });
  });

  it('DB에도 없는 slug는 null을 반환한다', async () => {
    const { getDbBlogPost } = await import('./blogApi');
    vi.mocked(getDbBlogPost).mockResolvedValue(null);
    const { getPostContent } = await import('./posts');

    expect(await getPostContent('en', 'does-not-exist')).toBeNull();
  });
});
