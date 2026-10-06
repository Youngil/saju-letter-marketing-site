/**
 * `next build` 중인지 — 빌드 땐 백엔드가 떠 있지 않을 수 있어 조회 실패를 흡수하고(정적 폴백·빈 목록), 실행 중엔 던져
 * ISR이 직전에 잘 만든 페이지를 계속 보여 주게 하는 판단에 쓴다(`blogApi.ts`, `serviceLanguagesApi.ts`, 신년운세 랜딩).
 */
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}
