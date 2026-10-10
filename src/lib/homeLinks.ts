import { isLaunchContentLanguage, isMarketingLanguage } from './languages';

/**
 * 홈·홈 데모로 가는 주소(2026-10-10 전체 점검 14차) — 404·만료된 궁합 초대처럼 6개 언어 어디서나 뜨는 화면이 쓴다.
 * 홈은 콘텐츠 축(ko/en/ja/es)에만 있으므로, 그 밖의 언어(pt/vi)나 모르는 값은 언어 없는 `/`로 보내 proxy가 방문자 언어의
 * 홈으로 넘기게 한다(주소의 `#demo`는 리다이렉트 뒤에도 브라우저가 유지한다).
 */
export function homeHref(lang: string | null | undefined): string {
  return lang && isMarketingLanguage(lang) && isLaunchContentLanguage(lang) ? `/${lang}` : '/';
}

export function demoHref(lang: string | null | undefined): string {
  const home = homeHref(lang);
  return home === '/' ? '/#demo' : `${home}#demo`;
}
