import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 날 유형 그림·한 줄 사본 어긋남 감시(2026-10-31) — `dayTypeArt.ts`·`dayTypeTraits.ts`는 모바일 사본이다. 사이트 결과 카드가 앱 공유 카드와
 * 다른 그림·문장을 보여 주지 않게, 형제 저장소가 있으면 import 줄과 첫 머리 주석을 뺀 본문이 글자 그대로 같은지 본다(import 경로는
 * 저장소마다 다르다). 없으면(CI·단독 클론) 건너뛴다 — `sajuCopyDrift.test.ts`와 같은 방식, 경로는 `SAJU_MOBILE_REPO`.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const mobileRepo = process.env.SAJU_MOBILE_REPO ?? path.resolve(here, '../../../saju-letter-mobile');
const siblingPresent = existsSync(path.join(mobileRepo, 'src'));

function body(source: string): string {
  const normalized = source.replace(/\r\n/g, '\n');
  const start = normalized.indexOf('/**');
  const end = normalized.indexOf('*/', start);
  const withoutHeader = start === -1 || end === -1 ? normalized : normalized.slice(0, start) + normalized.slice(end + 2);
  return withoutHeader.replace(/^import [^\n]*\n/gm, '').trim();
}

const COPIES = [
  { site: 'dayTypeArt.ts', mobile: 'src/components/day-type/dayTypeShapes.ts' },
  { site: 'dayTypeTraits.ts', mobile: 'src/domain/saju/dayTypeTraits.ts' },
];

describe('모바일 날 유형 사본과 같은가', () => {
  if (!siblingPresent) console.warn(`[dayTypeCopyDrift] 형제 저장소가 없어 비교를 건너뜀: ${mobileRepo}`);

  for (const { site, mobile } of COPIES) {
    it.skipIf(!siblingPresent)(`src/content/${site} = saju-letter-mobile/${mobile} (import·머리 주석 제외)`, () => {
      const siteBody = body(readFileSync(path.join(here, site), 'utf8'));
      const mobileBody = body(readFileSync(path.join(mobileRepo, mobile), 'utf8'));
      expect(siteBody, `${site}가 모바일 원본과 다르다 — 두 저장소를 함께 고칠 것`).toBe(mobileBody);
    });
  }
});
