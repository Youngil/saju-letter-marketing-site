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
 * 2026-09-08 3차 종합 버그 점검(항목 2) 회귀 테스트 — `/[lang]/privacy`는 트랜잭션/기존 데이터
 * 접근 축(모바일 앱이 6개 언어 중 하나로 이 URL을 직접 구성해 링크한다)이라 pt/vi를 포함한
 * 6개 언어(`MARKETING_LANGUAGES`) 전부에서 열려야 한다. 2026-09-07 커밋이 이 페이지에
 * `isLaunchContentLanguage`(4개) 체크를 추가로 얹어 pt/vi를 404 처리했던 회귀를 잡는다 —
 * 이 테스트는 실제 page.tsx의 `generateMetadata`/기본 export를 직접 호출해 검증한다(mock 없이
 * 실제 6개 언어 dictionary/PRIVACY_POLICY_CONTENT를 그대로 사용).
 */
describe('/[lang]/privacy 언어 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 허용', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('generateMetadata(%s)가 404 없이 실제 메타데이터를 반환한다', async (lang) => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang }) });
    expect(metadata.title).toBeTruthy();
  });

  it.each(marketingLanguages)('기본 export(PrivacyPolicyPage)가 %s에서 notFound()를 호출하지 않는다', async (lang) => {
    const pageModule = await import('./page');
    const PrivacyPolicyPage = pageModule.default;
    await expect(PrivacyPolicyPage({ params: Promise.resolve({ lang }) })).resolves.toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 여전히 notFound()로 404 처리한다', async () => {
    const pageModule = await import('./page');
    const PrivacyPolicyPage = pageModule.default;
    await expect(PrivacyPolicyPage({ params: Promise.resolve({ lang: 'xx' }) })).rejects.toBeInstanceOf(
      NotFoundSentinel,
    );
  });
});
