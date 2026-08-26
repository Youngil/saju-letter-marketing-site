import type { ComponentType } from 'react';
import { LAUNCH_CONTENT_LANGUAGES, type MarketingLanguage } from './languages';

/** 블로그는 1차 출시 타겟 언어(ko/en/ja/es)에서만 연다 — pt/vi는 이 배열에 언어를 추가하고
 * 그 언어의 content-posts/*.mdx를 채우면 열린다(languages.ts의 LAUNCH_CONTENT_LANGUAGES 참고). */
export const BLOG_LANGUAGES = LAUNCH_CONTENT_LANGUAGES;

/**
 * 새 주간 칼럼을 추가할 때: (1) 여기 slug를 넣고 (2) `{slug}.en.mdx` 원문 + ko/ja/es 번역을
 * `content-posts/`에 둔다. 입문 시리즈와 주간 칼럼을 한 목록에 섞어 보여도 되지만, 글 구조는
 * 섞지 않는다(`docs/marketing-site-realignment-2026-08-26.md` §4).
 */
export const POST_SLUGS = [
  'what-is-saju',
  'saju-vs-western-astrology',
  'how-korean-new-year-works',
  'who-writes-your-letter',
] as const;
export type PostSlug = (typeof POST_SLUGS)[number];

/** 가벼운 칼럼 분류 — SEO 카테고리 트리가 아니라 목록 칩용(Phase 5). */
export const POST_CATEGORIES = ['observation', 'explainer', 'behind', 'season'] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export interface PostMeta {
  title: string;
  description: string;
  date: string;
  /** 없으면 칩을 그리지 않는다. */
  category?: PostCategory;
}

export interface PostModule {
  Component: ComponentType;
  meta: PostMeta;
}

export type PostSummary = PostMeta & { slug: PostSlug };

/**
 * 프론트매터 파서를 직접 만드는 대신(정규식 유지보수 부담), MDX가 원래 지원하는
 * `export const meta = {...}` 구문을 그대로 쓴다 — gray-matter 등 새 의존성 없이도
 * @next/mdx가 컴파일 시점에 이 export를 그대로 노출해준다.
 */
export async function getPostModule(lang: MarketingLanguage, slug: PostSlug): Promise<PostModule | null> {
  try {
    const mod = (await import(`../content-posts/${slug}.${lang}.mdx`)) as { default: ComponentType; meta: PostMeta };
    return { Component: mod.default, meta: mod.meta };
  } catch {
    return null;
  }
}

export async function getAllPostSummaries(lang: MarketingLanguage): Promise<PostSummary[]> {
  const modules = await Promise.all(
    POST_SLUGS.map(async (slug) => {
      const mod = await getPostModule(lang, slug);
      return mod ? { slug, ...mod.meta } : null;
    }),
  );
  return modules.filter((post): post is PostSummary => post !== null).sort((a, b) => b.date.localeCompare(a.date));
}

/** 홈 “이번 주 다인의 글” — 날짜 최신 1건(언어별 MDX가 있는 것만). */
export async function getLatestPostSummary(lang: MarketingLanguage): Promise<PostSummary | null> {
  const posts = await getAllPostSummaries(lang);
  return posts[0] ?? null;
}

const INTL_LOCALE: Record<MarketingLanguage, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  es: 'es',
  pt: 'pt-BR',
  vi: 'vi-VN',
};

/** ISO `YYYY-MM-DD`를 언어별 긴 날짜로. 정오 고정으로 TZ 하루 밀림을 피한다. */
export function formatPostDate(dateIso: string, lang: MarketingLanguage): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateIso}T12:00:00`));
}

export function isPostCategory(value: unknown): value is PostCategory {
  return typeof value === 'string' && (POST_CATEGORIES as readonly string[]).includes(value);
}
