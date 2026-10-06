/**
 * 방문자 IP(2026-10-07 전체 점검 12차 — 백엔드와의 계약 `X-Visitor-Ip`).
 *
 * 이 사이트의 서버 렌더(`compat/[token]`·`lunar-new-year/r/[id]` 본문·메타데이터·OG)는 내부 키(`X-Marketing-Internal-Key`)를
 * 붙여 백엔드를 부르므로 백엔드의 IP별 한도에서 빠지는데, 그러면 방문자 모두가 내부 키 버킷 하나를 나눠 써서 무작위 토큰·id를
 * 연달아 여는 방문자 한 명이 모든 방문자의 궁합·신년운세 공유 화면을 1분 동안 429로 만들 수 있었다(12차 리뷰 R12-3-9). 이제
 * 내부 키와 함께 방문자 IP를 넘겨 백엔드가 방문자별로 나눠 센다 — 헤더는 `apiClient.ts`가 **내부 키를 보낼 때만** 붙인다(내부
 * 키가 없으면 백엔드는 이 값을 믿을 이유가 없다).
 *
 * 어느 항목을 쓰나: `X-Forwarded-For`의 **맨 오른쪽**(마지막) 항목. Cloud Run 앞단(Google Front End)은 실제 접속 IP를 목록 끝에
 * 덧붙이고, 그 앞의 항목은 방문자가 직접 보낸 값이라 마음대로 바꿀 수 있다 — 맨 앞을 쓰면 요청마다 가짜 IP를 넣어 한도를
 * 피할 수 있다. 백엔드가 `trust proxy` 1홉으로 `req.ip`를 정하는 것과 같은 규칙이다. Next 서버는 이 헤더가 없을 때만 소켓 주소로
 * 채운다(덧붙이지 않음). 앞에 부하 분산기를 더 두면 맨 오른쪽이 그 부하 분산기 IP가 되므로(모든 방문자가 한 IP — 지금과 같은
 * 공용 버킷으로 돌아갈 뿐 우회는 아님) 그때 이 규칙을 다시 볼 것.
 */
export const VISITOR_IP_HEADER = 'X-Visitor-Ip';

const IPV4_OCTET = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const IPV4_PATTERN = new RegExp(`^${IPV4_OCTET}(\\.${IPV4_OCTET}){3}$`);
const IPV4_MAPPED_PATTERN = new RegExp(`^::ffff:(${IPV4_OCTET}(\\.${IPV4_OCTET}){3})$`, 'i');
const IPV6_CHARS_PATTERN = /^[0-9a-f:.]{2,45}$/i;

/** IP 주소 모양이면 정리한 값(IPv4 그대로, IPv4-mapped IPv6는 IPv4로, IPv6는 소문자 압축형), 아니면 undefined. */
export function normalizeIpAddress(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const candidate = value.trim();
  if (IPV4_PATTERN.test(candidate)) return candidate;
  const mapped = IPV4_MAPPED_PATTERN.exec(candidate);
  if (mapped) return mapped[1];
  if (!candidate.includes(':') || !IPV6_CHARS_PATTERN.test(candidate)) return undefined;
  try {
    // URL 파서가 IPv6 문법 검사와 정규화(소문자·0 압축)를 함께 해 준다 — Node·브라우저 공용(node:net 없이).
    const hostname = new URL(`http://[${candidate}]/`).hostname;
    return hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : undefined;
  } catch {
    return undefined;
  }
}

/** `X-Forwarded-For` 값에서 방문자 IP(맨 오른쪽 항목) — 없거나 IP 모양이 아니면 undefined. */
export function pickVisitorIp(forwardedFor: string | null | undefined): string | undefined {
  if (!forwardedFor) return undefined;
  const entries = forwardedFor
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  return normalizeIpAddress(entries[entries.length - 1]);
}
