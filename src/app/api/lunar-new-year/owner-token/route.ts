import { NextResponse, type NextRequest } from 'next/server';
import {
  isValidOwnerToken,
  isValidReadingId,
  ownerCookieName,
  ownerCookieOptions,
} from '@/lib/readingOwner';

/**
 * 신년운세 결과를 만든 브라우저에 소유자 토큰을 httpOnly 쿠키로 심는다(2026-10-07 전체 점검 7차 항목 1, 배경은
 * `lib/readingOwner.ts`). 백엔드를 부르지 않는다 — 토큰이 맞는지는 백엔드가 쓸 때마다 확인하고, 여기서 틀린 값을 심어도
 * 그 브라우저가 그 결과의 구독 폼을 못 볼 뿐이다.
 *
 * JSON 본문만 받는다 — 다른 사이트의 `<form>`은 `application/json`을 보낼 수 없고, 다른 사이트의 fetch는 CORS 사전
 * 요청에서 막힌다(이 라우트는 CORS 헤더를 주지 않는다). 브라우저가 알려 주면 cross-site 요청도 한 번 더 거른다.
 */
export async function POST(request: NextRequest) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'unsupported_media_type' }, { status: 415 });
  }

  const body: unknown = await request.json().catch(() => null);
  const { readingId, ownerToken } = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (!isValidReadingId(readingId) || !isValidOwnerToken(ownerToken)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(ownerCookieName(readingId), ownerToken, ownerCookieOptions());
  // 쿠키를 심는 응답이 어디에도 캐시되지 않게.
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
