import { describe, expect, it, vi } from 'vitest';

class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

/**
 * 2026-09-08 4차 종합 버그 점검(항목 1) 회귀 테스트 — `/[lang]/lunar-new-year/unsubscribe`(드립
 * 이메일 수신거부 링크)도 이미 발송된 이메일 속 링크가 계속 열려야 하는 트랜잭션 축이다.
 * 2026-09-07 커밋이 `LAUNCH_CONTENT_LANGUAGES`(4)로 좁히면서 pt/vi 구독자의 수신거부 링크가
 * 깨졌다 — `MARKETING_LANGUAGES`(6)로 되돌려 잡는다.
 */
describe('/[lang]/lunar-new-year/unsubscribe 언어 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 허용', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('generateMetadata(%s)가 404 없이 실제 메타데이터를 반환한다', async (lang) => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang }) });
    expect(metadata.title).toBeTruthy();
  });

  it.each(marketingLanguages)('기본 export(LunarNewYearUnsubscribePage)가 %s에서 notFound()를 호출하지 않는다', async (lang) => {
    const pageModule = await import('./page');
    const LunarNewYearUnsubscribePage = pageModule.default;
    await expect(LunarNewYearUnsubscribePage({ params: Promise.resolve({ lang }) })).resolves.toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 여전히 notFound()로 404 처리한다', async () => {
    const pageModule = await import('./page');
    const LunarNewYearUnsubscribePage = pageModule.default;
    await expect(LunarNewYearUnsubscribePage({ params: Promise.resolve({ lang: 'xx' }) })).rejects.toBeInstanceOf(
      NotFoundSentinel,
    );
  });

  it('generateStaticParams가 6개 언어 전부를 반환한다', async () => {
    const { generateStaticParams } = await import('./page');
    const params = await generateStaticParams();
    expect(params.map((p) => p.lang).sort()).toEqual([...marketingLanguages].sort());
  });
});
