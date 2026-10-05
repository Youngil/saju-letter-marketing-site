import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import { isSafeUrl } from './mdxSanitize';
import { SafeMdx } from '@/components/blog/SafeMdx';

async function renderDbPost(source: string): Promise<string> {
  const content = await SafeMdx({ source, slug: 'test-post' });
  return renderToStaticMarkup(content as ReactElement);
}

describe('isSafeUrl', () => {
  it('상대 주소·앵커·http(s)·mailto만 링크로 허용한다', () => {
    expect(isSafeUrl('/en/compare')).toBe(true);
    expect(isSafeUrl('#section')).toBe(true);
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('mailto:hello@example.com')).toBe(true);
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl(' JaVa\tScRiPt:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox')).toBe(false);
  });

  // 2026-10-06 전체 점검 8차 — 외부 이미지는 추적 픽셀이 될 수 있어 이 사이트 상대 주소만.
  it('이미지는 이 사이트 상대 주소만', () => {
    expect(isSafeUrl('/dain-portrait.png', 'image')).toBe(true);
    expect(isSafeUrl('images/x.png', 'image')).toBe(true);
    expect(isSafeUrl('https://tracker.example/p.gif', 'image')).toBe(false);
    expect(isSafeUrl('http://tracker.example/p.gif', 'image')).toBe(false);
    expect(isSafeUrl('//tracker.example/p.gif', 'image')).toBe(false);
    expect(isSafeUrl('/\\tracker.example/p.gif', 'image')).toBe(false);
    expect(isSafeUrl(' \t//tracker.example/p.gif', 'image')).toBe(false);
    expect(isSafeUrl('mailto:x@example.com', 'image')).toBe(false);
    expect(isSafeUrl('data:image/svg+xml,<svg onload=alert(1)>', 'image')).toBe(false);
  });
});

/**
 * 2026-10-07 전체 점검 7차 항목 3·5 — DB 글(compileMDX)이 파일 글과 같은 요소 스타일을 쓰고, 위험한 태그·속성·주소는
 * 렌더 결과에 남지 않는다. 예전엔 blockJS가 `{}` 식만 지워 `<script>`·`<iframe>`·`<img onerror>`가 그대로 나갔다.
 */
