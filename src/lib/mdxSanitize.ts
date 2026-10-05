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
 * - 속성: HTML 태그는 태그별 허용 속성의 문자열 값만(`on*`·`style`·`className` 등은 전부 버림). 컴포넌트는 `on*`만 버린다
 *   (식 값은 뒤의 `blockJS`가 지운다). `className`은 2026-10-06 전체 점검 8차에서 뺐다 — Tailwind가 실려 있어
 *   `fixed inset-0 z-50 …` 한 줄이면 페이지 전체를 덮는 가짜 화면(피싱 오버레이)을 그릴 수 있었다.
 * - 주소: 마크다운 링크·참조 정의와 `a href`는 http(s)·mailto·상대 주소만(`javascript:` 등은 링크면 글자만 남기고 참조
 *   정의는 지운다). **이미지(`![]()`·`<img src>`·이미지 참조)는 이 사이트 상대 주소만**(2026-10-06 전체 점검 8차) — 외부
 *   이미지는 글을 연 방문자의 IP·시각을 남의 서버로 보내는 추적 픽셀이 될 수 있다. 블로그 이미지는 `public/`에 커밋한다.
 *
 * 외부 패키지 없이 mdast를 직접 돈다(unist 유틸은 next-mdx-remote의 간접 의존성이라 직접 import하지 않는다).
 */

interface MdastNode {
  type: string;
  name?: string | null;
  url?: string;
  /** definition·linkReference·imageReference의 정규화된 참조 이름. */
  identifier?: string;
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
/** 모든 허용 HTML 태그에 붙일 수 있는 속성 — `className`은 넣지 않는다(파일 상단 주석). */
const GLOBAL_HTML_ATTRIBUTES = ['title'];

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

/**
 * 주소가 안전한가 — 브라우저는 스킴 안의 공백·제어 문자를 무시하므로(`java\tscript:`) 그것들을 지운 뒤 스킴을 본다.
 * - 링크: 스킴이 없으면(상대 주소·`#앵커`) 안전, 있으면 http(s)·mailto만.
 * - 이미지: 이 사이트 상대 주소만(2026-10-06 전체 점검 8차) — 스킴이 있거나 `//host`·`/\host`처럼 다른 호스트를 가리키는
 *   주소는 거부한다(브라우저는 `\`를 `/`로 읽는다).
 */
export function isSafeUrl(url: string, kind: 'link' | 'image' = 'link'): boolean {
  const compact = url.replace(/[\u0000- \u007f-\u009f]/g, '').toLowerCase();
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(compact)?.[1];
  if (kind === 'image') return !scheme && !/^[\\/]{2}/.test(compact);
  if (!scheme) return true;
  return SAFE_LINK_SCHEMES.has(scheme);
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

interface SanitizeContext {
  allowedComponents: ReadonlySet<string>;
  /** 참조 정의(`[ref]: url`)의 주소 — 이미지 참조(`![x][ref]`)가 외부 주소를 가리키는지 보려고 먼저 모은다. */
  definitions: ReadonlyMap<string, string>;
}

function sanitizeNode(node: MdastNode, context: SanitizeContext): Action {
  if (node.type === 'html') return { kind: 'remove' };
  if (isJsxElement(node)) return sanitizeJsxElement(node, context.allowedComponents);
  if (node.type === 'imageReference') {
    const url = context.definitions.get(node.identifier ?? '');
    return url !== undefined && isSafeUrl(url, 'image') ? { kind: 'keep' } : { kind: 'remove' };
  }
  if (node.type === 'link' || node.type === 'linkReference') {
    if (node.type === 'link' && !isSafeUrl(node.url ?? '', 'link')) return { kind: 'unwrap' };
    return { kind: 'keep' };
  }
  if (node.type === 'image') return isSafeUrl(node.url ?? '', 'image') ? { kind: 'keep' } : { kind: 'remove' };
  // 참조 정의(`[ref]: url`)는 링크 규칙으로 — 이미지 참조(`![x][ref]`)는 위에서 그 정의 주소를 이미지 규칙으로 따로 본다.
  if (node.type === 'definition') return isSafeUrl(node.url ?? '', 'link') ? { kind: 'keep' } : { kind: 'remove' };
  return { kind: 'keep' };
}

function collectDefinitions(node: MdastNode, into: Map<string, string>): void {
  if (node.type === 'definition' && typeof node.identifier === 'string' && !into.has(node.identifier)) {
    into.set(node.identifier, node.url ?? '');
  }
  for (const child of node.children ?? []) collectDefinitions(child, into);
}

function walk(parent: MdastNode, context: SanitizeContext): void {
  const children = parent.children;
  if (!children) return;
  let index = 0;
  while (index < children.length) {
    const child = children[index]!;
    const action = sanitizeNode(child, context);
    if (action.kind === 'remove') {
      children.splice(index, 1);
      continue;
    }
    if (action.kind === 'unwrap') {
      // 안의 자식을 같은 자리에 펼친 뒤 그 자식들부터 다시 검사한다.
      children.splice(index, 1, ...(child.children ?? []));
      continue;
    }
    walk(child, context);
    index += 1;
  }
}

/** remark 플러그인 — `compileMDX({ options: { mdxOptions: { remarkPlugins: [[remarkSanitizeMdx, { … }]] } } })`. */
export function remarkSanitizeMdx(options: { allowedComponents: Iterable<string> }) {
  const allowed = new Set(options.allowedComponents);
  return (tree: MdastNode) => {
    const definitions = new Map<string, string>();
    collectDefinitions(tree, definitions);
    walk(tree, { allowedComponents: allowed, definitions });
  };
}
