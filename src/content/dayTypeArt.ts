import type { HeavenlyStem } from '@/lib/sajuVocabulary';

/**
 * 날 유형 그림 10장 — 모바일 `saju-letter-mobile/src/components/day-type/dayTypeShapes.ts`의 사본(2026-10-31, 사이트 날 유형 결과
 * 카드·`/[lang]/type/[slug]` 페이지·OG 이미지). 앱의 날 유형 공유 카드가 "saju-letter.com에서 생일만 넣으면 알 수 있어요"로 보내므로
 * 같은 그림을 보여 준다. 머리 주석·import 아래 본문은 모바일과 글자 그대로 같아야 한다(`dayTypeCopyDrift.test.ts`) — 함께 고친다.
 * viewBox 0 0 120 120, 색 토큰 deep·main·soft·shine은 `lib/dayTypeArtSvg.ts`가 오행 색으로 칠한다.
 */
export type ArtTone = 'deep' | 'main' | 'soft' | 'shine';

/** 배경 원(가운데 60,60 반지름 54) — 땅·물결처럼 가장자리까지 가는 면은 이 원으로 잘라 그린다. */
export const ART_CLIP = { cx: 60, cy: 60, r: 54 } as const;

export type ArtShape =
  | { kind: 'path'; d: string; fill?: ArtTone; stroke?: ArtTone; strokeWidth?: number; opacity?: number }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill?: ArtTone; stroke?: ArtTone; strokeWidth?: number; opacity?: number };

const BACKDROP: ArtShape = { kind: 'circle', cx: 60, cy: 60, r: 54, fill: 'soft' };

/** 태양의 빛살 12개 — 짧고 둥근 선. */
function sunRays(): ArtShape[] {
  const rays: ArtShape[] = [];
  for (let i = 0; i < 12; i += 1) {
    const a = (Math.PI * 2 * i) / 12;
    const r1 = 31;
    const r2 = i % 2 === 0 ? 43 : 39;
    const x1 = (60 + Math.cos(a) * r1).toFixed(1);
    const y1 = (60 + Math.sin(a) * r1).toFixed(1);
    const x2 = (60 + Math.cos(a) * r2).toFixed(1);
    const y2 = (60 + Math.sin(a) * r2).toFixed(1);
    rays.push({ kind: 'path', d: `M${x1} ${y1}L${x2} ${y2}`, stroke: 'main', strokeWidth: 4.5 });
  }
  return rays;
}

