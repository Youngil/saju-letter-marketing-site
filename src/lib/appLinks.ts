/**
 * 스토어 URL과 "실제로 다운로드 가능한지"를 분리해서 관리한다(2026-08-25). 패키지명/번들ID가
 * 정해지면 URL은 미리 넣어둘 수 있지만(실제로 `NEXT_PUBLIC_GOOGLE_PLAY_URL`은 이미
 * `com.sajuletter.app` 기준으로 채워져 있다 — meta 저장소 CLAUDE.md §11), Play Console/App
 * Store Connect 심사가 끝나 실제로 공개되기 전까지는 그 URL이 "존재하지 않는 항목" 페이지로
 * 연결된다. 그래서 URL이 채워져 있는지가 아니라 별도의 명시적 LIVE 플래그로 "지금 다운로드
 * 버튼을 눌러도 되는지"를 판단한다 — 안드로이드 우선 출시 방침(meta CLAUDE.md §2)대로 두 값은
 * 서로 다른 시점에 켜질 수 있다. 값 자체는 자주 안 바뀌므로(스토어 심사 통과는 일회성 이벤트)
 * 관리자 패널 런타임 토글이 아니라 배포 시 환경변수로 관리한다.
 */
export const GOOGLE_PLAY_URL = process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL;
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL;

export const ANDROID_APP_LIVE = process.env.NEXT_PUBLIC_ANDROID_APP_LIVE === 'true';
export const IOS_APP_LIVE = process.env.NEXT_PUBLIC_IOS_APP_LIVE === 'true';
