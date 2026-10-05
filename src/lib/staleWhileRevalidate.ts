/**
 * 인스턴스 메모리 캐시 — 오래된 값이라도 바로 돌려주고 뒤에서 새로 받는다(stale-while-revalidate).
 * middleware의 서비스 언어 목록용으로 뽑았다(2026-10-06 전체 점검 3차 후속): 예전엔 캐시가 만료되면 그 순간 들어온
 * 요청마다 백엔드 조회(최대 10초)를 각자 기다려, 백엔드가 느리면 첫 방문 리다이렉트가 통째로 멈췄다.
 *
 * - 값이 있으면(만료됐어도) 항상 즉시 그 값. 만료됐으면 새로 받기를 시작만 한다.
 * - 새로 받기는 동시에 하나만(공유 promise) — 같은 순간 들어온 요청들이 백엔드를 여러 번 부르지 않는다.
 * - 값이 하나도 없을 때(콜드 스타트)만 그 한 번의 조회를 기다린다. 실패하면 마지막 값(없으면 `fallback`)을
 *   `failureTtlMs` 동안만 쓰고 다시 시도한다.
 */
export interface StaleWhileRevalidateOptions<T> {
  load: () => Promise<T>;
  ttlMs: number;
  failureTtlMs: number;
  fallback: T;
  onError?: (error: unknown) => void;
  now?: () => number;
}

export interface StaleWhileRevalidate<T> {
  /** 지금 쓸 값. `background`가 있으면 뒤에서 진행 중인 새로 받기(요청이 끝난 뒤에도 살려 두려면 `waitUntil`에 넘긴다). */
  get(): Promise<{ value: T; background?: Promise<unknown> }>;
}

export function createStaleWhileRevalidate<T>(options: StaleWhileRevalidateOptions<T>): StaleWhileRevalidate<T> {
  const now = options.now ?? Date.now;
  let entry: { value: T; until: number } | null = null;
  let inFlight: Promise<T> | null = null;

  function refresh(): Promise<T> {
    // 동기 예외도 같은 실패 경로로(Promise.resolve().then 안에서 부른다).
    inFlight ??= Promise.resolve()
      .then(() => options.load())
      .then(
        (value) => {
          entry = { value, until: now() + options.ttlMs };
          return value;
        },
        (error: unknown) => {
          options.onError?.(error);
          const value = entry?.value ?? options.fallback;
          entry = { value, until: now() + options.failureTtlMs };
          return value;
        },
      )
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  }

  return {
    async get() {
      if (!entry) return { value: await refresh() };
      if (now() < entry.until) return { value: entry.value };
      return { value: entry.value, background: refresh() };
    },
  };
}
