import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { EmailSignupForm } from '@/components/lunar-new-year/EmailSignupForm';
import { ShareButton } from '@/components/lunar-new-year/ShareButton';
import { AppDownloadLinks } from '@/components/AppDownloadLinks';

class NotFoundSentinel extends Error {}
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSentinel('notFound() called');
  },
}));

/** 백엔드 결과 id는 UUID — 모양이 틀리면 페이지가 백엔드를 부르기 전에 404를 낸다(2026-10-06 전체 점검 11차). */
const SAMPLE_READING_ID = '0d6f3a52-7c1e-4b8a-9e2d-5f4c3b2a1e0d';

// 요청 쿠키 — 테스트마다 소유자 쿠키를 넣었다 뺐다 한다.
const cookieJar = new Map<string, string>();
// 요청 헤더 — 방문자 IP는 X-Forwarded-For의 맨 오른쪽(Cloud Run 앞단이 덧붙인 값, 2026-10-07 전체 점검 12차).
const VISITOR_IP = '198.51.100.7';
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
  }),
  headers: async () => new Headers({ 'x-forwarded-for': `203.0.113.9, ${VISITOR_IP}` }),
}));

// getReading은 saju-letter-backend를 실제로 호출한다 — 네트워크 호출 없이 항상 같은 결과를 돌려주도록 목킹한다
// (compat/[token]/page.test.ts와 같은 패턴). 기본은 공유 링크로 연 사람이 받는 공개 응답.
const PUBLIC_READING = {
  id: SAMPLE_READING_ID,
  name: 'Test',
  language: 'en',
  dayStem: '甲',
  content: {
    title: 'Sample title',
    greeting: 'Sample greeting',
    overview: 'Sample overview',
    highlight: 'Sample highlight',
    closing: 'Sample closing',
  },
  isOwner: false,
};
vi.mock('@/lib/lunarNewYearApi', () => ({
  getReading: vi.fn(),
}));

beforeEach(async () => {
  cookieJar.clear();
  const { getReading } = await import('@/lib/lunarNewYearApi');
  vi.mocked(getReading).mockReset();
  vi.mocked(getReading).mockResolvedValue(PUBLIC_READING as never);
});

/** 서버 컴포넌트가 돌려준 JSX 트리(렌더 전)에서 특정 컴포넌트 엘리먼트를 찾는다. */
function findElements(node: ReactNode, type: unknown): ReactElement[] {
  if (Array.isArray(node)) return node.flatMap((child) => findElements(child, type));
  if (!isValidElement(node)) return [];
  const own = node.type === type ? [node] : [];
  const children = (node.props as { children?: ReactNode }).children;
  return [...own, ...findElements(children, type)];
}

/**
 * 2026-09-08 4차 종합 버그 점검(항목 1) 회귀 테스트 — `/[lang]/lunar-new-year/r/[id]`(신년운세
 * 결과/공유 페이지)는 이미 발급된 결과 링크를 여는 트랜잭션 축이라, 백엔드의 `getReadingById`
 * 에도 언어 게이트가 없다. 2026-09-07 커밋이 페이지 게이트를 `isLaunchContentLanguage`(4)로
 * 좁히면서 pt/vi로 이미 발급된 링크가 전부 404가 났다 — `isMarketingLanguage`(6)로 되돌려 잡는다.
 */
describe('/[lang]/lunar-new-year/r/[id] 언어 게이트 — 6개 언어(MARKETING_LANGUAGES) 전부 허용', () => {
  const marketingLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'vi'] as const;

  it.each(marketingLanguages)('generateMetadata(%s)가 404 없이 실제 메타데이터를 반환한다', async (lang) => {
    const { generateMetadata } = await import('./page');
    const metadata = await generateMetadata({ params: Promise.resolve({ lang, id: SAMPLE_READING_ID }) });
    expect(metadata.title).toBeTruthy();
  });

  it.each(marketingLanguages)('기본 export(LunarNewYearResultPage)가 %s에서 notFound()를 호출하지 않는다', async (lang) => {
    const pageModule = await import('./page');
    const LunarNewYearResultPage = pageModule.default;
    await expect(
      LunarNewYearResultPage({ params: Promise.resolve({ lang, id: SAMPLE_READING_ID }) }),
    ).resolves.toBeTruthy();
  });

  it('지원하지 않는 언어 코드는 여전히 notFound()로 404 처리한다', async () => {
    const pageModule = await import('./page');
    const LunarNewYearResultPage = pageModule.default;
    await expect(
      LunarNewYearResultPage({ params: Promise.resolve({ lang: 'xx', id: SAMPLE_READING_ID }) }),
    ).rejects.toBeInstanceOf(NotFoundSentinel);
  });

  // 2026-10-06 전체 점검 11차 R11-6-1 — 모양부터 틀린 id는 백엔드를 부르지 않고 404.
  it.each(['sample-reading-id', '../admin', 'a'.repeat(300)])('UUID가 아닌 id(%s)는 백엔드를 부르지 않고 404', async (id) => {
    const { getReading } = await import('@/lib/lunarNewYearApi');
    const { default: LunarNewYearResultPage, generateMetadata } = await import('./page');
    await expect(LunarNewYearResultPage({ params: Promise.resolve({ lang: 'en', id }) })).rejects.toBeInstanceOf(NotFoundSentinel);
    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en', id }) });
    expect(metadata.title).toBeUndefined();
    expect(getReading).not.toHaveBeenCalled();
  });
});

