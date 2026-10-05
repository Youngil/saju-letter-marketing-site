import { describe, expect, it } from 'vitest';
import {
  availableSwitcherLanguages,
  buildLanguageSwitchPath,
  detectPreferredLaunchLanguage,
  isTransactionalPath,
  resolveLanguageSwitchPath,
  type MarketingLanguage,
} from './languages';

describe('detectPreferredLaunchLanguage (2026-09-03, 종합 버그 점검 — Accept-Language 우선순위 무시 버그 수정)', () => {
  it('q값 없이 하나만 오면 그 언어를 고른다', () => {
    expect(detectPreferredLaunchLanguage('ja')).toBe('ja');
  });

  it('q값 우선순위가 배열 선언 순서와 다를 때도 q값을 따른다(회귀 테스트 — 예전엔 en이 배열에서 먼저라 es보다 우선됐다)', () => {
    expect(detectPreferredLaunchLanguage('es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7')).toBe('es');
  });

  it('일본어가 1순위이고 영어가 보조로 붙어도 일본어를 고른다', () => {
    expect(detectPreferredLaunchLanguage('ja,en;q=0.9')).toBe('ja');
  });

  it('전체 지역 태그(es-MX)가 지원 목록에 없어도 기본 서브태그(es)로 매치한다', () => {
    expect(detectPreferredLaunchLanguage('es-MX,es;q=0.9')).toBe('es');
  });

  it('1순위가 지원하지 않는 언어(pt)면 다음 우선순위 지원 언어로 넘어간다', () => {
    expect(detectPreferredLaunchLanguage('pt-BR,pt;q=0.9,ko;q=0.8')).toBe('ko');
  });

  it('지원하는 언어가 전혀 없으면 기본 언어(en)로 폴백한다', () => {
    expect(detectPreferredLaunchLanguage('pt-BR,vi;q=0.9')).toBe('en');
  });

  it('빈 헤더도 기본 언어로 폴백한다', () => {
    expect(detectPreferredLaunchLanguage('')).toBe('en');
  });

  it('대문자 태그도 정상 처리한다', () => {
    expect(detectPreferredLaunchLanguage('KO-KR,ko;q=0.9')).toBe('ko');
  });

  it('와일드카드(*)는 언어 후보로 취급하지 않는다', () => {
    expect(detectPreferredLaunchLanguage('*,ko;q=0.5')).toBe('ko');
  });
});

describe('availableSwitcherLanguages — 경로별 언어 목록(2026-10-06 전체 점검 3차)', () => {
  const ALL: MarketingLanguage[] = ['ko', 'en', 'es', 'pt', 'ja', 'vi'];

  it('콘텐츠 경로(홈·블로그·compare)는 켠 언어 중 콘텐츠 축(ko/en/ja/es)만 보여준다', () => {
    expect(availableSwitcherLanguages('/blog/what-is-saju', ALL)).toEqual(['ko', 'en', 'ja', 'es']);
    expect(availableSwitcherLanguages('', ALL)).toEqual(['ko', 'en', 'ja', 'es']);
    expect(availableSwitcherLanguages('/compare', ALL)).toEqual(['ko', 'en', 'ja', 'es']);
  });

  it('트랜잭션 경로(신년운세·궁합·개인정보처리방침 등)는 켠 언어 그대로(pt/vi 포함)', () => {
    expect(availableSwitcherLanguages('/lunar-new-year', ALL)).toEqual(['ko', 'en', 'ja', 'es', 'pt', 'vi']);
    expect(availableSwitcherLanguages('/lunar-new-year/r/abc123', ALL)).toEqual(['ko', 'en', 'ja', 'es', 'pt', 'vi']);
    expect(availableSwitcherLanguages('/compat/tok', ALL)).toEqual(['ko', 'en', 'ja', 'es', 'pt', 'vi']);
    expect(availableSwitcherLanguages('/privacy', ALL)).toEqual(['ko', 'en', 'ja', 'es', 'pt', 'vi']);
  });

  it('끈 언어는 어느 경로에서도 빠진다', () => {
    expect(availableSwitcherLanguages('/lunar-new-year', ['en', 'ko', 'pt'])).toEqual(['ko', 'en', 'pt']);
    expect(availableSwitcherLanguages('/blog', ['en', 'ko', 'pt'])).toEqual(['ko', 'en']);
  });

  it('트랜잭션 경로 이름으로 시작할 뿐인 다른 경로는 콘텐츠 경로로 본다', () => {
    expect(isTransactionalPath('/privacy-notes')).toBe(false);
    expect(isTransactionalPath('/blog/privacy')).toBe(false);
  });
});

describe('resolveLanguageSwitchPath — 블로그 글이 없는 언어는 블로그 목록으로(2026-10-06 전체 점검 3차)', () => {
  const limit = { restOfPath: '/blog/hello', languages: ['en', 'ja'] as MarketingLanguage[], fallbackRestOfPath: '/blog' };

  it('그 글이 있는 언어는 같은 글로(쿼리 보존)', () => {
    expect(resolveLanguageSwitchPath('/blog/hello', 'ja', 'a=1', limit)).toBe('/ja/blog/hello?a=1');
  });

  it('그 글이 없는 언어는 그 언어의 블로그 목록으로', () => {
    expect(resolveLanguageSwitchPath('/blog/hello', 'ko', 'a=1', limit)).toBe('/ko/blog');
  });

  it('제한이 다른 경로 것이면 무시한다', () => {
    expect(resolveLanguageSwitchPath('/blog/other', 'ko', '', limit)).toBe('/ko/blog/other');
    expect(resolveLanguageSwitchPath('/blog/hello', 'ko', '', null)).toBe('/ko/blog/hello');
  });
});

describe('buildLanguageSwitchPath (2026-09-09, 최종 pre-launch 감사 — 언어 전환 시 ?token= 쿼리스트링이 사라지던 버그 수정)', () => {
  it('쿼리스트링이 없으면 예전과 동일하게 경로만 반환한다', () => {
    expect(buildLanguageSwitchPath('/blog/what-is-saju', 'ja', '')).toBe('/ja/blog/what-is-saju');
  });

  it('쿼리스트링이 있으면 언어를 바꾼 새 경로 뒤에 그대로 이어붙인다(회귀 테스트 — 수신거부 페이지의 ?token= 유실 버그)', () => {
    expect(buildLanguageSwitchPath('/unsubscribe', 'ko', 'token=abc123')).toBe('/ko/unsubscribe?token=abc123');
  });

  it('여러 쿼리 파라미터도 그대로 보존한다', () => {
    expect(buildLanguageSwitchPath('/lunar-new-year/unsubscribe', 'es', 'token=abc123&foo=bar')).toBe(
      '/es/lunar-new-year/unsubscribe?token=abc123&foo=bar',
    );
  });

  it('루트 경로(빈 rest)에서도 쿼리스트링을 보존한다', () => {
    expect(buildLanguageSwitchPath('', 'en', 'ref=email')).toBe('/en?ref=email');
  });
});

describe('detectPreferredLaunchLanguage — 관리자가 켠 언어만 후보(2026-10-06)', () => {
  it('꺼진 언어는 건너뛰고 다음 선호 언어나 기본 언어로 간다', () => {
    expect(detectPreferredLaunchLanguage('ja,ko;q=0.8', ['ko', 'en'], 'en')).toBe('ko');
    expect(detectPreferredLaunchLanguage('ja', ['ko', 'es'], 'es')).toBe('es');
  });
});
