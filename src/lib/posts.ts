import type { ComponentType } from 'react';
import { LAUNCH_CONTENT_LANGUAGES, type MarketingLanguage } from './languages';

/** 블로그는 1차 출시 타겟 언어(ko/en/ja/es)에서만 연다 — pt/vi는 이 배열에 언어를 추가하고
 * 그 언어의 content-posts/*.mdx 3편만 채우면 열린다(languages.ts의 LAUNCH_CONTENT_LANGUAGES 참고). */
export const BLOG_LANGUAGES = LAUNCH_CONTENT_LANGUAGES;

export const POST_SLUGS = ['what-is-saju', 'saju-vs-western-astrology', 'how-korean-new-year-works'] as const;
export type PostSlug = (typeof POST_SLUGS)[number];

export interface PostMeta {
  title: string;
  description: string;
  date: string;
}

export interface PostModule {
  Component: ComponentType;
  meta: PostMeta;
}

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

export async function getAllPostSummaries(lang: MarketingLanguage): Promise<(PostMeta & { slug: PostSlug })[]> {
  const modules = await Promise.all(
    POST_SLUGS.map(async (slug) => {
      const mod = await getPostModule(lang, slug);
      return mod ? { slug, ...mod.meta } : null;
    }),
  );
  return modules.filter((post): post is PostMeta & { slug: PostSlug } => post !== null).sort((a, b) => b.date.localeCompare(a.date));
}
