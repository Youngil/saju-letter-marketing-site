import type { MarketingLanguage as Language } from '@/lib/languages';
import type { HeavenlyStem } from '@/lib/sajuVocabulary';

/**
 * 날 유형 한 줄 — 모바일 `saju-letter-mobile/src/domain/saju/dayTypeTraits.ts`의 사본(2026-10-31, 사이트 날 유형 결과 카드·페이지).
 * 앱 공유 카드와 같은 문장이라 ko·ja는 주어 없이, en·es는 1인칭이다(공유 카드의 자기소개 말투). ko·ja의 줄바꿈은 카드 폭에 맞춘 것이라
 * 화면에서는 `whitespace-pre-line`으로 그린다. 머리 주석·import 아래 본문은 모바일과 글자 그대로 같아야 한다(`dayTypeCopyDrift.test.ts`).
 */
const TRAITS: Record<HeavenlyStem, Partial<Record<Language, string>> & { en: string }> = {
  甲: {
    ko: '곧게 자라고,\n곁에 있는 사람에게 쉴 그늘이 되어 줘요.',
    en: 'I grow straight and give shade to the people around me.',
    ja: 'まっすぐ伸びて、\nまわりの人がひと休みできる木陰になります。',
    es: 'Crezco derecho y doy sombra a quienes me rodean.',
  },
  乙: {
    ko: '부드럽게 휘어도 꺾이지 않고,\n어디서든 꽃을 피워요.',
    en: 'I bend without breaking, and bloom wherever I land.',
    ja: 'しなやかに曲がっても折れず、\nどこでも花を咲かせます。',
    es: 'Me doblo sin romperme y florezco donde caigo.',
  },
  丙: {
    ko: '들어서기만 해도 주변이 환해져요.\n숨기는 것 없이 따뜻해요.',
    en: 'A room gets brighter when I walk in. Warm, with nothing to hide.',
    ja: 'そこにいるだけで、まわりがぱっと明るくなります。\n隠しごとのない温かさです。',
    es: 'Cuando llego, todo se ilumina: calidez sin nada que esconder.',
  },
  丁: {
    ko: '큰 무대보다 한 사람을 밝히는 쪽이에요.\n남들이 놓친 작은 것을 먼저 알아채요.',
    en: "I'd rather light up one person than a whole stage, and I notice the small things first.",
    ja: '大きな舞台より、一人を照らすほうが好きです。\n人が見落とす小さなことに先に気づきます。',
    es: 'Prefiero iluminar a una persona antes que a todo un escenario, y noto primero lo pequeño.',
  },
  戊: {
    ko: '쉽게 흔들리지 않아서,\n곁에 있으면 마음이 놓여요.',
    en: "Hard to shake, so people feel calm when I'm near.",
    ja: '簡単には揺らがないので、\nそばにいると安心できます。',
    es: 'Cuesta moverme, y por eso a mi lado la gente se siente en calma.',
  },
  己: {
    ko: '무엇이든 너그럽게 받아 주고,\n천천히 자라게 도와요.',
    en: 'I make room for everything and help it grow, slowly.',
    ja: 'なんでもおおらかに受けとめて、\nゆっくり育てます。',
    es: 'Hago sitio para todo y lo ayudo a crecer, sin prisa.',
  },
  庚: {
    ko: '말보다 행동이 먼저예요.\n한번 정하면 끝까지 지켜요.',
    en: 'Actions over words. Once I decide, I see it through.',
    ja: '言葉より行動が先。\n一度決めたら最後までやり通します。',
    es: 'Más hechos que palabras: cuando decido algo, lo cumplo.',
  },
  辛: {
    ko: '감각이 섬세해서,\n작은 차이를 먼저 알아봐요.',
    en: 'My finely tuned sense picks up the small differences others miss.',
    ja: '感覚が繊細で、\n小さな違いにまっ先に気づきます。',
    es: 'Mi sensibilidad afinada capta las pequeñas diferencias que otros no ven.',
  },
  壬: {
    ko: '마음이 깊고 넓어서,\n많은 이야기를 품을 수 있어요.',
    en: "I'm deep and wide enough to hold a lot of stories.",
    ja: '心が深く広くて、\nたくさんの話を受けとめられます。',
    es: 'Tengo la hondura y la amplitud para guardar muchas historias.',
  },
  癸: {
    ko: '조용히 스며들어,\n주변을 조금 더 부드럽게 만들어요.',
    en: 'I arrive quietly and leave everything around me a little softer.',
    ja: '静かにしみこんで、\nまわりを少しやわらかくします。',
    es: 'Llego en silencio y dejo todo a mi alrededor un poco más suave.',
  },
};

export function dayTypeTrait(stem: HeavenlyStem, language: Language): string {
  const row = TRAITS[stem];
  return row[language] ?? row.en;
}
