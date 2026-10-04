import { compileMDX } from 'next-mdx-remote/rsc';
import { blogMdxComponents } from './BlogDiagrams';

/**
 * DB 블로그 글 본문(AI 초안) 렌더(2026-10-06). AI가 쓴 본문에 `<3`이나 짝 없는 `{` 같은 글자가 섞이면 MDX 컴파일이
 * 실패해 글 페이지 전체가 500이 났다 — 실패하면 문단 단위 평문으로 보여 주고 서버 로그에 남긴다.
 */
export async function SafeMdx({ source, slug }: { source: string; slug: string }) {
  try {
    const { content } = await compileMDX({ source, components: blogMdxComponents });
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
