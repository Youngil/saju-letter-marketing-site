import type { MarketingDictionary } from '@/dictionaries/types';
import type { ToneGroup } from '@/lib/languages';

/**
 * 톤 2그룹의 "컴포넌트 변형 층"(레이아웃 자체가 달라져야 하는 곳) — toneGroup 하나로만
 * 분기한다(언어별 6갈래 분기 아님). 문구는 항상 dictionary에서 온다 — 이 컴포넌트는 어떤
 * 레이아웃을 쓸지만 결정하고, 단어 선택에는 관여하지 않는다(src/lib/languages.ts 참고).
 *
 * 인포그래픽은 외부 이미지/영상 에셋이 아니라 인라인 SVG/HTML로 직접 그린다. 사용자가 참고로
 * 보여준 두 번째 이미지(사주 4기둥 일러스트 + 점성술 궤도 일러스트, 2026-08-08)의 만듦새를
 * 최대한 가깝게 재현했다 — 배경 아치선/반짝임, 기둥별 아이콘+2줄 라벨, 점선으로 중앙 매듭
 * 아이콘에 모이는 구조(사주), 동심원 궤도+태양 글리프+행성 기호 배지(점성술). 다만 실제 이미지
 * 파일을 자르거나 그대로 가져올 수는 없어서(이 사이트는 6개 언어 텍스트가 그림 위에 얹히므로
 * 외부 래스터 이미지 대신 항상 인라인 SVG/HTML로 직접 그린다 — 언어가 바뀌어도 재생성 없이
 * 그대로 재사용되고, 라벨 텍스트도 실제 번역 문자열로 나온다), 같은 구조를 코드로 새로 그렸다.
 *
 * 두 가지는 의도적으로 다르게 했다: (1) 참고 이미지의 4가지 기둥 아이콘(해/잎/사람/달)은
 * 유지했다 — 오행(나무/불/산/금속/물) 5원소 매핑이 아니라 "연/월/일/시" 각각을 구분하는
 * 중립적인 4개 아이콘이라 §8 가드레일(오행 명칭 노출 금지)과 부딪히지 않는다고 판단했다.
 * (2) 참고 이미지 맨 아래의 CTA 배너와 "Trusted by Global Users" 신뢰 배지는 여전히 넣지
 * 않았다 — CTA는 바로 아래 데모 섹션과 중복되고, 신뢰 배지는 신규 사이트에 근거 없는 주장이다.
 * pillarLabels는 새 dict 필드를 추가하는 대신 이미 존재하는 dict.demo의 년/월/일/시 라벨을
 * 그대로 재사용한다(호출부인 page.tsx 참고).
 */
