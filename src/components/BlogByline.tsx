import Image from 'next/image';
import type { MarketingLanguage } from '@/lib/languages';
import { formatPostDate, type PostCategory } from '@/lib/posts';

/**
 * 블로그 목록·상세·홈 티저 공통 바이라인(다인 초상 + 씀 + 날짜 + 선택 카테고리).
 */
export function BlogByline({
  byLabel,
  dateIso,
  lang,
  categoryLabel,
  size = 'sm',
}: {
  byLabel: string;
  dateIso: string;
  lang: MarketingLanguage;
  categoryLabel?: string;
  size?: 'sm' | 'md';
}) {
  const px = size === 'md' ? 24 : 20;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/50">
      <Image
        src="/dain-portrait.png"
        alt=""
        width={px}
        height={px}
        className="rounded-full border border-foreground/10 bg-[#F3EBDC] object-cover"
      />
      <span>{byLabel}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={dateIso}>{formatPostDate(dateIso, lang)}</time>
      {categoryLabel ? (
        <>
          <span aria-hidden="true">·</span>
          <span className="rounded-sm border border-foreground/12 px-1.5 py-0.5 text-xs text-foreground/55">
            {categoryLabel}
          </span>
        </>
      ) : null}
    </div>
  );
}

export type BlogCategoryLabels = Record<PostCategory, string>;

export function categoryLabelFor(
  category: PostCategory | undefined,
  labels: BlogCategoryLabels,
): string | undefined {
  return category ? labels[category] : undefined;
}
