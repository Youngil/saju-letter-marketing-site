import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 사주 계산 사본 어긋남 감시(2026-10-10 전체 점검 14차) — `birthClock.ts`·`koreanLunar.ts`는 모바일
 * `saju-letter-mobile/src/domain/saju/`의 사본이다(CLAUDE.md §4 "함께 바꾼다"). 사람이 기억하는 규칙만으론 한쪽만 고쳐질 수
 * 있어(데모가 앱과 다른 일간을 보여 준다), 형제 저장소가 같은 작업 폴더에 있으면 두 파일의 코드 본문이 글자 그대로 같은지
 * 확인한다. 머리 설명 주석(첫 `/** … *\/` 블록)은 저장소마다 "어디의 사본인지"가 달라 빼고 비교한다.
 *
 * 형제 저장소가 없으면(CI·단독 클론) 건너뛴다 — 경로는 `SAJU_MOBILE_REPO` 환경변수로 바꿀 수 있다.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const mobileRepo = process.env.SAJU_MOBILE_REPO ?? path.resolve(here, '../../../saju-letter-mobile');
const mobileSajuDir = path.join(mobileRepo, 'src', 'domain', 'saju');
const siblingPresent = existsSync(mobileSajuDir);

/** 줄바꿈을 맞추고 첫 JSDoc 블록(파일 머리 설명)을 뺀다. 그 앞의 import 줄은 그대로 비교한다. */
function stripHeaderComment(source: string): string {
  const normalized = source.replace(/\r\n/g, '\n');
  const start = normalized.indexOf('/**');
  if (start === -1) return normalized;
  const end = normalized.indexOf('*/', start);
  if (end === -1) return normalized;
  return normalized.slice(0, start) + normalized.slice(end + 2);
}

describe('stripHeaderComment', () => {
  it('첫 JSDoc 블록만 빼고 줄바꿈을 맞춘다', () => {
    const source = "import a from 'a';\r\n\r\n/**\r\n * 사본 설명\r\n */\r\nexport const x = 1;\r\n/** 남는 주석 */\r\n";
    expect(stripHeaderComment(source)).toBe("import a from 'a';\n\n\nexport const x = 1;\n/** 남는 주석 */\n");
  });
});

const COPIES: { site: string; mobile: string }[] = [
  { site: 'birthClock.ts', mobile: 'birthClock.ts' },
  { site: 'koreanLunar.ts', mobile: 'koreanLunar.ts' },
];

describe('모바일 사주 계산 사본과 같은 코드인가', () => {
  if (!siblingPresent) {
    // 조용히 통과한 것처럼 보이지 않게 이유를 남긴다.
    console.warn(`[sajuCopyDrift] 형제 저장소가 없어 비교를 건너뜀: ${mobileSajuDir} (SAJU_MOBILE_REPO로 경로 지정 가능)`);
  }

  for (const { site, mobile } of COPIES) {
    it.skipIf(!siblingPresent)(`src/lib/${site} = saju-letter-mobile/src/domain/saju/${mobile} (머리 주석 제외)`, () => {
      const siteBody = stripHeaderComment(readFileSync(path.join(here, site), 'utf8'));
      const mobileBody = stripHeaderComment(readFileSync(path.join(mobileSajuDir, mobile), 'utf8'));
      expect(siteBody, `${site}가 모바일 사본과 다르다 — 두 저장소를 함께 고칠 것`).toBe(mobileBody);
    });
  }
});
