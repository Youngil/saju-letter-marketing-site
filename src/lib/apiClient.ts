/**
 * saju-letter-backend 호출 공용 클라이언트 — 원래 api.ts 안에 있던 걸 분리했다(2026-08-07,
 * 신년운세 캠페인 이관 시점) — lunarNewYearApi.ts도 같은 fetch/에러 처리 로직이 필요해져서
 * 중복 대신 이 파일을 공유한다.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

/**
 * 응답을 기다리지 않는 이벤트 기록(2026-10-06 공용화 — 궁합·신년운세가 같은 코드를 각자 갖고 있었다). 페이지를 떠나도
 * 보내지도록 keepalive, 실패는 조용히 무시한다(기록 실패가 방문자 화면을 막으면 안 된다).
 */
export function sendBeaconJson(path: string, body: unknown): void {
  fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch((error) => {
    console.warn(`event ${path} failed`, error);
  });
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly reason?: string,
  ) {
    super(message);
  }
}

/**
 * 다시 시도하면 나을 수 있는 실패인가(2026-10-06 전체 점검 3차) — 429·408·5xx. 그 밖의 4xx(404 없음, 400 잘못된
 * 요청)는 다시 불러도 같으니 "없음"으로 봐도 된다. ApiError가 아닌 예외(네트워크·시간 초과)는 호출부가 그대로 던진다.
 */
export function isRetryableApiError(error: ApiError): boolean {
  return error.status === 429 || error.status === 408 || error.status >= 500;
}

/**
 * 시간 제한(2026-10-06 전체 점검) — 예전엔 없어서 백엔드가 멈추면 레이아웃(언어 목록 조회)까지 함께 멈췄다.
 * 조회는 짧게, 제출(POST)은 AI 동기 생성(데모·신년운세·궁합)을 기다려야 해서 길게 둔다.
 */
const GET_TIMEOUT_MS = 10_000;
const SUBMIT_TIMEOUT_MS = 120_000;

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isSubmit = Boolean(init?.method && init.method.toUpperCase() !== 'GET');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(isSubmit ? SUBMIT_TIMEOUT_MS : GET_TIMEOUT_MS),
    // 본문이 있을 때만 Content-Type을 붙인다 — GET에 붙이면 브라우저가 매번 CORS 사전 요청(OPTIONS)을 보낸다.
    headers: { ...(init?.body != null ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers ?? {}) },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    const reason = body && typeof body === 'object' && typeof body.error === 'string' ? body.error : undefined;
    throw new ApiError(reason ?? `API request to ${path} failed with status ${response.status}`, response.status, reason);
  }
  return body as T;
}
