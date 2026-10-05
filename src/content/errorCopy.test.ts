import { describe, expect, it } from 'vitest';
import { ERROR_COPY, errorCopyFor } from './errorCopy';

describe('errorCopyFor — 오류 화면 언어(2026-10-06 전체 점검 8차, global-error와 [lang]/error 공용)', () => {
  it('6개 사이트 언어 전부 문구가 있다', () => {
    expect(Object.keys(ERROR_COPY).sort()).toEqual(['en', 'es', 'ja', 'ko', 'pt', 'vi']);
    for (const copy of Object.values(ERROR_COPY)) {
      expect(copy.title && copy.body && copy.retry).toBeTruthy();
    }
  });

  it('주소 첫 마디가 언어면 그 언어, 아니면(없음·api·프로토타입 키) 영어', () => {
    expect(errorCopyFor('ja')).toEqual({ lang: 'ja', copy: ERROR_COPY.ja });
    expect(errorCopyFor(undefined).lang).toBe('en');
    expect(errorCopyFor('api').lang).toBe('en');
    expect(errorCopyFor('constructor').lang).toBe('en');
  });
});
