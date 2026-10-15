import { describe, expect, it } from 'vitest';
import { DAY_TYPE_NICKNAMES, dayTypeLine, dayTypeNickname } from './dayTypeNicknames';

describe('날 유형 별명(2026-10-15)', () => {
  it('10개 일간 모두 6개 언어 별명이 있고, 오행 이름(fire·earth 등)을 쓰지 않는다', () => {
    expect(Object.keys(DAY_TYPE_NICKNAMES)).toHaveLength(10);
    for (const names of Object.values(DAY_TYPE_NICKNAMES)) {
      expect(Object.keys(names).sort()).toEqual(['en', 'es', 'ja', 'ko', 'pt', 'vi']);
      expect(names.en).not.toMatch(/^(fire|earth|wood|metal|water)$/);
      expect(names.pt).not.toMatch(/^(fogo|terra|madeira|metal|água)$/);
    }
    expect(dayTypeNickname('丁', 'ko')).toBe('불꽃');
    expect(dayTypeNickname('丁', 'xx')).toBe('flame');
  });

  it('사전 문장의 {name} 자리에 별명을 넣는다', () => {
    expect(dayTypeLine("당신은 '{name}' 날에 태어났어요", '癸', 'ko')).toBe("당신은 '이슬' 날에 태어났어요");
  });
});
