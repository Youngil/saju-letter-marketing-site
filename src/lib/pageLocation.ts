/**
 * GA4로 보내는 페이지 위치에서 식별 값을 걷어 낸다(2026-10-06 전체 점검 3차 후속, 개인정보).
 *
 * 예전엔 `gtag('config', ID)`가 자동 page_view에 주소 전체를 실어 보냈다 — 궁합 공유 토큰(`/xx/compat/{token}`),
 * 신년운세 결과 id(`/xx/lunar-new-year/r/{id}`), 수신거부 토큰(`?token=`)이 그대로 GA에 쌓였다("토큰 등 식별 값을
 * GA 파라미터에 넣지 않는다" 규칙 위반). 이제 자동 page_view를 끄고(`send_page_view: false`) 경로가 바뀔 때마다
 * 이 모듈로 다듬은 값만 직접 보낸다(`GoogleAnalyticsPageView.tsx`).
 *
 * - 경로: 토큰·id 조각을 자리표시자로(`/compat/:token`, `/lunar-new-year/r/:id`).
 * - 쿼리: 통째로 버리고 유입 분석에 필요한 `utm_*`만 남긴다(GA4 세션 출처가 page_location의 utm을 읽는다).
 * - referrer: 같은 사이트면 경로만 같은 규칙으로 다듬고(쿼리 없음), 외부면 origin만.
 * - 제목: `document.title`은 **어느 페이지에서도 보내지 않고** 다듬은 경로를 제목으로 쓴다(2026-10-06 전체 점검 5차).
 *   개인화 페이지 제목엔 사람 이름이 들어가는데("OOO님과의 궁합", 신년운세 결과의 AI 헤드라인), 클라이언트 이동에선
 *   새 제목이 page_view effect보다 늦게 붙을 수 있어 "언제 읽은 제목이 누구 것인가"를 타이밍으로 가릴 수 없었다.
 *
 * **같은 규칙이 `GoogleAnalytics.tsx`의 인라인 스크립트(첫 로드의 `config`)에도 있다** — 인라인은 TS를 import할 수
 * 없어 `inlinePageContextFunctionSource()`가 규칙 상수로 JS 원문을 만든다. 둘이 같은 답을 내는지는 테스트가 확인한다.
 *
 * GA4 콘솔의 향상된 측정 → "브라우저 기록 이벤트 기반 페이지 변경"은 **반드시 꺼 둔다**(켜 두면 gtag가 주소 전체로
 * page_view를 따로 보낸다, CLAUDE.md §7).
 */

/** [정규식 원문, 바꿀 값] — 인라인 스크립트로 그대로 직렬화하므로 RegExp 객체 대신 문자열로 둔다. */
export const PAGE_PATH_RULES: ReadonlyArray<readonly [pattern: string, replacement: string]> = [
  ['^((?:/[a-z]{2})?/compat/)[^/]+', '$1:token'],
  ['^((?:/[a-z]{2})?/lunar-new-year/r/)[^/]+', '$1:id'],
];

/** 쿼리에서 남기는 키 — 유입 귀속(attribution.ts·GA4 세션 출처)에 필요한 것만. 순서대로 붙인다. */
export const KEPT_QUERY_KEYS: readonly string[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];

export interface SafePageContext {
  page_location: string;
  page_referrer: string;
  /** 다듬은 경로(쿼리 없음) — `document.title`은 쓰지 않는다. */
  page_title: string;
}

export function sanitizePagePath(pathname: string): string {
  return PAGE_PATH_RULES.reduce((path, [pattern, replacement]) => path.replace(new RegExp(pattern), replacement), pathname);
}

function keptQuery(searchParams: URLSearchParams): string {
  const parts: string[] = [];
  for (const key of KEPT_QUERY_KEYS) {
    const value = searchParams.get(key);
    if (value !== null) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

function safeReferrer(referrer: string, siteOrigin: string): string {
  if (!referrer) return '';
  try {
    const ref = new URL(referrer);
    return ref.origin === siteOrigin ? ref.origin + sanitizePagePath(ref.pathname) : `${ref.origin}/`;
  } catch {
    return '';
  }
}

/** GA4 page_view·이후 이벤트에 쓸 위치·referrer·제목(제목은 늘 다듬은 경로). */
export function safePageContext(href: string, referrer: string): SafePageContext {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { page_location: '', page_referrer: '', page_title: '' };
  }
  const path = sanitizePagePath(url.pathname);
  return {
    page_location: url.origin + path + keptQuery(url.searchParams),
    page_referrer: safeReferrer(referrer, url.origin),
    page_title: path,
  };
}

/**
 * `safePageContext(href, referrer)`와 같은 일을 하는 ES5 함수 원문 — `GoogleAnalytics.tsx`의 인라인 스크립트용
 * (`(<원문>)(location.href, document.referrer)`). 규칙 상수를 JSON으로 박는다.
 */
export function inlinePageContextFunctionSource(): string {
  return `function (href, referrer) {
    var rules = ${JSON.stringify(PAGE_PATH_RULES)};
    var keep = ${JSON.stringify(KEPT_QUERY_KEYS)};
    function path(p) {
      for (var i = 0; i < rules.length; i++) p = p.replace(new RegExp(rules[i][0]), rules[i][1]);
      return p;
    }
    var url;
    try { url = new URL(href); } catch (e) { return { page_location: '', page_referrer: '', page_title: '' }; }
    var safePath = path(url.pathname);
    var parts = [];
    for (var j = 0; j < keep.length; j++) {
      var value = url.searchParams.get(keep[j]);
      if (value !== null) parts.push(encodeURIComponent(keep[j]) + '=' + encodeURIComponent(value));
    }
    var ref = '';
    if (referrer) {
      try {
        var r = new URL(referrer);
        ref = r.origin === url.origin ? r.origin + path(r.pathname) : r.origin + '/';
      } catch (e) {}
    }
    return {
      page_location: url.origin + safePath + (parts.length ? '?' + parts.join('&') : ''),
      page_referrer: ref,
      page_title: safePath
    };
  }`;
}
