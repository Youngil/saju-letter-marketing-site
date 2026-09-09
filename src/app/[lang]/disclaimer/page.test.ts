import { describe, expect, it, vi } from 'vitest';

// notFound()는 실제로는 Next.js 렌더링을 인터럽트하는 특수 예외를 던진다 — 테스트에서는
// 감지 가능한 sentinel 에러로 대체해, "이 언어에서 404가 나는지"를 예외 발생 여부로 검증한다.
class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

/**
 * 2026-09-09 5차 종합 버그 점검 회귀 테스트 — `/[lang]/disclaimer`는 `/[lang]/privacy`와 같은
 * 트랜잭션/법적 고지 축이라 pt/vi를 포함한 6개 언어(`MARKETING_LANGUAGES`) 전부에서 열려야
 * 한다. 2026-09-07 커밋이 이 페이지에 `isLaunchContentLanguage`(4개) 체크를 추가로 얹어
 * pt/vi를 404 처리했던 회귀를 잡는다 — `privacy/page.test.ts`와 동일한 패턴.
 */
describe('/[lang]/disclaimer 언어 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 허용', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('generateMetadata(%s)가 404 없이 실제 메타데이터를 반환한다', async (lang) => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang }) });
    expect(metadata.title).toBeTruthy();
  });

  it.each(marketingLanguages)('기본 export(DisclaimerPage)가 %s에서 notFound()를 호출하지 않는다', async (lang) => {
    const pageModule = await import('./page');
    const DisclaimerPage = pageModule.default;
    await expect(DisclaimerPage({ params: Promise.resolve({ lang }) })).resolves.toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 여전히 notFound()로 404 처리한다', async () => {
    const pageModule = await import('./page');
    const DisclaimerPage = pageModule.default;
    await expect(DisclaimerPage({ params: Promise.resolve({ lang: 'xx' }) })).rejects.toBeInstanceOf(
      NotFoundSentinel,
    );
  });
});
