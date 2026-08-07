/** saju-letter-backend/src/domain/sajuVocabulary.ts와 동일한 값 — 별도 저장소라 복제해 둔다. */
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

export const HEAVENLY_STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export function isHeavenlyStem(value: string): value is HeavenlyStem {
  return (HEAVENLY_STEMS as string[]).includes(value);
}

export function isEarthlyBranch(value: string): value is EarthlyBranch {
  return (EARTHLY_BRANCHES as string[]).includes(value);
}
