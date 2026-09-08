import { describe, expect, it, vi } from 'vitest';

class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

/**
 * 2026-09-08 4차 종합 버그 점검(항목 1) 회귀 테스트 — `/[lang]/lunar-new-year`(신년운세 캠페인
 * 랜딩)은 2026-09-07 커밋(`ff41953`)이 원래의 `NON_KOREAN_LANGUAGES`(5, en/es/pt/ja/vi)를
 * `LAUNCH_CONTENT_LANGUAGES`(4, ko/en/ja/es)로 바꾸면서 ko는 의도대로 추가됐지만 pt/vi가
 * 실수로 함께 빠져 404가 났다. `MARKETING_LANGUAGES`(6)로 복원해 ko+pt/vi 모두 살렸는지
 * 확인한다.
 */
describe('/[lang]/lunar-new-year 언어 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 허용', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('generateMetadata(%s)가 404 없이 실제 메타데이터를 반환한다', async (lang) => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang }) });
    expect(metadata.title).toBeTruthy();
  });

  it.each(marketingLanguages)('기본 export(LunarNewYearPage)가 %s에서 notFound()를 호출하지 않는다', async (lang) => {
    const pageModule = await import('./page');
    const LunarNewYearPage = pageModule.default;
    await expect(LunarNewYearPage({ params: Promise.resolve({ lang }) })).resolves.toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 여전히 notFound()로 404 처리한다', async () => {
    const pageModule = await import('./page');
    const LunarNewYearPage = pageModule.default;
    await expect(LunarNewYearPage({ params: Promise.resolve({ lang: 'xx' }) })).rejects.toBeInstanceOf(
      NotFoundSentinel,
    );
  });

  it('generateStaticParams가 6개 언어 전부를 반환한다', async () => {
    const { generateStaticParams } = await import('./page');
    const params = await generateStaticParams();
    expect(params.map((p) => p.lang).sort()).toEqual([...marketingLanguages].sort());
  });
});
