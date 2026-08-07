import type { MarketingLanguage } from '@/lib/languages';
import type { MarketingDictionary } from './types';

const loaders: Record<MarketingLanguage, () => Promise<MarketingDictionary>> = {
  ko: () => import('./ko').then((m) => m.dictionary),
  en: () => import('./en').then((m) => m.dictionary),
  es: () => import('./es').then((m) => m.dictionary),
  pt: () => import('./pt').then((m) => m.dictionary),
  ja: () => import('./ja').then((m) => m.dictionary),
  vi: () => import('./vi').then((m) => m.dictionary),
};

/**
 * saju-letter-newyear-campaign의 useCampaignLanguage()(클라이언트 훅, useSyncExternalStore)와
 * 달리 async 함수다 — [lang]/layout.tsx가 서버 컴포넌트에서 params.lang을 받아 직접 호출하므로
 * 클라이언트 쪽 언어 감지가 필요 없다(URL이 이미 언어를 갖고 있다, src/lib/languages.ts 참고).
 */
export async function getDictionary(lang: MarketingLanguage): Promise<MarketingDictionary> {
  return loaders[lang]();
}

export type { MarketingDictionary };
