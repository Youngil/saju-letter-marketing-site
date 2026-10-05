/**
 * DB 블로그 글(MDX 문자열) 정화 remark 플러그인(2026-10-07 전체 점검 7차 항목 5).
 *
 * `next-mdx-remote`의 `blockJS`는 `{}` 식만 지운다 — `<script>`·`<iframe>`·`<img onerror="…">` 같은 JSX 태그는 그대로
 * 남아, React 서버 렌더가 인라인 `<script>`를 내보내 페이지를 열면 실행됐다. DB 글 본문은 AI 초안이고 관리자 API는
 * 공개(토큰 탈취 위험을 감수 중)라, 관리자 토큰 하나가 www의 저장형 XSS로 이어질 수 있었다.
 *
 * 허용 목록만 남긴다:
 * - 태그: 블로그 다이어그램 컴포넌트(`allowedComponents`) + 아래 `ALLOWED_HTML_TAGS`(본문 서식용 HTML).
 *   `DROPPED_WITH_CONTENT`(script·iframe·style·form 등)는 내용째 지우고, 그 밖의 모르는 태그(오타 난 컴포넌트 포함 —
 *   그대로 두면 렌더 중 "컴포넌트 없음" 예외로 글 전체가 500)는 껍데기만 벗기고 안의 글자는 남긴다.
 * - 속성: HTML 태그는 태그별 허용 속성의 문자열 값만(`on*`·`style` 등은 전부 버림). 컴포넌트는 `on*`만 버린다
 *   (식 값은 뒤의 `blockJS`가 지운다).
 * - 주소: 마크다운 링크·이미지·참조 정의와 `a href`/`img src`는 http(s)·mailto·상대 주소만. `javascript:` 등은 링크면
 *   글자만 남기고, 이미지·참조 정의는 지운다.
 *
 * 외부 패키지 없이 mdast를 직접 돈다(unist 유틸은 next-mdx-remote의 간접 의존성이라 직접 import하지 않는다).
 */

interface MdastNode {
  type: string;
  name?: string | null;
  url?: string;
  attributes?: MdxAttribute[];
  children?: MdastNode[];
}

interface MdxAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

const ALLOWED_HTML_TAGS: Record<string, readonly string[]> = {
  a: ['href'],
  abbr: [],
  b: [],
  blockquote: [],
  br: [],
  code: [],
  del: [],
  div: [],
  em: [],
  figcaption: [],
  figure: [],
  h2: [],
  h3: [],
  h4: [],
  hr: [],
  i: [],
  img: ['src', 'alt', 'width', 'height'],
  li: [],
  ol: ['start'],
  p: [],
  pre: [],
  s: [],
  small: [],
  span: [],
  strong: [],
  sub: [],
  sup: [],
  table: [],
  tbody: [],
  td: ['colSpan', 'rowSpan'],
  th: ['colSpan', 'rowSpan', 'scope'],
  thead: [],
  tr: [],
  u: [],
  ul: [],
};
/** 모든 허용 HTML 태그에 붙일 수 있는 속성. */
const GLOBAL_HTML_ATTRIBUTES = ['title', 'className'];

/** 껍데기만 벗기면 안의 글자가 코드·문서로 남는 태그 — 내용째 지운다(소문자로 비교). */
const DROPPED_WITH_CONTENT = new Set([
  'script',
  'style',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'noscript',
  'template',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'link',
  'meta',
  'base',
  'svg',
  'math',
  'video',
  'audio',
  'source',
  'track',
  'canvas',
  'portal',
  'head',
  'title',
]);

const SAFE_LINK_SCHEMES = new Set(['http', 'https', 'mailto']);
const SAFE_IMAGE_SCHEMES = new Set(['http', 'https']);

/**
 * 주소가 안전한가 — 스킴이 없으면(상대 주소·`#앵커`) 안전. 브라우저는 스킴 안의 공백·제어 문자를 무시하므로
 * (`java\tscript:`) 그것들을 지운 뒤 스킴을 본다.
 */
