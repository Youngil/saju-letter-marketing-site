/**
 * saju-letter-newyear-campaign/src/lib/language.ts와 달리, 이 사이트는 URL 세그먼트
 * (/[lang]/...) 기반 라우팅을 쓴다 — 블로그/compare 페이지가 언어별로 독립 인덱싱돼야
 * SEO에 유리하기 때문이다(신년운세 캠페인은 공유 링크 하나로 끝나는 단일 세션 퍼널이라
 * 브라우저 감지+localStorage만으로 충분했지만, 이 사이트는 그렇지 않다). 그래서 언어 감지는
 * proxy.ts의 리다이렉트 시점 한 번뿐이고, 이후로는 URL이 언어를 그대로 들고 있다.
 */
export type MarketingLanguage = 'ko' | 'en' | 'es' | 'pt' | 'ja' | 'vi';

export const MARKETING_LANGUAGES: MarketingLanguage[] = ['ko', 'en', 'es', 'pt', 'ja', 'vi'];

export const DEFAULT_LANGUAGE: MarketingLanguage = 'en';

export function isMarketingLanguage(value: string): value is MarketingLanguage {
  return (MARKETING_LANGUAGES as string[]).includes(value);
}

/**
 * 1차 서비스 타겟 언어(2026-08-07, 사용자 결정) — 한국어/영어/일본어/스페인어 4개.
 * 포르투갈어/베트남어는 초기 콘텐츠(블로그/compare 번역) 제작 비용과 마케팅 포인트를
 * 줄이기 위해 1차 출시 이후로 미룬다 — 사이트 자체는 이미 6개 언어를 구조적으로 지원하므로
 * (dictionaries/*.ts, compareZodiac.ts에 pt/vi 값도 이미 채워져 있음), 나중에 이 배열에
 * 'pt'/'vi'를 추가하고 그 언어의 content-posts/*.mdx 3편만 채우면 바로 열린다 — 라우팅/타입/
 * 다른 코드는 손댈 필요 없다(BLOG_LANGUAGES/compare 페이지가 전부 이 배열 하나만 참조).
 *
 * **2026-09-07부터 홈(미니 데모)·리드 캡처·개인정보처리방침·서비스 이용 안내·궁합 공유·
 * 신년운세 캠페인도 전부 이 4개로 좁혔다** — "모든 서비스를 1차 출시 4개 언어로 좁힌다"는
 * 결정에 따라, 예전에 "콘텐츠 제작 비용이 없다"는 이유로 6개 언어 그대로 열어뒀던 영역(홈
 * 미니 데모/리드 캡처)과 "법적 문서라 1차 출시 언어 축과 무관해야 한다"는 이유로 유지했던
 * 영역(개인정보처리방침/서비스 이용 안내)의 예외를 전부 없앴다 — 이제 이 배열이 사이트 전체의
 * 유일한 언어 축이다. `MARKETING_LANGUAGES`(6)는 dictionary/content 타입 정의용으로만 남는다.
 */
export type LaunchContentLanguage = 'ko' | 'en' | 'ja' | 'es';

export const LAUNCH_CONTENT_LANGUAGES: LaunchContentLanguage[] = ['ko', 'en', 'ja', 'es'];

/** 1차 출시에서 뺀 언어 — 실제로 어디서 쓰이진 않고, "왜 빠졌는지" 코드에서 바로 보이게 하는 문서용. */
export const DEFERRED_CONTENT_LANGUAGES: Exclude<MarketingLanguage, LaunchContentLanguage>[] = ['pt', 'vi'];

export function isLaunchContentLanguage(lang: MarketingLanguage): lang is LaunchContentLanguage {
  return (LAUNCH_CONTENT_LANGUAGES as MarketingLanguage[]).includes(lang);
}

/**
 * 6개 언어 트랜잭션 축 경로(언어 세그먼트를 뺀 나머지 경로의 첫 조각) — 신년운세(+결과 `r/[id]`·수신거부)·
 * 궁합 공유·개인정보처리방침·서비스 이용 안내·수신거부. 페이지 자체가 6개 언어로 열리는 곳들이다.
 */
const TRANSACTIONAL_ROUTE_ROOTS = ['lunar-new-year', 'compat', 'privacy', 'disclaimer', 'unsubscribe'];

export function isTransactionalPath(restOfPath: string): boolean {
  const firstSegment = restOfPath.split('/')[1] ?? '';
  return TRANSACTIONAL_ROUTE_ROOTS.includes(firstSegment);
}

/** 스위처에 보이는 순서 — 1차 출시 4개 언어 다음에 pt/vi. */
const SWITCHER_ORDER: MarketingLanguage[] = ['ko', 'en', 'ja', 'es', 'pt', 'vi'];

/**
 * `LanguageSwitcher.tsx`가 드롭다운에 보여줄 언어 목록을 정한다. `activeLanguages`는 관리자가 켠 언어 원본(6개 축).
 *
 * **경로별로 나눈다(2026-10-06 전체 점검 3차)** — 예전엔 레이아웃이 늘 콘텐츠 축(ko/en/ja/es)으로 좁혀 넘겨, pt/vi를
 * 켜면 신년운세 랜딩·hreflang·sitemap에는 pt/vi가 실리는데 그 페이지의 스위처에는 안 보였다. 이제 트랜잭션 축 경로
 * (`isTransactionalPath`)는 켠 언어 그대로, 나머지(홈·블로그·compare — pt/vi 콘텐츠가 없다)는 콘텐츠 축으로 좁힌다.
 * middleware 자동 감지가 콘텐츠 축으로만 보내는 것과 같은 나눔이다.
 */