/**
 * 2026-10-07 전체 점검 7차 항목 1 — 공유 링크로 연 사람에게는 메일 구독 폼·구독 상태를 보이지 않는다. 결과를 만든 브라우저의
 * httpOnly 쿠키(`nyo_<id>`)에 있는 소유자 토큰을 백엔드가 확인해 준(isOwner) 경우에만 폼을 그린다.
 */
describe('/[lang]/lunar-new-year/r/[id] 소유자만 메일 구독', () => {
  const READING_ID = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
  const OWNER_TOKEN = 'b3duZXItdG9rZW4tZXhhbXBsZS12YWx1ZQ';

  async function renderPage() {
    const { default: LunarNewYearResultPage } = await import('./page');
    return LunarNewYearResultPage({ params: Promise.resolve({ lang: 'en', id: READING_ID }) });
  }

  it('쿠키가 없으면(공유 링크) 토큰 없이 조회하고 구독 폼을 그리지 않는다', async () => {
    const { getReading } = await import('@/lib/lunarNewYearApi');
    const tree = await renderPage();
    expect(getReading).toHaveBeenCalledWith(READING_ID, undefined, VISITOR_IP);
    expect(findElements(tree, EmailSignupForm)).toHaveLength(0);
  });

  it('소유자 쿠키가 있고 백엔드가 isOwner를 확인하면 토큰과 구독 상태를 폼에 넘긴다', async () => {
    cookieJar.set(`nyo_${READING_ID}`, OWNER_TOKEN);
    const { getReading } = await import('@/lib/lunarNewYearApi');
    vi.mocked(getReading).mockResolvedValue({
      ...PUBLIC_READING,
      isOwner: true,
      hasEmailSubscription: true,
      subscriptionAvailable: true,
    } as never);
    const tree = await renderPage();
    expect(getReading).toHaveBeenCalledWith(READING_ID, OWNER_TOKEN, VISITOR_IP);
    const forms = findElements(tree, EmailSignupForm);
    expect(forms).toHaveLength(1);
    expect(forms[0]!.props).toMatchObject({ readingId: READING_ID, ownerToken: OWNER_TOKEN, alreadySubscribed: true });
  });

  it('새 소유자 쿠키(nyo, 여러 결과)에서도 이 결과의 토큰을 찾아 넘긴다', async () => {
    const { addOwnerEntry } = await import('@/lib/readingOwner');
    const now = Math.floor(Date.now() / 1000);
    const other = addOwnerEntry(undefined, '11111111-2222-4333-8444-555555555555', 'b3RoZXItdG9rZW4tdmFsdWU', now);
    cookieJar.set('nyo', addOwnerEntry(other, READING_ID, OWNER_TOKEN, now));
    const { getReading } = await import('@/lib/lunarNewYearApi');
    await renderPage();
    expect(getReading).toHaveBeenCalledWith(READING_ID, OWNER_TOKEN, VISITOR_IP);
  });

  it('쿠키가 있어도 백엔드가 소유자가 아니라고 하면(토큰 불일치) 폼이 없다', async () => {
    cookieJar.set(`nyo_${READING_ID}`, OWNER_TOKEN);
    const tree = await renderPage();
    expect(findElements(tree, EmailSignupForm)).toHaveLength(0);
  });

  // 2026-10-06 전체 점검 8차 — 도움 안내로 대체된 결과에 공유 버튼·앱 홍보를 붙이지 않는다.
  it('위기 신호로 대체된 결과(subscriptionAvailable false)는 소유자에게도 폼·공유 버튼·앱 안내가 없다', async () => {
    cookieJar.set(`nyo_${READING_ID}`, OWNER_TOKEN);
    const { getReading } = await import('@/lib/lunarNewYearApi');
    vi.mocked(getReading).mockResolvedValue({
      ...PUBLIC_READING,
      isOwner: true,
      hasEmailSubscription: false,
      subscriptionAvailable: false,
    } as never);
    const tree = await renderPage();
    expect(findElements(tree, EmailSignupForm)).toHaveLength(0);
    expect(findElements(tree, ShareButton)).toHaveLength(0);
    expect(findElements(tree, AppDownloadLinks)).toHaveLength(0);
  });

  it('일반 결과는 공유 버튼과 앱 안내를 그대로 보여 준다(공유 링크·소유자 모두)', async () => {
    const publicTree = await renderPage();
    expect(findElements(publicTree, ShareButton)).toHaveLength(1);
    expect(findElements(publicTree, AppDownloadLinks)).toHaveLength(1);

    cookieJar.set(`nyo_${READING_ID}`, OWNER_TOKEN);
    const { getReading } = await import('@/lib/lunarNewYearApi');
    vi.mocked(getReading).mockResolvedValue({ ...PUBLIC_READING, isOwner: true, subscriptionAvailable: true } as never);
    const ownerTree = await renderPage();
    expect(findElements(ownerTree, ShareButton)).toHaveLength(1);
    expect(findElements(ownerTree, AppDownloadLinks)).toHaveLength(1);
  });

  it('모양이 틀린 쿠키 값은 백엔드로 보내지 않는다', async () => {
    cookieJar.set(`nyo_${READING_ID}`, 'not a token!');
    const { getReading } = await import('@/lib/lunarNewYearApi');
    await renderPage();
    expect(getReading).toHaveBeenCalledWith(READING_ID, undefined, VISITOR_IP);
  });
});
