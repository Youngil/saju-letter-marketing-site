import { DateTime, IANAZone } from 'luxon';

/**
 * 출생 시각을 사주 계산용 시계 두 개로 바꾼다(2026-10-07 전체 점검 13차 F2).
 *
 * 예전엔 입력한 벽시계 시각을 그대로 lunar-javascript에 넣었다. 라이브러리의 절기 시각은 베이징 시(UTC+8)라, 한국 출생은 절입
 * 직후 1시간, 미 동부는 반나절 넘게 년주·월주가 틀렸고(예: KST 2000-02-04 21:00은 입춘(KST 21:40) 전인데 庚辰年 戊寅月로 계산),
 * 서머타임 출생(한국 1948~51·1955~60·1987~88 등)은 시주·일주가 한 시간 밀렸다.
 *
 * 이제 출생 타임존(앱은 온보딩 타임존, 이 사이트는 `assumedBirthTimeZone`)과 tzdb(luxon → Intl)로 출생 순간(UTC)을 구해
 * - **년주·월주**(절기 경계): 그 순간의 베이징 시각(UTC+8 고정 — 라이브러리 절기 표의 기준)으로 계산하고
 * - **일주·시주**: 서머타임을 뺀 그 지역의 **표준시** 벽시계로 계산한다(자시 처리는 라이브러리 기본 sect 2 — 야자시 관례 그대로).
 *
 * 진태양시(경도) 보정은 하지 않는다 — 명리학 자문 항목(meta CLAUDE.md 미결정)이라 사람이 정할 때까지 표준시까지만.
 * 타임존이 없거나 알 수 없는 이름이면 null을 돌려주고, 호출하는 쪽은 예전처럼 벽시계를 그대로 쓴다.
 *
 * saju-letter-mobile `src/domain/saju/birthClock.ts`의 사본이다 — 바꿀 때 함께 바꾼다. 이 사이트엔 출생 타임존 입력이 없어 `assumedBirthTimeZone`(saju.ts)으로 정한다.
 */
export interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface BirthClocks {
  /** 년주·월주(절기 판정)용 — 출생 순간의 베이징 시각(UTC+8). */
  solarTermClock: WallClock;
  /** 일주·시주용 — 출생지 표준시(서머타임 제외) 벽시계. */
  dayClock: WallClock;
}

const BEIJING_OFFSET_MINUTES = 8 * 60;
const MINUTE_MS = 60_000;
/** 서머타임 판정에 쓰는 표본 간격(평균 한 달)과 앞뒤 표본 수 — 서머타임 기간(길어야 7~8개월)을 양쪽에서 벗어날 만큼. */
const SAMPLE_STEP_MS = 30.44 * 24 * 60 * MINUTE_MS;
const SAMPLE_COUNT = 8;

function clockAt(epochMs: number, offsetMinutes: number): WallClock {
  const shifted = DateTime.fromMillis(epochMs + offsetMinutes * MINUTE_MS, { zone: 'utc' });
  return { year: shifted.year, month: shifted.month, day: shifted.day, hour: shifted.hour, minute: shifted.minute };
}

/**
 * 그 순간 그 지역의 표준시 오프셋(분). tzdb는 Intl로 "서머타임인지"를 바로 알려 주지 않아, 앞뒤 8개월을 한 달 간격으로 보고
 * **양쪽 모두에 지금보다 작은 오프셋이 있으면**(잠깐 올라갔다 내려오는 구간) 서머타임으로 보고 그 작은 값을 표준시로 삼는다.
 * 표준시 자체가 바뀐 경우(예: 서울 1954-03 +9→+8:30, 1961-08 +8:30→+9)는 한쪽에만 다른 값이 있어 서머타임으로 보지 않는다.
 */
export function standardOffsetMinutes(zone: IANAZone, epochMs: number): number {
  const current = zone.offset(epochMs);
  let minBefore = Infinity;
  let minAfter = Infinity;
  for (let k = 1; k <= SAMPLE_COUNT; k += 1) {
    minBefore = Math.min(minBefore, zone.offset(epochMs - k * SAMPLE_STEP_MS));
    minAfter = Math.min(minAfter, zone.offset(epochMs + k * SAMPLE_STEP_MS));
  }
  if (minBefore < current && minAfter < current) return Math.max(minBefore, minAfter);
  return current;
}

/**
 * 벽시계(출생지 현지 시각) + 출생 타임존 → 사주 계산용 시계 두 개. 타임존이 없거나 잘못됐거나 날짜가 없는 값이면 null.
 * 서머타임 시작으로 건너뛴 시각(존재하지 않는 시각)은 luxon 규칙대로 앞으로 밀어(한 시간 뒤의 서머타임 시각) 해석한다.
 */
export function resolveBirthClocks(wall: WallClock, timeZone: string | null | undefined): BirthClocks | null {
  if (!timeZone || !IANAZone.isValidZone(timeZone)) return null;
  const zone = IANAZone.create(timeZone);
  const local = DateTime.fromObject(
    { year: wall.year, month: wall.month, day: wall.day, hour: wall.hour, minute: wall.minute, second: 0, millisecond: 0 },
    { zone },
  );
  if (!local.isValid) return null;
  const epochMs = local.toMillis();
  return {
    solarTermClock: clockAt(epochMs, BEIJING_OFFSET_MINUTES),
    dayClock: clockAt(epochMs, standardOffsetMinutes(zone, epochMs)),
  };
}

/** 기기 타임존(IANA 이름). 못 읽으면 빈 문자열 — 사주 계산은 그때 예전처럼 벽시계를 그대로 쓴다. */
export function detectDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    return '';
  }
}
