import { isLaunchContentLanguage, isMarketingLanguage } from './languages';

/**
 * 홈·홈 데모로 가는 주소(2026-10-10 전체 점검 14차) — 404·만료된 궁합 초대처럼 6개 언어 어디서나 뜨는 화면이 쓴다.
 * 홈은 콘텐츠 축(ko/en/ja/es)에만 있으므로, 그 밖의 언어(pt/vi)나 모르는 값은 언어 없는 `/`로 보내 proxy가 방문자 언어의
 * 홈으로 넘기게 한다(주소의 `#demo`는 리다이렉트 뒤에도 브라우저가 유지한다).
 */
export function homeHref(lang: string | null | undefined): string {
  return lang && isMarketingLanguage(lang) && isLaunchContentLanguage(lang) ? `/${lang}` : '/';
}

/**
 * 홈 데모(`#demo`) 주소. `activeLanguages`(관리자가 켠 서비스 언어)를 넘기면, 그 언어가 꺼져 있을 때도 `/#demo`로 보낸다
 * (2026-10-11 전체 점검 15차) — 꺼진 언어의 홈은 데모 섹션을 숨기므로(`showContentLinks`) `/{lang}#demo`는 데모 없는 화면에
 * 닿았다. proxy는 `/`를 켜진 콘텐츠 언어 중 방문자 언어의 홈으로 보낸다. 모르면(넘기지 않으면) 예전처럼 언어만 본다.
 */
export function demoHref(lang: string | null | undefined, activeLanguages?: readonly string[]): string {
  const home = homeHref(lang);
  if (home === '/' || (activeLanguages && !activeLanguages.includes(lang as string))) return '/#demo';
  return `${home}#demo`;
}
