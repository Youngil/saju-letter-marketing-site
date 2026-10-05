import { describe, expect, it, vi } from 'vitest';
import { NOINDEX_ROBOTS } from '@/lib/seo';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('notFound() called');
  },
}));

// 관리자가 es를 끈 상태 — 콘텐츠 축 판정(activeContentLanguages)은 실제 구현을 쓰고 조회만 고정값으로.
vi.mock('@/lib/serviceLanguagesApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/serviceLanguagesApi')>()),
  fetchActiveServiceLanguages: vi.fn().mockResolvedValue({ active: ['ko', 'en', 'ja', 'pt'], default: 'en' }),
}));

// 글 조회는 백엔드·MDX 로더 없이 — DB 글 하나가 4개 언어로 있다고 친다.
vi.mock('@/lib/posts', () => ({
  BLOG_LANGUAGES: ['ko', 'en', 'ja', 'es'],
  POST_SLUGS: [],
  getAllPostSummaries: vi.fn().mockResolvedValue([]),
  getLanguagesForSlug: vi.fn().mockResolvedValue(['ko', 'en', 'ja', 'es']),
  getPostContent: vi.fn().mockResolvedValue({
    source: 'db',
    bodyMdx: '',
    meta: { title: 'Title', description: 'Description', date: '2026-10-01', category: 'observation' },
  }),
}));

/**
 * 2026-10-06 전체 점검 5차 — 블로그 목록·글·compare도 홈처럼, 관리자가 끈 콘텐츠 언어면 noindex(hreflang·sitemap에서 빠진
 * 페이지가 색인에 남지 않게). 켠 언어는 robots를 건드리지 않는다.
 */
describe('콘텐츠 축 페이지 — 꺼진 언어만 noindex', () => {
  const pages = {
    blog: async (lang: string) => (await import('./blog/page')).generateMetadata({ params: Promise.resolve({ lang }) }),
    compare: async (lang: string) => (await import('./compare/page')).generateMetadata({ params: Promise.resolve({ lang }) }),
    'blog/[slug]': async (lang: string) =>
      (await import('./blog/[slug]/page')).generateMetadata({ params: Promise.resolve({ lang, slug: 'db-post' }) }),
  };

  it.each(Object.entries(pages))('%s — 꺼진 es는 noindex, 켠 en은 robots 없음', async (_name, generate) => {
    expect((await generate('es')).robots).toEqual(NOINDEX_ROBOTS);
    expect((await generate('en')).robots).toBeUndefined();
  }, 20_000); // 첫 import(페이지·사전 모듈)가 전체 병렬 실행에선 기본 5초를 넘기기도 한다
});
