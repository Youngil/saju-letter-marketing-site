import { describe, expect, it, vi } from 'vitest';

class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

// 켠 언어 목록 — 네트워크 없이(compat page.test.ts와 같은 패턴).
vi.mock('@/lib/serviceLanguagesApi', () => ({
  fetchActiveServiceLanguages: vi.fn().mockResolvedValue({ active: ['ko', 'en', 'ja', 'es'], default: 'en' }),
  activeContentLanguages: (languages: { active: string[] }) => languages.active.filter((l) => ['ko', 'en', 'ja', 'es'].includes(l)),
}));

const { default: DayTypePage, generateMetadata, generateStaticParams } = await import('./page');

const params = (lang: string, slug: string) => ({ params: Promise.resolve({ lang, slug }) });

describe('/[lang]/type/[slug] — 콘텐츠 축 4개 언어 × 날 유형 10개', () => {
  it('정적 페이지는 40장', () => {
    expect(generateStaticParams()).toHaveLength(40);
  });

  it.each(['ko', 'en', 'ja', 'es'])('%s: 메타데이터에 제목·설명·canonical·hreflang이 있고 페이지가 404 없이 그려진다', async (lang) => {
    const meta = await generateMetadata(params(lang, 'flame'));
    expect(meta.title).toBeTruthy();
    expect(String(meta.description)).not.toContain('\n');
    expect(meta.alternates?.canonical).toMatch(new RegExp(`/${lang}/type/flame$`));
    expect(Object.keys(meta.alternates?.languages ?? {})).toEqual(expect.arrayContaining(['ko', 'en', 'ja', 'es', 'x-default']));
    expect(meta.robots).toBeUndefined();
    await expect(DayTypePage(params(lang, 'flame'))).resolves.toBeTruthy();
  });

  it('pt·vi와 모르는 주소 이름은 404', async () => {
    for (const [lang, slug] of [
      ['pt', 'flame'],
      ['vi', 'tree'],
      ['en', 'candle'],
      ['en', 'Flame'],
    ]) {
      await expect(DayTypePage(params(lang!, slug!))).rejects.toBeInstanceOf(NotFoundSentinel);
      expect(await generateMetadata(params(lang!, slug!))).toEqual({});
    }
  });
});
