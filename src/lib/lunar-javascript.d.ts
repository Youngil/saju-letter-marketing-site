/**
 * lunar-javascript는 공식 TypeScript 타입을 제공하지 않으므로, 이 프로젝트가 실제로 쓰는
 * API 표면만 최소한으로 선언한다(saju-letter-mobile/saju-letter-backend/
 * saju-letter-newyear-campaign의 동명 파일과 같은 이유 — 각 저장소가 독립 워크스페이스라
 * 따로 선언한다).
 * https://github.com/6tail/lunar-javascript
 *
 * `Lunar.fromYmdHms`(음력 생성자)는 궁합 공유 웹페이지 이관(2026-08-12, saju.ts의 음력 입력
 * 지원) 때 추가했다 — 그 전까지는 이 사이트의 미니 데모/신년운세 캠페인이 전부 양력 입력만
 * 받아 필요 없었다.
 *
 * `LunarYear`는 saju-letter-mobile의 동명 선언에서 `getLeapMonth()`만 가져왔다(2026-09-04,
 * 종합 버그 점검 2회차) — 이 사이트는 day-count 드롭다운이 없는 plain number input이라
 * `getMonth()`(음력 월의 일수 조회용)까지는 필요 없다.
 */
declare module 'lunar-javascript' {
  export interface EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
  }

  export interface Lunar {
    getEightChar(): EightChar;
    getSolar(): Solar;
  }

  export interface Solar {
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  export const Solar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
  };

  export const Lunar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
  };

  export interface LunarYear {
    /** 그 해에 윤달이 없으면 0을 반환 */
    getLeapMonth(): number;
  }

  export const LunarYear: {
    fromYear(year: number): LunarYear;
  };
}
