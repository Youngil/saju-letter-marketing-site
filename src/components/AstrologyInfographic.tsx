import type { MarketingDictionary } from '@/dictionaries/types';
import type { ToneGroup } from '@/lib/languages';

/**
 * 톤 2그룹의 "컴포넌트 변형 층"(레이아웃 자체가 달라져야 하는 곳) — toneGroup 하나로만
 * 분기한다(언어별 6갈래 분기 아님). 문구는 항상 dictionary에서 온다 — 이 컴포넌트는 어떤
 * 레이아웃을 쓸지만 결정하고, 단어 선택에는 관여하지 않는다(src/lib/languages.ts 참고).
 *
 * 실제 이미지 에셋(정적 인포그래픽)은 이번 범위 밖 — public/infographic/{lang}.svg를
 * 나중에 채워 넣을 자리만 만들어둔다.
 */
export function AstrologyInfographic({ dict, toneGroup }: { dict: MarketingDictionary['infographic']; toneGroup: ToneGroup }) {
  const isTraditionLed = toneGroup === 'lean-into-tradition';

  return (
    <section className={`rounded-2xl border border-foreground/10 p-6 ${isTraditionLed ? 'bg-accent/5' : 'bg-white/60'}`}>
      <h2 className="mb-2 text-xl font-semibold">{dict.title}</h2>
      <p className="mb-6 max-w-2xl text-foreground/70">{dict.subtitle}</p>
      <div className={`grid gap-6 ${isTraditionLed ? 'md:grid-cols-[1fr_1.4fr]' : 'md:grid-cols-2'}`}>
        <div className="rounded-xl border border-foreground/10 bg-white p-4">
          <div className="mb-2 text-sm font-semibold text-foreground/60">{dict.zodiacLabel}</div>
          <div className="flex h-32 items-center justify-center rounded-lg bg-foreground/5 text-foreground/30">☉</div>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <div className="mb-2 text-sm font-semibold text-accent">{dict.sajuLabel}</div>
          <div className="flex h-32 items-center justify-center rounded-lg bg-accent/10 text-accent/40 text-2xl">四柱</div>
        </div>
      </div>
    </section>
  );
}
