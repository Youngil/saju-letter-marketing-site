import { describe, expect, it, vi } from 'vitest';

class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

// getReading은 saju-letter-backend를 실제로 호출한다 — 언어 게이트만 검증하는 이 테스트에서는
// 네트워크 호출 없이 항상 같은 결과를 돌려주도록 목킹한다(compat/[token]/page.test.ts와 같은 패턴).
vi.mock('@/lib/lunarNewYearApi', () => ({
  getReading: vi.fn().mockResolvedValue({
    id: 'sample-reading-id',
    name: 'Test',
    language: 'en',
    dayStem: '甲',
    content: {
      title: 'Sample title',
      greeting: 'Sample greeting',
      overview: 'Sample overview',
      highlight: 'Sample highlight',
      closing: 'Sample closing',
    },
    hasEmailSubscription: false,
  }),
}));

/**
 * 2026-09-08 4차 종합 버그 점검(항목 1) 회귀 테스트 — `/[lang]/lunar-new-year/r/[id]`(신년운세
 * 결과/공유 페이지)는 이미 발급된 결과 링크를 여는 트랜잭션 축이라, 백엔드의 `getReadingById`
 * 에도 언어 게이트가 없다. 2026-09-07 커밋이 페이지 게이트를 `isLaunchContentLanguage`(4)로
 * 좁히면서 pt/vi로 이미 발급된 링크가 전부 404가 났다 — `isMarketingLanguage`(6)로 되돌려 잡는다.
 */
describe('/[lang]/lunar-new-year/r/[id] 언어 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 허용', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('generateMetadata(%s)가 404 없이 실제 메타데이터를 반환한다', async (lang) => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang, id: 'sample-reading-id' }) });
    expect(metadata.title).toBeTruthy();
  });

  it.each(marketingLanguages)('기본 export(LunarNewYearResultPage)가 %s에서 notFound()를 호출하지 않는다', async (lang) => {
    const pageModule = await import('./page');
    const LunarNewYearResultPage = pageModule.default;
    await expect(
      LunarNewYearResultPage({ params: Promise.resolve({ lang, id: 'sample-reading-id' }) }),
    ).resolves.toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 여전히 notFound()로 404 처리한다', async () => {
    const pageModule = await import('./page');
    const LunarNewYearResultPage = pageModule.default;
    await expect(
      LunarNewYearResultPage({ params: Promise.resolve({ lang: 'xx', id: 'sample-reading-id' }) }),
    ).rejects.toBeInstanceOf(NotFoundSentinel);
  });
});