describe('SafeMdx — DB 글 정화', () => {
  it('script·iframe·style·form은 내용째, on* 속성과 style 속성은 지운다', async () => {
    const html = await renderDbPost(
      [
        'Hello <b onClick="steal()">bold</b> <span style="color:red">s</span>',
        '',
        '<script>alert("xss")</script>',
        '',
        '<iframe src="https://evil.example"></iframe>',
        '',
        '<img src="/x.png" onerror="alert(1)" alt="x" />',
        '',
        '<style>{"body{display:none}"}</style>',
        '',
        '<form action="https://evil.example"><input name="q" /></form>',
      ].join('\n'),
    );
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/alert/);
    expect(html).not.toMatch(/<iframe/i);
    expect(html).not.toMatch(/<style/i);
    expect(html).not.toMatch(/<form|<input/i);
    expect(html).not.toMatch(/onerror|onclick/i);
    expect(html).not.toMatch(/style=/i);
    expect(html).toContain('<b>bold</b>');
    expect(html).toContain('src="/x.png"');
  });

  it('javascript: 링크는 글자만 남기고, 위험한 이미지·참조 정의는 지운다', async () => {
    const html = await renderDbPost(
      [
        '[click me](javascript:alert(1)) and [ref link][r] and <a href="javascript:alert(2)">jsx link</a>',
        '',
        '![pic](javascript:alert(3))',
        '',
        '[r]: javascript:alert(4)',
      ].join('\n'),
    );
    expect(html).not.toMatch(/javascript:/i);
    expect(html).toContain('click me');
    expect(html).toContain('jsx link');
    expect(html).not.toMatch(/<img/i);
  });

  it('className은 지운다(Tailwind로 화면 전체를 덮는 가짜 화면 방지)', async () => {
    const html = await renderDbPost('<div className="fixed inset-0 z-50 bg-white">Log in again</div>');
    expect(html).toContain('Log in again');
    expect(html).not.toMatch(/fixed|inset-0|class=/);
  });

  it('외부 이미지(마크다운·JSX·이미지 참조)는 지우고 상대 주소 이미지는 남긴다', async () => {
    const html = await renderDbPost(
      [
        '![pixel](https://tracker.example/p.gif) ![proto](//tracker.example/q.gif)',
        '',
        '<img src="https://tracker.example/r.gif" alt="r" />',
        '',
        '![ref pixel][px] and [a link][px]',
        '',
        '![local](/dain-portrait.png)',
        '',
        '[px]: https://tracker.example/s.gif',
      ].join('\n'),
    );
    expect(html).not.toMatch(/<img[^>]*tracker/);
    expect(html).not.toMatch(/[pqr]\.gif/);
    expect(html).toContain('src="/dain-portrait.png"');
    // 같은 참조 정의를 쓰는 링크는 링크 규칙(http(s) 허용)대로 남는다.
    expect(html).toMatch(/<a [^>]*href="https:\/\/tracker\.example\/s\.gif"/);
  });

  it('모르는 태그·컴포넌트는 껍데기만 벗기고 글자는 남긴다(렌더 중 "컴포넌트 없음" 예외 없이)', async () => {
    const html = await renderDbPost('<Unknown>inside text</Unknown>\n\n<section>sectioned</section>');
    expect(html).toContain('inside text');
    expect(html).toContain('sectioned');
    expect(html).not.toMatch(/<section|<Unknown/i);
  });

  it('마크다운 요소에 파일 글과 같은 스타일이 붙는다(h2·h3·ol·blockquote·a)', async () => {
    const html = await renderDbPost(
      ['## Heading', '', '### Sub', '', '1. one', '2. two', '', '> quoted', '', 'See [compare](/en/compare).'].join('\n'),
    );
    expect(html).toMatch(/<h2 class="[^"]*text-xl/);
    expect(html).toMatch(/<h3 class="[^"]*text-lg/);
    expect(html).toMatch(/<ol class="[^"]*list-decimal/);
    expect(html).toMatch(/<blockquote class="[^"]*border-l-2/);
    expect(html).toMatch(/<a [^>]*href="\/en\/compare"[^>]*class="[^"]*underline|<a [^>]*class="[^"]*underline[^"]*"[^>]*href="\/en\/compare"/);
  });

  it('블로그 다이어그램 컴포넌트는 그대로 렌더한다', async () => {
    const html = await renderDbPost(
      '<FixedVsChangingDiagram fixedLabel="Fixed" fixedCaption="One sign" changingLabel="Changing" changingCaption="Every day" onClick="x" />',
    );
    expect(html).toContain('Every day');
    expect(html).not.toMatch(/onclick/i);
  });

  // 2026-10-06 전체 점검 8차 — 배열 prop이 필요한 RitualFlowDiagram은 blockJS가 식을 지워 렌더 중 던졌다(글 전체 500).
  it('RitualFlowDiagram은 DB 글에서 쓰지 않는다 — 태그를 써도 렌더가 실패하지 않는다', async () => {
    const html = await renderDbPost(
      ['Before', '', '<RitualFlowDiagram steps={["a", "b"]} caption="Flow caption" />', '', '<RitualFlowDiagram steps="a,b" caption="Second" />', '', 'After'].join('\n'),
    );
    expect(html).toContain('Before');
    expect(html).toContain('After');
  });

  it('컴파일 실패는 평문으로 떨어진다(기존 동작 유지)', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const html = await renderDbPost('I <3 you {');
    expect(html).toContain('I &lt;3 you');
    spy.mockRestore();
  });
});
