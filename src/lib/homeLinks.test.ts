import { describe, expect, it } from 'vitest';
import { demoHref, homeHref } from './homeLinks';

describe('homeLinks', () => {
  it.each(['ko', 'en', 'ja', 'es'])('%s: 그 언어 홈과 #demo', (lang) => {
    expect(homeHref(lang)).toBe(`/${lang}`);
    expect(demoHref(lang)).toBe(`/${lang}#demo`);
  });

  it.each(['pt', 'vi', 'xx', '', null, undefined])('홈이 없는 언어(%s)는 언어 없는 /로(proxy가 방문자 언어로 보낸다)', (lang) => {
    expect(homeHref(lang)).toBe('/');
    expect(demoHref(lang)).toBe('/#demo');
  });
});
