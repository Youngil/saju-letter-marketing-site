'use client';

import { useEffect, useState } from 'react';
import type { MarketingDictionary } from '@/dictionaries/types';
import type { NonKoreanLanguage } from '@/lib/languages';
import { getCampaignWindow, type CampaignWindowStatus } from '@/lib/lunarNewYearApi';
import { ReadingForm } from './ReadingForm';
import { OffSeasonPlaceholder } from './OffSeasonPlaceholder';

type LunarNewYearDict = NonNullable<MarketingDictionary['lunarNewYear']>;

export function LunarNewYearHome({
  language,
  dict: t,
  appLinksDict,
}: {
  language: NonKoreanLanguage;
  dict: LunarNewYearDict;
  appLinksDict: MarketingDictionary['appLinks'];
}) {
  const [windowStatus, setWindowStatus] = useState<CampaignWindowStatus | null>(null);

  useEffect(() => {
    getCampaignWindow()
      .then(setWindowStatus)
      .catch((error) => {
        console.warn('getCampaignWindow failed', error);
        // 조회 실패 시 폼을 막지 않는다 — 서버 쪽이 어차피 제출 시점에 다시 검증한다.
        setWindowStatus({ active: true });
      });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 py-10">
      {windowStatus === null ? null : windowStatus.active ? (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{t.landing.title}</h1>
            <p className="mt-2 text-stone-600">{t.landing.subtitle}</p>
          </div>
          <ReadingForm language={language} dict={t.landing} />
        </>
      ) : (
        <OffSeasonPlaceholder
          language={language}
          nextStartsAt={windowStatus.nextStartsAt ?? { year: 2026, month: 1, day: 17 }}
          dict={t.offSeason}
          appLinksDict={appLinksDict}
        />
      )}

      <footer className="mt-auto pt-8 text-center text-xs text-stone-400">{t.footerPrivacy}</footer>
    </div>
  );
}
