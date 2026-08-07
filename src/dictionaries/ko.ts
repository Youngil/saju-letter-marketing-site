import type { MarketingDictionary } from './types';

/**
 * 1차 서비스 타겟 언어 4개(ko/en/ja/es) 중 하나(2026-08-07, 사용자 결정 — 원래는 해외
 * K-컬처 팬층만 노리고 ko를 PR/QA 전용으로 뒀었지만, 국내 타겟도 포함시키기로 전환했다).
 * 톤 그룹은 ja와 같은 lean-into-tradition — 이미 사주에 익숙한 독자에게 "사주가 뭔지"부터
 * 설명하는 톤은 어색해서(languages.ts의 TONE_GROUP 참고).
 */
export const dictionary: MarketingDictionary = {
  brand: '사주편지',
  languageSwitcherLabel: '한국어',
  nav: { home: '홈', blog: '블로그', compare: '별자리 vs 사주' },
  hero: {
    title: '태어난 순간을 담아, 매일 아침 도착하는 짧은 편지',
    subtitle: '사주편지는 생년월일시를 바탕으로 매일 아침 짧고 감성적인 한 통의 편지를 보내드립니다. 아래에서 무료로 한 줄 미리보기를 체험해보세요.',
    ctaDemo: '무료로 체험하기',
  },
  infographic: {
    eyebrow: '인생을 읽는 두 가지 방법',
    title: '별자리와 사주, 무엇이 다를까요',
    subtitle: '별자리는 태어난 달만으로 정해지지만, 사주는 년/월/일/시 네 가지 기둥을 조합해 훨씬 세밀한 결과를 만듭니다.',
    zodiacLabel: '서양 별자리',
    sajuLabel: '사주',
    zodiacHeadline: '하늘을 보는 시스템',
    zodiacDescription: '같은 달에 태어났다면 누구나 같은 별자리예요 — 큰 틀에서 보는 방식이에요.',
    zodiacTags: ['태어난 달', '12개 중 1개', '태양 기준'],
    sajuHeadline: '시간을 보는 한국 전통 시스템',
    sajuDescription: '년·월·일·시를 모두 조합해서, 훨씬 더 구체적인 나만의 출발점을 만들어요.',
    sajuTags: ['정확한 출생 시각', '네 개의 기둥', '나만의 고유한 조합'],
    sajuCombineCaption: '네 기둥이 합쳐져 만드는 의미',
    compareCategoryLabel: '구분',
    compareRows: [
      { category: '기본 단위', zodiac: '1개 별자리', zodiacNote: '태어난 달 기준', saju: '4개 기둥', sajuNote: '년·월·일·시' },
      { category: '필요한 정보', zodiac: '생년월일시 + 출생 장소', saju: '생년월일시', sajuNote: '출생 장소는 필요 없음' },
      { category: '구조', zodiac: '궤도 시스템', zodiacNote: '별자리 안 행성 위치', saju: '조합 시스템', sajuNote: '네 기둥이 상호작용하는 방식' },
      { category: '주로 다루는 것', zodiac: '성격과 특성', saju: '흐름과 타이밍' },
    ],
  },
  demo: {
    title: '무료로 한 줄 미리보기',
    subtitle: '가입 없이 바로 체험할 수 있어요. 생년월일을 입력하면 사주편지가 매일 아침 보내는 편지의 느낌을 바로 확인할 수 있습니다.',
    dateLabel: '생년월일',
    yearLabel: '년',
    monthLabel: '월',
    dayLabel: '일',
    timeLabel: '태어난 시간(선택)',
    timeUnknownLabel: '태어난 시간을 몰라요',
    hourLabel: '시',
    minuteLabel: '분',
    submitButton: '결과 보기',
    submitting: '사주를 읽는 중…',
    resultTitle: '오늘 당신에게 건네는 한마디',
    resultCta: '이런 편지를 매일 아침 받아보세요 — 무료로 시작',
    tryAgain: '다른 날짜로 다시 보기',
    errors: {
      date: '올바른 생년월일을 입력해주세요.',
      generic: '문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      rateLimited: '이미 여러 번 시도하셨어요. 잠시 후 다시 시도해주세요.',
    },
  },
  blog: {
    title: '사주편지 블로그',
    subtitle: '사주와 한국의 전통, 그리고 별자리와의 비교에 대한 짧은 글들을 전해드려요.',
    readMore: '더 보기',
    empty: '아직 등록된 글이 없어요. 곧 찾아올게요.',
  },
  compare: {
    title: '별자리와 사주, 나란히 비교해보기',
    subtitle: '이미 별자리에 익숙하다면, 사주가 어떻게 다르게 접근하는지 살펴보세요.',
    ogTitle: '별자리 vs 사주 — 사주편지',
    ogDescription: '서양 12별자리와 한국식 사주를 비교해보세요.',
    zodiacColumnLabel: '별자리',
    sajuColumnLabel: '일간(사주)',
    dayMasterSectionTitle: '사주의 10개 일간',
    dayMasterIntro:
      '별자리는 태어난 달로 정해져 12개가 있어요. 사주의 일간은 태어난 날짜 그 자체로 정해지고 10일 주기로 10개가 순환해요 — 그래서 위 별자리 표와 한 줄씩 대응되지는 않아요. 내 일간은 위 데모에서 직접 확인해보세요.',
  },
  leadCapture: {
    title: '지금 등록하고 30일 무료체험 쿠폰 받기',
    subtitle: '이메일을 남겨주시면 며칠에 걸쳐 사주에 대한 짧은 소개와 실제 편지 예시를 보내드리고, 마지막 날엔 앱에서 쓸 수 있는 30일 무료체험 쿠폰(원래 7일 대신)을 드려요.',
    emailPlaceholder: 'you@example.com',
    consentLabel: '이 이메일을 받고 싶어요 (언제든 수신거부 가능)',
    submitButton: '보내주세요',
    submitting: '등록하는 중…',
    success: '완료됐어요! 첫 메일이 준비되면 보내드릴게요.',
    remainingSlots: '선착순 {count}명에게만 드려요',
    soldOut: '선착순 쿠폰이 모두 소진됐어요 — 등록은 계속 받고 있어요!',
    errors: {
      email: '올바른 이메일 주소를 입력해주세요.',
      consent: '이메일 수신에 동의해주세요.',
      generic: '문제가 발생했어요. 다시 시도해주세요.',
      already: '이미 등록된 이메일이에요.',
    },
  },
  unsubscribe: {
    title: '수신거부',
    loading: '처리 중…',
    success: '수신거부가 완료됐어요. 아쉽지만 다음에 또 만나요!',
    alreadyUnsubscribed: '이미 수신거부된 상태예요.',
    notFound: '해당 구독 정보를 찾을 수 없어요.',
  },
  footer: {
    privacyNote: '생년월일시는 브라우저 밖으로 전송되지 않아요 — 계산된 결과만 전송됩니다.',
    googlePlayCta: 'Google Play에서 다운로드',
  },
};
