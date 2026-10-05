import { ImageResponse } from 'next/og';
import { getReading } from '@/lib/lunarNewYearApi';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, type MarketingLanguage } from '@/lib/languages';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * saju-letter-newyear-campaign/src/app/r/[id]/opengraph-image.tsx와 동일한 Next.js 파일
 * 규약 — 결과별로 동적 OG 카드를 만든다(공유 시 미리보기).
 */
/**
 * "{이름}님을 위한" 부제 — 페이지 언어로(2026-10-06 전체 점검 8차, 예전엔 모든 언어에서 영어 "for {name}"이었다).
 * 사전에 없는 OG 전용 짧은 문구라 여기 둔다(`[lang]/error.tsx`의 `ERROR_COPY`와 같은 방식).
 */
const FOR_NAME: Record<MarketingLanguage, (name: string) => string> = {
  ko: (name) => `${name}님을 위한 신년운세`,
  en: (name) => `for ${name}`,
  ja: (name) => `${name}さんへ`,
  es: (name) => `para ${name}`,
  pt: (name) => `para ${name}`,
  vi: (name) => `dành cho ${name}`,
};

export default async function Image({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: rawLang, id } = await params;
  const language: MarketingLanguage = isMarketingLanguage(rawLang) ? rawLang : 'en';
  const reading = await getReading(id).catch(() => null);
  const dict = await getDictionary(language);

  const title = reading?.content.title ?? 'Saju Letter';
  const subtitle = reading
    ? FOR_NAME[language](reading.name)
    : (dict.lunarNewYear?.landing.title ?? 'Korean New Year Fortune');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fbf6ee',
          color: '#2b2621',
          padding: 80,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, color: '#a85e2c', marginBottom: 24 }}>SAJU LETTER</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 32, marginTop: 24, color: '#6b6151' }}>{subtitle}</div>
      </div>
    ),
    { ...size },
  );
}
