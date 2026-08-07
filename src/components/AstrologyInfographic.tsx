import type { MarketingDictionary } from '@/dictionaries/types';
import type { ToneGroup } from '@/lib/languages';

/**
 * 톤 2그룹의 "컴포넌트 변형 층"(레이아웃 자체가 달라져야 하는 곳) — toneGroup 하나로만
 * 분기한다(언어별 6갈래 분기 아님). 문구는 항상 dictionary에서 온다 — 이 컴포넌트는 어떤
 * 레이아웃을 쓸지만 결정하고, 단어 선택에는 관여하지 않는다(src/lib/languages.ts 참고).
 *
 * 실제 인포그래픽은 외부 이미지/영상 에셋이 아니라 인라인 SVG/HTML로 직접 그린다 — "별자리는
 * 태어난 달 하나로 정해지는 1개 값, 사주는 년/월/일/시 네 값을 조합"이라는 dict.subtitle의
 * 핵심 메시지를 글이 아니라 그림으로도 보여주기 위함(2026-08-08, 빈 플레이스홀더였던 걸 교체).
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
      <h2 className="mb-2 text-xl font-semibold sm:text-2xl">{dict.title}</h2>
      <p className="mb-8 max-w-2xl text-foreground/70">{dict.subtitle}</p>
      <div className={`grid gap-6 ${isTraditionLed ? 'md:grid-cols-[1fr_1.3fr]' : 'md:grid-cols-2'}`}>
        {/* 서양 별자리 — 12개 중 태어난 '달'에 해당하는 1칸만 채워진 원형 다이얼로 표현 */}
        <div className="rounded-2xl border border-foreground/10 bg-white p-5">
          <div className="mb-4 text-sm font-semibold text-foreground/60">{dict.zodiacLabel}</div>
          <div className="flex items-center justify-center py-2">
            <svg viewBox="0 0 120 120" className="h-32 w-32" role="img" aria-hidden="true">
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
          <p className="text-center text-xs text-foreground/50">1 / 12</p>
        </div>

        {/* 사주 — 년/월/일/시 네 기둥이 각각 2칸(천간/지지)씩으로 나뉘는 모습을 시각화 */}
        <div className="rounded-2xl border border-accent-warm/25 bg-accent-warm-soft/40 p-5">
          <div className="mb-4 text-sm font-semibold text-accent-warm">{dict.sajuLabel}</div>
          <div className="flex items-center justify-center gap-3 py-2">
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
          <p className="text-center text-xs text-foreground/50">4 × 2</p>
        </div>
      </div>
    </section>
  );
}
