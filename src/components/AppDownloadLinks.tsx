import { ANDROID_APP_LIVE, IOS_APP_LIVE, GOOGLE_PLAY_URL, APP_STORE_URL } from '@/lib/appLinks';

export interface AppDownloadLinksDict {
  androidCta: string;
  iosCta: string;
  comingSoon: string;
}

/**
 * 안드로이드/iOS 다운로드 배지 — 아직 스토어에 안 올라간 플랫폼은 링크 없이 "준비 중" 상태로
 * 보여준다(2026-08-25). 순수 프레젠테이션 컴포넌트라 서버/클라이언트 컴포넌트 어디서든 그대로
 * 쓸 수 있다(footer는 서버 컴포넌트, DemoForm/CompatView는 'use client' — 훅을 쓰지 않아 둘 다
 * 문제없다).
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
            ? 'rounded-full bg-accent px-6 py-3 text-center font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30'
            : 'rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground/80 transition hover:border-accent hover:text-accent'
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
}: {
  dict: AppDownloadLinksDict;
  onAndroidClick?: () => void;
  onIosClick?: () => void;
  emphasized?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      <AppLinkBadge
        href={ANDROID_APP_LIVE ? GOOGLE_PLAY_URL : undefined}
        label={dict.androidCta}
        comingSoonLabel={dict.comingSoon}
        onClick={onAndroidClick}
        emphasized={emphasized}
      />
      <AppLinkBadge
        href={IOS_APP_LIVE ? APP_STORE_URL : undefined}
        label={dict.iosCta}
        comingSoonLabel={dict.comingSoon}
        onClick={onIosClick}
        emphasized={emphasized}
      />
    </div>
  );
}
