import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  activeContentLanguages,
  fetchServiceLanguagesOnce,
  loadActiveServiceLanguages,
  parseServiceLanguages,
  resetServiceLanguagesMemoryForTest,
  STATIC_SERVICE_LANGUAGES,
} from './serviceLanguagesApi';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

beforeEach(() => {
  resetServiceLanguagesMemoryForTest();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('activeContentLanguages — sitemap·hreflang용 콘텐츠 축 ∩ 켠 언어', () => {
  it('콘텐츠 축(ko/en/ja/es) 중 켠 언어만, 콘텐츠 축 순서대로 — pt/vi는 켜져 있어도 빠진다', () => {
    expect(activeContentLanguages({ active: ['es', 'pt', 'ko', 'vi'], default: 'ko' })).toEqual(['ko', 'es']);
  });

  it('후보를 넘기면(글이 발행된 언어) 그 안에서만 고른다', () => {
    expect(activeContentLanguages({ active: ['ko', 'en', 'ja'], default: 'en' }, ['en', 'es'])).toEqual(['en']);
  });
});

describe('parseServiceLanguages — 관리자가 켠 언어 원본(6개 축)을 그대로', () => {
  it('pt/vi도 콘텐츠 축으로 걸러내지 않는다(신년운세 랜딩·sitemap이 6개 언어 페이지라서)', () => {
    expect(parseServiceLanguages({ languages: ['ko', 'en', 'pt', 'vi'], defaultLanguage: 'pt' })).toEqual({
      active: ['ko', 'en', 'pt', 'vi'],
      default: 'pt',
    });
  });

  it('모르는 언어는 빼고, 기본 언어가 이상하면 en', () => {
    expect(parseServiceLanguages({ languages: ['fr', 'ja'], defaultLanguage: 'fr' })).toEqual({ active: ['ja'], default: 'en' });
  });

  it('쓸 수 있는 언어가 없으면 null', () => {
    expect(parseServiceLanguages({ languages: ['fr'] })).toBeNull();
    expect(parseServiceLanguages({})).toBeNull();
  });
});

describe('loadActiveServiceLanguages — 실패 처리', () => {
  it('실패하면 마지막으로 성공한 값을 쓴다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse(200, { languages: ['ko', 'pt'], defaultLanguage: 'ko' })));
    await expect(loadActiveServiceLanguages()).resolves.toEqual({ active: ['ko', 'pt'], default: 'ko' });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(503, { error: 'down' })));
    await expect(loadActiveServiceLanguages()).resolves.toEqual({ active: ['ko', 'pt'], default: 'ko' });
  });

  it('한 번도 성공한 적 없으면 실행 중엔 던진다(ISR이 실패 값을 굳히지 않게)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(503, { error: 'down' })));
    await expect(loadActiveServiceLanguages()).rejects.toMatchObject({ status: 503 });
  });

  it('빌드 중에는 정적 목록으로 흡수한다(백엔드 없이도 빌드돼야 한다)', async () => {
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(loadActiveServiceLanguages()).resolves.toEqual(STATIC_SERVICE_LANGUAGES);
  });
});

describe('fetchServiceLanguagesOnce — middleware용 한 번 조회', () => {
  it('마지막 성공 값이 있어도 실패는 그대로 던진다(middleware 캐시가 짧게 다시 시도하도록)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse(200, { languages: ['ko'], defaultLanguage: 'ko' })));
    await fetchServiceLanguagesOnce();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(503, { error: 'down' })));
    await expect(fetchServiceLanguagesOnce()).rejects.toMatchObject({ status: 503 });
  });

  it('timeoutMs를 주면 그 시간 제한 signal로 부른다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { languages: ['en'] }));
    vi.stubGlobal('fetch', fetchMock);
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');

    await fetchServiceLanguagesOnce({ timeoutMs: 2000 });

    expect(timeoutSpy).toHaveBeenCalledWith(2000);
    expect(fetchMock.mock.calls[0]![1].signal).toBe(timeoutSpy.mock.results[0]!.value);
  });
});
