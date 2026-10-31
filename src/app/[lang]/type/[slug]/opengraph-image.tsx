import { ImageResponse } from 'next/og';
import { DAY_TYPE_COPY } from '@/content/dayTypeCopy';
import { dayTypeLine } from '@/content/dayTypeNicknames';
import { dayTypeTrait } from '@/content/dayTypeTraits';
import { DAY_TYPE_SLUGS, dayTypeArtSvg, stemFromDayTypeSlug } from '@/lib/dayType';
import { isLaunchContentLanguage, isMarketingLanguage, LAUNCH_CONTENT_LANGUAGES, type LaunchContentLanguage } from '@/lib/languages';
import { HEAVENLY_STEMS } from '@/lib/sajuVocabulary';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** 페이지와 같은 40장을 빌드 때 미리 만든다. */
export function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.flatMap((lang) => HEAVENLY_STEMS.map((stem) => ({ lang, slug: DAY_TYPE_SLUGS[stem] })));
}

/**
 * 날 유형 공유 카드(2026-10-31) — 메신저·SNS 미리보기. 앱 1.1.7 날 유형 공유 카드처럼 그림 + "'불꽃' 날" + 한 줄. 모르는 주소면 그림 없이
 * 질문과 사주 한 줄만(페이지는 404).
 */
export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params;
  const lang: LaunchContentLanguage = isMarketingLanguage(rawLang) && isLaunchContentLanguage(rawLang) ? rawLang : 'en';
  const stem = stemFromDayTypeSlug(slug);
  const copy = DAY_TYPE_COPY[lang];
  const art = stem ? `data:image/svg+xml;base64,${Buffer.from(dayTypeArtSvg(stem, 300)).toString('base64')}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: '#fbf6ee',
          color: '#2b2621',
          padding: '0 90px',
          gap: 70,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og(Satori)는 <img>만 그린다 */}
        {art && <img src={art} width={300} height={300} alt="" />}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: '#a85e2c', marginBottom: 22 }}>SAJU LETTER</div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>{stem ? dayTypeLine(copy.heading, stem, lang) : copy.question}</div>
          <div style={{ fontSize: 32, marginTop: 26, lineHeight: 1.4, color: '#4a4237', whiteSpace: 'pre-line' }}>
            {stem ? dayTypeTrait(stem, lang) : copy.note}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
