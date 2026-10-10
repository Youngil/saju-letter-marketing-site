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
 * - 폰트 파일 이름은 내용 해시라 `next.config.ts`가 1년 immutable 캐시를 건다. CSS 이름은 레이아웃이 고정 주소로 걸어야 해서
 *   고정이고, 대신 캐시를 10분으로 짧게 둔다(15차 — 하루였을 땐 Google이 폰트 파일을 바꾼 뒤 배포하면 브라우저에 남은 옛 CSS가
 *   새 컨테이너엔 없는 옛 woff2 이름을 하루 동안 가리켜 404가 났다).
 * - **운영 빌드(`isStrictBuild` — `K_SERVICE`·`CI`·`NODE_ENV=production`, 15차)에선 받기 실패면 빌드를 멈춘다**(exit 1). 예전엔
 *   경고만 남기고 빈 CSS로 빌드가 성공해 ko/ja 제목이 조용히 시스템 세리프로 배포됐다. 로컬(`npm run dev`의 predev, 위 변수가
 *   없는 로컬 build)은 지금처럼 경고 + 빈 CSS로 계속한다. `CJK_FONTS_STRICT=0|1`로 판단을 직접 덮을 수 있다.
 * - 결과물(`public/fonts/`)은 git에 넣지 않는다(.gitignore) — `npm run build`의 `prebuild`가 매번 만든다.
 *
 * 실행: `node scripts/vendor-cjk-fonts.mjs`(prebuild가 자동으로 부른다). `--if-missing`(predev)은 이미 제대로 받아 둔 CSS가 있으면
 * 건너뛴다 — 받기 실패로 남은 빈 CSS(`@font-face` 없음)는 "없음"으로 보고 다시 받는다(15차).
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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

/**
 * 받기 실패를 빌드 실패로 볼지(15차). 운영 빌드 — Cloud Run(`K_SERVICE`), CI(`CI`), `NODE_ENV=production` — 에선 그렇다.
 * `CJK_FONTS_STRICT`가 `1`/`true`면 항상, `0`/`false`면 절대(급할 때 폰트 없이라도 배포해야 하면 이 값으로 끈다).
 */
export function isStrictBuild(env = process.env) {
  const override = env.CJK_FONTS_STRICT?.trim().toLowerCase();
  if (override === '1' || override === 'true') return true;
  if (override === '0' || override === 'false') return false;
  return Boolean(env.K_SERVICE) || Boolean(env.CI && env.CI !== 'false') || env.NODE_ENV === 'production';
}

/** 이미 제대로 받아 둔 CSS인지 — 받기 실패로 남긴 빈 CSS(주석만)는 아니다. */
export function isUsableFontCss(css) {
  return typeof css === 'string' && css.includes('@font-face');
}

async function hasUsableCss(cssPath) {
  try {
    return isUsableFontCss(await readFile(cssPath, 'utf8'));
  } catch {
    return false;
  }
}

/**
 * 반환: 받기에 실패한 폰트 이름 목록. `strict`면 실패가 하나라도 있을 때 던진다(빈 CSS는 쓰지 않는다).
 * `fetchFont`는 테스트용 주입점(기본은 Google Fonts에서 받는 `vendorFont`).
 */
export async function main(outDir, { ifMissing = false, strict = false, fetchFont = vendorFont } = {}) {
  await mkdir(outDir, { recursive: true });
  const failed = [];
  for (const font of CJK_FONTS) {
    const cssPath = path.join(outDir, `${font.id}.css`);
    if (ifMissing && (await hasUsableCss(cssPath))) continue;
    try {
      const count = await fetchFont(font, outDir);
      console.log(`[vendor-cjk-fonts] ${font.family}: 파일 ${count}개`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failed.push(font.family);
      if (strict) {
        console.error(`[vendor-cjk-fonts] ${font.family} 받기 실패(운영 빌드라 중단):`, message);
        continue;
      }
      // 로컬에선 멈추지 않는다 — 제목만 시스템 세리프로 보인다. 빈 CSS를 써서 <link>가 404를 내지 않게.
      console.warn(`[vendor-cjk-fonts] ${font.family} 받기 실패, 시스템 세리프로 대체:`, message);
      await writeFile(cssPath, `/* ${font.family}: 빌드 때 받기 실패 — 시스템 세리프 사용 */\n`);
    }
  }
  if (strict && failed.length > 0) {
    throw new Error(
      `CJK 세리프 받기 실패: ${failed.join(', ')} — 빌드 서버의 fonts.googleapis.com·fonts.gstatic.com 접근을 확인하세요` +
        '(폰트 없이라도 배포해야 하면 CJK_FONTS_STRICT=0).',
    );
  }
  return failed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const ifMissing = process.argv.includes('--if-missing');
  try {
    // predev(--if-missing)는 개발 서버 시작이라 운영 빌드 판정과 무관하게 멈추지 않는다.
    await main(path.join(root, 'public', 'fonts'), { ifMissing, strict: !ifMissing && isStrictBuild() });
  } catch (error) {
    console.error(`[vendor-cjk-fonts] ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