export function isSafeUrl(url: string, kind: 'link' | 'image' = 'link'): boolean {
  // eslint-disable-next-line no-control-regex
  const compact = url.replace(/[\u0000- \u007f-\u009f]/g, '').toLowerCase();
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(compact)?.[1];
  if (!scheme) return true;
  return (kind === 'image' ? SAFE_IMAGE_SCHEMES : SAFE_LINK_SCHEMES).has(scheme);
}

function isJsxElement(node: MdastNode): boolean {
  return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

type Action = { kind: 'keep' } | { kind: 'remove' } | { kind: 'unwrap' };

function sanitizeJsxElement(node: MdastNode, allowedComponents: ReadonlySet<string>): Action {
  const name = node.name ?? '';
  if (DROPPED_WITH_CONTENT.has(name.toLowerCase())) return { kind: 'remove' };

  if (allowedComponents.has(name)) {
    node.attributes = (node.attributes ?? []).filter(
      (attr) => attr.type === 'mdxJsxAttribute' && typeof attr.name === 'string' && !/^on/i.test(attr.name),
    );
    return { kind: 'keep' };
  }

  const allowedForTag = Object.hasOwn(ALLOWED_HTML_TAGS, name) ? ALLOWED_HTML_TAGS[name]! : null;
  // 프래그먼트(<>…</>)·모르는 태그·모르는 컴포넌트 — 안의 글자만 남긴다.
  if (!allowedForTag) return { kind: 'unwrap' };

  node.attributes = (node.attributes ?? []).filter((attr) => {
    if (attr.type !== 'mdxJsxAttribute' || typeof attr.name !== 'string') return false;
    if (!allowedForTag.includes(attr.name) && !GLOBAL_HTML_ATTRIBUTES.includes(attr.name)) return false;
    // 문자열 값(또는 값 없는 불리언 속성)만 — 식 값은 받지 않는다.
    if (attr.value !== null && attr.value !== undefined && typeof attr.value !== 'string') return false;
    if (attr.name === 'href' && typeof attr.value === 'string') return isSafeUrl(attr.value, 'link');
    if (attr.name === 'src') return typeof attr.value === 'string' && isSafeUrl(attr.value, 'image');
    return true;
  });
  // src가 없는 img는 의미가 없다.
  if (name === 'img' && !node.attributes.some((attr) => attr.name === 'src')) return { kind: 'remove' };
  return { kind: 'keep' };
}

function sanitizeNode(node: MdastNode, allowedComponents: ReadonlySet<string>): Action {
  if (node.type === 'html') return { kind: 'remove' };
  if (isJsxElement(node)) return sanitizeJsxElement(node, allowedComponents);
  if (node.type === 'link' || node.type === 'linkReference') {
    if (node.type === 'link' && !isSafeUrl(node.url ?? '', 'link')) return { kind: 'unwrap' };
    return { kind: 'keep' };
  }
  if (node.type === 'image') return isSafeUrl(node.url ?? '', 'image') ? { kind: 'keep' } : { kind: 'remove' };
  // 참조 정의(`[ref]: url`)는 링크 규칙으로 — 이미지 참조(`![x][ref]`)가 mailto를 가리켜도 그림이 안 뜰 뿐이다.
  if (node.type === 'definition') return isSafeUrl(node.url ?? '', 'link') ? { kind: 'keep' } : { kind: 'remove' };
  return { kind: 'keep' };
}

function walk(parent: MdastNode, allowedComponents: ReadonlySet<string>): void {
  const children = parent.children;
  if (!children) return;
  let index = 0;
  while (index < children.length) {
    const child = children[index]!;
    const action = sanitizeNode(child, allowedComponents);
    if (action.kind === 'remove') {
      children.splice(index, 1);
      continue;
    }
    if (action.kind === 'unwrap') {
      // 안의 자식을 같은 자리에 펼친 뒤 그 자식들부터 다시 검사한다.
      children.splice(index, 1, ...(child.children ?? []));
      continue;
    }
    walk(child, allowedComponents);
    index += 1;
  }
}

/** remark 플러그인 — `compileMDX({ options: { mdxOptions: { remarkPlugins: [[remarkSanitizeMdx, { … }]] } } })`. */
export function remarkSanitizeMdx(options: { allowedComponents: Iterable<string> }) {
  const allowed = new Set(options.allowedComponents);
  return (tree: MdastNode) => {
    walk(tree, allowed);
  };
}
