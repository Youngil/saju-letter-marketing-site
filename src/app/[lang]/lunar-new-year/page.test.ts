import { describe, expect, it, vi } from 'vitest';

class NotFoundSentinel extends Error {}
class RedirectSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
  redirect: (to: string) => {
    throw new RedirectSentinel(to);
  },
}));
// 관리자가 켠 언어(2026-10-06부터 랜딩이 이 값으로 새 결과를 받을 언어를 정한다) — 지금 운영과 같은 4개.
vi.mock('@/lib/serviceLanguagesApi', () => ({
  fetchActiveServiceLanguages: async () => ({ active: ['ko', 'en', 'ja', 'es'], default: 'en' }),
}));
vi.mock('@/lib/lunarNewYearApi', () => ({
  getCampaignWindow: async () => ({ active: true }),
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

  it.each(['ko', 'en', 'ja', 'es'] as const)('기본 export(LunarNewYearPage)가 활성 언어 %s에서 랜딩을 그린다', async (lang) => {
    const pageModule = await import('./page');
    const LunarNewYearPage = pageModule.default;
    await expect(LunarNewYearPage({ params: Promise.resolve({ lang }) })).resolves.toBeTruthy();
  });

  it.each(['pt', 'vi'] as const)(
    '비활성 언어 %s의 랜딩은 404 대신 기본 언어 랜딩으로 보낸다(2026-10-06 — 백엔드가 비활성 언어 결과를 거부해 폼 제출이 400이었다)',
    async (lang) => {
      const pageModule = await import('./page');
      const LunarNewYearPage = pageModule.default;
      await expect(LunarNewYearPage({ params: Promise.resolve({ lang }) })).rejects.toThrow('/en/lunar-new-year');
    },
  );

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
