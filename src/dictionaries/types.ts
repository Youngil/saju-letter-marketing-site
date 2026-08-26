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
    /** 히어로에 보이는 다인 이름(예: "Dain" / "다인"). */
    dainName: string;
    /** 다인 역할 한 줄(예: "Your letter writer" / "사주편지의 편지지기"). */
    dainRole: string;
    /** 다인 소개 글(who-writes-your-letter)로 가는 링크 문구. 1차 출시 언어에서만 렌더. */
    learnAboutDain: string;
    /** 인포그래픽 제거 후 compare로 보내는 안내 문장. 1차 출시 언어에서만 렌더. */
    compareHint: string;
    /** compare 링크 CTA 문구. */
    compareLink: string;
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
    resultFromName: string;
    resultFromRole: string;
    resultCta: string;
    tryAgain: string;
    errors: {
      date: string;
      underage: string;
      generic: string;
      rateLimited: string;
    };
  };
  blog: {
    title: string;
    subtitle: string;
    readMore: string;
    empty: string;
    byLabel: string;
    /** 홈 “이번 주 다인의 글” 섹션 라벨. */
    thisWeekLabel: string;
    /** 홈 티저 CTA. */
    thisWeekCta: string;
    categories: {
      observation: string;
      explainer: string;
      behind: string;
      season: string;
    };
  };
  /**
   * Phase 4 `CompareInfographic`용 — 옛 홈 대시보드형 AstrologyInfographic 카피는 폐기.
   * 기둥 라벨(년/월/일/시)은 demo.yearLabel 등을 재사용한다.
   */
  compare: {
    title: string;
    subtitle: string;
    ogTitle: string;
    ogDescription: string;
    /** 다인/아침 편지 맥락으로 compare를 여는 짧은 문단. */
    opening: string;
    /** 인포그래픽 위 작은 캡션(예: "Dain's quick look at the difference"). */
    diagramCaption: string;
    diagramZodiacLabel: string;
    /** 별자리 쪽 한 줄(예: "One sun position"). */
    diagramZodiacPoint: string;
    diagramSajuLabel: string;
    /** 그림 아래 결론 한 줄(매일 편지 가능 이유). */
    diagramClosing: string;
    zodiacColumnLabel: string;
    sajuColumnLabel: string;
    dayMasterSectionTitle: string;
    dayMasterIntro: string;
    infoAmountTitle: string;
    infoAmountBody: string;
    hourTitle: string;
    hourBody: string;
    philosophyTitle: string;
    philosophyBody: string;
    referenceTitle: string;
    ctaText: string;
  };
  leadCapture: {
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    consentLabel: string;
    submitButton: string;
    submitting: string;
    success: string;
    /** 선착순 쿠폰 현황 문구 — "{capacity}"(전체 캡)/"{issued}"(현재까지 발급 수)/"{remaining}"(잔여
     * 인원) 3개 자리표시자를 실제 숫자로 치환해서 쓴다(2026-08-26, 잔여 인원만 보여주던 것에서
     * 확장 — 총 인원/현재 신청 수도 함께 보여달라는 사용자 요청). */
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
  };
  /**
   * 안드로이드/iOS 스토어 다운로드 CTA — 홈 히어로(첫 화면, 스크롤 없이 보임)·footer(전 페이지
   * 공통)·두 전환 지점(무료 미리보기 결과, 궁합 결과)에서 재사용한다
   * (`components/AppDownloadLinks.tsx`, 2026-08-25). 아직 어느 플랫폼도 스토어에 올라가지
   * 않은 지금은 `comingSoon` 문구가 두 배지 모두에 함께 표시된다.
   */
  appLinks: {
    /** 배지 위 작은 섹션 라벨(예: "앱 다운로드"). */
    sectionLabel: string;
    androidCta: string;
    iosCta: string;
    comingSoon: string;
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
        underage: string;
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
      /** 결과 하단 soft connect — 캠페인 Fortune 톤과 별도로 아침 편지/앱 안내. */
      appBridgeTitle: string;
      appBridgeBody: string;
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
