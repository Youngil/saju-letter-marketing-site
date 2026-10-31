'use client';
import Link from 'next/link';
import { useState } from 'react';
import { dayTypeLine } from '@/content/dayTypeNicknames';
import type { DayTypeResultCopy } from '@/content/dayTypeCopy';
import { dayTypePath, dayTypeShareUrl } from '@/lib/dayType';
import type { LaunchContentLanguage } from '@/lib/languages';
import type { HeavenlyStem } from '@/lib/sajuVocabulary';
import { DayTypeArt } from './DayTypeArt';

/**
 * 홈 데모 결과 맨 위의 날 유형 카드(2026-10-31) — V1 영상과 앱 공유 카드가 "saju-letter.com에서 내 날 유형 확인"으로 보내는데,
 * 예전 결과는 편지 안의 작은 글자 한 줄뿐이었다. 그림 + 앱 카드와 같은 한 줄 + "친구에게 보내기"(그 날 유형 페이지 주소 — 생일은
 * 담지 않는다). 휴대폰은 공유 창, 그 밖엔 주소 복사.
 */
export function DayTypeResultCard({
  stem,
  language,
  copy,
}: {
  stem: HeavenlyStem;
  language: LaunchContentLanguage;
  copy: DayTypeResultCopy;
}) {
  const [copied, setCopied] = useState(false);
  const title = dayTypeLine(copy.resultTitle, stem, language);

  async function share() {
    const url = dayTypeShareUrl(language, stem);
    const text = dayTypeLine(copy.shareText, stem, language);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text, url });
        return;
      } catch (error) {
        // 사용자가 공유 창을 닫았으면 그대로 끝, 그 밖의 실패만 복사로 넘어간다.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // 복사도 막힌 브라우저 — 조용히 둔다(아래 "열 가지 날" 링크로 같은 페이지에 갈 수 있다).
    }
  }

  return (
    <section className="letter-surface flex flex-col items-center gap-3 rounded-sm px-6 py-7 text-center">
      <p className="text-xs font-semibold tracking-wide text-accent-warm uppercase">{copy.kicker}</p>
      <DayTypeArt stem={stem} size={112} />
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="max-w-sm text-base leading-relaxed whitespace-pre-line text-foreground/80">{copy.traits[stem]}</p>
      <p className="max-w-sm text-xs text-foreground/55">{copy.note}</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={share}
          className="rounded-full bg-accent-warm px-5 py-2 text-sm font-medium text-white transition hover:bg-accent-warm/90"
        >
          {copy.share}
        </button>
        <Link href={dayTypePath(language, stem)} className="text-sm text-foreground/60 underline underline-offset-2 hover:text-foreground">
          {copy.seeAll}
        </Link>
      </div>
      <p className="min-h-4 text-xs text-foreground/60" role="status" aria-live="polite">
        {copied ? copy.copied : ''}
      </p>
    </section>
  );
}
