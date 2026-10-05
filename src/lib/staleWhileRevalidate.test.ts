import { describe, expect, it, vi } from 'vitest';
import { createStaleWhileRevalidate } from './staleWhileRevalidate';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(load: () => Promise<string>) {
  let clock = 0;
  const swr = createStaleWhileRevalidate({
    load,
    ttlMs: 1000,
    failureTtlMs: 100,
    fallback: 'static',
    onError: () => {},
    now: () => clock,
  });
  return { swr, advance: (ms: number) => (clock += ms) };
}

describe('createStaleWhileRevalidate', () => {
  it('콜드 스타트엔 한 번 기다리고, 동시에 들어온 요청은 조회 하나를 함께 기다린다', async () => {
    const pending = deferred<string>();
    const load = vi.fn(() => pending.promise);
    const { swr } = setup(load);

    const first = swr.get();
    const second = swr.get();
    pending.resolve('fresh');

    await expect(first).resolves.toEqual({ value: 'fresh' });
    await expect(second).resolves.toEqual({ value: 'fresh' });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('콜드 스타트 조회가 실패하면 fallback을 짧게(failureTtl) 쓰고 그 뒤 다시 시도한다', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce('fresh');
    const { swr, advance } = setup(load);

    await expect(swr.get()).resolves.toEqual({ value: 'static' });
    advance(50);
    await expect(swr.get()).resolves.toEqual({ value: 'static' });
    expect(load).toHaveBeenCalledTimes(1);

    advance(60); // failureTtl(100) 지남 — 만료된 fallback을 바로 주고 뒤에서 새로 받는다.
    const { value, background } = await swr.get();
    expect(value).toBe('static');
    await background;
    await expect(swr.get()).resolves.toEqual({ value: 'fresh' });
  });

  it('load가 동기적으로 던져도 실패 경로(fallback)로 흡수한다', async () => {
    const { swr } = setup(() => {
      throw new Error('sync');
    });
    await expect(swr.get()).resolves.toEqual({ value: 'static' });
  });

  it('만료된 값은 기다리지 않고 바로 주며, 새로 받기는 하나만 돈다', async () => {
    const refreshed = deferred<string>();
    const load = vi.fn().mockResolvedValueOnce('v1').mockReturnValueOnce(refreshed.promise);
    const { swr, advance } = setup(load);

    await swr.get();
    advance(1001);

    const a = await swr.get();
    const b = await swr.get();
    expect(a.value).toBe('v1');
    expect(b.value).toBe('v1');
    expect(a.background).toBeDefined();
    expect(load).toHaveBeenCalledTimes(2);

    refreshed.resolve('v2');
    await a.background;
    await expect(swr.get()).resolves.toEqual({ value: 'v2' });
  });

  it('새로 받기가 실패하면 마지막 값을 failureTtl 동안 유지한다(fallback으로 바꾸지 않는다)', async () => {
    const load = vi.fn().mockResolvedValueOnce('v1').mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce('v2');
    const { swr, advance } = setup(load);

    await swr.get();
    advance(1001);
    const { background } = await swr.get();
    await background;

    await expect(swr.get()).resolves.toEqual({ value: 'v1' });
    advance(101);
    expect((await swr.get()).background).toBeDefined();
  });
});
