import { LangNotFoundView } from '@/components/LangNotFoundView';

/**
 * 언어 경로 아래 페이지가 `notFound()`를 부를 때(2026-10-10 전체 점검 14차) — 예전엔 파일이 없어 Next 기본 영어 404가 떴다.
 * 레이아웃(헤더·푸터)은 그대로 두고 데모·홈으로 잇는다. 문구는 `content/notFoundCopy.ts`(사전이 아닌 이유는 그 파일 주석).
 * 주소가 어느 라우트에도 맞지 않거나 레이아웃이 404를 낼 때는 `app/global-not-found.tsx`.
 */
export default function LangNotFound() {
  return <LangNotFoundView />;
}
