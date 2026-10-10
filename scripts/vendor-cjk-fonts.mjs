/**
 * 한국어·일본어 디스플레이 세리프(Noto Serif KR/JP)를 빌드 때 받아 `public/fonts/`에 둔다(2026-10-10 전체 점검 14차).
 *
 * 왜: 예전엔 `[lang]/layout.tsx`가 next/font로 두 폰트를 불러, 유니코드 구간별 `@font-face` CSS 두 벌(gzip 약 119KB)이
 * en/es까지 모든 페이지의 렌더 차단 CSS로 실렸다. next/font CSS는 번들러가 레이아웃 진입점에 모아 버려(`next/dynamic`으로
 * 감싸도 마찬가지 — 빌드로 확인) 언어별로 나눌 수 없다. 그래서 이 스크립트가 같은 폰트를 이 사이트 주소로 옮겨 두고,
 * 레이아웃은 ko 페이지에만 `/fonts/noto-serif-kr.css`, ja 페이지에만 `/fonts/noto-serif-jp.css`를 `<link>`로 건다.
 *
 * - 방문자 브라우저는 Google에 요청하지 않는다(제3자 전송 없음 — 처리방침 변경 불필요). 빌드 서버만 Google Fonts에서 받는다
 *   (next/font도 빌드 때 같은 곳에서 받았다).
 * - 폰트 파일 이름은 내용 해시라 `next.config.ts`가 1년 immutable 캐시를 건다. CSS 이름은 고정이라 하루.
 * - 받기에 실패하면 경고만 남기고 빈 CSS를 쓴다 — 제목이 시스템 세리프로 보일 뿐 빌드는 계속된다.
 * - 결과물(`public/fonts/`)은 git에 넣지 않는다(.gitignore) — `npm run build`의 `prebuild`가 매번 만든다.
 *
 * 실행: `node scripts/vendor-cjk-fonts.mjs`(prebuild가 자동으로 부른다). `--if-missing`(predev)은 이미 받아 둔 CSS가 있으면 건너뛴다.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** 사이트에서 쓰는 두 폰트 — 레이아웃의 `CJK_FONT_STYLESHEETS`와 이름을 맞춘다. 굵기는 예전 next/font 설정(600·700) 그대로. */
export const CJK_FONTS = [
  { id: 'noto-serif-kr', family: 'Noto Serif KR', variable: '--font-noto-kr' },
  { id: 'noto-serif-jp', family: 'Noto Serif JP', variable: '--font-noto-ja' },
];

// Google Fonts는 User-Agent를 보고 형식을 고른다 — 최신 브라우저 UA여야 woff2 + unicode-range 구간으로 준다.
const MODERN_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const GSTATIC_URL = /url\((https:\/\/fonts\.gstatic\.com\/[^)\s'"]+\.woff2)\)/g;

/** Google CSS 안의 gstatic 주소 목록(중복 제거). */
export function extractFontUrls(css) {
  return [...new Set([...css.matchAll(GSTATIC_URL)].map((m) => m[1]))];
}

/**
 * gstatic 주소를 이 사이트 주소로 바꾸고, 페이지 CSS(`globals.css`의 `html[lang]`)가 쓰는 변수를 붙인다.
 * `fileNameFor`는 원래 주소 → 저장한 파일 이름.
 */
export function rewriteFontCss(css, { id, family, variable }, fileNameFor) {
  const rewritten = css
    .replace(GSTATIC_URL, (_, url) => `url(/fonts/${id}/${fileNameFor(url)})`)
    // 줄바꿈·들여쓰기만 걷어 낸다(구간이 120여 개라 공백만 수십 KB).
    .replace(/\s*\n\s*/g, '')
    .trim();
  return `${rewritten}\n:root{${variable}:'${family}';}\n`;
}

function cssUrlFor(family) {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@600;700&display=swap`;
}

async function fetchOk(url, as) {
  const response = await fetch(url, { headers: { 'User-Agent': MODERN_UA }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${url} → HTTP ${response.status}`);
  return as === 'text' ? response.text() : Buffer.from(await response.arrayBuffer());
}

/** 동시에 너무 많이 받지 않게 몇 개씩. */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function vendorFont(font, outDir) {
  const fontDir = path.join(outDir, font.id);
  await rm(fontDir, { recursive: true, force: true });
  await mkdir(fontDir, { recursive: true });
  const css = await fetchOk(cssUrlFor(font.family), 'text');
  const urls = extractFontUrls(css);
  if (urls.length === 0) throw new Error(`${font.family}: CSS에 woff2 주소가 없음`);
  const names = new Map();
  await mapLimit(urls, 8, async (url) => {
    const data = await fetchOk(url, 'buffer');
    const name = `${createHash('sha256').update(data).digest('hex').slice(0, 16)}.woff2`;
    await writeFile(path.join(fontDir, name), data);
    names.set(url, name);
  });
  await writeFile(path.join(outDir, `${font.id}.css`), rewriteFontCss(css, font, (url) => names.get(url)));
  return urls.length;
}

export async function main(outDir, { ifMissing = false } = {}) {
  await mkdir(outDir, { recursive: true });
  for (const font of CJK_FONTS) {
    if (ifMissing && existsSync(path.join(outDir, `${font.id}.css`))) continue;
    try {
      const count = await vendorFont(font, outDir);
      console.log(`[vendor-cjk-fonts] ${font.family}: 파일 ${count}개`);
    } catch (error) {
      // 빌드를 멈추지 않는다 — 제목만 시스템 세리프로 보인다. 빈 CSS를 써서 <link>가 404를 내지 않게.
      console.warn(`[vendor-cjk-fonts] ${font.family} 받기 실패, 시스템 세리프로 대체:`, error instanceof Error ? error.message : error);
      await writeFile(path.join(outDir, `${font.id}.css`), `/* ${font.family}: 빌드 때 받기 실패 — 시스템 세리프 사용 */\n`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  await main(path.join(root, 'public', 'fonts'), { ifMissing: process.argv.includes('--if-missing') });
}
