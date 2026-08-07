import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, type MarketingLanguage } from '@/lib/languages';
import { DAY_MASTER_ROMANIZATIONS, isCompareLanguage, ZODIAC_ROWS, type CompareLanguage } from '@/content/compareZodiac';

/** 표 헤더 하나짜리 짧은 문구라 dictionary까지 확장하지 않고 여기서만 로컬라이즈한다. */
const DATE_RANGE_HEADER: Record<CompareLanguage, string> = {
  en: 'Date range',
  es: 'Rango de fechas',
  pt: 'Período',
  ja: '期間',
  vi: 'Khoảng ngày',
};

/** BLOG_LANGUAGES와 같은 5개 언어(ko 제외) — ko는 이 사이트에서 PR/QA 전용이라 SEO 콘텐츠 대상이 아니다. */
export async function generateStaticParams() {
  return (['en', 'es', 'pt', 'ja', 'vi'] as const).map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isCompareLanguage(rawLang)) return {};
  const dict = await getDictionary(rawLang);
  return {
    title: dict.compare.ogTitle,
    description: dict.compare.ogDescription,
    openGraph: { title: dict.compare.ogTitle, description: dict.compare.ogDescription },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isCompareLanguage(rawLang)) notFound();
  const lang: MarketingLanguage = rawLang;
  const dict = await getDictionary(lang);
  const rows = ZODIAC_ROWS[rawLang];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">{dict.compare.title}</h1>
      <p className="mb-10 text-foreground/70">{dict.compare.subtitle}</p>

      <table className="mb-4 w-full border-collapse text-left">
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

      <h2 className="mb-3 mt-12 text-xl font-semibold">{dict.compare.dayMasterSectionTitle}</h2>
      <p className="mb-4 text-foreground/70">{dict.compare.dayMasterIntro}</p>
      <ul className="flex flex-wrap gap-2">
        {DAY_MASTER_ROMANIZATIONS.map((label) => (
          <li key={label} className="rounded-full border border-foreground/15 px-4 py-1 text-sm text-foreground/80">
            {dict.compare.sajuColumnLabel}: {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
