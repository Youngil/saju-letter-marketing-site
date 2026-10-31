import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DAY_TYPE_COPY, oneLine } from '@/content/dayTypeCopy';
import { dayTypeLine } from '@/content/dayTypeNicknames';
import { dayTypeTrait } from '@/content/dayTypeTraits';
import { DayTypeArt } from '@/components/day-type/DayTypeArt';
import { DAY_TYPE_SLUGS, dayTypePath, stemFromDayTypeSlug } from '@/lib/dayType';
import { demoHref } from '@/lib/homeLinks';
import { isLaunchContentLanguage, isMarketingLanguage, LAUNCH_CONTENT_LANGUAGES, type LaunchContentLanguage } from '@/lib/languages';
import { HEAVENLY_STEMS } from '@/lib/sajuVocabulary';
import { WEB_BASE_URL, activeLanguageAlternates, buildSocialMetadata, NOINDEX_ROBOTS } from '@/lib/seo';
import { activeContentLanguages, fetchActiveServiceLanguages } from '@/lib/serviceLanguagesApi';

type Params = Promise<{ lang: string; slug: string }>;

/** 콘텐츠 축 4개 언어 × 날 유형 10개 = 40장 정적 페이지(compare와 같은 축 — 데모가 있는 언어). */
export function generateStaticParams() {
  return LAUNCH_CONTENT_LANGUAGES.flatMap((lang) => HEAVENLY_STEMS.map((stem) => ({ lang, slug: DAY_TYPE_SLUGS[stem] })));
}

function parse(rawLang: string, slug: string) {
  if (!isMarketingLanguage(rawLang) || !isLaunchContentLanguage(rawLang)) return null;
  const stem = stemFromDayTypeSlug(slug);
  return stem ? { lang: rawLang as LaunchContentLanguage, stem } : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const parsed = parse(rawLang, slug);
  if (!parsed) return {};
  const { lang, stem } = parsed;
  const copy = DAY_TYPE_COPY[lang];
  const title = dayTypeLine(copy.pageTitle, stem, lang);
  const description = `${oneLine(dayTypeTrait(stem, lang), lang)} ${copy.note}`;
  const path = (l: LaunchContentLanguage) => dayTypePath(l, stem);
  // hreflang·noindex는 compare와 같은 계산 — 관리자가 켠 콘텐츠 언어끼리만, 꺼진 언어 페이지는 noindex.
  const serviceLanguages = await fetchActiveServiceLanguages();
  const contentLanguages = activeContentLanguages(serviceLanguages);
  return {
    title,
    description,
    alternates: {
      canonical: `${WEB_BASE_URL}${path(lang)}`,
      languages: activeLanguageAlternates(contentLanguages, path, serviceLanguages.default),
    },
    ...(contentLanguages.includes(lang) ? {} : { robots: NOINDEX_ROBOTS }),
    // OG 이미지는 같은 세그먼트의 opengraph-image 파일 규약이 붙인다.
    ...buildSocialMetadata({ title, description, url: `${WEB_BASE_URL}${path(lang)}` }),
  };
}

/**
 * 날 유형 페이지(2026-10-31) — 데모 결과 "친구에게 보내기"가 여는 곳이자 검색으로 들어오는 곳. 받은 사람이 할 일은 하나: 자기 날을
 * 알아보러 홈 데모로. 그 아래 열 가지 날을 모두 보여 준다(서로 링크). 주소에 생일이 없어 누구의 페이지도 아니다.
 */
export default async function DayTypePage({ params }: { params: Params }) {
  const { lang: rawLang, slug } = await params;
  const parsed = parse(rawLang, slug);
  if (!parsed) notFound();
  const { lang, stem } = parsed;
  const copy = DAY_TYPE_COPY[lang];
  // 데모 링크는 이 언어가 켜져 있을 때만 그 언어 홈으로(`demoHref`, compare와 같다).
  const serviceLanguages = await fetchActiveServiceLanguages();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-14 px-4 py-12">
      <section className="letter-surface mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-sm px-6 py-10 text-center">
        <p className="max-w-sm text-sm text-foreground/60">{copy.note}</p>
        <DayTypeArt stem={stem} size={160} idSuffix="-hero" />
        <h1 className="font-display text-3xl font-semibold">{dayTypeLine(copy.heading, stem, lang)}</h1>
        <p className="max-w-sm text-lg leading-relaxed whitespace-pre-line text-foreground/80">{dayTypeTrait(stem, lang)}</p>
      </section>

      <section className="flex flex-col items-center gap-3 text-center">
        <h2 className="font-display text-xl font-semibold">{copy.question}</h2>
        <p className="max-w-md text-foreground/70">{copy.buttonSub}</p>
        <Link
          href={demoHref(lang, serviceLanguages.active)}
          className="mt-2 rounded-full bg-accent-warm px-6 py-3 font-medium text-white transition hover:bg-accent-warm/90"
        >
          {copy.button}
        </Link>
      </section>

      <section>
        <h2 className="font-display mb-5 text-center text-xl font-semibold">{copy.allHeading}</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {HEAVENLY_STEMS.map((other) => (
            <li key={other}>
              <Link
                href={dayTypePath(lang, other)}
                aria-current={other === stem ? 'page' : undefined}
                className={`card-surface flex flex-col items-center gap-2 rounded-xl border px-2 py-4 text-sm transition hover:border-accent-warm/60 ${
                  other === stem ? 'border-accent-warm/70' : 'border-foreground/10'
                }`}
              >
                <DayTypeArt stem={other} size={56} idSuffix="-grid" />
                <span>{dayTypeLine(copy.heading, other, lang)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
