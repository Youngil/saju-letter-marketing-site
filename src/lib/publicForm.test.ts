import { describe, expect, it } from 'vitest';
import { ApiError } from './apiClient';
import { EMAIL_REGEX, mapPublicFormError } from './publicForm';

describe('EMAIL_REGEX', () => {
  it('간단한 이메일 모양만 본다', () => {
    expect(EMAIL_REGEX.test('a@b.co')).toBe(true);
    expect(EMAIL_REGEX.test('a@b')).toBe(false);
    expect(EMAIL_REGEX.test('a b@c.d')).toBe(false);
  });
});

describe('mapPublicFormError', () => {
  const messages = { underage: 'U', date: 'D', generic: 'G', rateLimited: 'R', byReason: { campaign_not_active: 'OFF' } };

  it('서버 사유 underage/birth_date_required', () => {
    expect(mapPublicFormError(new ApiError('x', 400, 'underage'), messages)).toBe('U');
    expect(mapPublicFormError(new ApiError('x', 400, 'birth_date_required'), messages)).toBe('D');
  });

  it('429는 rateLimited가 있을 때만, 없으면 generic(궁합 폼)', () => {
    expect(mapPublicFormError(new ApiError('x', 429), messages)).toBe('R');
    expect(mapPublicFormError(new ApiError('x', 429), { underage: 'U', date: 'D', generic: 'G' })).toBe('G');
  });

  it('폼별 사유, 그 밖은 generic', () => {
    expect(mapPublicFormError(new ApiError('x', 403, 'campaign_not_active'), messages)).toBe('OFF');
    expect(mapPublicFormError(new ApiError('x', 403, 'toString'), messages)).toBe('G');
    expect(mapPublicFormError(new ApiError('x', 500), messages)).toBe('G');
    expect(mapPublicFormError(new TypeError('fetch failed'), messages)).toBe('G');
  });
});
