import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CJK_FONTS, extractFontUrls, isStrictBuild, isUsableFontCss, main, rewriteFontCss } from './vendor-cjk-fonts.mjs';

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

  // 16차 — 빌드는 기본 엄격(운영 --source 빌드에 K_SERVICE·CI가 없어 환경 추측이 틀렸다). CJK_FONTS_STRICT=0만 비상 해제.
  it('빌드 판정: 기본 엄격, CJK_FONTS_STRICT=0/false만 해제', () => {
    expect(isStrictBuild({})).toBe(true);
    expect(isStrictBuild({ NODE_ENV: 'development' })).toBe(true);
    expect(isStrictBuild({ CJK_FONTS_STRICT: '1' })).toBe(true);
    expect(isStrictBuild({ CJK_FONTS_STRICT: '' })).toBe(true);
    expect(isStrictBuild({ CJK_FONTS_STRICT: '0' })).toBe(false);
    expect(isStrictBuild({ CJK_FONTS_STRICT: ' False ' })).toBe(false);
    expect(isStrictBuild({ NODE_ENV: 'production', CJK_FONTS_STRICT: '0' })).toBe(false);
  });

  it('받기 실패로 남긴 빈 CSS는 쓸 수 있는 CSS가 아니다', () => {
    expect(isUsableFontCss('/* Noto Serif KR: 빌드 때 받기 실패 — 시스템 세리프 사용 */\n')).toBe(false);
    expect(isUsableFontCss(rewriteFontCss(SAMPLE, CJK_FONTS[0], () => 'a.woff2'))).toBe(true);
  });

  describe('main', () => {
    let dir;
    beforeEach(async () => {
      dir = await mkdtemp(path.join(tmpdir(), 'cjk-fonts-'));
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(async () => {
      vi.restoreAllMocks();
      await rm(dir, { recursive: true, force: true });
    });
    const failing = async () => {
      throw new Error('offline');
    };

    it('관대(predev·비상 해제): 실패하면 빈 CSS를 쓰고 계속한다', async () => {
      expect(await main(dir, { fetchFont: failing })).toEqual(['Noto Serif KR', 'Noto Serif JP']);
      expect(isUsableFontCss(await readFile(path.join(dir, 'noto-serif-kr.css'), 'utf8'))).toBe(false);
    });

    it('엄격(빌드 기본): 실패하면 던진다', async () => {
      await expect(main(dir, { strict: true, fetchFont: failing })).rejects.toThrow(/CJK 세리프 받기 실패/);
    });

    it('--if-missing: 제대로 된 CSS는 건너뛰고 빈 CSS는 다시 받는다', async () => {
      await writeFile(path.join(dir, 'noto-serif-kr.css'), rewriteFontCss(SAMPLE, CJK_FONTS[0], () => 'a.woff2'));
      await writeFile(path.join(dir, 'noto-serif-jp.css'), '/* 받기 실패 */\n');
      const fetched = [];
      await main(dir, {
        ifMissing: true,
        fetchFont: async (font) => {
          fetched.push(font.id);
          return 1;
        },
      });
      expect(fetched).toEqual(['noto-serif-jp']);
    });
  });
});
