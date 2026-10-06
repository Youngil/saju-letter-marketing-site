import { describe, expect, it, vi } from 'vitest';

class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

// getCompatInvite는 saju-letter-backend를 실제로 호출한다 — generateMetadata의 언어 게이트만
// 검증하는 이 테스트에서는 네트워크 호출 없이 항상 'pending' 뷰를 돌려주도록 목킹한다
// (posts.test.ts가 blogApi를 목킹하는 것과 같은 패턴).
vi.mock('@/lib/compatApi', () => ({
  getCompatInvite: vi.fn().mockResolvedValue({ status: 'pending' }),
}));

// 방문자 IP — X-Forwarded-For의 맨 오른쪽(Cloud Run 앞단이 덧붙인 값)을 백엔드 조회에 함께 넘긴다(2026-10-07 전체 점검 12차).
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.9, 198.51.100.7' }),
}));

/** 백엔드가 만드는 모양(32바이트 base64url, 43자) — 모양이 틀리면 백엔드를 부르기 전에 404(2026-10-06 전체 점검 11차). */
const SAMPLE_TOKEN = 'q3JxP0bV9mZk1yTn8LwC4uHs6dRf2aGe7iOj5pXc-_A';

/**
 * 2026-09-08 3차 종합 버그 점검(항목 2) 회귀 테스트 — `/[lang]/compat/[token]`(궁합 공유 결과
 * 조회)은 트랜잭션 축이라, 이미 pt/vi로 발급된 공유 링크가 계속 열려야 한다. 2026-09-07 커밋이
 * `isLaunchContentLanguage`(4개) 체크를 추가로 얹어 pt/vi를 404 처리했던 회귀를 잡는다 —
 * `generateMetadata`만 검증한다(기본 export는 'use client' 컴포넌트(CompatView)를 렌더링까지
 * 필요로 하지 않고 단순 조립만 하지만, 여기서는 언어 게이트 자체가 관심사라 이 정도로 충분하다).
 */
describe('/[lang]/compat/[token] 언어 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 허용', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('generateMetadata(%s)가 404 없이 실제 메타데이터를 반환한다', async (lang) => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang, token: SAMPLE_TOKEN }) });
    expect(metadata.title).toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 generateMetadata에서 빈 메타데이터를 반환한다', async () => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'xx', token: SAMPLE_TOKEN }) });
    expect(metadata).toEqual({});
  });
});

describe('/[lang]/compat/[token] 토큰 모양 검사(2026-10-06 전체 점검 11차 R11-6-1)', () => {
  it.each(['sample-token', 'a'.repeat(44), `${SAMPLE_TOKEN.slice(0, 42)}=`])('모양이 틀린 토큰(%s)은 백엔드를 부르지 않고 404', async (token) => {
    const { getCompatInvite } = await import('@/lib/compatApi');
    vi.mocked(getCompatInvite).mockClear();
    const { default: CompatPage, generateMetadata } = await import('./page');
    await expect(CompatPage({ params: Promise.resolve({ lang: 'en', token }) })).rejects.toBeInstanceOf(NotFoundSentinel);
    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en', token }) });
    expect(metadata.title).toBeUndefined();
    expect(getCompatInvite).not.toHaveBeenCalled();
  });
});

describe('/[lang]/compat/[token] 방문자 IP 전달(2026-10-07 전체 점검 12차)', () => {
  it('본문·메타데이터 모두 같은 방문자 IP로 조회한다(cache()가 한 번으로 묶이게)', async () => {
    const { getCompatInvite } = await import('@/lib/compatApi');
    vi.mocked(getCompatInvite).mockClear();
    const { default: CompatPage, generateMetadata } = await import('./page');
    await generateMetadata({ params: Promise.resolve({ lang: 'en', token: SAMPLE_TOKEN }) });
    await CompatPage({ params: Promise.resolve({ lang: 'en', token: SAMPLE_TOKEN }) });
    expect(getCompatInvite).toHaveBeenCalledTimes(2);
    expect(vi.mocked(getCompatInvite).mock.calls).toEqual([
      [SAMPLE_TOKEN, 'en', '198.51.100.7'],
      [SAMPLE_TOKEN, 'en', '198.51.100.7'],
    ]);
  });
});
