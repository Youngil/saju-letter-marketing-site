import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { isMarketingLanguage, isLaunchContentLanguage, LAUNCH_CONTENT_LANGUAGES, type LaunchContentLanguage } from '@/lib/languages';
import { DAY_MASTER_ROMANIZATIONS, ZODIAC_ROWS } from '@/content/compareZodiac';

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
  return {
    title: dict.compare.ogTitle,
    description: dict.compare.ogDescription,
    openGraph: { title: dict.compare.ogTitle, description: dict.compare.ogDescription },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) notFound();
  const lang: LaunchContentLanguage = rawLang;
  const dict = await getDictionary(lang);
  const rows = ZODIAC_ROWS[rawLang];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">{dict.compare.title}</h1>
      <p className="mb-10 text-foreground/70">{dict.compare.subtitle}</p>

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
