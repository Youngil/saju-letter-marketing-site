import { ImageResponse } from 'next/og';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, isLaunchContentLanguage, LAUNCH_CONTENT_LANGUAGES } from '@/lib/languages';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * saju-letter-newyear-campaign의 r/[id]/opengraph-image.tsx와 같은 Next.js 파일 규약을
 * 쓴다 — 다만 compare 페이지는 정적 콘텐츠라 백엔드 호출 없이 dictionary만으로 카드를 만든다.
 */
/** 빌드 때 콘텐츠 축 4개 언어 카드를 미리 만든다(2026-10-06 전체 점검 8차) — compare 페이지와 같은 언어 집합. */
export function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.map((lang) => ({ lang }));
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const dict = await getDictionary(isMarketingLanguage(rawLang) && isLaunchContentLanguage(rawLang) ? rawLang : 'en');

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
        <div style={{ fontSize: 28, letterSpacing: 4, color: '#208aef', marginBottom: 24 }}>SAJU LETTER</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>{dict.compare.ogTitle}</div>
        <div style={{ fontSize: 30, marginTop: 24, color: '#6b6151' }}>{dict.compare.ogDescription}</div>
      </div>
    ),
    { ...size },
  );
}
