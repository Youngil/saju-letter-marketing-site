import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

/**
 * 2026-09-08 3차 종합 버그 점검(항목 2) — 이전까지 이 저장소는 별도 vitest 설정 없이(package.json의
 * `vitest run`) Vite 기본값으로 돌았는데, 그 기본값은 tsconfig.json의 `paths`(`@/*` → `src/*`)를
 * 모른다. 그래서 `src/lib/*` 같은 상대 경로 전용 순수 함수만 테스트할 수 있었고, `@/lib/...`
 * 형태로 서로를 import하는 `src/app/**\/page.tsx` 같은 라우트 파일은 이 별칭이 안 풀려 애초에
 * import조차 안 됐다(`Cannot find package '@/lib/languages'`) — 그 결과 이번 감사에서 발견한
 * "레이아웃 게이트가 언어 축을 잘못 좁혀 트랜잭션 페이지(궁합/개인정보처리방침/수신거부)를
 * 깨뜨리는" 종류의 버그를 실제 라우트 코드로 직접 검증할 방법이 없었다.
 *
 * 이 별칭 하나만 추가한다 — Next.js 자체의 dev/build 파이프라인(webpack/turbopack)은 이 파일과
 * 무관하게 독립적으로 별칭을 해석하므로, 이 설정은 오직 `npm test`(vitest)에만 영향을 준다.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
});
