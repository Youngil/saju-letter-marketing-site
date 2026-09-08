import { describe, expect, it, vi } from 'vitest';

class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

/**
 * 2026-09-08 3차 종합 버그 점검(항목 2) 회귀 테스트 — `/[lang]/unsubscribe`(웰컴 드립 이메일
 * 수신거부 링크)는 이 파일 자체는 처음부터 `isMarketingLanguage`(6개)만 검사해 올바르게
 * 구현돼 있었지만, 부모 레이아웃(`[lang]/layout.tsx`)의 게이트가 `isLaunchContentLanguage`(4개)로
 * 좁혀져 있어(2026-09-07) 이 페이지 자신의 검사에 도달하기도 전에 pt/vi 요청이 404로 막히고
 * 있었다. 이 테스트는 페이지 자신의 게이트가 여전히 6개 언어를 허용하는지 확인한다 — 부모
 * 레이아웃의 게이트 자체는 Next.js 서버 컴포넌트 트리 밖에서 이 저장소의 테스트 인프라로
 * 독립 검증하기 어려워(next/font/google 등 빌드 전용 의존성), `[lang]/layout.tsx`의 주석과
 * `npm run build`(정적 파라미터 생성)로 교차 확인한다.
 */
describe('/[lang]/unsubscribe 언어 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 허용', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('generateMetadata(%s)가 404 없이 실제 메타데이터를 반환한다', async (lang) => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang }) });
    expect(metadata.title).toBeTruthy();
  });

  it.each(marketingLanguages)('기본 export(UnsubscribePage)가 %s에서 notFound()를 호출하지 않는다', async (lang) => {
    const pageModule = await import('./page');
    const UnsubscribePage = pageModule.default;
    await expect(UnsubscribePage({ params: Promise.resolve({ lang }) })).resolves.toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 여전히 notFound()로 404 처리한다', async () => {
    const pageModule = await import('./page');
    const UnsubscribePage = pageModule.default;
    await expect(UnsubscribePage({ params: Promise.resolve({ lang: 'xx' }) })).rejects.toBeInstanceOf(
      NotFoundSentinel,
    );
  });
});
