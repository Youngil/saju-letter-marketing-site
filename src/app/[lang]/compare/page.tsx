import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import {
  isMarketingLanguage,
  isLaunchContentLanguage,
  LAUNCH_CONTENT_LANGUAGES,
  DEFAULT_LANGUAGE,
  type LaunchContentLanguage,
} from '@/lib/languages';
import { DAY_MASTER_ROMANIZATIONS, ZODIAC_ROWS } from '@/content/compareZodiac';
import { HEAVENLY_STEMS } from '@/lib/sajuVocabulary';
import { WEB_BASE_URL, languageAlternates } from '@/lib/seo';
import { CompareInfographic } from '@/components/CompareInfographic';

/** 한국어/일본어는 로마자 표기(Gap 등)만으로는 어색해서 한자를 함께 보여준다(2026-08-08,
 * 사용자 요청) — 두 언어 모두 한자 자체는 읽을 수 있는 독자층이라 발음 표기 없이도 통한다.
 * 그 외 언어는 로마자만으로 충분해 그대로 둔다. */
const SHOWS_HANJA: Record<LaunchContentLanguage, boolean> = { ko: true, ja: true, en: false, es: false };

/** 표 헤더 하나짜리 짧은 문구라 dictionary까지 확장하지 않고 여기서만 로컬라이즈한다. pt/vi는
 * 1차 출시 대상이 아니지만(languages.ts) 나중에 열 때 바로 쓸 수 있게 값은 남겨둔다. */
const DATE_RANGE_HEADER: Record<LaunchContentLanguage | 'pt' | 'vi', string> = {
  ko: '기간',
  en: 'Date range',
  es: 'Rango de fechas',
  pt: 'Período',
  ja: '期間',
  vi: 'Khoảng ngày',
};

export async function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  const path = (lang: LaunchContentLanguage) => `/${lang}/compare`;
  return {
    title: dict.compare.ogTitle,
    description: dict.compare.ogDescription,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(rawLang)}`,
      languages: languageAlternates(LAUNCH_CONTENT_LANGUAGES, path, DEFAULT_LANGUAGE as LaunchContentLanguage),
    },
    openGraph: { title: dict.compare.ogTitle, description: dict.compare.ogDescription, url: `${WEB_BASE_URL}${path(rawLang)}` },
    twitter: { card: 'summary_large_image', title: dict.compare.ogTitle, description: dict.compare.ogDescription },
  };
}

/**
 * Phase 4 — 홈에서 뺀 교육을 이 페이지의 정식 자리로 둔다. 다인/편지 오프닝 → 재설계
 * 인포그래픽(와이어 A) → 설명 3섹션 → 참고 표. 옛 AstrologyInfographic(궤도·카드 대시보드)은
 * 폐기하고 CompareInfographic으로 대체했다.
 */
export default async function ComparePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
  const lang: LaunchContentLanguage = rawLang;
  const dict = await getDictionary(lang);
  const rows = ZODIAC_ROWS[rawLang];
  const pillars: [string, string, string, string] = [
    dict.demo.yearLabel,
    dict.demo.monthLabel,
    dict.demo.dayLabel,
    dict.demo.hourLabel,
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-14 px-4 py-12">
      <div>
        <h1 className="font-display mb-2 text-3xl font-semibold">{dict.compare.title}</h1>
        <p className="text-foreground/70">{dict.compare.subtitle}</p>
        <p className="mt-4 text-foreground/70">{dict.compare.opening}</p>
      </div>

      <CompareInfographic
        caption={dict.compare.diagramCaption}
        zodiacLabel={dict.compare.diagramZodiacLabel}
        zodiacPoint={dict.compare.diagramZodiacPoint}
        sajuLabel={dict.compare.diagramSajuLabel}
        pillars={pillars}
        closing={dict.compare.diagramClosing}
      />

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="font-display mb-2 text-xl font-semibold">{dict.compare.infoAmountTitle}</h2>
          <p className="text-foreground/70">{dict.compare.infoAmountBody}</p>
        </section>
        <section>
          <h2 className="font-display mb-2 text-xl font-semibold">{dict.compare.hourTitle}</h2>
          <p className="text-foreground/70">{dict.compare.hourBody}</p>
        </section>
        <section>
          <h2 className="font-display mb-2 text-xl font-semibold">{dict.compare.philosophyTitle}</h2>
          <p className="text-foreground/70">{dict.compare.philosophyBody}</p>
        </section>
      </div>

      <div className="card-surface rounded-xl border border-foreground/10 p-6">
        <h2 className="font-display mb-4 text-lg font-semibold text-foreground/80">{dict.compare.referenceTitle}</h2>

        <div className="mb-4 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-left">
            <thead>
              <tr className="border-b border-foreground/20 text-sm text-foreground/60">
                <th className="py-2 pr-4 font-medium">{dict.compare.zodiacColumnLabel}</th>
                <th className="py-2 font-medium">{DATE_RANGE_HEADER[rawLang]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sign} className="border-b border-foreground/10">
                  <td className="py-2 pr-4">{row.sign}</td>
                  <td className="py-2 text-foreground/70">{row.dateRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 mt-8 text-base font-semibold">{dict.compare.dayMasterSectionTitle}</h3>
        <p className="mb-4 text-foreground/70">{dict.compare.dayMasterIntro}</p>
        <ul className="flex flex-wrap gap-2">
          {DAY_MASTER_ROMANIZATIONS.map((label, index) => (
            <li key={label} className="rounded-full border border-foreground/15 px-4 py-1 text-sm text-foreground/80">
              {dict.compare.sajuColumnLabel}: {SHOWS_HANJA[lang] ? `${HEAVENLY_STEMS[index]}(${label})` : label}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={`/${lang}#demo`}
        className="mx-auto rounded-full bg-accent-warm px-8 py-3 text-center font-medium text-white transition hover:bg-accent-warm/90"
      >
        {dict.compare.ctaText}
      </Link>
    </div>
  );
}
