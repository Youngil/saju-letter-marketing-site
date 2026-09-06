import type { ComponentType } from 'react';
import { LAUNCH_CONTENT_LANGUAGES, type MarketingLanguage } from './languages';
import { listDbBlogPosts, getDbBlogPost } from './blogApi';

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
  'why-a-short-letter',
  'zodiac-and-saju-feel',
] as const;
export type PostSlug = (typeof POST_SLUGS)[number];

export function isPostSlug(value: string): value is PostSlug {
  return (POST_SLUGS as readonly string[]).includes(value);
}

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

/**
 * `slug`가 `string`인 이유(예전엔 `PostSlug`) — DB 저장 글(2026-09-06, 아래 참고)은 빌드 시점에
 * 알 수 없는 임의의 slug를 가질 수 있어, 정적 파일 글의 고정 유니언 타입으로는 표현이 안 된다.
 */
export type PostSummary = PostMeta & { slug: string };

/**
 * 블로그 글의 실제 본문 — 두 소스 중 하나에서 온다(2026-09-06, 사용자 요청: "블로그를 매번
 * 작성하여 배포해야 한다면, 자동화를 위해서라도 데이터베이스를 이용하도록 변경 — 이미지는
 * 마케팅 사이트에 저장(=git 커밋 유지)하는 식으로"). 기존 정적 파일 글(`content-posts/*.mdx`,
 * git 커밋 후 배포 필요)은 그대로 두고, 새 글부터는 `saju-letter-admin-backend`가 DB에 저장한
 * 글을 코드 배포 없이 발행할 수 있다 — `blog/[slug]/page.tsx`가 `source`로 렌더 방식을 가른다:
 * 'file'은 기존처럼 `<Component/>`를, 'db'는 `next-mdx-remote/rsc`의 `<MDXRemote>`로 `bodyMdx`를
 * 렌더한다(DB 저장 본문은 `next-mdx-remote`가 런타임에 문자열을 컴파일하는 방식이라 `import`
 * 구문을 지원하지 않음 — 다이어그램 등 컴포넌트는 렌더러가 넘기는 `components` 맵으로 해석된다).
 */
export type PostContent = ({ source: 'file'; Component: ComponentType } | { source: 'db'; bodyMdx: string }) & { meta: PostMeta };

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

/** 정적 파일 글만(DB 글 제외) — 두 소스를 합치기 전 내부용, sitemap.ts처럼 파일 글 존재
 * 여부만 필요한 호출부를 위해 별도로 남겨둔다. */
async function getFilePostSummaries(lang: MarketingLanguage): Promise<PostSummary[]> {
  const modules = await Promise.all(
    POST_SLUGS.map(async (slug): Promise<PostSummary | null> => {
      const mod = await getPostModule(lang, slug);
      return mod ? { slug, ...mod.meta } : null;
    }),
  );
  return modules.filter((post): post is PostSummary => post !== null);
}

/** 정적 파일 글(git 커밋) + DB 저장 글(2026-09-06, 코드 배포 없이 발행)을 날짜 기준으로 병합한다. */
export async function getAllPostSummaries(lang: MarketingLanguage): Promise<PostSummary[]> {
  const [filePosts, dbPosts] = await Promise.all([getFilePostSummaries(lang), listDbBlogPosts(lang)]);
  // DB는 카테고리 없음을 null로 표현하지만(Prisma nullable 컬럼), PostMeta는 optional(undefined)
  // 관례를 쓴다(`isPostCategory` 등 기존 소비처와 형태를 맞추기 위함) — 여기서 한 번만 정규화한다.
  const normalizedDbPosts: PostSummary[] = dbPosts.map((post) => ({ ...post, category: post.category ?? undefined }));
  return [...filePosts, ...normalizedDbPosts].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * `blog/[slug]/page.tsx` 전용 — 알려진 정적 slug면 파일에서, 아니면 DB에서 찾는다. 두 소스가
 * 같은 slug를 가질 일은 없다고 가정한다(정적 slug는 `POST_SLUGS`에 코드로 등록된 것뿐이라
 * DB 발행 시점에 겹치지 않게 고르면 된다) — 겹치면 이 함수는 항상 파일 쪽을 우선한다.
 */
export async function getPostContent(lang: MarketingLanguage, slug: string): Promise<PostContent | null> {
  if (isPostSlug(slug)) {
    const mod = await getPostModule(lang, slug);
    return mod ? { source: 'file', Component: mod.Component, meta: mod.meta } : null;
  }
  const post = await getDbBlogPost(lang, slug);
  if (!post) return null;
  const meta: PostMeta = { title: post.title, description: post.description, date: post.date, category: post.category ?? undefined };
  return { source: 'db', bodyMdx: post.bodyMdx, meta };
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
