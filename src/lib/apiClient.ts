/**
 * saju-letter-backend 호출 공용 클라이언트 — 원래 api.ts 안에 있던 걸 분리했다(2026-08-07,
 * 신년운세 캠페인 이관 시점) — lunarNewYearApi.ts도 같은 fetch/에러 처리 로직이 필요해져서
 * 중복 대신 이 파일을 공유한다.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly reason?: string,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    const reason = body && typeof body === 'object' && typeof body.error === 'string' ? body.error : undefined;
    throw new ApiError(reason ?? `API request to ${path} failed with status ${response.status}`, response.status, reason);
  }
  return body as T;
}
