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
 * 1차 서비스 타겟 언어(2026-08-07, 사용자 결정) — 한국어/영어/일본어/스페인어 4개.
 * 포르투갈어/베트남어는 초기 콘텐츠(블로그/compare 번역) 제작 비용과 마케팅 포인트를
 * 줄이기 위해 1차 출시 이후로 미룬다 — 사이트 자체는 이미 6개 언어를 구조적으로 지원하므로
 * (dictionaries/*.ts, compareZodiac.ts에 pt/vi 값도 이미 채워져 있음), 나중에 이 배열에
 * 'pt'/'vi'를 추가하고 그 언어의 content-posts/*.mdx 3편만 채우면 바로 열린다 — 라우팅/타입/
 * 다른 코드는 손댈 필요 없다(BLOG_LANGUAGES/compare 페이지가 전부 이 배열 하나만 참조).
 * 홈(미니 데모)·리드 캡처는 콘텐츠 제작 비용이 없는 영역이라(데모는 실시간 AI 호출, 리드는
 * 이메일만 받음) 이 축과 무관하게 6개 언어 전부 그대로 연다 — MARKETING_LANGUAGES 참고.
 */
export type LaunchContentLanguage = 'ko' | 'en' | 'ja' | 'es';

export const LAUNCH_CONTENT_LANGUAGES: LaunchContentLanguage[] = ['ko', 'en', 'ja', 'es'];

/** 1차 출시에서 뺀 언어 — 실제로 어디서 쓰이진 않고, "왜 빠졌는지" 코드에서 바로 보이게 하는 문서용. */
export const DEFERRED_CONTENT_LANGUAGES: NonKoreanLanguage[] = ['pt', 'vi'];

export function isLaunchContentLanguage(lang: MarketingLanguage): lang is LaunchContentLanguage {
  return (LAUNCH_CONTENT_LANGUAGES as MarketingLanguage[]).includes(lang);
}

/**
 * `Accept-Language` 헤더를 실제 우선순위(q값)대로 파싱해 지원 언어 중 첫 매치를 고른다
 * (2026-09-03, 종합 버그 점검으로 발견) — `middleware.ts`가 예전엔
 * `LAUNCH_CONTENT_LANGUAGES.find(lang => header.includes(lang))`로, 헤더 전체에 대한 단순
 * 부분 문자열 검사를 고정 배열 순서(`ko, en, ja, es`)로만 돌고 있었다. `en`이 배열에서
 * 두 번째라, `es-ES,es;q=0.9,en;q=0.8` 같은 흔한 헤더(스페인어가 실제 1순위)도 `'en'`이
 * 먼저 매치돼 영어 홈으로 잘못 리다이렉트됐다 — 언어별 라우팅이 핵심인 사이트에서 구조적으로
 * 자주 발생할 오탐이었다.
 *
 * 태그를 q값 내림차순으로 정렬한 뒤(동률은 헤더에 나온 순서 유지 — Array.sort는 안정 정렬),
 * 전체 태그("es-ES")로 먼저 매치를 시도하고 안 되면 기본 서브태그("es")로도 시도한다.
 */
export function detectPreferredLaunchLanguage(acceptLanguageHeader: string): LaunchContentLanguage {
  const entries = acceptLanguageHeader
    .split(',')
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(';');
      const tag = rawTag?.trim().toLowerCase();
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag, q: Number.isFinite(q) ? q : 1 };
    })
    .filter((entry): entry is { tag: string; q: number } => Boolean(entry.tag) && entry.tag !== '*')
    .sort((a, b) => b.q - a.q);

  for (const { tag } of entries) {
    if (isLaunchContentLanguage(tag as MarketingLanguage)) return tag as LaunchContentLanguage;
    const primarySubtag = tag.split('-')[0]!;
    if (isLaunchContentLanguage(primarySubtag as MarketingLanguage)) return primarySubtag as LaunchContentLanguage;
  }

  return DEFAULT_LANGUAGE as LaunchContentLanguage;
}

/**
 * 마케팅 카피의 톤 2그룹(사용자 확정) — en/es는 사주 개념을 처음 접하는 독자에게 서양
 * 별자리에 빗대어 처음부터 설명하고, ko/ja는 각자 이미 익숙한 전통(사주, 四柱推命)과의
 * 유사성을 강조한다(2026-08-07: ko를 PR/QA 전용에서 정식 타겟으로 전환하면서 ja와 같은
 * 그룹으로 옮겼다 — 한국 독자에게 "사주가 뭔지 처음부터 설명"하는 톤은 어색하기 때문).
 * pt/vi는 1차 출시 대상이 아니지만(위 LAUNCH_CONTENT_LANGUAGES 참고) 값 자체는 그대로
 * 유지한다 — 나중에 다시 열 때 이 결정을 다시 내릴 필요가 없게.
 *
 * 이 구분은 saju-letter-backend가 2026-08-05에 확정한 "AI 생성 사주 콘텐츠는 6개 언어
 * 전부 동일하게 취급(오행명/전문용어 노출 금지에 언어별 차등 없음)" 원칙과는 다른 층이다 —
 * 그 원칙은 사람마다 매일 생성되는 개인화 리딩의 전문용어 노출을 다루고, 여기는 사람이
 * 직접 쓴(또는 한 번 다듬은) 정적 마케팅 카피의 포지셔닝을 다룬다. 이 구분은 코드 분기가
 * 아니라 언어별 dictionary 문구 차이로 대부분 구현되고, 레이아웃이 실제로 달라져야 하는
 * 곳(인포그래픽 — 2026-08-26부터 홈이 아니라 compare 쪽)만 이 축 하나로 컴포넌트를 분기한다 —
 * 언어별로 6갈래 분기하지 않는다. 홈 히어로는 편지 약속으로 6개 언어를 통일했다
 * (`docs/marketing-site-realignment-2026-08-26.md` Phase 1).
 */
export type ToneGroup = 'explain-from-scratch' | 'lean-into-tradition';

export const TONE_GROUP: Record<MarketingLanguage, ToneGroup> = {
  ko: 'lean-into-tradition',
  en: 'explain-from-scratch',
  es: 'explain-from-scratch',
  pt: 'explain-from-scratch',
  ja: 'lean-into-tradition',
  vi: 'lean-into-tradition',
};
