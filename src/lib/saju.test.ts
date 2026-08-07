import { describe, expect, it } from 'vitest';
import { calculateSaju } from './saju';

describe('calculateSaju', () => {
  // saju-letter-mobile/src/domain/saju/calculateSaju.test.ts의 검증된 샘플 1과 동일한 값
  // (양력 1993-04-15 10:30) — 여러 저장소가 독립적으로 같은 결과를 내는지 대조하는 회귀 가드.
  it('시간을 알 때 4주 전체를 계산한다', () => {
    const chart = calculateSaju({ year: 1993, month: 4, day: 15, hour: 10, minute: 30 });
    expect(chart.yearPillar).toEqual({ stem: '癸', branch: '酉' });
    expect(chart.monthPillar).toEqual({ stem: '丙', branch: '辰' });
    expect(chart.dayPillar).toEqual({ stem: '丙', branch: '寅' });
    expect(chart.hourPillar).toEqual({ stem: '癸', branch: '巳' });
  });

  it('시간을 모르면 시주는 null이고, 일주는 정오 기준으로 그대로 계산된다', () => {
    const chart = calculateSaju({ year: 1993, month: 4, day: 15 });
    expect(chart.hourPillar).toBeNull();
    expect(chart.dayPillar).toEqual({ stem: '丙', branch: '寅' });
  });

  it('만세력 기준일(2000-01-01 = 戊午日)과 대조해 일주 정확성을 확인한다', () => {
    const chart = calculateSaju({ year: 2000, month: 1, day: 1 });
    expect(chart.dayPillar).toEqual({ stem: '戊', branch: '午' });
  });

  it('잘못된 month는 RangeError를 던진다', () => {
    expect(() => calculateSaju({ year: 2000, month: 13, day: 1 })).toThrow(RangeError);
  });
});
