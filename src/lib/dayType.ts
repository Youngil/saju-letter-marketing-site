import { ART_CLIP, DAY_TYPE_ART, type ArtShape, type ArtTone } from '@/content/dayTypeArt';
import { HEAVENLY_STEMS, type HeavenlyStem } from './sajuVocabulary';
import { WEB_BASE_URL } from './seo';

/**
 * 날 유형(일간) 페이지 주소 이름(2026-10-31) — `/[lang]/type/[slug]`. 영어 별명(`dayTypeNicknames.ts`의 en)과 같다. 주소엔 생일이
 * 들어가지 않는다(공유 링크가 그 사람의 생일을 알리지 않게 — 10개 고정 페이지).
 */
export const DAY_TYPE_SLUGS: Record<HeavenlyStem, string> = {
  甲: 'tree',
  乙: 'flower',
  丙: 'sun',
  丁: 'flame',
  戊: 'mountain',
  己: 'land',
  庚: 'rock',
  辛: 'jewel',
  壬: 'sea',
  癸: 'dew',
};

export function stemFromDayTypeSlug(slug: string): HeavenlyStem | null {
  return HEAVENLY_STEMS.find((stem) => DAY_TYPE_SLUGS[stem] === slug) ?? null;
}

export function dayTypePath(lang: string, stem: HeavenlyStem): string {
  return `/${lang}/type/${DAY_TYPE_SLUGS[stem]}`;
}

/**
 * 데모 결과의 "친구에게 보내기" 주소 — 유입 꼬리표를 붙여 공유로 들어온 방문(page_view의 utm)과 그 뒤 설치(Play referrer,
 * `attribution.ts`)를 GA 이벤트 없이 잰다(새 이벤트를 만들지 않아 처리방침 §1 그대로).
 */
export function dayTypeShareUrl(lang: string, stem: HeavenlyStem): string {
  return `${WEB_BASE_URL}${dayTypePath(lang, stem)}?utm_source=friend_share&utm_medium=referral&utm_campaign=day_type`;
}

/** 일간 → 오행 그룹(색 고르기에만 쓴다 — 화면엔 오행 이름을 쓰지 않는다). */
const STEM_GROUP: Record<HeavenlyStem, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
  甲: 'wood',
  乙: 'wood',
  丙: 'fire',
  丁: 'fire',
  戊: 'earth',
  己: 'earth',
  庚: 'metal',
  辛: 'metal',
  壬: 'water',
  癸: 'water',
};

/**
 * 그림 색 — 모바일 `constants/theme.ts`의 라이트 팔레트(main = ElementColors, deep = ElementTextColors, soft = ElementTints)와
 * 같은 값이다. 앱 공유 카드가 늘 라이트로 그려지므로 사이트도 라이트만. 1.1.9에서 앱 오행 색을 바꾸면(`docs/visual-depth-palette-design.md`)
 * 여기도 같이 바꾼다.
 */
const PALETTES: Record<(typeof STEM_GROUP)[HeavenlyStem], Omit<Record<ArtTone, string>, 'shine'>> = {
  wood: { main: '#3A7D5A', deep: '#377655', soft: '#E4F1EA' },
  fire: { main: '#E4572E', deep: '#B83C18', soft: '#F9E3DC' },
  earth: { main: '#C28D40', deep: '#8A632C', soft: '#F4ECE1' },
  metal: { main: '#7A7D85', deep: '#666970', soft: '#EAEAEB' },
  water: { main: '#2C6CB0', deep: '#2B69AC', soft: '#E0EAF6' },
};

const SHINE = '#FFFDF8';

export function dayTypeColors(stem: HeavenlyStem): Record<ArtTone, string> {
  return { ...PALETTES[STEM_GROUP[stem]], shine: SHINE };
}

export interface ResolvedArtShape {
  kind: ArtShape['kind'];
  attrs: Record<string, string | number>;
}

/** 그림 한 장의 도형을 색까지 정해 돌려준다 — 첫 도형(배경 원)은 잘라 그리지 않고, 나머지는 배경 원으로 잘라 그린다. */
export function resolveDayTypeArt(stem: HeavenlyStem): { backdrop: ResolvedArtShape | null; shapes: ResolvedArtShape[] } {
  const colors = dayTypeColors(stem);
  const [backdrop, ...shapes] = DAY_TYPE_ART[stem];
  const resolve = (shape: ArtShape): ResolvedArtShape => {
    const attrs: Record<string, string | number> = {
      fill: shape.fill ? colors[shape.fill] : 'none',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    };
    if (shape.stroke) {
      attrs.stroke = colors[shape.stroke];
      attrs['stroke-width'] = shape.strokeWidth ?? 2;
    }
    if (shape.opacity !== undefined) attrs.opacity = shape.opacity;
    if (shape.kind === 'circle') Object.assign(attrs, { cx: shape.cx, cy: shape.cy, r: shape.r });
    else attrs.d = shape.d;
    return { kind: shape.kind, attrs };
  };
  return { backdrop: backdrop ? resolve(backdrop) : null, shapes: shapes.map(resolve) };
}

function shapeMarkup({ kind, attrs }: ResolvedArtShape): string {
  const list = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  return `<${kind} ${list}/>`;
}

/** SVG 문서 한 장(OG 이미지가 data URI로 쓴다). 값은 모두 코드에 있는 고정 데이터라 따로 이스케이프하지 않는다. */
export function dayTypeArtSvg(stem: HeavenlyStem, size = 120): string {
  const { backdrop, shapes } = resolveDayTypeArt(stem);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">` +
    `<defs><clipPath id="c"><circle cx="${ART_CLIP.cx}" cy="${ART_CLIP.cy}" r="${ART_CLIP.r}"/></clipPath></defs>` +
    (backdrop ? shapeMarkup(backdrop) : '') +
    `<g clip-path="url(#c)">${shapes.map(shapeMarkup).join('')}</g></svg>`
  );
}
