import { INTL_LOCALE, type LaunchContentLanguage } from '@/lib/languages';

/**
 * 날짜 도장 — 앱 편지 머리의 점선 원형 도장(모바일 `Postmark`)과 같은 모양(2026-10-03, 디자인 감사 P1).
 * 데모 결과가 "운세 결과 카드"가 아니라 오늘 도착한 편지로 보이게 한다. 날짜는 방문자 기기 기준 오늘.
 */

export function Postmark({ language, date = new Date(), className = '' }: { language: LaunchContentLanguage; date?: Date; className?: string }) {
  const month = new Intl.DateTimeFormat(INTL_LOCALE[language], { month: 'short' }).format(date);
  return (
    <div
      aria-hidden="true"
      className={`flex h-14 w-14 shrink-0 -rotate-6 flex-col items-center justify-center rounded-full border-2 border-dashed border-accent-warm/70 text-accent-warm ${className}`}
    >
      <span className="text-lg leading-none font-semibold">{date.getDate()}</span>
      <span className="mt-0.5 text-[10px] leading-none uppercase">{month}</span>
    </div>
  );
}
