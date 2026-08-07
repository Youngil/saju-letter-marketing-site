import { ImageResponse } from 'next/og';
import { getReading } from '@/lib/lunarNewYearApi';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * saju-letter-newyear-campaign/src/app/r/[id]/opengraph-image.tsx와 동일한 Next.js 파일
 * 규약 — 결과별로 동적 OG 카드를 만든다(공유 시 미리보기).
 */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reading = await getReading(id);

  const title = reading?.content.title ?? 'Saju Letter';
  const subtitle = reading ? `for ${reading.name}` : 'Korean New Year Fortune';

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
        <div style={{ fontSize: 28, letterSpacing: 4, color: '#b5652f', marginBottom: 24 }}>SAJU LETTER</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 32, marginTop: 24, color: '#6b6151' }}>{subtitle}</div>
      </div>
    ),
    { ...size },
  );
}
