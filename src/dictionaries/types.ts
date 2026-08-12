/** 모든 언어 dictionary가 공유하는 형태 — 새 언어를 추가할 때 이 타입이 빠진 키를 잡아준다. */
export interface MarketingDictionary {
  brand: string;
  /** 언어 스위처에 표시되는 이 언어 자신의 이름(자국어 표기). */
  languageSwitcherLabel: string;
  nav: {
    home: string;
    blog: string;
    compare: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaDemo: string;
  };
  infographic: {
    /** 제목 위 작은 배지 문구(예: "Two ways to read your life") — 순수 장식용 타이포 계층. */
    eyebrow: string;
    title: string;
    subtitle: string;
    zodiacLabel: string;
    sajuLabel: string;
    /** 라벨 바로 아래 짧은 카테고리 태그라인(예: "A sky-based system") — 본문 설명(zodiacDescription)보다 짧고 추상적. */
    zodiacHeadline: string;
    zodiacDescription: string;
    zodiacTags: [string, string, string];
    sajuHeadline: string;
    sajuDescription: string;
    sajuTags: [string, string, string];
    /** 네 기둥 시각화 아래 캡션(예: "Meaning through combining all four"). */
    sajuCombineCaption: string;
    /** 비교 표 왼쪽 열 헤더(예: "Category"/"구분") — zodiac/saju 열 헤더는 위 zodiacLabel/sajuLabel을 재사용한다. */
    compareCategoryLabel: string;
    compareRows: { category: string; zodiac: string; zodiacNote?: string; saju: string; sajuNote?: string }[];
  };
  demo: {
    title: string;
    subtitle: string;
    dateLabel: string;
    yearLabel: string;
    monthLabel: string;
    dayLabel: string;
    timeLabel: string;
    timeUnknownLabel: string;
    hourLabel: string;
    minuteLabel: string;
    submitButton: string;
    submitting: string;
    resultTitle: string;
    resultCta: string;
    tryAgain: string;
    errors: {
      date: string;
      generic: string;
      rateLimited: string;
    };
  };
  blog: {
    title: string;
    subtitle: string;
    readMore: string;
    empty: string;
  };
  compare: {
    title: string;
    subtitle: string;
    ogTitle: string;
    ogDescription: string;
    zodiacColumnLabel: string;
    sajuColumnLabel: string;
    dayMasterSectionTitle: string;
    dayMasterIntro: string;
  };
  leadCapture: {
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    consentLabel: string;
    submitButton: string;
    submitting: string;
    success: string;
    /** 선착순 쿠폰 잔여 인원 문구 — "{count}"를 실제 잔여 인원 숫자로 치환해서 쓴다. */
    remainingSlots: string;
    /** 잔여 인원이 0이 됐을 때 위 remainingSlots 대신 보여준다. */
    soldOut: string;
    errors: {
      email: string;
      consent: string;
      generic: string;
      already: string;
    };
  };
  unsubscribe: {
    title: string;
    loading: string;
    success: string;
    alreadyUnsubscribed: string;
    notFound: string;
  };
  footer: {
    privacyNote: string;
    privacyLinkLabel: string;
    googlePlayCta: string;
  };
  /**
   * saju-letter-newyear-campaign 이관분(2026-08-07) — ko를 제외한 5개 언어에만 존재한다(그
   * 캠페인이 원래 ko를 지원하지 않았던 것과 같은 이유, languages.ts의 `NonKoreanLanguage` 참고).
   * ko.ts는 이 필드를 채우지 않고, `/[lang]/lunar-new-year/*` 라우트가 `isNonKoreanLanguage`로
   * 걸러 ko 요청 자체를 `notFound()` 처리하므로 런타임에 undefined로 접근될 일이 없다.
   */
  lunarNewYear?: {
    navHome: string;
    landing: {
      title: string;
      subtitle: string;
      nameLabel: string;
      namePlaceholder: string;
      dateLabel: string;
      yearLabel: string;
      monthLabel: string;
      dayLabel: string;
      timeLabel: string;
      timeUnknownLabel: string;
      hourLabel: string;
      minuteLabel: string;
      memorableEventLabel: string;
      memorableEventPlaceholder: string;
      ageConfirmLabel: string;
      consentPreviewNote: string;
      submitButton: string;
      submitting: string;
      errors: {
        name: string;
        date: string;
        memorableEvent: string;
        age: string;
        generic: string;
        rateLimited: string;
      };
    };
    offSeason: {
      title: string;
      body: string;
      cta: string;
    };
    result: {
      loading: string;
      notFound: string;
      shareTitle: string;
      shareButton: string;
      shareCopied: string;
      emailSectionTitle: string;
      emailSectionSubtitle: string;
      emailPlaceholder: string;
      consentLabel: string;
      subscribeButton: string;
      subscribing: string;
      subscribed: string;
      errors: {
        email: string;
        consent: string;
        generic: string;
        already: string;
      };
    };
    unsubscribe: {
      title: string;
      loading: string;
      success: string;
      alreadyUnsubscribed: string;
      notFound: string;
    };
    footerPrivacy: string;
  };
}
