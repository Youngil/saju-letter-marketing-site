/**
 * lunar-javascript는 공식 TypeScript 타입을 제공하지 않으므로, 이 프로젝트가 실제로 쓰는
 * API 표면만 최소한으로 선언한다(saju-letter-mobile/saju-letter-backend/
 * saju-letter-newyear-campaign의 동명 파일과 같은 이유 — 각 저장소가 독립 워크스페이스라
 * 따로 선언한다).
 * https://github.com/6tail/lunar-javascript
 *
 * 이 사이트의 미니 데모도 신년운세 캠페인과 마찬가지로 양력 입력만 받는다(음력/윤달 처리는
 * 범위 밖) — 그래서 mobile/backend의 동명 파일과 달리 Lunar.fromYmd(음력 생성자)는
 * 선언하지 않는다.
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
  }

  export interface Solar {
    getLunar(): Lunar;
  }

  export const Solar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
  };
}