export function AstrologyInfographic({
  dict,
  toneGroup,
  pillarLabels,
}: {
  dict: MarketingDictionary['infographic'];
  toneGroup: ToneGroup;
  pillarLabels: { year: string; month: string; day: string; hour: string };
}) {
  const isTraditionLed = toneGroup === 'lean-into-tradition';
  const pillars = [pillarLabels.year, pillarLabels.month, pillarLabels.day, pillarLabels.hour];

  return (
    <section
      className={`card-surface rounded-3xl border border-foreground/10 p-6 sm:p-8 ${isTraditionLed ? 'ring-1 ring-accent-warm/20' : ''}`}
    >
      <div className="mb-6 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold tracking-wide text-foreground/50 uppercase">
          <SparkleIcon />
          {dict.eyebrow}
        </span>
        <h2 className="mt-3 text-xl font-semibold sm:text-2xl">{dict.title}</h2>
        <p className="mt-2 max-w-2xl text-foreground/70 sm:mx-0 mx-auto">{dict.subtitle}</p>
      </div>

      <div className={`grid gap-6 ${isTraditionLed ? 'md:grid-cols-[1fr_1.15fr]' : 'md:grid-cols-2'}`}>
        {/* 서양 별자리 */}
        <div className="flex flex-col rounded-2xl border border-foreground/10 bg-white p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/8 text-foreground/60">
              <RingedPlanetIcon />
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground/80">{dict.zodiacLabel}</div>
              <div className="text-xs text-foreground/50">{dict.zodiacHeadline}</div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/65">{dict.zodiacDescription}</p>

          <div className="flex items-center justify-center py-6">
            <AstrologyOrbitIllustration />
          </div>

          <div className="mt-auto flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {dict.zodiacTags.map((tag) => (
              <span key={tag} className="rounded-full border border-foreground/15 bg-white px-2.5 py-1 text-[11px] font-medium text-foreground/60">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 사주 */}
        <div className="flex flex-col rounded-2xl border border-accent-warm/25 bg-accent-warm-soft/40 p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-warm/15 text-accent-warm">
              <FourGridIcon />
            </span>
            <div>
              <div className="text-sm font-semibold text-accent-warm">{dict.sajuLabel}</div>
              <div className="text-xs text-accent-warm/70">{dict.sajuHeadline}</div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/65">{dict.sajuDescription}</p>

          <div className="flex justify-center py-4">
            <SajuPillarsIllustration pillars={pillars} caption={dict.sajuCombineCaption} />
          </div>

          <div className="mt-auto flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {dict.sajuTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-accent-warm/30 bg-white px-2.5 py-1 text-[11px] font-medium text-accent-warm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 요약 비교 표 — "주로 다루는 것" 행이 별자리=성격/특성, 사주=흐름/타이밍이라는, 이
          서비스가 "매일의 흐름을 짧은 편지로 전한다"는 제품 자체의 포지셔닝과도 맞아떨어지는
          실제 차이를 담는다(단정적 예측 주장이 아니라 각 시스템이 주로 다루는 주제 차이). */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-foreground/10">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="bg-foreground/[0.03] text-xs tracking-wide text-foreground/50">
              <th className="px-4 py-3 text-left font-medium">{dict.compareCategoryLabel}</th>
              <th className="px-4 py-3 text-left font-medium">{dict.zodiacLabel}</th>
              <th className="px-4 py-3 text-left font-medium text-accent-warm">{dict.sajuLabel}</th>
            </tr>
          </thead>
          <tbody>
            {dict.compareRows.map((row, i) => (
              <tr key={row.category} className="border-t border-foreground/10 align-top">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-medium text-foreground/70">
                    <span className="text-foreground/35">{ROW_ICONS[i % ROW_ICONS.length]}</span>
                    {row.category}
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {row.zodiac}
                  {row.zodiacNote && <div className="mt-0.5 text-xs text-foreground/45">{row.zodiacNote}</div>}
                </td>
                <td className="px-4 py-3 text-foreground/85">
                  {row.saju}
                  {row.sajuNote && <div className="mt-0.5 text-xs text-accent-warm/70">{row.sajuNote}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * 사주 일러스트 — 년/월/일/시 네 기둥(각각 고유 아이콘+2줄 라벨) → 점선으로 중앙의 매듭
 * 아이콘에 모이는 구조. 라벨 길이가 언어마다 크게 달라서(예: "년" vs "Year" vs "Ngày sinh"급
 * 단어들) 연결선은 SVG로 정교하게 그리는 대신 CSS(가로 점선 + 짧은 세로선)로 단순화했다 —
 * 텍스트가 있는 요소는 항상 일반 HTML로 두고(리플로우 가능), 순수 장식 요소만 SVG/절대 위치를
 * 쓴다는 원칙을 지키기 위함(반응형에서 깨지기 쉬운 절대 좌표 계산을 텍스트 근처에 두지 않음).
 */
function SajuPillarsIllustration({ pillars, caption }: { pillars: string[]; caption: string }) {
  const icons = [SunGlyph, LeafIcon, PersonIcon, CrescentMoonIcon];
  const tints = ['text-amber-600 bg-amber-50', 'text-rose-600 bg-rose-50', 'text-emerald-600 bg-emerald-50', 'text-sky-600 bg-sky-50'];
  const sparkles = [
    { top: '-4%', left: '4%' },
    { top: '2%', right: '2%' },
    { top: '28%', left: '-2%' },
    { top: '30%', right: '-4%' },
  ];

  return (
    <div className="relative flex w-full max-w-[260px] flex-col items-center">
      <svg
        viewBox="0 0 220 90"
        className="pointer-events-none absolute -top-6 left-1/2 h-20 w-full -translate-x-1/2 opacity-50"
        aria-hidden="true"
      >
        <path d="M 10 90 A 100 100 0 0 1 210 90" fill="none" stroke="var(--accent-warm)" strokeWidth="1" />
        <path d="M 35 90 A 75 75 0 0 1 185 90" fill="none" stroke="var(--accent-warm)" strokeWidth="1" />
        <path d="M 60 90 A 50 50 0 0 1 160 90" fill="none" stroke="var(--accent-warm)" strokeWidth="1" />
      </svg>
      {sparkles.map((pos, i) => (
        <span key={i} className="pointer-events-none absolute text-accent-warm/40" style={pos} aria-hidden="true">
          <SparkleIcon />
        </span>
      ))}

      <div className="relative flex gap-1.5 sm:gap-2">
        {pillars.map((label, i) => {
          const Icon = icons[i];
          return (
            <div
              key={i}
              className="flex w-12 flex-col items-center gap-1 rounded-xl border border-foreground/10 bg-white px-1 py-2.5 shadow-sm sm:w-16 sm:gap-1.5 sm:py-3"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full sm:h-7 sm:w-7 ${tints[i]}`}>
                <Icon />
              </span>
              <span className="text-center text-[9px] leading-tight font-bold tracking-wide text-foreground/70 uppercase sm:text-[10px]">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 w-full max-w-[210px] border-t border-dashed border-accent-warm/35" aria-hidden="true" />
      <div className="h-3 w-px bg-accent-warm/35" aria-hidden="true" />
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-warm/30 bg-white text-accent-warm shadow-sm">
        <KnotIcon />
      </span>
      <p className="mt-1.5 max-w-[180px] text-center text-[11px] text-foreground/50">{caption}</p>
    </div>
  );
}

/**
 * 점성술 일러스트 — 동심원 궤도(점선) + 중심 태양 글리프 + 궤도를 따라 흩뿌려진 작은 점(행성) +
 * 모서리에 배치한 4개 배지. 배지 안 기호(☽♆♄♀)는 실제 서양 점성술/천문학 기호(유니코드)라
 * 번역이 필요 없는 고유 표기다 — 오행 문제와 무관하게 어느 언어에서든 그대로 재사용된다.
 */
function AstrologyOrbitIllustration() {
  const dots = [
    { r: 34, deg: 20 },
    { r: 34, deg: 200 },
    { r: 24, deg: 100 },
    { r: 24, deg: 280 },
    { r: 44, deg: 150 },
    { r: 44, deg: 330 },
  ];

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full text-accent/30" aria-hidden="true">
        {[44, 34, 24].map((r) => (
          <circle key={r} cx={60} cy={60} r={r} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="2.5 4" />
        ))}
        {dots.map(({ r, deg }, i) => {
          const rad = (deg * Math.PI) / 180;
          return <circle key={i} cx={60 + r * Math.cos(rad)} cy={60 + r * Math.sin(rad)} r={2} className="fill-accent/60" />;
        })}
        <g className="text-accent" transform="translate(60 60)">
          <circle r={11} fill="var(--background)" stroke="currentColor" strokeWidth={1.4} />
          {Array.from({ length: 8 }).map((_, i) => {
            const rad = (i / 8) * 2 * Math.PI;
            const x1 = 14 * Math.cos(rad);
            const y1 = 14 * Math.sin(rad);
            const x2 = 18 * Math.cos(rad);
            const y2 = 18 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />;
          })}
        </g>
      </svg>

      <span className="pointer-events-none absolute top-1 right-2 text-accent/50" aria-hidden="true">
        <SparkleIcon />
      </span>
      <span className="pointer-events-none absolute bottom-3 left-0 text-accent/40" aria-hidden="true">
        <SparkleIcon />
      </span>

      <PlanetBadge symbol="☽" className="-top-2 left-1/2 -translate-x-1/2" />
      <PlanetBadge symbol="♆" className="top-6 -left-3" />
      <PlanetBadge symbol="♄" className="-bottom-2 left-2" />
      <PlanetBadge symbol="♀" className="-bottom-2 right-0" />
    </div>
  );
}

function PlanetBadge({ symbol, className }: { symbol: string; className: string }) {
  return (
    <span
      className={`absolute flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-white text-sm text-accent shadow-sm ${className}`}
      aria-hidden="true"
    >
      {symbol}
    </span>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

function RingedPlanetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M14.5 12.2A6.2 6.2 0 1 1 7.6 3.5a7.2 7.2 0 1 0 8.5 9.2c-.5.1-1.1.1-1.6-.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18.5 4.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z" fill="currentColor" />
    </svg>
  );
}

function FourGridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function SunGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      {Array.from({ length: 8 }).map((_, i) => {
        const rad = (i / 8) * 2 * Math.PI;
        const x1 = 12 + 8 * Math.cos(rad);
        const y1 = 12 + 8 * Math.sin(rad);
        const x2 = 12 + 10.5 * Math.cos(rad);
        const y2 = 12 + 10.5 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 18c-2-6 1-12 12-13 1 10-4 14-12 13Z" />
      <path d="M7 17c2-3 5-6 10-9" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20c1-4 4-6 6.5-6s5.5 2 6.5 6" />
    </svg>
  );
}

function CrescentMoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M15.5 12.5A6.5 6.5 0 1 1 8.3 3.2a7.5 7.5 0 1 0 8.9 9.6c-.5.1-1.1.1-1.7-.3Z" />
    </svg>
  );
}

function KnotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1.5" transform="rotate(45 12 12)" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" transform="rotate(45 12 12)" />
    </svg>
  );
}

/** 표 행 왼쪽의 작은 장식 아이콘 — 언어 무관 도형이라 dict가 아니라 인덱스로 고정 매핑한다. */
const ROW_ICONS = ['◧', '◔', '◫', '◎'];
