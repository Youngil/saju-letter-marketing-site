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
    title: '다인이 매일 아침 전하는 짧은 편지',
    subtitle:
      '사주편지는 생년월일시를 바탕으로, 다인이 짧고 따뜻한 한 통의 편지를 보내드려요. 긴 운세 리포트가 아니라, 매일 아침 도착하는 편지입니다. 아래에서 무료로 받아보세요.',
    ctaDemo: '오늘의 편지 무료로 받아보기',
    dainName: '다인',
    dainRole: '편지 쓰는 사람',
    learnAboutDain: '다인 소개 보기',
    compareHint: '사주가 별자리와 어떻게 다른지 궁금하신가요?',
    compareLink: '별자리 vs 사주 보기',
  },
  demo: {
    title: '오늘의 편지, 무료로 받아보기',
    subtitle: '가입 없이 바로 체험할 수 있어요. 생년월일을 입력하면 다인이 매일 아침 보내는 편지의 느낌을 바로 확인할 수 있습니다.',
    dateLabel: '생년월일',
    yearLabel: '년',
    monthLabel: '월',
    dayLabel: '일',
    timeLabel: '태어난 시간(선택)',
    timeUnknownLabel: '태어난 시간을 몰라요',
    hourLabel: '시',
    minuteLabel: '분',
    submitButton: '편지 받아보기',
    submitting: '편지를 쓰는 중…',
    resultTitle: '오늘 아침 편지의 맛보기',
    resultFromName: '다인',
    resultFromRole: '편지 쓰는 사람',
    resultCta: '이런 편지를 매일 아침 받아보세요 — 무료로 시작',
    tryAgain: '다른 날짜로 다시 보기',
    errors: {
      date: '올바른 생년월일을 입력해주세요.',
      underage: '이 서비스는 만 16세 이상만 이용할 수 있어요.',
      generic: '문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      rateLimited: '이미 여러 번 시도하셨어요. 잠시 후 다시 시도해주세요.',
    },
  },
  blog: {
    title: '다인의 블로그',
    subtitle: '다인이 남기는 짧은 글 — 아침, 계절, 그리고 편지 쓰는 이야기.',
    readMore: '읽기',
    empty: '아직 글이 없어요. 곧 찾아올게요.',
    byLabel: '다인',
    thisWeekLabel: '이번 주 다인의 글',
    thisWeekCta: '블로그 읽기',
    categories: {
      observation: '관찰',
      explainer: '풀어쓰기',
      behind: '뒷이야기',
      season: '계절',
    },
  },
  compare: {
    title: '별자리와 사주, 나란히 비교해보기',
    subtitle:
      '이미 별자리에 익숙하다면, 사주가 어떻게 다르게 접근하는지 — 그리고 왜 아침 편지가 더 개인적으로 느껴질 수 있는지 살펴보세요.',
    ogTitle: '별자리 vs 사주 — 사주편지',
    ogDescription: '서양 12별자리와 한국식 사주를 비교해보세요.',
    opening:
      '다인은 별자리 하나가 아니라, 태어난 순간을 바탕으로 매일 아침 편지를 씁니다. 홈에는 넣지 않았던 긴 설명을 이 페이지에 모았어요 — 사주가 별자리와 어떻게 다른지, 쉬운 말로요.',
    diagramCaption: '다인이 짚어 보는 차이',
    diagramZodiacLabel: '별자리',
    diagramZodiacPoint: '태양 위치 하나 (태어난 달 기준)',
    diagramSajuLabel: '사주',
    diagramClosing: '네 기둥이 있어서 매일 다른 리듬이 생기고 — 그래서 짧은 아침 편지가 가능합니다.',
    zodiacColumnLabel: '별자리',
    sajuColumnLabel: '일간(사주)',
    dayMasterSectionTitle: '사주의 10개 일간',
    dayMasterIntro:
      '별자리는 태어난 달로 정해져 12개가 있어요. 사주의 일간은 태어난 날짜 그 자체로 정해지고 10일 주기로 10개가 순환해요 — 그래서 아래 별자리 표와 한 줄씩 대응되지는 않아요. 홈에서 오늘의 편지를 무료로 받아보며 느낌을 확인해보세요.',
    infoAmountTitle: '얼마나 다른 정보를 담고 있나요',
    infoAmountBody:
      "서양 별자리는 태어난 '월'만으로 정해지는 값 하나예요 — 예를 들어 3월에 태어났다면 평생 물고기자리 하나죠. 사주는 태어난 년·월·일·시 네 가지를 각각 하나의 '기둥'으로 세워요. 그래서 같은 달, 심지어 같은 날에 태어났더라도 시간이 다르면 출발점 자체가 꽤 달라질 수 있어요 — 별자리 하나만으로보다 훨씬 개인적인 조합인 셈이에요.",
    hourTitle: '태어난 시간까지 꼭 알아야 하나요',
    hourBody:
      '네 기둥 중 마지막 하나(시주)는 태어난 시간으로 정해져요. 시간을 정확히 모르셔도 괜찮아요 — 사주편지는 년·월·일 세 기둥만으로도 해석을 만들 수 있게 설계돼 있고, 나중에 시간을 알게 되면 언제든 더해서 볼 수 있어요.',
    philosophyTitle: '둘 다 미래를 단정하지 않아요',
    philosophyBody:
      '별자리든 사주 읽기든, 성향과 흐름을 돌아보는 하나의 렌즈일 뿐 앞날을 확정하는 게 아니에요. 사주편지의 매일 편지도 이 원칙을 지켜요 — 단정적인 예언이 아니라, 부드럽게 힘을 실어주는 한마디를 목표로 해요.',
    referenceTitle: '참고 자료: 별자리·일간 대응표',
    ctaText: '내 아침 편지, 무료로 받아보기',
  },
  leadCapture: {
    title: '다인의 소개 편지 받기 — 30일 체험 포함',
    subtitle:
      '이메일을 남겨주시면 다인이 짧은 소개 편지를 바로 보내드려요. 실제 아침 편지 예시도 들어 있고, 앱에서 쓸 수 있는 30일 무료체험 쿠폰(원래 7일 대신)도 함께 드려요.',
    emailPlaceholder: 'you@example.com',
    consentLabel: '메일을 받고 싶어요 (언제든 수신거부 가능)',
    submitButton: '소개 편지 받기',
    submitting: '등록하는 중…',
    success: '완료됐어요! 다인의 소개 편지를 메일함에서 확인해보세요.',
    remainingSlots: '선착순 {capacity}명 중 {issued}명 신청 완료, {remaining}명 남았어요',
    soldOut: '선착순 쿠폰이 모두 소진됐어요 — 소개 노트 등록은 계속 받고 있어요!',
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
    privacyNote: '만 16세 확인을 위해 양력 생년월일을 서버로 보내지만 저장하지는 않아요. 사주 계산은 브라우저에서 이뤄집니다.',
    privacyLinkLabel: '개인정보처리방침',
    disclaimerLinkLabel: '서비스 이용 안내',
  },
  consent: {
    message: '더 나은 서비스를 위해 방문 통계를 수집하는 쿠키를 사용해요. 동의 여부는 언제든 바꿀 수 있어요.',
    acceptButton: '동의해요',
    declineButton: '거부해요',
  },
  appLinks: {
    sectionLabel: '앱 다운로드',
    androidCta: 'Google Play에서 다운로드',
    iosCta: 'App Store에서 다운로드',
    comingSoon: '출시 준비 중',
  },
  // 서비스 언어 통합 관리(2026-09-07) — 신년운세 캠페인이 더 이상 한국어를 배제하지 않으면서
  // (saju-letter-backend/CLAUDE.md §1.5 참고) 새로 채운 섹션. 다른 lunarNewYear 언어들과 같은
  // 구조를 그대로 따르되, 이 사이트 전반의 다인 보이스·해요체 톤을 맞췄다.
  lunarNewYear: {
    navHome: '홈',
    landing: {
      title: '설날 신년운세',
      subtitle: '매년 설날을 전후로 많은 분들이 챙겨보는 그 운세 — 생년월일시를 바탕으로 짧고 개인적인 풀이를 받아보세요.',
      nameLabel: '이름',
      namePlaceholder: '어떻게 불러드릴까요?',
      dateLabel: '생년월일',
      yearLabel: '년',
      monthLabel: '월',
      dayLabel: '일',
      timeLabel: '태어난 시간(선택)',
      timeUnknownLabel: '태어난 시간을 몰라요',
      hourLabel: '시',
      minuteLabel: '분',
      memorableEventLabel: '올 한 해 가장 기억에 남는 일은 무엇이었나요?',
      memorableEventPlaceholder: '한 줄로 편하게 적어주세요',
      ageConfirmLabel: '만 16세 이상입니다',
      consentPreviewNote: '입력하신 정보는 운세를 만드는 데만 사용돼요 — 아래에서 어떻게 쓰이는지 확인하세요.',
      submitButton: '내 운세 확인하기',
      submitting: '사주를 읽는 중…',
      errors: {
        name: '이름을 입력해주세요.',
        date: '올바른 생년월일을 입력해주세요.',
        memorableEvent: '올 한 해에 대해 한 줄만 적어주세요(최대 300자).',
        age: '계속하려면 만 16세 이상임을 확인해주세요.',
        underage: '이 서비스는 만 16세 이상만 이용할 수 있어요.',
        generic: '문제가 발생했어요. 잠시 후 다시 시도해주세요.',
        rateLimited: '이미 여러 번 시도하셨어요. 잠시 후 다시 시도해주세요.',
      },
    },
    offSeason: {
      title: '올해의 신년운세는 마감됐어요',
      body: '이 이벤트는 매년 설날을 전후로 약 두 달간 진행돼요. 아래 날짜부터 다시 만나요',
      cta: '그동안 사주편지 앱에서는 다인이 매일 아침 짧은 편지를 보내드려요.',
    },
    result: {
      loading: '운세를 불러오는 중…',
      notFound: '해당 운세를 찾을 수 없어요.',
      shareTitle: '내 운세 공유하기',
      shareButton: '공유하기',
      shareCopied: '링크가 복사됐어요!',
      emailSectionTitle: '앞으로 11일 더, 신년 이야기가 이어져요',
      emailSectionSubtitle: '이메일을 남기시면 앞으로 12일 동안 매일 짧은 풀이를 보내드려요 — 매번 사주의 다른 면을 살펴봐요.',
      emailPlaceholder: 'you@example.com',
      consentLabel: '12일 이메일 시리즈를 받고 싶어요 (언제든 수신거부 가능)',
      subscribeButton: '시리즈 받기',
      subscribing: '등록하는 중…',
      subscribed: '완료됐어요! 내일 첫 번째 이야기를 메일함에서 확인해보세요.',
      appBridgeTitle: '매일 아침 짧은 편지도 받아보실래요?',
      appBridgeBody:
        '이번 신년운세와는 별개로, 사주편지 앱에서는 다인이 짧은 아침 노트를 보내드려요 — 따뜻하고 개인적인, 긴 운세 리포트가 아닌 편지예요.',
      errors: {
        email: '올바른 이메일 주소를 입력해주세요.',
        consent: '이메일 시리즈를 받으려면 동의해주세요.',
        generic: '문제가 발생했어요. 다시 시도해주세요.',
        already: '이미 이 운세로 시리즈를 신청하셨어요.',
      },
    },
    unsubscribe: {
      title: '수신거부',
      loading: '처리 중…',
      success: '신년 이메일 시리즈 수신거부가 완료됐어요. 아쉽지만 다음에 또 만나요!',
      alreadyUnsubscribed: '이미 수신거부된 상태예요.',
      notFound: '해당 구독 정보를 찾을 수 없어요.',
    },
    footerPrivacy: '이 페이지는 사주편지가 제공하는 프로모션 체험이에요. 생년월일시는 브라우저 밖으로 전송되지 않고, 계산된 사주 값만 서버로 전달돼요.',
  },
};
