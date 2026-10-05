'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';
import { safePageContext } from '@/lib/pageLocation';

/**
 * GA4 page_view를 직접 보낸다(2026-10-06 전체 점검 3차 후속) — `GoogleAnalytics.tsx`가 `send_page_view: false`로 자동
 * page_view를 껐다(주소 전체에 토큰이 실려 갔다). 경로가 바뀔 때마다 `pageLocation.ts`로 다듬은 위치·referrer·제목(=다듬은 경로)을
 * `set`(이후 커스텀 이벤트도 같은 값을 쓰도록) + `page_view`로 보낸다.
 *
 * - `usePathname`만 본다 — 쿼리만 바뀌는 이동은 새 페이지가 아니고(남기는 것도 utm뿐), `useSearchParams`를 쓰면 Suspense
 *   경계가 필요해져 이 컴포넌트가 늦게 하이드레이션되면서 다른 컴포넌트의 마운트 이벤트(`compat_result_view`)보다
 *   뒤에 위치를 바꾸게 된다. 레이아웃 `<body>` 맨 앞에 두어 effect도 페이지 컴포넌트들보다 먼저 돈다.
 * - referrer는 첫 화면이면 `document.referrer`, 그 뒤로는 직전에 보낸(이미 다듬은) 위치.
 * - 제목은 `document.title`을 읽지 않고 다듬은 경로를 쓴다(2026-10-06 전체 점검 5차) — 예전엔 개인화 페이지에서 본
 *   제목을 기억해 두었다가 걸렀는데, `router.push`로 들어간 신년운세 결과처럼 이름이 든 제목이 이 effect보다 늦게
 *   붙으면 기억되지 않은 채 다음 page_view에 실렸고, 거꾸로 직전 랜딩 제목이 잘못 막히기도 했다.
 * - 같은 주소로 두 번 보내지 않는 판정은 **다듬기 전** 주소로 한다 — 개발 모드 StrictMode의 effect 두 번 실행만
 *   걸러야 하는데, 다듬은 위치로 비교하면 서로 다른 두 궁합 토큰 페이지(둘 다 `/compat/:token`) 사이 이동도 삼켰다.
 */
export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const lastHref = useRef<string | null>(null);
  const lastLocation = useRef<string | null>(null);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
    const href = window.location.href;
    if (href === lastHref.current) return;
    const context = safePageContext(href, lastLocation.current ?? document.referrer);
    if (!context.page_location) return;
    lastHref.current = href;
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
