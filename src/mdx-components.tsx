import type { MDXComponents } from 'mdx/types';

/**
 * App Router에서 @next/mdx를 쓰려면 이 파일(프로젝트 루트 또는 src/ 바로 아래)이 반드시
 * 있어야 한다 — 없으면 MDX 컴파일 자체가 실패한다(Next.js 공식 관례). 블로그 글은 전부
 * 이 저장소가 직접 쓰는 3편짜리 placeholder라 마크다운 구문은 h2/p/ul 정도만 쓴다.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="mt-8 mb-3 text-xl font-semibold" {...props} />,
    p: (props) => <p className="mb-4 leading-relaxed text-foreground/80" {...props} />,
    ul: (props) => <ul className="mb-4 ml-5 list-disc space-y-1 text-foreground/80" {...props} />,
    li: (props) => <li {...props} />,
    strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
    ...components,
  };
}
