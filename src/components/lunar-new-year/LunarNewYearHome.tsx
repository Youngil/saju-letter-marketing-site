import type { MarketingDictionary } from '@/dictionaries/types';
import type { MarketingLanguage } from '@/lib/languages';
import type { CampaignWindowStatus } from '@/lib/lunarNewYearApi';
import { ReadingForm } from './ReadingForm';
import { OffSeasonPlaceholder } from './OffSeasonPlaceholder';
import { DISCLAIMER_CONTENT } from '@/content/disclaimer';

type LunarNewYearDict = NonNullable<MarketingDictionary['lunarNewYear']>;

/**
 * 신년운세 랜딩 본문 — 서버 컴포넌트(2026-10-06). 예전엔 브라우저에서 기간을 조회한 뒤에야 제목과 폼을 그려서
 * 검색엔진에는 빈 페이지로 보였고, 조회가 실패하면 비시즌에도 폼을 띄웠다. 이제 페이지가 서버에서 기간을 읽어 넘긴다.
 * 기간 조회 자체가 실패하면(windowStatus=null — 빌드 중에만, 실행 중엔 페이지가 던진다) 폼 대신 중립 안내를 그린다
 * (2026-10-06 전체 점검 11차 R11-6-3 — 예전엔 폼을 그려 ISR이 "폼 열림"을 굳혔다). 기간 안이라도 제출 때 서버가 기간을
 * 다시 확인한다(ReadingForm이 campaign_not_active를 비시즌 안내로 바꿔 보여 준다).
 */
export function LunarNewYearHome({
  language,
  dict: t,
  appLinksDict,
  windowStatus,
}: {
  language: MarketingLanguage;
  dict: LunarNewYearDict;
  appLinksDict: MarketingDictionary['appLinks'];
  windowStatus: CampaignWindowStatus | null;
}) {
  const showOffSeason = windowStatus !== null && !windowStatus.active && windowStatus.nextStartsAt;
  const windowUnknown = windowStatus === null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 py-10">
      {showOffSeason ? (
        <OffSeasonPlaceholder language={language} nextStartsAt={windowStatus.nextStartsAt!} dict={t.offSeason} appLinksDict={appLinksDict} />
      ) : (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{t.landing.title}</h1>
            <p className="mt-2 text-stone-600">{t.landing.subtitle}</p>
          </div>
          {windowUnknown ? (
            <p role="status" className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-stone-600">
              {t.landing.errors.generic}
            </p>
          ) : (
            <ReadingForm
              language={language}
              dict={t.landing}
              offSeasonMessage={t.offSeason.title}
              disclaimerShort={DISCLAIMER_CONTENT[language].short}
            />
          )}
        </>
      )}

      <footer className="mt-auto pt-8 text-center text-xs text-stone-600">{t.footerPrivacy}</footer>
    </div>
  );
}
