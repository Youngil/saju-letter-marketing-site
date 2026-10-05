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

const CASES: Array<{ name: string; href: string; referrer: string; expected: ReturnType<typeof safePageContext> }> = [
  {
    name: '궁합 공유 — 토큰을 빼고, 제목은 다듬은 경로',
    href: `${ORIGIN}/en/compat/tok_secret?utm_source=kakao&utm_medium=share`,
    referrer: '',
    expected: {
      page_location: `${ORIGIN}/en/compat/:token?utm_source=kakao&utm_medium=share`,
      page_referrer: '',
      page_title: '/en/compat/:token',
    },
  },
  {
    name: '수신거부 — 쿼리 토큰은 통째로 버린다',
    href: `${ORIGIN}/ko/unsubscribe?token=secret-token`,
    referrer: '',
    expected: { page_location: `${ORIGIN}/ko/unsubscribe`, page_referrer: '', page_title: '/ko/unsubscribe' },
  },
  {
    name: '신년운세 수신거부 — 토큰은 버리고 utm만 남긴다(utm 순서는 고정)',
    href: `${ORIGIN}/es/lunar-new-year/unsubscribe?utm_campaign=ny%20drip&token=abc&utm_source=email#top`,
    referrer: '',
    expected: {
      page_location: `${ORIGIN}/es/lunar-new-year/unsubscribe?utm_source=email&utm_campaign=ny%20drip`,
      page_referrer: '',
      page_title: '/es/lunar-new-year/unsubscribe',
    },
  },
  {
    name: 'Google Ads 클릭 id·_gl은 남긴다(utm 뒤, 정해진 순서로)',
    href: `${ORIGIN}/en?_gl=1*abc*_ga*MTIz&wbraid=W1&token=x&gclid=G1&dclid=D1&gbraid=B1&utm_source=google`,
    referrer: '',
    expected: {
      page_location: `${ORIGIN}/en?utm_source=google&gclid=G1&gbraid=B1&wbraid=W1&dclid=D1&_gl=1*abc*_ga*MTIz`,
      page_referrer: '',
      page_title: '/en',
    },
  },
  {
    name: '신년운세 결과 id',
    href: `${ORIGIN}/ja/lunar-new-year/r/abc-123`,
    referrer: `${ORIGIN}/ja/lunar-new-year?utm_source=x`,
    expected: {
      page_location: `${ORIGIN}/ja/lunar-new-year/r/:id`,
      page_referrer: `${ORIGIN}/ja/lunar-new-year`,
      page_title: '/ja/lunar-new-year/r/:id',
    },
  },
  {
    name: '같은 사이트 referrer의 토큰도 다듬는다',
    href: `${ORIGIN}/en/privacy`,
    referrer: `${ORIGIN}/en/compat/tok_secret?x=1`,
    expected: { page_location: `${ORIGIN}/en/privacy`, page_referrer: `${ORIGIN}/en/compat/:token`, page_title: '/en/privacy' },
  },
  {
    name: '외부 referrer는 origin만',
    href: `${ORIGIN}/en`,
    referrer: 'https://www.reddit.com/r/kpop/comments/abc/?ref=share',
    expected: { page_location: `${ORIGIN}/en`, page_referrer: 'https://www.reddit.com/', page_title: '/en' },
  },
  {
    name: '해석할 수 없는 주소는 빈 값',
    href: 'not a url',
    referrer: '',
    expected: { page_location: '', page_referrer: '', page_title: '' },
  },
];

describe('safePageContext', () => {
  it.each(CASES)('$name', ({ href, referrer, expected }) => {
    expect(safePageContext(href, referrer)).toEqual(expected);
  });

  it('제목은 언제나 다듬은 경로 — document.title(이름·AI 헤드라인)을 받는 자리 자체가 없다', () => {
    expect(safePageContext.length).toBe(2);
    expect(safePageContext(`${ORIGIN}/en/blog/what-is-saju?utm_source=x`, '').page_title).toBe('/en/blog/what-is-saju');
  });
});

describe('inlinePageContextFunctionSource — GoogleAnalytics.tsx 인라인 스크립트가 같은 답을 낸다', () => {
  const inline = new Function(`return (${inlinePageContextFunctionSource()});`)() as typeof safePageContext;

  it.each(CASES)('$name', ({ href, referrer, expected }) => {
    expect(inline(href, referrer)).toEqual(expected);
  });
});
