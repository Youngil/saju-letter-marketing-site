import KoreanLunarCalendar from 'korean-lunar-calendar';

/**
 * 한국 음력(한국천문연구원 KASI 역서 기준) ↔ 양력 변환(2026-10-07 전체 점검 13차 F1).
 *
 * 예전엔 음력 입력을 lunar-javascript(중국 음력, 베이징 시 UTC+8 합삭 기준)로 바꿨다. 합삭이 베이징 23:00~24:00(한국은 다음
 * 날 00:00~01:00)에 드는 달은 한국 음력 1일이 하루 늦어, 그 달 한 달 내내 양력 날짜(→ 일주·일간)가 하루 앞당겨졌다(예: 음력
 * 1997-01-01은 한국 설날 1997-02-08인데 앱은 02-07로 계산). 그 바로 앞 달은 한국에선 30일인데 29일까지만 고를 수 있었고,
 * 윤달도 해에 따라 다르다(2012 한국 윤3월/중국 윤4월, 2017 한국 윤5월/중국 윤6월). 1900~2050년 사이 시작일이 갈리는 달이 64개.
 *
 * 그래서 **음력→양력 변환·음력 달의 일수·윤달 여부만** 한국 음력 표(npm `korean-lunar-calendar`, MIT, KASI 기준 내장 표, 음력
 * 1000-01-01~2050-11-18)로 한다. 사주 기둥은 이렇게 얻은 양력 날짜(+시각)를 lunar-javascript `Solar`에 넣어 그대로 계산한다 —
 * 기둥은 양력 날짜와 절기로 정해지므로 라이브러리를 계속 써도 된다.
 *
 * saju-letter-mobile `src/domain/saju/koreanLunar.ts`의 사본이다 — 바꿀 때 함께 바꾼다.
 */
export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

/** 표가 다루는 음력 연도 범위(라이브러리 상수와 같다 — 2050년은 11월 18일까지). */
export const KOREAN_LUNAR_MIN_YEAR = 1000;
export const KOREAN_LUNAR_MAX_YEAR = 2050;

// 상태를 가진 변환기지만 동기 호출만 하므로 하나를 같이 쓴다(누적 일수 캐시를 다시 만들지 않게).
let converter: KoreanLunarCalendar | null = null;
function getConverter(): KoreanLunarCalendar {
  converter ??= new KoreanLunarCalendar();
  return converter;
}

function isIntegerInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

/** 한국 음력 날짜 → 양력 날짜. 없는 날짜(30일이 없는 달의 30일, 그 해에 없는 윤달 등)나 표 범위 밖이면 null. */
export function koreanLunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean): SolarDate | null {
  if (!isIntegerInRange(year, KOREAN_LUNAR_MIN_YEAR, KOREAN_LUNAR_MAX_YEAR)) return null;
  if (!isIntegerInRange(month, 1, 12) || !isIntegerInRange(day, 1, 30)) return null;
  const calendar = getConverter();
  if (!calendar.setLunarDate(year, month, day, isLeapMonth)) return null;
  const solar = calendar.getSolarCalendar();
  return { year: solar.year, month: solar.month, day: solar.day };
}

/** 그 해 한국 음력의 윤달(1~12), 없으면 0. 표 범위 밖 연도도 0. */
export function getKoreanLunarLeapMonth(year: number): number {
  for (let month = 1; month <= 12; month += 1) {
    if (koreanLunarToSolar(year, month, 1, true) !== null) return month;
  }
  return 0;
}

/** 한국 음력 연/월(윤달 여부 포함)의 일수(29 또는 30). 없는 조합이면 null. */
export function getKoreanLunarDaysInMonth(year: number, month: number, isLeapMonth: boolean): number | null {
  if (koreanLunarToSolar(year, month, 1, isLeapMonth) === null) return null;
  return koreanLunarToSolar(year, month, 30, isLeapMonth) !== null ? 30 : 29;
}
