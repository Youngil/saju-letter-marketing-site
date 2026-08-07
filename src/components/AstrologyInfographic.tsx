import type { MarketingDictionary } from '@/dictionaries/types';
import type { ToneGroup } from '@/lib/languages';

/**
 * 톤 2그룹의 "컴포넌트 변형 층"(레이아웃 자체가 달라져야 하는 곳) — toneGroup 하나로만
 * 분기한다(언어별 6갈래 분기 아님). 문구는 항상 dictionary에서 온다 — 이 컴포넌트는 어떤
 * 레이아웃을 쓸지만 결정하고, 단어 선택에는 관여하지 않는다(src/lib/languages.ts 참고).
 *
 * 인포그래픽은 외부 이미지/영상 에셋이 아니라 인라인 SVG/HTML로 직접 그린다. 사용자가 참고로
 * 보여준 타 서비스 인포그래픽(2차 버전, 2026-08-08)의 만듦새 — 아이콘 배지, 카드 태그라인,
 * 조합 캡션, 4행 비교 표 — 를 따라가되 두 가지는 의도적으로 다르게 했다: (1) 카드 헤더 아이콘은
 * 오행(나무/불/산/금속/물)이 아니라 격자(4개 기둥)/고리 달린 행성(천체) 같은 중립적인 도형만
 * 쓴다 — §8 가드레일("오행 명칭 노출 금지, 서양 4원소와 혼동 방지")과 부딪힐 소지를 원천
 * 차단하기 위함. (2) 참고 이미지 맨 아래의 CTA 배너("Get My Reading")와 "Trusted by Global
 * Users" 같은 신뢰 배지는 넣지 않았다 — CTA는 바로 아래 데모 섹션과 중복되고, "글로벌 유저가
 * 신뢰"는 신규 사이트에 아직 근거 없는 주장이라 뺐다.
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

          {/* 12개 중 태어난 '달'에 해당하는 1칸만 채워진 원형 다이얼로 표현 */}
          <div className="flex items-center justify-center py-4">
            <svg viewBox="0 0 120 120" className="h-28 w-28" role="img" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
                const nextAngle = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
                const outer = 52;
                const inner = 34;
                const cx = 60;
                const cy = 60;
                const isHighlighted = i === 0;
                const path = [
                  `M ${cx + inner * Math.cos(angle)} ${cy + inner * Math.sin(angle)}`,
                  `L ${cx + outer * Math.cos(angle)} ${cy + outer * Math.sin(angle)}`,
                  `A ${outer} ${outer} 0 0 1 ${cx + outer * Math.cos(nextAngle)} ${cy + outer * Math.sin(nextAngle)}`,
                  `L ${cx + inner * Math.cos(nextAngle)} ${cy + inner * Math.sin(nextAngle)}`,
                  `A ${inner} ${inner} 0 0 0 ${cx + inner * Math.cos(angle)} ${cy + inner * Math.sin(angle)}`,
                  'Z',
                ].join(' ');
                return (
                  <path
                    key={i}
                    d={path}
                    fill={isHighlighted ? 'var(--accent)' : 'currentColor'}
                    className={isHighlighted ? '' : 'text-foreground/10'}
                    stroke="var(--background)"
                    strokeWidth={1}
                  />
                );
              })}
              <circle cx={60} cy={60} r={20} fill="var(--background)" />
              <circle cx={60} cy={60} r={20} fill="none" stroke="currentColor" className="text-foreground/15" strokeWidth={1} />
            </svg>
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

          {/* 년/월/일/시 네 기둥이 각각 2칸(천간/지지)씩으로 나뉘는 모습 + 하나로 합쳐지는 캡션 */}
          <div className="flex flex-col items-center py-4">
            <div className="flex items-center justify-center gap-3">
              {pillars.map((label, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="flex h-24 w-9 flex-col overflow-hidden rounded-lg shadow-sm">
                    <div className="flex-1" style={{ background: `color-mix(in srgb, var(--accent-warm) ${85 - i * 8}%, transparent)` }} />
                    <div className="flex-1" style={{ background: `color-mix(in srgb, var(--accent-warm) ${45 - i * 6}%, transparent)` }} />
                  </div>
                  <span className="text-[11px] font-medium text-foreground/55">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 h-3 w-px bg-accent-warm/30" aria-hidden="true" />
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-warm/15 text-accent-warm" aria-hidden="true">
              <MergeIcon />
            </span>
            <p className="mt-1.5 text-center text-[11px] text-foreground/50">{dict.sajuCombineCaption}</p>
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
      <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/10">
        <table className="w-full text-sm">
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

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

function RingedPlanetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <ellipse cx="12" cy="12" rx="10" ry="3.2" transform="rotate(-20 12 12)" />
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

function MergeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

/** 표 행 왼쪽의 작은 장식 아이콘 — 언어 무관 도형이라 dict가 아니라 인덱스로 고정 매핑한다. */
const ROW_ICONS = ['◧', '◔', '◫', '◎'];
