import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LANGUAGE, MARKETING_LANGUAGES } from '@/lib/languages';

/**
 * saju-letter-newyear-campaign은 URL 세그먼트 없이 브라우저 언어 감지+localStorage만 썼다
 * (단일 세션 퍼널이라 SEO가 필요 없었음). 이 사이트는 블로그/compare가 언어별로 독립
 * 인덱싱돼야 해서 URL 세그먼트가 필수다 — 그래서 언어 감지는 여기(최초 진입 시 리다이렉트)
 * 한 번뿐이고, 이후로는 URL이 언어를 그대로 들고 다닌다(src/lib/languages.ts 참고).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLangPrefix = MARKETING_LANGUAGES.some((lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`));
  if (hasLangPrefix) return NextResponse.next();

  const acceptLanguage = (request.headers.get('accept-language') ?? '').toLowerCase();
  const detected = MARKETING_LANGUAGES.find((lang) => lang !== 'ko' && acceptLanguage.includes(lang)) ?? DEFAULT_LANGUAGE;

  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // _next(빌드 산출물), 확장자가 있는 정적 파일(og 이미지 등), sitemap/robots는 리다이렉트 대상에서 제외.
  matcher: ['/((?!_next|sitemap.xml|robots.txt|.*\\..*).*)'],
};
