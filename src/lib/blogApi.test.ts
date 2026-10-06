import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./apiClient')>();
  return { ...actual, request: vi.fn() };
});

const { request, ApiError } = await import('./apiClient');
const { getDbBlogPost, listDbBlogPosts } = await import('./blogApi');

beforeEach(() => {
  vi.mocked(request).mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getDbBlogPost', () => {
  it('모양이 틀린 slug는 백엔드를 부르지 않고 null(2026-10-06 전체 점검 11차 R11-6-1)', async () => {
    for (const slug of ['Hello', '../x', 'a b', 'a'.repeat(201), '']) {
      await expect(getDbBlogPost('en', slug)).resolves.toBeNull();
    }
    expect(request).not.toHaveBeenCalled();
  });

  it('404는 null', async () => {
    vi.mocked(request).mockRejectedValue(new ApiError('not found', 404));
    await expect(getDbBlogPost('en', 'some-post')).resolves.toBeNull();
  });

  it('실행 중의 404 아닌 오류는 던진다(ISR이 직전 페이지를 유지하게)', async () => {
    vi.mocked(request).mockRejectedValue(new ApiError('down', 503));
    await expect(getDbBlogPost('en', 'some-post')).rejects.toMatchObject({ status: 503 });
  });

  it('빌드 중에는 오류를 흡수한다', async () => {
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    vi.mocked(request).mockRejectedValue(new TypeError('fetch failed'));
    await expect(getDbBlogPost('en', 'some-post')).resolves.toBeNull();
  });
});

describe('listDbBlogPosts', () => {
  it('실행 중엔 던지고 빌드 중엔 빈 목록', async () => {
    vi.mocked(request).mockRejectedValue(new ApiError('down', 500));
    await expect(listDbBlogPosts('en')).rejects.toMatchObject({ status: 500 });
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    await expect(listDbBlogPosts('en')).resolves.toEqual([]);
  });
});
