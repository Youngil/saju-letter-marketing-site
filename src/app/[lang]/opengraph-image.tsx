import { ImageResponse } from 'next/og';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage } from '@/lib/languages';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * 사이트 공통 기본 OG 카드 — compare/compat/lunar-new-year 결과 페이지처럼 전용 카드가 없는
 * 페이지(홈/블로그/개인정보처리방침 등)가 이 세그먼트의 이미지를 URL로 직접 참조해 재사용한다
 * (Next.js는 이 파일 규약을 같은 세그먼트에서만 자동 적용하고 하위 세그먼트로 자동 상속하지
 * 않으므로, 다른 세그먼트는 `${WEB_BASE_URL}/${lang}/opengraph-image`를 openGraph.images에
 * 직접 넣는다 — compare/opengraph-image.tsx와 같은 스타일로 통일).
 */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const dict = await getDictionary(isMarketingLanguage(rawLang) ? rawLang : 'en');

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
        <div style={{ fontSize: 28, letterSpacing: 4, color: '#208aef', marginBottom: 24 }}>{dict.brand.toUpperCase()}</div>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.25 }}>{dict.hero.title}</div>
      </div>
    ),
    { ...size },
  );
}
