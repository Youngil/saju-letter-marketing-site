import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

/**
 * 모든 응답에 붙는 보안 헤더(2026-10-06 전체 점검 11차 R11-6-4).
 * - 이 사이트를 다른 사이트가 iframe으로 감싸지 못하게(클릭재킹 — 궁합·신년운세·리드 폼 위에 투명 레이어를 얹는 공격):
 *   `X-Frame-Options: DENY`(구형 브라우저)와 CSP `frame-ancestors 'none'`(표준) 둘 다. CSP는 이 지시어 하나만 둔다 —
 *   스크립트·스타일 출처 제한은 GA·Turnstile·인라인 동의 스크립트를 함께 따져야 해 별도 작업. 이 사이트를 iframe으로
 *   쓰는 곳은 없다(모바일 WebView·관리자 패널·백엔드 모두 확인, 2026-10-06). Turnstile 위젯은 이 페이지 *안의* iframe이라
 *   영향이 없다. 언젠가 다른 곳에 임베드해야 하면 그 출처만 `frame-ancestors`에 열 것.
 * - HSTS 1년 + 하위 도메인(운영은 Cloud Run 도메인 매핑이라 항상 https). preload는 신청 절차가 따로 있어 넣지 않았다.
 */
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // `X-Powered-By: Next.js` 헤더를 내보내지 않는다.
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default createMDX({})(nextConfig);
