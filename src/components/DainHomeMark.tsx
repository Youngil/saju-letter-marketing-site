import Image from 'next/image';
import Link from 'next/link';

/**
 * 홈 히어로의 다인 발신자 마크 — 모바일 `DainSender`와 같은 계층(작은 초상 + 이름/역할).
 * 가상 캐릭터 고지는 전기처럼 쓰지 않고, 소개 글 링크로만 연결한다
 * (`docs/marketing-site-realignment-2026-08-26.md` Phase 1).
 * 초상은 앱 `dain-portrait.png`와 동일 원본(Phase 3).
 */
export function DainHomeMark({
  name,
  role,
  learnAboutLabel,
  learnAboutHref,
}: {
  name: string;
  role: string;
  learnAboutLabel?: string;
  learnAboutHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <Image
          src="/dain-portrait.png"
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-full border border-foreground/15 bg-[#F3EBDC] object-cover"
          priority
        />
        <div className="text-left">
          <div className="text-sm font-semibold text-foreground">{name}</div>
          <div className="text-xs text-foreground/55">{role}</div>
        </div>
      </div>
      {learnAboutLabel && learnAboutHref ? (
        <Link
          href={learnAboutHref}
          className="text-xs font-medium text-accent-warm underline-offset-2 hover:underline"
        >
          {learnAboutLabel}
        </Link>
      ) : null}
    </div>
  );
}
