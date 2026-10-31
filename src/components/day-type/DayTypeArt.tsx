import { ART_CLIP } from '@/content/dayTypeArt';
import { resolveDayTypeArt, type ResolvedArtShape } from '@/lib/dayType';
import type { HeavenlyStem } from '@/lib/sajuVocabulary';

/** SVG 속성 이름 → React prop 이름(`stroke-width` → `strokeWidth`). */
function reactAttrs(attrs: ResolvedArtShape['attrs']): Record<string, string | number> {
  return Object.fromEntries(Object.entries(attrs).map(([key, value]) => [key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), value]));
}

/**
 * 날 유형 그림(앱 `DayTypeArt.tsx`와 같은 데이터·같은 라이트 색) — 장식이라 스크린 리더에는 숨긴다(옆 글자가 뜻을 전한다).
 * 훅이 없어 서버·클라이언트 어디서나 쓴다. 한 화면에 같은 그림이 둘 이상이면 `idSuffix`로 잘라내기 id를 나눈다.
 */
export function DayTypeArt({ stem, size, idSuffix = '' }: { stem: HeavenlyStem; size: number; idSuffix?: string }) {
  const { backdrop, shapes } = resolveDayTypeArt(stem);
  const clipId = `day-type-clip-${stem.codePointAt(0)}${idSuffix}`;
  const render = (shape: ResolvedArtShape, key: string) =>
    shape.kind === 'circle' ? <circle key={key} {...reactAttrs(shape.attrs)} /> : <path key={key} {...reactAttrs(shape.attrs)} />;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId}>
          <circle cx={ART_CLIP.cx} cy={ART_CLIP.cy} r={ART_CLIP.r} />
        </clipPath>
      </defs>
      {backdrop && render(backdrop, 'bg')}
      <g clipPath={`url(#${clipId})`}>{shapes.map((shape, i) => render(shape, String(i)))}</g>
    </svg>
  );
}
