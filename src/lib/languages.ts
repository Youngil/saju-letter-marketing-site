/**
 * saju-letter-newyear-campaign/src/lib/language.ts와 달리, 이 사이트는 URL 세그먼트
 * (/[lang]/...) 기반 라우팅을 쓴다 — 블로그/compare 페이지가 언어별로 독립 인덱싱돼야
 * SEO에 유리하기 때문이다(신년운세 캠페인은 공유 링크 하나로 끝나는 단일 세션 퍼널이라
 * 브라우저 감지+localStorage만으로 충분했지만, 이 사이트는 그렇지 않다). 그래서 언어 감지는
 * middleware.ts의 리다이렉트 시점 한 번뿐이고, 이후로는 URL이 언어를 그대로 들고 있다.
 */
export type MarketingLanguage = 'ko' | 'en' | 'es' | 'pt' | 'ja' | 'vi';

export const MARKETING_LANGUAGES: MarketingLanguage[] = ['ko', 'en', 'es', 'pt', 'ja', 'vi'];

export const DEFAULT_LANGUAGE: MarketingLanguage = 'en';

export function isMarketingLanguage(value: string): value is MarketingLanguage {
  return (MARKETING_LANGUAGES as string[]).includes(value);
}

/**
 * ko를 제외한 5개 언어 — 블로그/compare/lunar-new-year처럼 "SEO 대상 또는 원래 ko 미지원이던
 * 콘텐츠"에서 공통으로 쓰는 축이라 한 곳에 모아뒀다(예전엔 posts.ts/content/compareZodiac.ts에
 * 각자 따로 정의돼 있었다).
 */
export type NonKoreanLanguage = Exclude<MarketingLanguage, 'ko'>;

export const NON_KOREAN_LANGUAGES: NonKoreanLanguage[] = MARKETING_LANGUAGES.filter(
  (lang): lang is NonKoreanLanguage => lang !== 'ko',
);

export function isNonKoreanLanguage(lang: MarketingLanguage): lang is NonKoreanLanguage {
  return lang !== 'ko';
}

/**
 * 마케팅 카피의 톤 2그룹(사용자 확정, 2026-08-XX) — en/es/pt는 사주 개념을 처음 접하는
 * 독자에게 서양 별자리에 빗대어 처음부터 설명하고, ja/vi는 각자 이미 갖고 있는 전통
 * (四柱推命, Tử Vi/Bát Tự)과의 유사성을 강조한다. ko는 이 사이트에서 PR/QA 전용이라
 * 실질적으로 마케팅 비중이 없으므로 explain-from-scratch로 둔다.
 *
 * 이 구분은 saju-letter-backend가 2026-08-05에 확정한 "AI 생성 사주 콘텐츠는 6개 언어
 * 전부 동일하게 취급(오행명/전문용어 노출 금지에 언어별 차등 없음)" 원칙과는 다른 층이다 —
 * 그 원칙은 사람마다 매일 생성되는 개인화 리딩의 전문용어 노출을 다루고, 여기는 사람이
 * 직접 쓴(또는 한 번 다듬은) 정적 마케팅 카피의 포지셔닝을 다룬다. 이 구분은 코드 분기가
 * 아니라 언어별 dictionary 문구 차이로 대부분 구현되고, 레이아웃이 실제로 달라져야 하는
 * 곳(홈 히어로/인포그래픽)만 이 축 하나로 컴포넌트를 분기한다 — 언어별로 6갈래 분기하지 않는다.
 */
export type ToneGroup = 'explain-from-scratch' | 'lean-into-tradition';

export const TONE_GROUP: Record<MarketingLanguage, ToneGroup> = {
  ko: 'explain-from-scratch',
  en: 'explain-from-scratch',
  es: 'explain-from-scratch',
  pt: 'explain-from-scratch',
  ja: 'lean-into-tradition',
  vi: 'lean-into-tradition',
};
