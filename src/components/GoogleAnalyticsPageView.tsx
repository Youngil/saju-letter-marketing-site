'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';
import { safePageContext } from '@/lib/pageLocation';

/**
 * GA4 page_view를 직접 보낸다(2026-10-06 전체 점검 3차 후속) — `GoogleAnalytics.tsx`가 `send_page_view: false`로 자동
 * page_view를 껐다(주소 전체에 토큰이 실려 갔다). 경로가 바뀔 때마다 `pageLocation.ts`로 다듬은 위치·referrer·제목을
 * `set`(이후 커스텀 이벤트도 같은 값을 쓰도록) + `page_view`로 보낸다.
 *
 * - `usePathname`만 본다 — 쿼리만 바뀌는 이동은 새 페이지가 아니고(남기는 것도 utm뿐), `useSearchParams`를 쓰면 Suspense
 *   경계가 필요해져 이 컴포넌트가 늦게 하이드레이션되면서 다른 컴포넌트의 마운트 이벤트(`compat_result_view`)보다
 *   뒤에 위치를 바꾸게 된다. 레이아웃 `<body>` 맨 앞에 두어 effect도 페이지 컴포넌트들보다 먼저 돈다.
 * - referrer는 첫 화면이면 `document.referrer`, 그 뒤로는 직전에 보낸(이미 다듬은) 위치.
 * - 개인화 페이지(토큰 경로)에서 본 제목은 기억해 두었다가, 이동 직후 `document.title`이 아직 그 제목이면 쓰지 않는다.
 * - 개발 모드 StrictMode의 effect 두 번 실행으로 같은 위치를 두 번 보내지 않게 직전 위치와 같으면 건너뛴다.
 */
export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const lastLocation = useRef<string | null>(null);
  const unsafeTitles = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
    const context = safePageContext(
      window.location.href,
      lastLocation.current ?? document.referrer,
      document.title,
      unsafeTitles.current,
    );
    if (!context.page_location || context.page_location === lastLocation.current) return;
    if (context.personal && document.title) unsafeTitles.current.add(document.title);
    lastLocation.current = context.page_location;

    const params = {
      page_location: context.page_location,
      page_referrer: context.page_referrer,
      page_title: context.page_title,
    };
    window.gtag('set', params);
    window.gtag('event', 'page_view', params);
  }, [pathname]);

  return null;
}
