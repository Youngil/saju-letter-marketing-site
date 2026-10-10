/**
 * 언어별 CJK 디스플레이 세리프 CSS 주소 — `scripts/vendor-cjk-fonts.mjs`(prebuild)가 `public/fonts/`에 만드는 파일 이름과 같다
 * (2026-10-10 14차에 `[lang]/layout.tsx`에 두었다가 15차에 `app/global-not-found.tsx`도 쓰게 되어 여기로 옮김).
 * 그 언어 페이지에서만 `<link>`한다 — en/es 페이지가 CJK 폰트 CSS를 받지 않게.
 */
export const CJK_FONT_STYLESHEETS: Readonly<Record<string, string>> = {
  ko: '/fonts/noto-serif-kr.css',
  ja: '/fonts/noto-serif-jp.css',
};

export function cjkFontStylesheetFor(lang: string): string | undefined {
  return Object.hasOwn(CJK_FONT_STYLESHEETS, lang) ? CJK_FONT_STYLESHEETS[lang] : undefined;
}
