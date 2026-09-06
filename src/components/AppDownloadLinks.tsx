'use client';

import { ANDROID_APP_LIVE, IOS_APP_LIVE, GOOGLE_PLAY_URL, APP_STORE_URL } from '@/lib/appLinks';
import { trackEvent } from '@/lib/analytics';

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
 */
function AppLinkBadge({
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
  onAndroidClick,
  onIosClick,
  emphasized,
  className,
  context,
}: {
  dict: AppDownloadLinksDict;
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
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      <AppLinkBadge
        href={ANDROID_APP_LIVE ? GOOGLE_PLAY_URL : undefined}
        label={dict.androidCta}
        comingSoonLabel={dict.comingSoon}
        onClick={handleClick('android', onAndroidClick)}
        emphasized={emphasized}
      />
      <AppLinkBadge
        href={IOS_APP_LIVE ? APP_STORE_URL : undefined}
        label={dict.iosCta}
        comingSoonLabel={dict.comingSoon}
        onClick={handleClick('ios', onIosClick)}
        emphasized={emphasized}
      />
    </div>
  );
}
