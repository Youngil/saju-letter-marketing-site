import { NextResponse } from "next/server";

/**
 * Android App Links 검증용 파일(2026-08-12, saju-letter-backend/src/server.ts에서 이관) —
 * 궁합 공유 링크의 도메인이 saju-letter.com(apex, 백엔드)에서 www.saju-letter.com(이 사이트)로
 * 바뀌면서, App Links 검증도 이제 이 도메인 기준으로 이뤄져야 한다.
 * middleware.ts의 매처가 "."을 포함한 경로를 이미 제외하므로 이 경로는 언어 리다이렉트의
 * 영향을 받지 않는다.
 *
 * **SHA-256 지문 검증 완료(2026-09-03)** — 아래 값은 더 이상 자리표시자가 아니다. 사용자가
 * Play Console(설정 → 앱 무결성 → 앱 서명 → "앱 서명 키 인증서"의 SHA-256 지문)에서 직접
 * 확인해 알려준 실제 값과 정확히 일치함을 확인했다 — Play App Signing이 재서명한 뒤 실제
 * 유저 기기에 배포되는 인증서 지문이라, 이 값 자체는 신뢰할 수 있다. 지문이 안 맞으면
 * 안드로이드는 그냥 웹 폴백(이 페이지)으로 넘어갈 뿐이라 애초에 fail-safe였지만, 이제는
 * "맞는지 확인 안 됨"이 아니라 "확인해서 맞음" 상태다. **다만 실기기 Digital Asset Links
 * 검증(`adb shell pm verify-app-links` 또는 실제 기기에서 공유 링크 탭)은 아직 별도로
 * 확인되지 않았다** — 지문 일치는 필요조건이지만, 실제 딥링크 라우팅까지 끝까지 되는지는
 * 실기기가 있어야 확인 가능하다.
 */
const ANDROID_ASSET_LINKS = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.sajuletter.app",
      sha256_cert_fingerprints: [
        "4A:B8:D8:D4:D6:A9:00:45:8F:56:28:60:C2:3D:70:B3:11:0B:0E:4F:F3:07:0F:82:2A:E2:26:A6:FD:5E:D1:1A",
      ],
    },
  },
];

export async function GET() {
  return NextResponse.json(ANDROID_ASSET_LINKS);
}
