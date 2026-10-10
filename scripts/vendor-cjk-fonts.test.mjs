import { describe, expect, it } from 'vitest';
import { CJK_FONTS, extractFontUrls, rewriteFontCss } from './vendor-cjk-fonts.mjs';

/** 2026-10-10 전체 점검 14차 — 빌드 때 받은 CJK 세리프 CSS가 이 사이트 주소만 가리키는지(방문자가 Google로 요청하지 않게). */
const SAMPLE = `/* [0] */
@font-face {
  font-family: 'Noto Serif KR';
  font-weight: 600;
  src: url(https://fonts.gstatic.com/s/notoserifkr/v32/abc.0.woff2) format('woff2');
  unicode-range: U+f9ca-fa0b;
}
@font-face {
  font-family: 'Noto Serif KR';
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/notoserifkr/v32/abc.0.woff2) format('woff2');
  unicode-range: U+f9ca-fa0b;
}
`;

describe('vendor-cjk-fonts', () => {
  it('gstatic 주소를 중복 없이 뽑는다', () => {
    expect(extractFontUrls(SAMPLE)).toEqual(['https://fonts.gstatic.com/s/notoserifkr/v32/abc.0.woff2']);
  });

  it('주소를 /fonts/<id>/로 바꾸고 페이지 CSS가 쓰는 변수를 붙인다', () => {
    const css = rewriteFontCss(SAMPLE, CJK_FONTS[0], () => 'deadbeef.woff2');
    expect(css).not.toContain('gstatic');
    expect(css).toContain('url(/fonts/noto-serif-kr/deadbeef.woff2)');
    expect(css.trimEnd().endsWith(":root{--font-noto-kr:'Noto Serif KR';}")).toBe(true);
    expect(css.split('\n').length).toBe(3); // 공백을 걷어 낸 본문 한 줄 + 변수 한 줄 + 끝 줄바꿈
  });

  it('globals.css가 쓰는 변수 이름과 같다', () => {
    expect(CJK_FONTS.map((f) => f.variable)).toEqual(['--font-noto-kr', '--font-noto-ja']);
  });
});
