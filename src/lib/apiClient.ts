import { normalizeIpAddress, VISITOR_IP_HEADER } from './visitorIp';

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

/**
 * 서버 내부 호출 표시 헤더(2026-10-06 전체 점검 3차 후속) — `compat/[token]`·`r/[id]` 같은 서버 렌더는 Next 서버 한
 * IP에서 백엔드를 부르므로, 방문자 모두가 백엔드의 IP별 한도 하나를 나눠 쓴다. 백엔드는 이 헤더 값이 자기
 * `MARKETING_INTERNAL_KEY`와 같으면 그 한도에서 뺀다.
 *
 * **서버에서만, 그리고 키가 있을 때만 붙인다.** 값은 런타임 환경변수 `MARKETING_INTERNAL_KEY`(Secret Manager) —
 * `NEXT_PUBLIC_` 접두사를 절대 붙이지 않는다(붙이면 클라이언트 번들에 인라인돼 누구나 한도를 우회한다). 브라우저
 * 번들에선 `process.env.MARKETING_INTERNAL_KEY`가 비어 있지만, `typeof window` 검사로 한 번 더 막는다.
 */
export const INTERNAL_KEY_HEADER = 'X-Marketing-Internal-Key';

/**
 * 내부 키 헤더 + (넘겨받았으면) 방문자 IP 헤더(2026-10-07 전체 점검 12차, 백엔드와의 계약). 내부 키로 IP별 한도에서 빠지면
 * 방문자 모두가 내부 키 버킷 하나를 나눠 쓰므로, 요청마다 그리는 서버 렌더는 방문자 IP를 `X-Visitor-Ip`로 함께 넘겨 백엔드가
 * 방문자별로 세게 한다(`visitorIp.ts`). **내부 키를 보낼 때만** 붙인다 — 키 없는 요청의 이 헤더는 백엔드가 믿을 근거가 없다.
 * IP 모양이 아니거나 없으면(방문자 없는 ISR 재검증·공용 캐시 조회 등) 빼고 보낸다.
 */
export function internalKeyHeaders(visitorIp?: string): Record<string, string> {
  if (typeof window !== 'undefined') return {};
  const key = process.env.MARKETING_INTERNAL_KEY?.trim();
  if (!key) return {};
  const ip = normalizeIpAddress(visitorIp);
  return ip ? { [INTERNAL_KEY_HEADER]: key, [VISITOR_IP_HEADER]: ip } : { [INTERNAL_KEY_HEADER]: key };
}

export interface ApiRequestInit extends RequestInit {
  /** 이 조회를 일으킨 방문자 IP(서버 전용, `requestVisitorIp.ts::getRequestVisitorIp`) — 내부 키와 함께만 보낸다. */
  visitorIp?: string;
}

export async function request<T>(path: string, options?: ApiRequestInit): Promise<T> {
  const { visitorIp, ...init } = options ?? {};
  const isSubmit = Boolean(init.method && init.method.toUpperCase() !== 'GET');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(isSubmit ? SUBMIT_TIMEOUT_MS : GET_TIMEOUT_MS),
    // 본문이 있을 때만 Content-Type을 붙인다 — GET에 붙이면 브라우저가 매번 CORS 사전 요청(OPTIONS)을 보낸다.
    headers: {
      ...(init.body != null ? { 'Content-Type': 'application/json' } : {}),
      ...internalKeyHeaders(visitorIp),
      ...(init.headers ?? {}),
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    const reason = body && typeof body === 'object' && typeof body.error === 'string' ? body.error : undefined;
    throw new ApiError(reason ?? `API request to ${path} failed with status ${response.status}`, response.status, reason);
  }
  return body as T;
}
