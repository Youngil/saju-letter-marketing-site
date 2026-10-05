import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import {
  DEFAULT_LANGUAGE,
  MARKETING_LANGUAGES,
  detectPreferredLaunchLanguage,
  isLaunchContentLanguage,
  type LaunchContentLanguage,
} from '@/lib/languages';
import { fetchServiceLanguagesOnce, STATIC_SERVICE_LANGUAGES } from '@/lib/serviceLanguagesApi';
import { createStaleWhileRevalidate } from '@/lib/staleWhileRevalidate';

/**
 * 관리자가 켠 언어·기본 언어(2026-10-06) — 예전엔 고정 4개 언어와 'en'으로만 감지해, 언어를 끄거나 기본 언어를
 * 바꿔도 첫 방문 리다이렉트에 반영되지 않았다. 요청마다 백엔드를 부르지 않게 인스턴스 메모리에 10분 둔다.
 *
 * **리다이렉트가 백엔드를 기다리지 않게**(2026-10-06 전체 점검 3차 후속) — 예전엔 캐시가 만료된 순간 들어온 요청마다
 * 최대 10초짜리 조회를 각자 기다렸다. 이제 만료된 값이라도 바로 쓰고 새로 받기는 하나만 뒤에서(`waitUntil`) 돌린다.
 * 값이 하나도 없는 콜드 스타트에만 2초 제한으로 한 번 기다리고, 실패하면 마지막 값(없으면 정적 목록)을 30초만 쓴다.
 */
const LANGUAGE_CACHE_MS = 10 * 60_000;
const FAILURE_CACHE_MS = 30_000;
const MIDDLEWARE_FETCH_TIMEOUT_MS = 2_000;

const activeLanguages = createStaleWhileRevalidate({
  load: () => fetchServiceLanguagesOnce({ timeoutMs: MIDDLEWARE_FETCH_TIMEOUT_MS }),
  ttlMs: LANGUAGE_CACHE_MS,
  failureTtlMs: FAILURE_CACHE_MS,
  fallback: STATIC_SERVICE_LANGUAGES,
  onError: (error) => console.warn('middleware: service languages unavailable — using last/static list briefly', error),
});

/**
 * saju-letter-newyear-campaign은 URL 세그먼트 없이 브라우저 언어 감지+localStorage만 썼다
 * (단일 세션 퍼널이라 SEO가 필요 없었음). 이 사이트는 블로그/compare가 언어별로 독립
 * 인덱싱돼야 해서 URL 세그먼트가 필수다 — 그래서 언어 감지는 여기(최초 진입 시 리다이렉트)
 * 한 번뿐이고, 이후로는 URL이 언어를 그대로 들고 다닌다(src/lib/languages.ts 참고).
 */
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // apex 도메인(saju-letter.com, www 없음)은 GCP 배포(2026-08-09) 이후 DNS 자체가 없다가
  // 2026-08-12에 이 사이트로 연결됐다 — 처음부터 이 사이트의 canonical 도메인은 www였으므로
  // (NEXT_PUBLIC_WEB_BASE_URL, sitemap.ts/robots.ts/모든 generateMetadata가 www 기준),
  // apex로 들어오는 요청은 콘텐츠를 그대로 서빙하지 않고 항상 www로 리다이렉트한다(중복
  // 콘텐츠로 인한 SEO 문제 방지, 단일 canonical 유지).
  const host = request.headers.get('host') ?? '';
  if (host === 'saju-letter.com') {
    const url = request.nextUrl.clone();
    url.protocol = 'https';
    url.hostname = 'www.saju-letter.com';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  const hasLangPrefix = MARKETING_LANGUAGES.some((lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`));
  if (hasLangPrefix) return NextResponse.next();

  // 자동 감지 후보는 LAUNCH_CONTENT_LANGUAGES(ko/en/ja/es)로 한정한다(2026-08-08) —
  // LanguageSwitcher와 같은 이유(pt/vi는 블로그/compare가 아직 없어 "숨겨둔" 상태). URL에 이미
  // /pt나 /vi가 붙은 링크(신년운세 캠페인 등)는 위 hasLangPrefix에서 이미 걸러져 영향받지 않는다.
  // 실제 우선순위(q값) 파싱은 detectPreferredLaunchLanguage 참고(2026-09-03, 종합 버그 점검 —
  // 예전엔 헤더 전체에 대한 단순 부분 문자열 검사를 고정 배열 순서로만 돌아 우선순위를 무시했다).
  // 자동 감지는 홈이 있는 콘텐츠 축 언어로만 — 관리자가 켠 언어 원본(6개 축)에서 여기서 좁힌다.
  const { value, background } = await activeLanguages.get();
  // 뒤에서 새로 받는 조회가 응답을 보낸 뒤에도 끝까지 돌도록.
  if (background) event.waitUntil(background);
  const { active, default: defaultLanguage } = value;
  const candidates = active.filter(isLaunchContentLanguage);
  const fallback: LaunchContentLanguage = isLaunchContentLanguage(defaultLanguage)
    ? defaultLanguage
    : (DEFAULT_LANGUAGE as LaunchContentLanguage);
  const detected = detectPreferredLaunchLanguage(request.headers.get('accept-language') ?? '', candidates, fallback);

  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // _next(빌드 산출물), 확장자가 있는 정적 파일(og 이미지 등), sitemap/robots, 이 사이트 자체 API(`/api/…` — 신년운세
  // 소유자 쿠키 저장, 2026-10-07)는 리다이렉트 대상에서 제외.
  matcher: ['/((?!api/|_next|sitemap.xml|robots.txt|.*\\..*).*)'],
};
