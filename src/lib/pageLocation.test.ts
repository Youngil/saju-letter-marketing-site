import { describe, expect, it } from 'vitest';
import { inlinePageContextFunctionSource, safePageContext, sanitizePagePath } from './pageLocation';

const ORIGIN = 'https://www.saju-letter.com';

describe('sanitizePagePath — 토큰·id 경로 조각을 자리표시자로', () => {
  it.each([
    ['/en/compat/abc123XYZ', '/en/compat/:token'],
    ['/ko/compat/abc123/opengraph-image', '/ko/compat/:token/opengraph-image'],
    ['/compat/abc123', '/compat/:token'],
    ['/ja/lunar-new-year/r/9f8e7d', '/ja/lunar-new-year/r/:id'],
    ['/pt/lunar-new-year', '/pt/lunar-new-year'],
    ['/en/blog/what-is-saju', '/en/blog/what-is-saju'],
    ['/en/unsubscribe', '/en/unsubscribe'],
    ['/en', '/en'],
  ])('%s → %s', (input, expected) => {
    expect(sanitizePagePath(input)).toBe(expected);
  });

  it('이미 다듬은 경로를 다시 넣어도 그대로(직전 위치를 referrer로 다시 다듬는다)', () => {
    expect(sanitizePagePath('/en/compat/:token')).toBe('/en/compat/:token');
  });
});

const CASES: Array<{ name: string; href: string; referrer: string; title: string; expected: ReturnType<typeof safePageContext> }> = [
  {
    name: '궁합 공유 — 토큰을 빼고, 제목(보낸 사람 이름)도 경로로',
    href: `${ORIGIN}/en/compat/tok_secret?utm_source=kakao&utm_medium=share`,
    referrer: '',
    title: 'Your compatibility with Minji',
    expected: {
      page_location: `${ORIGIN}/en/compat/:token?utm_source=kakao&utm_medium=share`,
      page_referrer: '',
      page_title: '/en/compat/:token',
      personal: true,
    },
  },
  {
    name: '수신거부 — 쿼리 토큰은 통째로 버린다',
    href: `${ORIGIN}/ko/unsubscribe?token=secret-token`,
    referrer: '',
    title: '수신거부',
    expected: { page_location: `${ORIGIN}/ko/unsubscribe`, page_referrer: '', page_title: '수신거부', personal: false },
  },
  {
    name: '신년운세 수신거부 — 토큰은 버리고 utm만 남긴다(utm 순서는 고정)',
    href: `${ORIGIN}/es/lunar-new-year/unsubscribe?utm_campaign=ny%20drip&token=abc&utm_source=email#top`,
    referrer: '',
    title: 'Baja',
    expected: {
      page_location: `${ORIGIN}/es/lunar-new-year/unsubscribe?utm_source=email&utm_campaign=ny%20drip`,
      page_referrer: '',
      page_title: 'Baja',
      personal: false,
    },
  },
  {
    name: '신년운세 결과 id',
    href: `${ORIGIN}/ja/lunar-new-year/r/abc-123`,
    referrer: `${ORIGIN}/ja/lunar-new-year?utm_source=x`,
    title: '結果',
    expected: {
      page_location: `${ORIGIN}/ja/lunar-new-year/r/:id`,
      page_referrer: `${ORIGIN}/ja/lunar-new-year`,
      page_title: '/ja/lunar-new-year/r/:id',
      personal: true,
    },
  },
  {
    name: '같은 사이트 referrer의 토큰도 다듬는다',
    href: `${ORIGIN}/en/privacy`,
    referrer: `${ORIGIN}/en/compat/tok_secret?x=1`,
    title: 'Privacy',
    expected: { page_location: `${ORIGIN}/en/privacy`, page_referrer: `${ORIGIN}/en/compat/:token`, page_title: 'Privacy', personal: false },
  },
  {
    name: '외부 referrer는 origin만',
    href: `${ORIGIN}/en`,
    referrer: 'https://www.reddit.com/r/kpop/comments/abc/?ref=share',
    title: 'Saju Letter',
    expected: { page_location: `${ORIGIN}/en`, page_referrer: 'https://www.reddit.com/', page_title: 'Saju Letter', personal: false },
  },
  {
    name: '해석할 수 없는 주소는 빈 값',
    href: 'not a url',
    referrer: '',
    title: 'x',
    expected: { page_location: '', page_referrer: '', page_title: '', personal: false },
  },
];

describe('safePageContext', () => {
  it.each(CASES)('$name', ({ href, referrer, title, expected }) => {
    expect(safePageContext(href, referrer, title)).toEqual(expected);
  });

  it('앞서 본 개인화 페이지의 제목이 이동 뒤에도 남아 있으면 경로로 바꾼다', () => {
    const unsafe = new Set(['Your compatibility with Minji']);
    expect(safePageContext(`${ORIGIN}/en/blog`, '', 'Your compatibility with Minji', unsafe).page_title).toBe('/en/blog');
    expect(safePageContext(`${ORIGIN}/en/blog`, '', 'Blog', unsafe).page_title).toBe('Blog');
  });
});

describe('inlinePageContextFunctionSource — GoogleAnalytics.tsx 인라인 스크립트가 같은 답을 낸다', () => {
  const inline = new Function(`return (${inlinePageContextFunctionSource()});`)() as typeof safePageContext;

  it.each(CASES)('$name', ({ href, referrer, title, expected }) => {
    expect(inline(href, referrer, title)).toEqual(expected);
  });
});
