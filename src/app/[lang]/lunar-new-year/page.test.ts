import { afterEach, describe, expect, it, vi } from 'vitest';
import { isValidElement, type ReactElement, type ReactNode } from 'react';

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
  fetchActiveServiceLanguages: vi.fn(async () => ({ active: ['ko', 'en', 'ja', 'es'], default: 'en' })),
}));
vi.mock('@/lib/lunarNewYearApi', () => ({
  getCampaignWindow: vi.fn(async () => ({ active: true })),
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

  it('관리자가 pt를 켜면 /pt/lunar-new-year가 열린다(2026-10-06 전체 점검 3차 — 언어 목록을 콘텐츠 축 4개로 거르던 회귀)', async () => {
    const { fetchActiveServiceLanguages } = await import('@/lib/serviceLanguagesApi');
    vi.mocked(fetchActiveServiceLanguages).mockResolvedValueOnce({ active: ['ko', 'en', 'ja', 'es', 'pt'], default: 'en' });
    const { default: LunarNewYearPage } = await import('./page');
    await expect(LunarNewYearPage({ params: Promise.resolve({ lang: 'pt' }) })).resolves.toBeTruthy();
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

// 2026-10-06 전체 점검 11차 R11-6-3 — 기간 조회 실패를 "폼 열림"으로 굳히지 않는다.
describe('/[lang]/lunar-new-year 캠페인 기간 조회 실패', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('실행 중 조회가 실패하면 던진다(ISR이 직전 페이지를 유지하게)', async () => {
    const { getCampaignWindow } = await import('@/lib/lunarNewYearApi');
    vi.mocked(getCampaignWindow).mockRejectedValueOnce(new Error('down'));
    const { default: LunarNewYearPage } = await import('./page');
    await expect(LunarNewYearPage({ params: Promise.resolve({ lang: 'en' }) })).rejects.toThrow('down');
  });

  it('빌드 중 조회가 실패하면 기간을 모르는 상태(null)로 그린다 — 폼 대신 중립 안내', async () => {
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    const { getCampaignWindow } = await import('@/lib/lunarNewYearApi');
    vi.mocked(getCampaignWindow).mockRejectedValueOnce(new Error('down'));
    const { default: LunarNewYearPage } = await import('./page');
    const tree = (await LunarNewYearPage({ params: Promise.resolve({ lang: 'en' }) })) as ReactElement<{ windowStatus: unknown }>;
    expect(isValidElement(tree)).toBe(true);
    expect(tree.props.windowStatus).toBeNull();
  });

  it('기간을 모르면(null) 랜딩이 폼을 그리지 않고, 기간 안이면 폼을 그린다', async () => {
    const { LunarNewYearHome } = await import('@/components/lunar-new-year/LunarNewYearHome');
    const { ReadingForm } = await import('@/components/lunar-new-year/ReadingForm');
    const { getDictionary } = await import('@/dictionaries');
    const dict = await getDictionary('en');
    const render = (windowStatus: { active: boolean } | null) =>
      LunarNewYearHome({ language: 'en', dict: dict.lunarNewYear!, appLinksDict: dict.appLinks, windowStatus });
    expect(findElements(render(null), ReadingForm)).toHaveLength(0);
    expect(findElements(render({ active: true }), ReadingForm)).toHaveLength(1);
  });
});

/** 서버 컴포넌트가 돌려준 JSX 트리(렌더 전)에서 특정 컴포넌트 엘리먼트를 찾는다. */
function findElements(node: ReactNode, type: unknown): ReactElement[] {
  if (Array.isArray(node)) return node.flatMap((child) => findElements(child, type));
  if (!isValidElement(node)) return [];
  const own = node.type === type ? [node] : [];
  const children = (node.props as { children?: ReactNode }).children;
  return [...own, ...findElements(children, type)];
}
