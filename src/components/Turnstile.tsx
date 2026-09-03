'use client';

import Script from 'next/script';
import { forwardRef, useEffect, useImperativeHandle, useId, useRef, useState } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * 폼이 제출 버튼을 토큰 준비 여부로 잠글지 판단하는 데 쓴다 — 사이트 키가 없는 환경(로컬 개발)
 * 에서는 토큰이 영원히 안 생기므로, 이 값이 false일 때는 잠그면 안 된다.
 */
export const TURNSTILE_ENABLED = Boolean(SITE_KEY);

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileHandle {
  /** 실패한 제출 뒤 새 토큰을 받고 싶을 때 호출한다 — Turnstile 토큰은 1회용이라, 폼이
   * 언마운트되지 않고 그대로 남아 재시도를 받는 경우(대부분의 폼) 이 호출 없이는 죽은
   * 토큰이 그대로 남는다. */
  reset: () => void;
}

/**
 * Cloudflare Turnstile 위젯. NEXT_PUBLIC_TURNSTILE_SITE_KEY가 없으면 렌더링하지 않는다 —
 * 사이트 키 없이 위젯을 그리면 에러만 난다. 로컬 백엔드는 시크릿이 없을 때 토큰 없이 통과하고,
 * 운영은 토큰·시크릿이 없으면 거부한다(`saju-letter-backend` `newYearCampaign/turnstile.ts`).
 *
 * **토큰 재사용 버그 수정(2026-09-03, 종합 버그 점검으로 발견)** — Turnstile 토큰은 1회용인데,
 * 이 컴포넌트를 쓰는 5개 공개 폼(`DemoForm`/`LeadCaptureForm`/`CompatView`의 `PendingForm`/
 * `EmailSignupForm`/`ReadingForm`) 중 어디도 제출 후 토큰을 리셋하지 않고 있었다 — 재시도하면
 * 백엔드가 항상 403(`turnstile_verification_failed`)을 돌려줬다. 특히 `DemoForm`의 "다시 시도"는
 * 결과 화면에서 폼으로 되돌아가며 이 컴포넌트를 리마운트하는데, `next/script`가 같은 `src`의
 * 스크립트를 전역에서 한 번만 로드된 것으로 캐시해 `onLoad`가 두 번째 마운트부터는 다시 안
 * 불려서 위젯 자체가 아예 다시 렌더되지 않았다(100% 실패, 제출 버튼도 안 잠겨 그대로 클릭
 * 가능했음). 두 가지를 함께 고쳤다: (1) 마운트 시점에 `window.turnstile`이 이미 있으면(이전
 * 마운트가 스크립트를 이미 로드해둔 경우) `onLoad`를 기다리지 않고 즉시 렌더한다. (2)
 * `forwardRef` + `useImperativeHandle`로 `reset()`을 노출해, 폼이 언마운트 없이 그대로 남는
 * 실패 경로(나머지 4개 폼)에서도 호출부가 명시적으로 새 토큰을 받을 수 있게 했다.
 */
export const Turnstile = forwardRef<TurnstileHandle, { onVerify: (token: string) => void }>(function Turnstile(
  { onVerify },
  ref,
) {
  const containerId = useId().replace(/:/g, '');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // 이전 마운트에서 스크립트가 이미 로드돼 있으면 next/script의 onLoad가 이번엔 안 불린다 —
    // 그런 경우를 여기서 직접 확인해서 렌더를 진행시킨다.
    if (window.turnstile) setScriptLoaded(true);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !SITE_KEY) return;
    widgetIdRef.current = window.turnstile?.render(`#${containerId}`, { sitekey: SITE_KEY, callback: onVerify });
    return () => {
      if (widgetIdRef.current !== undefined) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onVerify는 각 폼에서 setState 함수를
    // 그대로 넘겨 참조가 안정적이다; containerId는 useId 기반이라 이 컴포넌트 생애 동안 불변.
  }, [scriptLoaded]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== undefined) window.turnstile?.reset(widgetIdRef.current);
    },
  }));

  if (!SITE_KEY) return null;

  return (
    <>
      <div id={containerId} />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
    </>
  );
});
