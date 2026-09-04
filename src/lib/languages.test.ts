import { describe, expect, it } from 'vitest';
import { availableSwitcherLanguages, detectPreferredLaunchLanguage } from './languages';

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

describe('availableSwitcherLanguages (2026-09-04, 종합 버그 점검 2회차 — 신년운세 캠페인에서 ko를 보여줘 404를 유발하던 버그 수정)', () => {
  it('일반 경로에서는 LAUNCH_CONTENT_LANGUAGES 4개(ko 포함)를 그대로 보여준다', () => {
    expect(availableSwitcherLanguages('/blog/what-is-saju')).toEqual(['ko', 'en', 'ja', 'es']);
    expect(availableSwitcherLanguages('')).toEqual(['ko', 'en', 'ja', 'es']);
  });

  it('신년운세 캠페인 루트 경로에서는 ko를 뺀다', () => {
    expect(availableSwitcherLanguages('/lunar-new-year')).toEqual(['en', 'ja', 'es']);
  });

  it('신년운세 캠페인 하위 경로(결과/수신거부)에서도 ko를 뺀다', () => {
    expect(availableSwitcherLanguages('/lunar-new-year/r/abc123')).toEqual(['en', 'ja', 'es']);
    expect(availableSwitcherLanguages('/lunar-new-year/unsubscribe')).toEqual(['en', 'ja', 'es']);
  });

  it('경로 이름에 lunar-new-year가 우연히 포함될 뿐 실제로는 다른 경로면 ko를 빼지 않는다', () => {
    expect(availableSwitcherLanguages('/blog/not-lunar-new-year-related')).toEqual(['ko', 'en', 'ja', 'es']);
  });
});
