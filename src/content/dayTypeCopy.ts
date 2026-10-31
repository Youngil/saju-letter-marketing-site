import type { LaunchContentLanguage } from '@/lib/languages';
import { HEAVENLY_STEMS, type HeavenlyStem } from '@/lib/sajuVocabulary';
import { dayTypeTrait } from './dayTypeTraits';

/**
 * 날 유형 결과 카드(홈 데모)·`/[lang]/type/[slug]` 페이지 문구(2026-10-31) — 콘텐츠 축 4개 언어만(데모·페이지 모두 콘텐츠 축).
 * `{name}`은 `dayTypeNicknames.ts`의 별명. kicker·resultTitle·heading·note·question은 앱 1.1.7 날 유형 카드(`dayType.*`,
 * `onboarding.confirm.dayTypeNote`)와 같은 말이다 — 단 ko question은 앱의 "당신은 …"을 쓰지 않는다(`docs/ko-copy-style.md` §2 "당신").
 * 오행 이름·사주 용어 없음, 단정 없음. ja·es는 원어민 검토 전 초안.
 */
export interface DayTypeCopy {
  /** 결과 카드 머리 — "내가 태어난 날". */
  kicker: string;
  /** 결과 카드 제목(1인칭 — 앱 공유 카드와 같다). */
  resultTitle: string;
  /** 사주 한 줄 설명. */
  note: string;
  share: string;
  copied: string;
  seeAll: string;
  /** 휴대폰 공유 창에 같이 넣는 글(주소는 따로). */
  shareText: string;
  /** 페이지 `<title>`(레이아웃이 "— 브랜드"를 붙인다). */
  pageTitle: string;
  /** 페이지 H1. */
  heading: string;
  question: string;
  button: string;
  buttonSub: string;
  allHeading: string;
}

export const DAY_TYPE_COPY: Record<LaunchContentLanguage, DayTypeCopy> = {
  ko: {
    kicker: '내가 태어난 날',
    resultTitle: "'{name}' 날에 태어났어요",
    note: '사주에서는 태어난 날을 열 가지 자연 중 하나로 봐요.',
    share: '친구에게 보내기',
    copied: '링크를 복사했어요',
    seeAll: '열 가지 날 모두 보기',
    shareText: "'{name}' 날에 태어났어요. 생일만 넣으면 어떤 날인지 알 수 있어요.",
    pageTitle: "'{name}' 날 — 사주로 보는 내가 태어난 날",
    heading: "'{name}' 날",
    question: '나는 어떤 날에 태어났을까요?',
    button: '생일 넣고 알아보기',
    buttonSub: '생일만 넣으면 알 수 있어요. 오늘 아침 편지 한 통도 함께 읽어 볼 수 있어요.',
    allHeading: '열 가지 날',
  },
  en: {
    kicker: 'My day type',
    resultTitle: 'I was born on a {name} day',
    note: 'In saju, the day you were born is likened to one of ten things in nature.',
    share: 'Send to a friend',
    copied: 'Link copied',
    seeAll: 'See all ten day types',
    shareText: 'I was born on a {name} day. Find yours with just your birthday.',
    pageTitle: 'The {name} day — your birth day in Korean saju',
    heading: 'The {name} day',
    question: 'What kind of day were you born on?',
    button: 'Find my day type',
    buttonSub: "Just your birthday. You'll also get to read this morning's letter.",
    allHeading: 'All ten day types',
  },
  ja: {
    kicker: 'わたしが生まれた日',
    resultTitle: '「{name}」の日に生まれました',
    note: 'サジュでは、生まれた日を十の自然にたとえます。',
    share: '友だちに送る',
    copied: 'リンクをコピーしました',
    seeAll: '十の日をすべて見る',
    shareText: '「{name}」の日に生まれました。誕生日を入れるだけで、どんな日かわかります。',
    pageTitle: '「{name}」の日 — サジュで見る生まれた日',
    heading: '「{name}」の日',
    question: 'あなたはどんな日に生まれましたか？',
    button: '自分の日を調べる',
    buttonSub: '誕生日を入れるだけでわかります。今朝の手紙もひとつ読めます。',
    allHeading: '十の日',
  },
  es: {
    kicker: 'Mi tipo de día',
    resultTitle: 'Nací en un día de {name}',
    note: 'En el saju, el día en que naciste se compara con una de diez cosas de la naturaleza.',
    share: 'Compartir',
    copied: 'Enlace copiado',
    seeAll: 'Ver los diez tipos de día',
    shareText: 'Nací en un día de {name}. Descubre el tuyo solo con tu fecha de nacimiento.',
    pageTitle: 'El día de {name}: tu día de nacimiento en el saju coreano',
    heading: 'El día de {name}',
    question: '¿En qué tipo de día naciste?',
    button: 'Descubrir mi tipo de día',
    buttonSub: 'Solo con tu fecha de nacimiento. También podrás leer la carta de esta mañana.',
    allHeading: 'Los diez tipos de día',
  },
};

/** 데모(클라이언트 컴포넌트)에 넘길 현재 언어 문자열만 — 6개 언어 객체를 클라이언트 번들에 싣지 않는다(CLAUDE.md §3 RSC 경계). */
export interface DayTypeResultCopy {
  kicker: string;
  resultTitle: string;
  note: string;
  share: string;
  copied: string;
  seeAll: string;
  shareText: string;
  traits: Record<HeavenlyStem, string>;
}

export function pickDayTypeResultCopy(lang: LaunchContentLanguage): DayTypeResultCopy {
  const copy = DAY_TYPE_COPY[lang];
  return {
    kicker: copy.kicker,
    resultTitle: copy.resultTitle,
    note: copy.note,
    share: copy.share,
    copied: copy.copied,
    seeAll: copy.seeAll,
    shareText: copy.shareText,
    traits: Object.fromEntries(HEAVENLY_STEMS.map((stem) => [stem, dayTypeTrait(stem, lang)])) as Record<HeavenlyStem, string>,
  };
}

/** 메타 설명처럼 한 줄로 써야 하는 곳 — 카드용 줄바꿈을 공백으로(일본어는 띄어 쓰지 않으므로 그냥 붙인다). */
export function oneLine(text: string, lang: LaunchContentLanguage): string {
  return text.replace(/\s*\n\s*/g, lang === 'ja' ? '' : ' ');
}
