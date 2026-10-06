import { headers } from 'next/headers';
import { unstable_rethrow } from 'next/navigation';
import { pickVisitorIp } from './visitorIp';

/**
 * 지금 처리 중인 요청의 방문자 IP(서버 컴포넌트·generateMetadata·OG 이미지·Route Handler 전용, 2026-10-07 전체 점검 12차) —
 * 백엔드 조회에 `X-Visitor-Ip`로 넘길 값(`visitorIp.ts` 참고). **요청마다 그리는 동적 라우트에서만** 부를 것: `headers()`를
 * 읽으면 그 라우트는 정적·ISR이 될 수 없다(홈·블로그·레이아웃처럼 방문자가 없는 재검증 렌더에선 부르지 않는다 — 그 조회는
 * 예전처럼 내부 키 버킷 하나로 센다).
 *
 * 클라이언트 컴포넌트가 import하는 모듈(`compatApi.ts`·`lunarNewYearApi.ts`)에 `next/headers`가 섞이지 않게 따로 둔다.
 * 헤더를 못 읽으면(요청 범위 밖 등) 없는 것으로 본다 — Next 내부 신호(동적 렌더 전환 등)만 다시 던진다.
 */
export async function getRequestVisitorIp(): Promise<string | undefined> {
  try {
    return pickVisitorIp((await headers()).get('x-forwarded-for'));
  } catch (error) {
    unstable_rethrow(error);
    return undefined;
  }
}
