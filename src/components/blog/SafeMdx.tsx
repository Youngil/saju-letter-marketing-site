import { compileMDX } from 'next-mdx-remote/rsc';
import { blogMdxComponents } from './BlogDiagrams';
import { mdxElements } from './mdxElements';
import { remarkSanitizeMdx } from '@/lib/mdxSanitize';

/**
 * DB 글에 쓰는 요소 맵(2026-10-07 전체 점검 7차) — 파일 글과 같은 마크다운 요소 스타일(`mdxElements`) + 다이어그램.
 * `compileMDX`는 `mdx-components.tsx`를 읽지 않아서 예전엔 다이어그램만 넘겨 본문 서식이 전부 빠졌다.
 */
const DB_POST_COMPONENTS = { ...mdxElements, ...blogMdxComponents };

/**
 * DB 블로그 글 본문(AI 초안) 렌더(2026-10-06). AI가 쓴 본문에 `<3`이나 짝 없는 `{` 같은 글자가 섞이면 MDX 컴파일이
 * 실패해 글 페이지 전체가 500이 났다 — 실패하면 문단 단위 평문으로 보여 주고 서버 로그에 남긴다.
 */
export async function SafeMdx({ source, slug }: { source: string; slug: string }) {
  try {
    const { content } = await compileMDX({
      source,
      components: DB_POST_COMPONENTS,
      options: {
        // 아는 태그·속성·안전한 주소만 남긴다(`lib/mdxSanitize.ts`) — blockJS(기본 켜짐)는 `{}` 식만 지운다.
        mdxOptions: { remarkPlugins: [[remarkSanitizeMdx, { allowedComponents: Object.keys(blogMdxComponents) }]] },
        blockJS: true,
      },
    });
    return content;
  } catch (error) {
    console.error(`[blog] MDX 컴파일 실패 — 평문으로 표시 (slug=${slug}):`, error);
    return (
      <>
        {source
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index} className="mb-4 whitespace-pre-line">
              {paragraph.replace(/^#+\s*/, '')}
            </p>
          ))}
      </>
    );
  }
}
