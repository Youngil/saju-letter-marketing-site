import type { HeavenlyStem } from '@/lib/sajuVocabulary';

/**
 * 날 유형(일간) 별명(2026-10-15 사용자 결정) — 명리학에서 10천간을 자연에 빗대는 전통 물상을 짧게: 나무 · 화초 · 태양 · 불꽃 · 산 · 대지 · 바위 · 보석 ·
 * 바다 · 이슬. 영어·포르투갈어·베트남어는 오행 이름(fire·earth / fogo·terra / hỏa·thổ)을 피한다(공개 문구에 오행 명칭 금지). backend
 * `src/content/dailyLetterLine.ts`·ops-agent `videoSeries.ts`(ko·en·es·ja)와 같은 표 — 인스타 "오늘의 편지 한 줄"·V1 영상이 "내 날은 어떤 자연인지
 * saju-letter.com에서 확인"으로 보내므로, 홈 미니 데모 결과가 같은 별명을 보여 준다. pt·vi·ja는 원어민 검토 대상.
 */
export const DAY_TYPE_NICKNAMES: Record<HeavenlyStem, Record<string, string>> = {
  甲: { ko: '나무', en: 'tree', es: 'árbol', ja: '木', pt: 'árvore', vi: 'cây' },
  乙: { ko: '화초', en: 'flower', es: 'flor', ja: '草花', pt: 'flor', vi: 'hoa' },
  丙: { ko: '태양', en: 'sun', es: 'sol', ja: '太陽', pt: 'sol', vi: 'mặt trời' },
  丁: { ko: '불꽃', en: 'flame', es: 'llama', ja: '炎', pt: 'chama', vi: 'ngọn lửa' },
  戊: { ko: '산', en: 'mountain', es: 'montaña', ja: '山', pt: 'montanha', vi: 'núi' },
  己: { ko: '대지', en: 'land', es: 'raíces', ja: '大地', pt: 'campo', vi: 'cánh đồng' },
  庚: { ko: '바위', en: 'rock', es: 'roca', ja: '岩', pt: 'rocha', vi: 'đá' },
  辛: { ko: '보석', en: 'jewel', es: 'joya', ja: '宝石', pt: 'joia', vi: 'ngọc' },
  壬: { ko: '바다', en: 'sea', es: 'mar', ja: '海', pt: 'mar', vi: 'biển' },
  癸: { ko: '이슬', en: 'dew', es: 'rocío', ja: '露', pt: 'orvalho', vi: 'sương' },
};

export function dayTypeNickname(stem: HeavenlyStem, language: string): string {
  const names = DAY_TYPE_NICKNAMES[stem];
  return names[language] ?? names.en!;
}

/** 사전 문장의 `{name}` 자리에 별명을 넣는다. */
export function dayTypeLine(template: string, stem: HeavenlyStem, language: string): string {
  return template.replace('{name}', dayTypeNickname(stem, language));
}
