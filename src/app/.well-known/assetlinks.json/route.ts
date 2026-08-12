import { NextResponse } from 'next/server';

/**
 * Android App Links 검증용 파일(2026-08-12, saju-letter-backend/src/server.ts에서 이관) —
 * 궁합 공유 링크의 도메인이 saju-letter.com(apex, 백엔드)에서 www.saju-letter.com(이 사이트)로
 * 바뀌면서, App Links 검증도 이제 이 도메인 기준으로 이뤄져야 한다. 실 배포(릴리스 서명 키
 * 확정) 전까지는 자리표시자다 — 이 값이 실제 서명 키의 SHA-256 지문과 일치하지 않으면
 * 안드로이드는 그냥 웹 폴백(이 페이지)으로 넘어갈 뿐이라, 배포 전 상태에서도 안전하다.
 * middleware.ts의 매처가 "."을 포함한 경로를 이미 제외하므로 이 경로는 언어 리다이렉트의
 * 영향을 받지 않는다.
 */
const ANDROID_ASSET_LINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.sajuletter.app',
      sha256_cert_fingerprints: ['REPLACE_WITH_RELEASE_SIGNING_CERT_SHA256_FINGERPRINT'],
    },
  },
];

export async function GET() {
  return NextResponse.json(ANDROID_ASSET_LINKS);
}
