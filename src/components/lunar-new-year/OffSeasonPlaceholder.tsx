import type { MarketingDictionary } from '@/dictionaries/types';
import type { MarketingLanguage } from '@/lib/languages';
import { AppDownloadLinks } from '@/components/AppDownloadLinks';

// pt/vi 항목은 2026-09-08 3차 종합 버그 점검(항목 1)으로 캠페인 언어 집합이
// MARKETING_LANGUAGES(6)로 복원되며 함께 추가됐다 — 그전까지는 이 맵 자체가 4개뿐이라 pt/vi
// 방문자가 오프시즌 화면에서 `formatDate`를 호출하면 `undefined` locale로 Intl이 예외를 던졌다.
const INTL_LOCALE: Record<MarketingLanguage, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  es: 'es-ES',
  pt: 'pt-BR',
  vi: 'vi-VN',
};

function formatDate(date: { year: number; month: number; day: number }, language: MarketingLanguage): string {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day));
  return new Intl.DateTimeFormat(INTL_LOCALE[language], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

type OffSeasonDict = NonNullable<MarketingDictionary['lunarNewYear']>['offSeason'];

/**
 * 오프시즌 — 캠페인 Fortune 톤은 유지하되, 하단에서만 아침 편지/앱으로 soft connect(Phase 6).
 * 다인 초상·히어로는 넣지 않는다(신년운세를 “다인의 점술”로 재포장하지 않음).
 */
export function OffSeasonPlaceholder({
  language,
  nextStartsAt,
  dict: t,
  appLinksDict,
}: {
  language: MarketingLanguage;
  nextStartsAt: { year: number; month: number; day: number };
  dict: OffSeasonDict;
  appLinksDict: MarketingDictionary['appLinks'];
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold">{t.title}</h1>
      <p className="text-stone-600">
        {t.body} <strong>{formatDate(nextStartsAt, language)}</strong>.
      </p>
      <p className="text-sm text-stone-500">{t.cta}</p>
      <AppDownloadLinks dict={appLinksDict} context="newyear_offseason" />
    </div>
  );
}
