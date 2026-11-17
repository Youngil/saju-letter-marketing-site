import type { MarketingLanguage } from '@/lib/languages';
import { SERVICE_ENDING, SERVICE_ENDING_COPY, serviceEndingText } from '@/content/serviceEnding';

/** 모든 페이지 맨 위 서비스 종료 안내 한 줄(2026-11-17, `content/serviceEnding.ts`). 서버 컴포넌트 — 현재 언어 문자열만 그린다. */
export function ServiceEndingBanner({ language, brand }: { language: MarketingLanguage; brand: string }) {
  if (!SERVICE_ENDING) return null;
  return (
    <div role="status" className="border-b border-foreground/10 bg-accent-warm/10 px-4 py-2 text-center text-sm text-foreground/80">
      {serviceEndingText(SERVICE_ENDING_COPY[language].banner, brand)}
    </div>
  );
}
