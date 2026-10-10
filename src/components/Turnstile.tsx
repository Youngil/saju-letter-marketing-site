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
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          'timeout-callback'?: () => void;
          appearance?: 'always' | 'execute' | 'interaction-only';
          execution?: 'render' | 'execute';
        },
      ) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const FAILURE_MESSAGES: Record<string, string> = {
  ko: '보안 확인을 불러오지 못했어요. 광고 차단기를 끄거나 페이지를 새로고침해 주세요.',
  en: "We couldn't load the security check. Please turn off ad blockers or refresh the page.",
  ja: 'セキュリティ確認を読み込めませんでした。広告ブロッカーをオフにするか、ページを再読み込みしてください。',
  es: 'No pudimos cargar la verificación de seguridad. Desactiva el bloqueador de anuncios o recarga la página.',
  pt: 'Não foi possível carregar a verificação de segurança. Desative o bloqueador de anúncios ou recarregue a página.',
  vi: 'Không thể tải bước xác minh bảo mật. Vui lòng tắt trình chặn quảng cáo hoặc tải lại trang.',
};

/** 페이지 언어(<html lang>)로 안내 문구를 고른다 — 이 위젯은 5개 폼이 공유해 사전을 따로 받지 않는다. */
function failureMessage(): string {
  const lang = typeof document === 'undefined' ? 'en' : document.documentElement.lang;
  return FAILURE_MESSAGES[lang] ?? FAILURE_MESSAGES.en!;
}

export interface TurnstileHandle {
  /** 실패한 제출 뒤 새 토큰을 받고 싶을 때 호출한다 — Turnstile 토큰은 1회용이라, 폼이
   * 언마운트되지 않고 그대로 남아 재시도를 받는 경우(대부분의 폼) 이 호출 없이는 죽은
   * 토큰이 그대로 남는다. */
  reset: () => void;
  /**
   * `lazy` 위젯의 확인을 시작한다(2026-10-10 전체 점검 14차) — 폼이 첫 상호작용(focus·pointerdown·keydown)마다 불러도 된다.
   * 이미 시작했거나 토큰이 살아 있으면 아무것도 안 한다. 스크립트가 아직 안 왔으면 위젯을 그린 직후에 시작한다.
   */
  execute: () => void;
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
/**
 * **`lazy`(2026-10-10 전체 점검 14차)** — 홈에는 데모·리드 두 폼이 있어, 위젯이 그려지자마자 확인을 두 번 돌리고 토큰이
 * 만료될 때마다(약 5분) 다시 돌렸다 — 폼을 건드리지도 않은 방문자 모두에게. `lazy`면 `execution: 'execute'`로 그려 두기만 하고,
 * 폼의 첫 상호작용에서 호출부가 `execute()`를 부를 때 확인한다. 만료되면 토큰만 비우고 다음 상호작용에서 다시 확인한다
 * (실패한 제출 뒤 `reset()`은 이미 상호작용한 사람이라 바로 다시 확인). 서버 검증은 그대로다.
 */
export const Turnstile = forwardRef<TurnstileHandle, { onVerify: (token: string) => void; lazy?: boolean }>(function Turnstile(
  { onVerify, lazy = false },
  ref,
) {
  const containerId = useId().replace(/:/g, '');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetIdRef = useRef<string | undefined>(undefined);
  // lazy 전용 — 지금 확인을 돌렸거나 살아 있는 토큰이 있는가 / 위젯이 그려지기 전에 execute()가 불렸는가 / 이 방문자가 폼을 건드렸는가.
  const executedRef = useRef(false);
  const pendingExecuteRef = useRef(false);
  const interactedRef = useRef(false);

  function runExecute() {
    const widgetId = widgetIdRef.current;
    if (widgetId === undefined || executedRef.current) return;
    executedRef.current = true;
    try {
      window.turnstile?.execute(widgetId);
    } catch (error) {
      // 이미 확인 중인 위젯 등 — 다음 상호작용에서 다시 시도한다.
      executedRef.current = false;
      console.warn('turnstile execute failed', error);
    }
  }
  // 스크립트가 막히거나(광고 차단기·네트워크) 확인이 실패하면 폼 버튼이 이유 없이 회색으로 남았다(2026-10-06) —
  // 위젯 자리에 안내를 띄운다. 위젯이 평소엔 보이지 않아(interaction-only) 이 안내가 유일한 단서다.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // 이전 마운트에서 스크립트가 이미 로드돼 있으면 next/script의 onLoad가 이번엔 안 불린다 —
    // 그런 경우를 여기서 직접 확인해서 렌더를 진행시킨다.
    if (window.turnstile) setScriptLoaded(true);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !SITE_KEY) return;
    widgetIdRef.current = window.turnstile?.render(`#${containerId}`, {
      sitekey: SITE_KEY,
      callback: (token) => {
        setFailed(false);
        onVerify(token);
      },
      'error-callback': () => {
        executedRef.current = false;
        setFailed(true);
      },
      'timeout-callback': () => {
        executedRef.current = false;
        setFailed(true);
      },
      // 토큰은 몇 분 뒤 만료된다 — 폼이 죽은 토큰으로 제출해 403을 받지 않게 비운다. 보통 위젯은 리셋하면 바로 새로 받고,
      // lazy 위젯은 리셋만 해 두고 다음 상호작용(execute())에서 받는다 — 폼을 떠난 방문자에게 5분마다 다시 돌리지 않게.
      'expired-callback': () => {
        onVerify('');
        executedRef.current = false;
        if (widgetIdRef.current !== undefined) window.turnstile?.reset(widgetIdRef.current);
      },
      // 사람 확인이 실제로 필요할 때만 위젯이 보인다 — 평소엔 입력칸과 버튼 사이에 빈 자리만 남았다(2026-10-03).
      appearance: 'interaction-only',
      execution: lazy ? 'execute' : 'render',
    });
    if (lazy && pendingExecuteRef.current) {
      pendingExecuteRef.current = false;
      runExecute();
    }
    return () => {
      if (widgetIdRef.current !== undefined) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = undefined;
      executedRef.current = false;
    };
    // onVerify는 각 폼에서 setState 함수를 그대로 넘겨 참조가 안정적이다; containerId는 useId 기반이라 이 컴포넌트
    // 생애 동안 불변. (예전엔 이 설명 위에 disable 지시문이 있어 실제로는 아무것도 끄지 못했다 — 바로 위 줄이어야 한다.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current === undefined) return;
      window.turnstile?.reset(widgetIdRef.current);
      executedRef.current = false;
      // 실패한 제출 뒤 — 이미 폼을 쓰고 있는 사람이니 lazy여도 바로 새 토큰을 받는다.
      if (lazy && interactedRef.current) runExecute();
    },
    execute: () => {
      if (!lazy || !SITE_KEY) return;
      interactedRef.current = true;
      if (widgetIdRef.current === undefined) {
        pendingExecuteRef.current = true;
        return;
      }
      runExecute();
    },
  }));

  if (!SITE_KEY) return null;

  return (
    <>
      <div id={containerId} />
      {failed && (
        <p role="alert" className="text-sm text-red-700">
          {failureMessage()}
        </p>
      )}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
});
