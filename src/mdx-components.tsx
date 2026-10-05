import type { MDXComponents } from 'mdx/types';
import { mdxElements } from '@/components/blog/mdxElements';

/**
 * App Router에서 @next/mdx를 쓰려면 이 파일(프로젝트 루트 또는 src/ 바로 아래)이 반드시
 * 있어야 한다 — 없으면 MDX 컴파일 자체가 실패한다(Next.js 공식 관례). 파일 글(`content-posts/*.mdx`)용.
 * 요소 스타일은 DB 글(`SafeMdx.tsx`)과 같은 `mdxElements`를 쓴다(2026-10-07 — 예전엔 여기에만 있어 DB 글이 맨 글자였다).
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxElements,
    ...components,
  };
}
