import { describe, expect, it, vi } from 'vitest';

class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

// getCompatInvite는 saju-letter-backend를 실제로 호출한다 — generateMetadata의 언어 게이트만
// 검증하는 이 테스트에서는 네트워크 호출 없이 항상 'pending' 뷰를 돌려주도록 목킹한다
// (posts.test.ts가 blogApi를 목킹하는 것과 같은 패턴).
vi.mock('@/lib/compatApi', () => ({
  getCompatInvite: vi.fn().mockResolvedValue({ status: 'pending' }),
}));

/**
 * 2026-09-08 3차 종합 버그 점검(항목 2) 회귀 테스트 — `/[lang]/compat/[token]`(궁합 공유 결과
 * 조회)은 트랜잭션 축이라, 이미 pt/vi로 발급된 공유 링크가 계속 열려야 한다. 2026-09-07 커밋이
 * `isLaunchContentLanguage`(4개) 체크를 추가로 얹어 pt/vi를 404 처리했던 회귀를 잡는다 —
 * `generateMetadata`만 검증한다(기본 export는 'use client' 컴포넌트(CompatView)를 렌더링까지
 * 필요로 하지 않고 단순 조립만 하지만, 여기서는 언어 게이트 자체가 관심사라 이 정도로 충분하다).
 */
describe('/[lang]/compat/[token] 언어 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 허용', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('generateMetadata(%s)가 404 없이 실제 메타데이터를 반환한다', async (lang) => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang, token: 'sample-token' }) });
    expect(metadata.title).toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 generateMetadata에서 빈 메타데이터를 반환한다', async () => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'xx', token: 'sample-token' }) });
    expect(metadata).toEqual({});
  });
});
