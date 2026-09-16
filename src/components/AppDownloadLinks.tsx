'use client';

import Image from 'next/image';
import { ANDROID_APP_LIVE, IOS_APP_LIVE, GOOGLE_PLAY_URL, APP_STORE_URL } from '@/lib/appLinks';
import { trackEvent } from '@/lib/analytics';
import type { MarketingLanguage } from '@/lib/languages';

export interface AppDownloadLinksDict {
  androidCta: string;
  iosCta: string;
  comingSoon: string;
}

/**
 * 안드로이드/iOS 다운로드 배지 — 아직 스토어에 안 올라간 플랫폼은 링크 없이 "준비 중" 상태로
 * 보여준다(2026-08-25).
 *
 * **2026-09-07부터 'use client'** — 그로스 문서(사주편지 성장 원장 §2/§6 커뮤니티·PR 채널)의
 * 유입 채널별 효과를 재려면 이 버튼이 어느 화면(context)에서 눌렸는지 GA4로 잡아야 하는데,
 * 순수 서버 컴포넌트(예전 footer, 지금은 홈 히어로/신년운세 오프시즌/결과 화면)에서는 함수를
 * 이벤트 핸들러로 붙일 수 없다(RSC 경계는 함수를 못 건너간다 — `compat/[token]` 페이지가 이미
 * 겪은 "Functions cannot be passed directly to Client Components" 크래시와 같은 종류의 제약).
 * 이 컴포넌트 자체를 클라이언트 컴포넌트로 만들면 훅 없이도(순수 프레젠테이션이라 여전히 훅은
 * 안 씀) 어느 부모(서버든 클라이언트든)에서 렌더되든 안전하게 클릭을 잡을 수 있다.
 *
 * **2026-09-17부터 안드로이드는 Google 공식 배지 이미지(`public/badges/google-play-{lang}.png`,
 * Google Play 배지 생성기에서 받은 원본, 6개 언어)를 쓴다** — Google 브랜드 가이드라인상
 * 배지는 변형 금지·페이지 언어와 일치·Play 리스팅으로 직접 링크가 조건이라, 원본 PNG를 그대로
 * 페이지 언어로 골라 스토어 URL에만 연결한다(원본 PNG에 클리어 스페이스가 이미 포함돼 있어
 * 추가 여백은 두지 않는다). **iOS는 여전히 텍스트 배지다** — Apple 마케팅 가이드라인은
 * "Download on the App Store" 배지를 App Store에 실제 게시된 앱에만 허용하므로, iOS 출시
 * (`NEXT_PUBLIC_IOS_APP_LIVE`)와 함께 공식 배지로 교체한다.
 */
const GOOGLE_PLAY_BADGE_WIDTH = 646;
const GOOGLE_PLAY_BADGE_HEIGHT = 250;

function GooglePlayBadge({
  language,
  label,
  onClick,
  emphasized,
}: {
  language: MarketingLanguage;
  label: string;
  onClick?: () => void;
  emphasized?: boolean;
}) {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="inline-flex shrink-0 transition hover:opacity-90"
    >
      <Image
        src={`/badges/google-play-${language}.png`}
        alt={label}
        width={GOOGLE_PLAY_BADGE_WIDTH}
        height={GOOGLE_PLAY_BADGE_HEIGHT}
        className={emphasized ? 'h-16 w-auto' : 'h-14 w-auto'}
        priority={false}
      />
    </a>
  );
}

function TextBadge({
  href,
  label,
  comingSoonLabel,
  onClick,
  emphasized,
}: {
  href: string | undefined;
  label: string;
  comingSoonLabel: string;
  onClick?: () => void;
  emphasized?: boolean;
}) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={
          emphasized
            ? 'rounded-full bg-accent-warm px-6 py-3 text-center font-medium text-white transition hover:bg-accent-warm/90'
            : 'rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground/80 transition hover:border-accent-warm hover:text-accent-warm'
        }
      >
        {label}
      </a>
    );
  }
  return (
    <span
      className={
        emphasized
          ? 'rounded-full border border-dashed border-foreground/20 px-6 py-3 text-center text-sm text-foreground/40'
          : 'rounded-full border border-dashed border-foreground/15 px-4 py-2 text-sm text-foreground/40'
      }
    >
      {label} · {comingSoonLabel}
    </span>
  );
}

export function AppDownloadLinks({
  dict,
  language,
  onAndroidClick,
  onIosClick,
  emphasized,
  className,
  context,
}: {
  dict: AppDownloadLinksDict;
  /** 페이지 언어 — Google 배지는 페이지 언어와 같은 언어판을 써야 한다(가이드라인). */
  language: MarketingLanguage;
  onAndroidClick?: () => void;
  onIosClick?: () => void;
  emphasized?: boolean;
  className?: string;
  /**
   * GA4 `install_cta_click` 이벤트에 함께 실리는 화면 식별자(예: 'home_hero' / 'demo_result' /
   * 'compat_result' / 'newyear_result' / 'newyear_offseason') — 그로스 문서 채널별 UTM 유입이
   * 최종적으로 어느 전환 지점의 CTA까지 이어지는지 구분하기 위함. 생략하면 GA 이벤트 자체를
   * 보내지 않는다(호출부가 이 배지의 용도를 아직 분류하지 않은 경우 무리하게 태깅하지 않음).
   */
  context?: string;
}) {
  function handleClick(platform: 'android' | 'ios', existing?: () => void) {
    return () => {
      if (context) trackEvent('install_cta_click', { context, platform });
      existing?.();
    };
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className ?? ''}`}>
      {ANDROID_APP_LIVE ? (
        <GooglePlayBadge
          language={language}
          label={dict.androidCta}
          onClick={handleClick('android', onAndroidClick)}
          emphasized={emphasized}
        />
      ) : (
        <TextBadge
          href={undefined}
          label={dict.androidCta}
          comingSoonLabel={dict.comingSoon}
          emphasized={emphasized}
        />
      )}
      <TextBadge
        href={IOS_APP_LIVE ? APP_STORE_URL : undefined}
        label={dict.iosCta}
        comingSoonLabel={dict.comingSoon}
        onClick={handleClick('ios', onIosClick)}
        emphasized={emphasized}
      />
    </div>
  );
}
