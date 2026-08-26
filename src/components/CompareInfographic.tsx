/**
 * compare 페이지용 가로 한 줄 대비 인포그래픽(Phase 4 와이어 A).
 * 옛 AstrologyInfographic(궤도·카드·태그·비교표)을 대체한다 — 한 가지 일만:
 * “별자리 = 태양 위치 하나 / 사주 = 네 기둥 → 그래서 매일 편지가 가능하다”.
 */
export function CompareInfographic({
  caption,
  zodiacLabel,
  zodiacPoint,
  sajuLabel,
  pillars,
  closing,
}: {
  caption: string;
  zodiacLabel: string;
  zodiacPoint: string;
  sajuLabel: string;
  pillars: [string, string, string, string];
  closing: string;
}) {
  return (
    <figure className="letter-surface rounded-sm px-5 py-6 sm:px-8 sm:py-8">
      <figcaption className="mb-6 text-center text-xs font-medium tracking-wide text-foreground/45">
        {caption}
      </figcaption>

      <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
        <div className="flex flex-1 flex-col items-center gap-3 text-center">
          <div className="text-sm font-semibold text-foreground/75">{zodiacLabel}</div>
          <div
            className="h-3 w-3 rounded-full border border-foreground/35 bg-foreground/15"
            aria-hidden="true"
          />
          <p className="max-w-[11rem] text-sm leading-snug text-foreground/65">{zodiacPoint}</p>
        </div>

        <div
          className="hidden text-lg text-foreground/25 sm:block"
          aria-hidden="true"
        >
          →
        </div>
        <div className="text-center text-sm text-foreground/30 sm:hidden" aria-hidden="true">
          ↓
        </div>

        <div className="flex flex-1 flex-col items-center gap-3 text-center">
          <div className="text-sm font-semibold text-accent-warm">{sajuLabel}</div>
          <div className="grid grid-cols-4 gap-1.5" role="list">
            {pillars.map((label) => (
              <div
                key={label}
                role="listitem"
                className="flex h-11 w-11 flex-col items-center justify-center rounded-sm border border-accent-warm/35 bg-accent-warm-soft/50 text-[11px] font-medium text-accent-warm sm:h-12 sm:w-12"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="font-display mt-7 text-center text-base font-medium leading-snug text-foreground/80 sm:text-lg">
        {closing}
      </p>
    </figure>
  );
}