export function availableSwitcherLanguages(restOfPath: string, activeLanguages: readonly MarketingLanguage[]): MarketingLanguage[] {
  const transactional = isTransactionalPath(restOfPath);
  return SWITCHER_ORDER.filter((lang) => activeLanguages.includes(lang) && (transactional || isLaunchContentLanguage(lang)));
}

/**
 * `Accept-Language` 헤더를 실제 우선순위(q값)대로 파싱해 지원 언어 중 첫 매치를 고른다
 * (2026-09-03, 종합 버그 점검으로 발견) — `proxy.ts`가 예전엔
 * `LAUNCH_CONTENT_LANGUAGES.find(lang => header.includes(lang))`로, 헤더 전체에 대한 단순
 * 부분 문자열 검사를 고정 배열 순서(`ko, en, ja, es`)로만 돌고 있었다. `en`이 배열에서
 * 두 번째라, `es-ES,es;q=0.9,en;q=0.8` 같은 흔한 헤더(스페인어가 실제 1순위)도 `'en'`이
 * 먼저 매치돼 영어 홈으로 잘못 리다이렉트됐다 — 언어별 라우팅이 핵심인 사이트에서 구조적으로
 * 자주 발생할 오탐이었다.
 *
 * 태그를 q값 내림차순으로 정렬한 뒤(동률은 헤더에 나온 순서 유지 — Array.sort는 안정 정렬),
 * 전체 태그("es-ES")로 먼저 매치를 시도하고 안 되면 기본 서브태그("es")로도 시도한다.
 */
export function detectPreferredLaunchLanguage(
  acceptLanguageHeader: string,
  /** 관리자가 켜 둔 언어만 후보로(2026-10-06). 생략하면 1차 출시 4개 언어 전부. */
  candidates: readonly LaunchContentLanguage[] = LAUNCH_CONTENT_LANGUAGES,
  fallback: LaunchContentLanguage = DEFAULT_LANGUAGE as LaunchContentLanguage,
): LaunchContentLanguage {
  const isCandidate = (value: string): value is LaunchContentLanguage => (candidates as readonly string[]).includes(value);
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
    if (isCandidate(tag)) return tag;
    const primarySubtag = tag.split('-')[0]!;
    if (isCandidate(primarySubtag)) return primarySubtag;
  }

  return fallback;
}

/**
 * `LanguageSwitcher.tsx`가 실제로 이동할 URL을 만든다(2026-09-09, 최종 pre-launch 감사
 * `docs/audit-2026-09-09-final-prelaunch.md` "언어 전환기가 수신거부 페이지의 `?token=` 쿼리
 * 파라미터를 버림" 대응). 예전엔 `usePathname()`만으로 `/${lang}${rest}`를 만들었는데,
 * `usePathname()`은 쿼리스트링을 포함하지 않는다 — `UnsubscribeStatus.tsx`/
 * `lunar-new-year/UnsubscribeStatus.tsx`처럼 `?token=...`에만 의존해 상태를 판단하는 페이지에서
 * 언어를 바꾸면 토큰이 사라져 곧바로 "찾을 수 없음"으로 보였다(실제로는 이미 성공했을 수도
 * 있는데 실패로 오인시킴). 특정 라우트만 예외 처리하는 대신, 모든 언어 전환에 현재 쿼리스트링을
 * 그대로 이어붙이는 일반 해법을 택했다 — 이 사이트는 언어 스위처가 레이아웃 한 곳에서만
 * 렌더되고(`[lang]/layout.tsx`) 페이지별로 다르게 동작할 필요가 없으며, 쿼리 파라미터가 언어
 * 전환 후에도 유지되는 쪽이 일반적으로 유용하지 해가 되지 않는다(토큰/추적 파라미터 등 어떤
 * 페이지가 미래에 쿼리 파라미터에 의존하게 되더라도 이 버그 클래스 자체가 재발하지 않는다).
 */
export function buildLanguageSwitchPath(restOfPath: string, lang: MarketingLanguage, queryString: string): string {
  const base = `/${lang}${restOfPath}`;
  return queryString ? `${base}?${queryString}` : base;
}

/**
 * 언어마다 있는지가 다른 페이지(블로그 글)의 스위처 제한(2026-10-06 전체 점검 3차) — 글 페이지가 `SwitcherLanguageLimit`
 * 으로 알려 준다. 그 글이 없는 언어를 고르면 404 대신 그 언어의 `fallbackRestOfPath`(블로그 목록)로 보낸다.
 */
export interface SwitcherPathLimit {
  /** 이 제한이 적용되는 경로(언어 세그먼트 제외, 디코드된 값). */
  restOfPath: string;
  languages: readonly MarketingLanguage[];
  fallbackRestOfPath: string;
}

function safeDecodePath(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

export function resolveLanguageSwitchPath(
  restOfPath: string,
  lang: MarketingLanguage,
  queryString: string,
  limit: SwitcherPathLimit | null,
): string {
  if (limit && safeDecodePath(restOfPath) === limit.restOfPath && !limit.languages.includes(lang)) {
    return buildLanguageSwitchPath(limit.fallbackRestOfPath, lang, '');
  }
  return buildLanguageSwitchPath(restOfPath, lang, queryString);
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

/**
 * 날짜를 그 언어로 쓸 때의 Intl 로캘(2026-10-06 공용화 — 블로그 날짜·신년운세 비시즌·날짜 도장이 각자 갖고 있었고 es가
 * 'es'/'es-ES'로 달랐다).
 */
export const INTL_LOCALE: Record<MarketingLanguage, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  es: 'es-ES',
  pt: 'pt-BR',
  vi: 'vi-VN',
};
