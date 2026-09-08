import { describe, expect, it, vi } from 'vitest';

class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

// next/font/google은 빌드 타임 폰트 최적화용 매크로라 순수 vitest 환경에서 실행 불가 — 이
// 레이아웃이 실제로 쓰는 형태(변수 CSS 클래스를 노출하는 객체)만 흉내낸다.
vi.mock('next/font/google', () => ({
  Playfair_Display: () => ({ variable: '--font-playfair' }),
  Noto_Serif_KR: () => ({ variable: '--font-noto-kr' }),
  Noto_Serif_JP: () => ({ variable: '--font-noto-ja' }),
}));

// 서비스 언어 통합 관리 API 호출 — 언어 게이트 자체와 무관하니 고정값으로 목킹한다.
vi.mock('@/lib/serviceLanguagesApi', () => ({
  fetchActiveServiceLanguages: vi.fn().mockResolvedValue({ active: ['ko', 'en', 'ja', 'es'] }),
}));

/**
 * 2026-09-08 3차 종합 버그 점검(항목 2) 회귀 테스트 — `[lang]/layout.tsx`가 사이트 전체의
 * 유일한 `[lang]` 유효성 검증 지점이라, 여기서 `isLaunchContentLanguage`(4개)로 게이트를 걸면
 * 트랜잭션 축 페이지(compat/privacy/unsubscribe)까지 pt/vi에 대해 무조건 404가 났다
 * (2026-09-07 커밋의 회귀). 이 레이아웃 자체는 두 축의 합집합(`isMarketingLanguage`, 6개)만
 * 확인해야 하고, 콘텐츠 축으로의 추가 제한은 각 리프 page.tsx가 책임진다.
 */
describe('[lang]/layout.tsx 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 통과, 콘텐츠 축 좁힘은 리프 페이지 책임', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('LangLayout(%s)이 notFound()를 호출하지 않는다', async (lang) => {
    const { default: LangLayout } = await import('./layout');
    await expect(
      LangLayout({ children: null, params: Promise.resolve({ lang }) }),
    ).resolves.toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 여전히 notFound()로 404 처리한다', async () => {
    const { default: LangLayout } = await import('./layout');
    await expect(
      LangLayout({ children: null, params: Promise.resolve({ lang: 'xx' }) }),
    ).rejects.toBeInstanceOf(NotFoundSentinel);
  });
});
