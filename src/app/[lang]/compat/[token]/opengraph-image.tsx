import { ImageResponse } from 'next/og';
import { isMarketingLanguage } from '@/lib/languages';
import { getCompatInvite, type InviteView } from '@/lib/compatApi';
import { COMPAT_CONTENT, resolveCompatOg } from '@/content/compatContent';
import { isValidCompatToken } from '@/lib/routeParams';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * lunar-new-year/r/[id]/opengraph-image.tsx와 같은 패턴 — 토큰별로 독립적으로 다시 fetch해
 * 동적 OG 카드를 만든다(공유 시 미리보기). 옛 compatOgTags.ts는 og:image 자체가 없었다(브랜드
 * 이미지 에셋 부재) — 이 카드는 텍스트만으로 compare/lunar-new-year와 같은 스타일을 재사용해
 * 기존보다 오히려 나아진 상태를 새 에셋 없이 만든다.
 */
export default async function Image({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang: rawLang, token } = await params;
  const lang = isMarketingLanguage(rawLang) ? rawLang : 'en';
  const content = COMPAT_CONTENT[lang];
  // 일시 오류(429·5xx)면 이름 없는 일반 카드로 — 미리보기 카드가 "초대 없음"으로 굳지 않게.
  // 모양부터 틀린 토큰은 백엔드를 부르지 않고 같은 일반 카드로(2026-10-06 전체 점검 11차 R11-6-1).
  const view: InviteView = isValidCompatToken(token)
    ? await getCompatInvite(token, lang).catch((): InviteView => ({ status: 'pending' }))
    : { status: 'pending' };

  const og = resolveCompatOg(content, view);

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
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>{og.title}</div>
        <div style={{ fontSize: 30, marginTop: 24, color: '#6b6151' }}>{og.description}</div>
      </div>
    ),
    { ...size },
  );
}
