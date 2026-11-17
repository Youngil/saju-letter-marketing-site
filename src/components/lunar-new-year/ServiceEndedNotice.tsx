import type { MarketingLanguage } from '@/lib/languages';
import { SERVICE_ENDING_COPY, serviceEndingText } from '@/content/serviceEnding';

/** 신년운세 랜딩 대신 보이는 종료 안내(2026-11-17, `content/serviceEnding.ts`) — 폼·앱 설치 안내 없이 한 장만. */
export function ServiceEndedNotice({ language, brand }: { language: MarketingLanguage; brand: string }) {
  const copy = SERVICE_ENDING_COPY[language];
  return (
    <div className="mx-auto my-16 flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold">{copy.newYearTitle}</h1>
      <p className="text-stone-600">{serviceEndingText(copy.newYearBody, brand)}</p>
    </div>
  );
}
