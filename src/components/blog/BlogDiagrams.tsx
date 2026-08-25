/**
 * 블로그 글에 쓰는 인라인 SVG/HTML 다이어그램 3종(2026-08-25) — "블로그가 텍스트만 있어서
 * 빈약해 보인다"는 피드백에 대한 대응. `AstrologyInfographic.tsx`와 같은 원칙(외부 이미지/영상
 * 에셋 없이 인라인 SVG/HTML로 직접 그린다)을 그대로 따른다. 이 컴포넌트들은 dictionary가 아니라
 * 호출부(각 언어별 .mdx 파일)가 넘기는 라벨 props로 텍스트를 받는다 — 블로그 프로즈 자체가
 * 이미 언어별로 완전히 분리된 .mdx 파일이라, 다이어그램 라벨도 그 글 안에서 자연스럽게 함께
 * 관리하는 편이 새 dict 키를 늘리는 것보다 단순하다.
 */

/** 글 1(what-is-saju) — 매일 편지의 4단 구성을 가로 흐름으로 보여준다. */
export function RitualFlowDiagram({ steps, caption }: { steps: string[]; caption: string }) {
  const icons = [SparkIcon, BookIcon, HandHeartIcon, WaveIcon];
  return (
    <div className="not-prose my-8 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:flex-nowrap sm:gap-1">
        {steps.map((label, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex w-20 flex-col items-center gap-2 text-center sm:w-24">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Icon />
                </span>
                <span className="text-xs font-medium text-foreground/70">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <span className="hidden text-foreground/25 sm:block" aria-hidden="true">
                  <ArrowIcon />
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-foreground/50">{caption}</p>
    </div>
  );
}

/** 글 2(saju-vs-western-astrology) — "고정된 값 하나" vs "매일 바뀌는 조합"을 대비시킨다. */
export function FixedVsChangingDiagram({
  fixedLabel,
  fixedCaption,
  changingLabel,
  changingCaption,
}: {
  fixedLabel: string;
  fixedCaption: string;
  changingLabel: string;
  changingCaption: string;
}) {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-foreground/10 bg-white p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/8 text-foreground/60">
          <PinIcon />
        </span>
        <div>
          <div className="text-sm font-semibold text-foreground/80">{fixedLabel}</div>
          <p className="mt-1 text-xs text-foreground/50">{fixedCaption}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent-warm/25 bg-accent-warm-soft/40 p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-warm/15 text-accent-warm">
          <CalendarIcon />
        </span>
        <div>
          <div className="text-sm font-semibold text-accent-warm">{changingLabel}</div>
          <p className="mt-1 text-xs text-foreground/60">{changingCaption}</p>
        </div>
      </div>
    </div>
  );
}

/** 글 3(how-korean-new-year-works) — 음력설날과 입춘을 같은 타임라인 위 서로 다른 지점으로 보여준다. */
export function NewYearTimelineDiagram({
  lunarLabel,
  lunarDate,
  ipchunLabel,
  ipchunDate,
}: {
  lunarLabel: string;
  lunarDate: string;
  ipchunLabel: string;
  ipchunDate: string;
}) {
  return (
    <div className="not-prose my-8 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6">
      <div className="mx-auto flex max-w-md items-start gap-3">
        <TimelineMarker label={lunarLabel} date={lunarDate} icon={<MoonIcon />} tint="text-foreground/60 bg-foreground/8" />
        <div className="mt-[18px] h-px flex-1 bg-foreground/15" aria-hidden="true" />
        <TimelineMarker label={ipchunLabel} date={ipchunDate} icon={<SunIcon />} tint="text-accent-warm bg-accent-warm/15" />
      </div>
    </div>
  );
}

function TimelineMarker({ label, date, icon, tint }: { label: string; date: string; icon: React.ReactNode; tint: string }) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center gap-2 text-center sm:w-28">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tint}`}>{icon}</span>
      <div>
        <div className="text-xs font-semibold text-foreground/80">{label}</div>
        <div className="text-[11px] text-foreground/50">{date}</div>
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5c2.5-1 5.5-1 8 0v13c-2.5-1-5.5-1-8 0v-13Z" />
      <path d="M20 5.5c-2.5-1-5.5-1-8 0v13c2.5-1 5.5-1 8 0v-13Z" />
    </svg>
  );
}
function HandHeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-6.5-4-6.5-9a3.5 3.5 0 0 1 6.5-2 3.5 3.5 0 0 1 6.5 2c0 5-6.5 9-6.5 9Z" />
    </svg>
  );
}
function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="10" r="3" />
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M15.5 12.5A6.5 6.5 0 1 1 8.3 3.2a7.5 7.5 0 1 0 8.9 9.6c-.5.1-1.1.1-1.7-.3Z" />
    </svg>
  );
}
function SunIcon() {
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