export const DAY_TYPE_ART: Record<HeavenlyStem, ArtShape[]> = {
  // 나무 — 곧은 줄기와 겹친 둥근 잎, 땅 한 줄.
  甲: [
    BACKDROP,
    { kind: 'path', d: 'M22 92H98', stroke: 'deep', strokeWidth: 3, opacity: 0.5 },
    { kind: 'path', d: 'M56 92V62C56 58 58 55 60 55C62 55 64 58 64 62V92Z', fill: 'deep' },
    { kind: 'path', d: 'M60 72L48 62M60 66L71 57', stroke: 'deep', strokeWidth: 3 },
    { kind: 'circle', cx: 45, cy: 52, r: 16, fill: 'main' },
    { kind: 'circle', cx: 75, cy: 50, r: 17, fill: 'main' },
    { kind: 'circle', cx: 60, cy: 37, r: 19, fill: 'main' },
    { kind: 'circle', cx: 60, cy: 37, r: 19, fill: 'shine', opacity: 0.12 },
    { kind: 'path', d: 'M50 33C53 28 58 26 63 27', stroke: 'shine', strokeWidth: 2.5, opacity: 0.55 },
  ],
  // 화초 — 휘어진 줄기, 잎 두 장, 다섯 꽃잎.
  乙: [
    BACKDROP,
    { kind: 'path', d: 'M60 96C58 82 63 70 60 54', stroke: 'deep', strokeWidth: 3.2 },
    { kind: 'path', d: 'M59 80C49 80 41 74 38 66C47 65 55 70 59 80Z', fill: 'main' },
    { kind: 'path', d: 'M61 72C70 70 77 63 79 55C70 55 63 61 61 72Z', fill: 'main' },
    { kind: 'circle', cx: 60, cy: 30, r: 9.5, fill: 'main' },
    { kind: 'circle', cx: 71, cy: 38, r: 9.5, fill: 'main' },
    { kind: 'circle', cx: 67, cy: 51, r: 9.5, fill: 'main' },
    { kind: 'circle', cx: 53, cy: 51, r: 9.5, fill: 'main' },
    { kind: 'circle', cx: 49, cy: 38, r: 9.5, fill: 'main' },
    { kind: 'circle', cx: 60, cy: 42, r: 7, fill: 'deep' },
    { kind: 'circle', cx: 58, cy: 40, r: 2.2, fill: 'shine', opacity: 0.7 },
  ],
  // 태양 — 둥근 해와 빛살.
  丙: [
    BACKDROP,
    ...sunRays(),
    { kind: 'circle', cx: 60, cy: 60, r: 24, fill: 'main' },
    { kind: 'circle', cx: 60, cy: 60, r: 24, stroke: 'deep', strokeWidth: 2.5, opacity: 0.6 },
    { kind: 'path', d: 'M47 54C49 47 55 43 62 43', stroke: 'shine', strokeWidth: 3, opacity: 0.55 },
  ],
  // 불꽃 — 타오르는 불꽃 하나(바깥 불꽃 · 안쪽 불꽃 · 튀는 불티 둘), 아래에 작은 불씨 받침.
  丁: [
    BACKDROP,
    { kind: 'path', d: 'M60 14C68 28 82 38 82 60C82 78 72 92 60 92C48 92 38 78 38 60C38 50 43 43 48 37C49 45 52 50 56 52C54 40 56 26 60 14Z', fill: 'main' },
    { kind: 'path', d: 'M60 44C65 52 72 59 72 70C72 80 66.5 87 60 87C53.5 87 48 80 48 70C48 63 52 58 55 54C56 59 58 62 60 63C59 56 59 50 60 44Z', fill: 'deep' },
    { kind: 'path', d: 'M60 64C63 69 66 72 66 77C66 82 63 85 60 85C57 85 54 82 54 77C54 73 57 69 60 64Z', fill: 'shine', opacity: 0.85 },
    { kind: 'circle', cx: 86, cy: 34, r: 2.6, fill: 'main' },
    { kind: 'circle', cx: 34, cy: 44, r: 2, fill: 'main', opacity: 0.8 },
    { kind: 'path', d: 'M42 98H78', stroke: 'deep', strokeWidth: 3.2, opacity: 0.6 },
  ],
  // 산 — 겹친 두 봉우리, 높은 쪽에 눈.
  戊: [
    BACKDROP,
    { kind: 'path', d: 'M14 92L46 48L62 70L76 52L106 92Z', fill: 'main' },
    { kind: 'path', d: 'M34 92L62 34L92 92Z', fill: 'deep' },
    { kind: 'path', d: 'M54 50L62 34L70 50L66 47L62 52L58 47Z', fill: 'shine', opacity: 0.85 },
    { kind: 'path', d: 'M14 92H106', stroke: 'deep', strokeWidth: 3 },
  ],
  // 대지 — 넓게 펼쳐진 땅(두 겹 흙)과 그 위에서 자라는 작은 싹.
  己: [
    BACKDROP,
    { kind: 'path', d: 'M6 74C30 62 50 60 66 66C80 71 94 70 114 63V116H6Z', fill: 'main' },
    { kind: 'path', d: 'M6 85C34 76 56 76 76 81C88 84 98 83 114 78V116H6Z', fill: 'deep' },
    { kind: 'path', d: 'M60 66V50', stroke: 'deep', strokeWidth: 3 },
    { kind: 'path', d: 'M60 56C54 56 49 52 48 46C54 46 59 50 60 56Z', fill: 'deep' },
    { kind: 'path', d: 'M60 52C66 52 71 48 72 42C66 42 61 46 60 52Z', fill: 'deep' },
  ],
  // 바위 — 각진 큰 바위와 면, 작은 돌.
  庚: [
    BACKDROP,
    { kind: 'path', d: 'M20 92L28 62L48 42L74 46L94 66L100 92Z', fill: 'main' },
    { kind: 'path', d: 'M48 42L56 66L28 62M56 66L94 66M56 66L62 92', stroke: 'deep', strokeWidth: 2.6, opacity: 0.7 },
    { kind: 'path', d: 'M48 42L74 46L56 66Z', fill: 'shine', opacity: 0.22 },
    { kind: 'path', d: 'M84 92L88 82L98 80L104 92Z', fill: 'deep' },
    { kind: 'path', d: 'M16 92H106', stroke: 'deep', strokeWidth: 3 },
  ],
  // 보석 — 깎은 면이 있는 보석과 반짝임.
  辛: [
    BACKDROP,
    { kind: 'path', d: 'M34 46L46 32H74L86 46L60 92Z', fill: 'main' },
    { kind: 'path', d: 'M34 46H86M46 32L52 46L60 92M74 32L68 46L60 92M52 46L60 32L68 46', stroke: 'deep', strokeWidth: 2.2, opacity: 0.75 },
    { kind: 'path', d: 'M46 32H60L52 46H34Z', fill: 'shine', opacity: 0.35 },
    { kind: 'path', d: 'M92 22V34M86 28H98', stroke: 'main', strokeWidth: 2.6 },
    { kind: 'path', d: 'M26 70V78M22 74H30', stroke: 'main', strokeWidth: 2.2, opacity: 0.8 },
  ],
  // 바다 — 깊이가 다른 물결 세 겹.
  壬: [
    BACKDROP,
    { kind: 'path', d: 'M2 56C10 48 30 48 38 56C46 64 54 64 62 56C70 48 78 48 86 56C94 64 104 64 118 58V118H2Z', fill: 'soft' },
    { kind: 'path', d: 'M2 60C10 52 30 52 38 60C46 68 54 68 62 60C70 52 78 52 86 60C94 68 104 68 118 62V118H2Z', fill: 'main', opacity: 0.55 },
    { kind: 'path', d: 'M2 72C10 64 30 64 38 72C46 80 54 80 62 72C70 64 78 64 86 72C94 80 104 80 118 74V118H2Z', fill: 'main' },
    { kind: 'path', d: 'M2 86C10 78 30 78 38 86C46 94 54 94 62 86C70 78 78 78 86 86C94 94 104 94 118 88V118H2Z', fill: 'deep' },
    { kind: 'path', d: 'M30 66C34 63 38 63 41 66', stroke: 'shine', strokeWidth: 2.4, opacity: 0.6 },
  ],
  // 이슬 — 잎 위의 물방울 하나.
  癸: [
    BACKDROP,
    { kind: 'path', d: 'M18 86C36 62 66 56 100 64C84 84 52 96 18 86Z', fill: 'main' },
    { kind: 'path', d: 'M22 84C46 76 70 70 96 65', stroke: 'deep', strokeWidth: 2.4, opacity: 0.7 },
    { kind: 'path', d: 'M60 26C66 36 72 44 72 52C72 59 66.5 64 60 64C53.5 64 48 59 48 52C48 44 54 36 60 26Z', fill: 'deep' },
    { kind: 'path', d: 'M60 26C66 36 72 44 72 52C72 59 66.5 64 60 64C53.5 64 48 59 48 52C48 44 54 36 60 26Z', fill: 'main', opacity: 0.45 },
    { kind: 'path', d: 'M54 50C54 46 56 42 58 40', stroke: 'shine', strokeWidth: 3, opacity: 0.8 },
  ],
};
