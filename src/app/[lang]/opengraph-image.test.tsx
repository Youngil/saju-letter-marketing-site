import { describe, expect, it } from 'vitest';

/**
 * 2026-09-08 3차 종합 버그 점검(항목 4) 회귀 테스트 — 이 파일(`[lang]/opengraph-image.tsx`)은
 * `/privacy`·`/disclaimer`(트랜잭션 축, 6개 언어)가 폴백 OG 이미지로 URL을 직접 참조하므로
 * `isLaunchContentLanguage`(4개)로 좁히면 안 된다(반면 `compare/opengraph-image.tsx`는 compare
 * 세그먼트 전용이라 좁혀도 안전하다). pt/vi에 대해 여전히 해당 언어의 dictionary를 그대로
 * 쓰는지(= 'en' 폴백으로 떨어지지 않는지) 확인한다 — `ImageResponse` 자체(next/og, satori 기반)는
 * 이 vitest 환경에서 실행하지 않고, 그 앞단인 언어 선택 로직만 dictionary 조회로 간접 검증한다.
 */
describe('[lang]/opengraph-image.tsx — pt/vi도 자기 언어 dictionary를 그대로 쓴다(en 폴백 아님)', () => {
  it.each(['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const)('%s는 해당 언어의 brand/hero.title을 그대로 쓴다', async (lang) => {
    const { isMarketingLanguage } = await import('@/lib/languages');
    const { getDictionary } = await import('@/dictionaries');

    // opengraph-image.tsx의 실제 선택 로직과 동일: isMarketingLanguage(rawLang) ? rawLang : 'en'
    const resolved = isMarketingLanguage(lang) ? lang : 'en';
    expect(resolved).toBe(lang); // 6개 언어 전부 'en' 폴백으로 떨어지지 않아야 한다.

    const dict = await getDictionary(resolved);
    const enDict = await getDictionary('en');
    if (lang !== 'en') {
      // 각 언어가 실제로 자기 자신의 문구를 갖고 있는지(전부 영어로 뭉개지지 않았는지) 교차 확인.
      expect(dict.hero.title).not.toBe(enDict.hero.title);
    }
  });
});
