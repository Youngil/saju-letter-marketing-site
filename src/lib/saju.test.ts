import { describe, expect, it } from 'vitest';
import { calculateSaju } from './saju';

describe('calculateSaju', () => {
  // saju-letter-mobile/src/domain/saju/calculateSaju.test.ts의 검증된 샘플 1과 동일한 값
  // (양력 1993-04-15 10:30) — 여러 저장소가 독립적으로 같은 결과를 내는지 대조하는 회귀 가드.
  it('시간을 알 때 4주 전체를 계산한다', () => {
    const chart = calculateSaju({ calendarType: 'solar', year: 1993, month: 4, day: 15, hour: 10, minute: 30 });
    expect(chart.yearPillar).toEqual({ stem: '癸', branch: '酉' });
    expect(chart.monthPillar).toEqual({ stem: '丙', branch: '辰' });
    expect(chart.dayPillar).toEqual({ stem: '丙', branch: '寅' });
    expect(chart.hourPillar).toEqual({ stem: '癸', branch: '巳' });
  });

  it('시간을 모르면 시주는 null이고, 일주는 정오 기준으로 그대로 계산된다', () => {
    const chart = calculateSaju({ calendarType: 'solar', year: 1993, month: 4, day: 15 });
    expect(chart.hourPillar).toBeNull();
    expect(chart.dayPillar).toEqual({ stem: '丙', branch: '寅' });
  });

  it('만세력 기준일(2000-01-01 = 戊午日)과 대조해 일주 정확성을 확인한다', () => {
    const chart = calculateSaju({ calendarType: 'solar', year: 2000, month: 1, day: 1 });
    expect(chart.dayPillar).toEqual({ stem: '戊', branch: '午' });
  });

  it('잘못된 month는 RangeError를 던진다', () => {
    expect(() => calculateSaju({ calendarType: 'solar', year: 2000, month: 13, day: 1 })).toThrow(RangeError);
  });

  // 궁합 공유 웹페이지 이관(2026-08-12) 때 옛 saju-letter-backend/src/lunar/guestDayMasterWebPage.test.ts(이제
  // 삭제됨)에서 이식한 음력 입력 회귀 가드 — 같은 날을 가리키는 양력/음력 입력이 항상 같은
  // 일간을 내는지 대조한다.
  const lunarSamples: { name: string; solar: { year: number; month: number; day: number }; lunar: { year: number; month: number; day: number }; expectedDayMaster: string }[] = [
    { name: '샘플 1', solar: { year: 1993, month: 4, day: 15 }, lunar: { year: 1993, month: 3, day: 24 }, expectedDayMaster: '丙' },
    { name: '샘플 2', solar: { year: 1988, month: 8, day: 20 }, lunar: { year: 1988, month: 7, day: 9 }, expectedDayMaster: '丁' },
    { name: '샘플 3', solar: { year: 1995, month: 11, day: 5 }, lunar: { year: 1995, month: 9, day: 13 }, expectedDayMaster: '庚' },
    { name: '샘플 4', solar: { year: 2000, month: 2, day: 18 }, lunar: { year: 2000, month: 1, day: 14 }, expectedDayMaster: '丙' },
    { name: '샘플 5', solar: { year: 1991, month: 7, day: 25 }, lunar: { year: 1991, month: 6, day: 14 }, expectedDayMaster: '丙' },
  ];

  for (const sample of lunarSamples) {
    it(`${sample.name}: 같은 날을 가리키는 음력 입력으로도 양력과 동일한 일간을 낸다`, () => {
      const solarChart = calculateSaju({ calendarType: 'solar', ...sample.solar });
      const lunarChart = calculateSaju({ calendarType: 'lunar', ...sample.lunar });
      expect(solarChart.dayPillar.stem).toBe(sample.expectedDayMaster);
      expect(lunarChart.dayPillar.stem).toBe(sample.expectedDayMaster);
    });
  }

  it('윤달(음력) 입력이 절기 기준 실제 양력 날짜와 같은 일간을 낸다 (1993년 윤3월24일 = 양력 5/15, 일주 丙申)', () => {
    const leapMonthChart = calculateSaju({ calendarType: 'lunar', year: 1993, month: 3, day: 24, isLeapMonth: true });
    const equivalentSolarChart = calculateSaju({ calendarType: 'solar', year: 1993, month: 5, day: 15 });
    expect(leapMonthChart.dayPillar.stem).toBe('丙');
    expect(leapMonthChart.dayPillar).toEqual(equivalentSolarChart.dayPillar);
  });
});
