import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';

/**
 * 블로그 본문의 마크다운 요소 스타일(2026-10-07 전체 점검 7차 항목 3) — 파일 글(`@next/mdx` → `mdx-components.tsx`)과
 * DB 글(`next-mdx-remote/rsc`의 `compileMDX` → `SafeMdx.tsx`)이 같이 쓴다. 예전엔 `mdx-components.tsx`에만 있었는데
 * `compileMDX`는 그 파일을 읽지 않아(`blogMdxComponents`만 받음), DB 글은 Tailwind 리셋 그대로 h2가 본문 크기·문단 간격
 * 없음·목록 글머리 없음이었다. 파일 글도 `a`가 없어 링크가 평문과 똑같아 보였다.
 */
const LINK_CLASS = 'font-medium text-accent-warm underline underline-offset-2 hover:text-accent-warm/80';

export const mdxElements: MDXComponents = {
  h2: (props) => <h2 className="mt-8 mb-3 text-xl font-semibold" {...props} />,
  h3: (props) => <h3 className="mt-6 mb-2 text-lg font-semibold" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed text-foreground/80" {...props} />,
  ul: (props) => <ul className="mb-4 ml-5 list-disc space-y-1 text-foreground/80" {...props} />,
  ol: (props) => <ol className="mb-4 ml-5 list-decimal space-y-1 text-foreground/80" {...props} />,
  li: (props) => <li {...props} />,
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-6 border-l-2 border-accent-warm/40 pl-4 italic text-foreground/70" {...props} />
  ),
  // 사이트 안 링크는 클라이언트 이동(Link), 밖으로 나가는 링크는 opener를 넘기지 않는다.
  a: ({ href, children, title }) =>
    typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') ? (
      <Link href={href} title={title} className={LINK_CLASS}>
        {children}
      </Link>
    ) : (
      <a href={href} title={title} className={LINK_CLASS} rel="noopener noreferrer">
        {children}
      </a>
    ),
};
