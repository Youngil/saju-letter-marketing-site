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
 * 2026-08-25 — 원래 "표 두 개 + 짧은 문단 하나"뿐이라 별자리/사주의 실제 차이를 이해하기엔
 * 내용이 얕다는 사용자 피드백으로 전면 확장했다. **처음엔 홈 화면의 `AstrologyInfographic`을
 * 이 페이지에도 그대로 재사용했는데, 홈에서 이미 본 카드가 이 페이지에서 그대로 다시 나와
 * 콘텐츠가 겹쳐 보인다는 후속 피드백으로 제거했다** — 홈은 짧은 시각적 티저 역할을 그대로
 * 유지하고, 이 페이지는 홈에 없는 새로운 설명(정보량 차이/시주와 출생시간/단정하지 않는다는
 * 철학) 3개 섹션으로 시작해 서로 다른 역할을 갖도록 다시 나눴다. 기존 별자리 날짜표·일간
 * 목록은 "참고 자료"로 이름 붙여 그 아래 유지한다.
 */
export default async function ComparePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
  const lang: LaunchContentLanguage = rawLang;
  const dict = await getDictionary(lang);
  const rows = ZODIAC_ROWS[rawLang];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-14 px-4 py-12">
      <div>
        <h1 className="mb-2 text-3xl font-bold">{dict.compare.title}</h1>
        <p className="text-foreground/70">{dict.compare.subtitle}</p>
      </div>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="mb-2 text-xl font-semibold">{dict.compare.infoAmountTitle}</h2>
          <p className="text-foreground/70">{dict.compare.infoAmountBody}</p>
        </section>
        <section>
          <h2 className="mb-2 text-xl font-semibold">{dict.compare.hourTitle}</h2>
          <p className="text-foreground/70">{dict.compare.hourBody}</p>
        </section>
        <section>
          <h2 className="mb-2 text-xl font-semibold">{dict.compare.philosophyTitle}</h2>
          <p className="text-foreground/70">{dict.compare.philosophyBody}</p>
        </section>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground/80">{dict.compare.referenceTitle}</h2>

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
        className="mx-auto rounded-full bg-accent px-8 py-3.5 text-center font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
      >
        {dict.compare.ctaText}
      </Link>
    </div>
  );
}
