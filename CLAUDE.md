# Saju Letter Marketing Site — 프로젝트 컨텍스트 (CLAUDE.md)

> 매 세션 자동 로드되는 파일 — **지금 유효한 규칙·구조만** 담는다.
> - 결정의 배경·경위·폐기된 대안은 `docs/decision-log.md`(2026-10-01 축약 직전 이 파일 전문 포함). **새 결정 이력은 그 파일 끝에 추가**하고, 여기엔 바뀐 규칙만 짧게 반영한다.
> - 제품 전체 그림은 meta 저장소 `../CLAUDE.md`(§9 "확장 기능 #9"), 배포/환경 세부는 `../docs/setup-guide.md`.
> - 이 저장소는 saju-letter.com 마케팅 허브(Next.js App Router) **프론트엔드만**. API/AI/DB는 `saju-letter-backend/`.

## 0. 응답 언어

- **Claude Code는 이 프로젝트에서 항상 한국어로 응답한다.**

## 1. 정체성·카피 원칙

- **"다인의 공개 편지함"** — 가입 없이 다인의 목소리를 맛보고 매일 아침 앱으로 이어받는 곳(`../docs/marketing-site-realignment-2026-08-26.md`). 홈 = 편지 약속 + 미니 데모. 사주 교육은 compare·블로그에만, 홈에 인포그래픽 없음.
- 비주얼: `--accent` 웜 테라코타(모바일 `dainAccent`와 동일), 옛 블루 `--accent-splash`, 보조 `--accent-warm`, 세리프 디스플레이, `.letter-surface`. 다인 이미지 `public/dain-portrait.png`/`dain-avatar.png`.
- **실제 사람 이름 텍스트에 붉은 계열 색 금지**(한국 정서상 금기) — 중립색 사용.
- **마케팅 카피에서 AI 활용 사실을 언급하지 않는다**(법적 고지 문서는 예외).
- **다인은 가상 캐릭터** — 바이라인("다인 씀", `dict.blog.byLabel`)은 필명처럼 수식어 없이. 전기를 서술할 땐 "가상의 캐릭터, 실존 인물 아님" 고지를 맨 앞에 두고 "~라는 설정"으로(`who-writes-your-letter`). JSON-LD에서 다인을 `Person`으로 마크업하지 않는다(Article `publisher`=Organization).
- 신년운세·궁합 게스트 페이지엔 다인 초상/서사 없음 — 결과 등에서만 앱으로 soft connect.

## 2. 언어 — 두 개의 축 (`src/lib/languages.ts`)

- **트랜잭션·법적 축** `MARKETING_LANGUAGES`/`isMarketingLanguage`(ko/en/es/pt/ja/vi): `privacy`, `disclaimer`, `unsubscribe`, `compat/[token]`, `lunar-new-year`(+`r/[id]`, `unsubscribe`), `[lang]/layout.tsx` 게이트, `[lang]/opengraph-image.tsx`(privacy/disclaimer가 폴백 OG로 참조).
- **콘텐츠 축** `LAUNCH_CONTENT_LANGUAGES`/`isLaunchContentLanguage`(ko/en/ja/es): 홈, `blog`, `blog/[slug]`, `compare`(+OG), middleware 자동 감지, 언어 스위처(콘텐츠 경로에서만 — 트랜잭션 경로는 켠 언어 그대로, §3).
- 레이아웃은 합집합(6)만 통과시키고 리프 페이지가 세부 판정(레이아웃은 하위 pathname을 모름). 콘텐츠 축 페이지는 pt/vi를 `notFound()`.
- **이미 발급된 링크(드립 수신거부·궁합 공유·신년운세 결과)는 언어 무관하게 열려야 한다 — 트랜잭션 축을 4개로 좁히지 말 것.** 게이트를 바꾸면 `generateStaticParams`·`languageAlternates`·`sitemap.ts`·prop 타입·OG 참조·`INTL_LOCALE` 맵 등 **형제 코드를 함께** 맞출 것(반복된 회귀 패턴).
- 레이아웃: 헤더 Blog/Compare 링크는 콘텐츠 축일 때만, 로고는 pt/vi에서 비클릭 `<span>`. 푸터 privacy/disclaimer 링크는 항상.
- pt/vi 블로그·compare 오픈: `LAUNCH_CONTENT_LANGUAGES`에 추가 + `content-posts/*.{pt,vi}.mdx` 작성(dictionary·`compareZodiac.ts`는 6개 언어 준비됨, 단 2026-08-25 블로그/compare 보강분은 pt/vi MDX에 미반영).
- **서비스 언어 실시간 반영**: `serviceLanguagesApi.ts::fetchActiveServiceLanguages()` → 백엔드 `GET /marketing-site/service-languages`(공유 `ServiceLanguage` 테이블). **반환은 6개 축 원본**(`MarketingLanguage[]`) — 신년운세 랜딩·hreflang·sitemap은 그대로 쓰고, 콘텐츠 축 소비처(홈, middleware)가 `isLaunchContentLanguage`로 좁히고, 레이아웃은 원본을 `LanguageSwitcher`에 넘겨 스위처가 경로별로 좁힌다. 실패 시 마지막 성공 값 → 한 번도 성공 못 했으면 빌드 중에만 정적 목록, 실행 중엔 던진다(ISR이 폴백을 굳히지 않게). middleware는 `fetchServiceLanguagesOnce`(2초 제한) + `staleWhileRevalidate.ts` 메모리 캐시(10분) — 만료된 값도 즉시 쓰고 새로 받기는 공유 promise 하나로 뒤에서(`event.waitUntil`), 콜드 스타트만 한 번 기다리며, 실패하면 마지막 값(없으면 정적 목록)을 30초만. 홈은 `showContentLinks = isLaunchContentLanguage(lang) && activeLanguages.includes(lang)`로 데모 CTA/섹션·소개/compare 링크·"이번 주 다인의 글" 배너를 게이트. `generateStaticParams`는 정적 상수 그대로.
- `DemoForm`/`LeadCaptureForm`의 `language`와 `api.ts`의 `DemoReadingInput`/`SubscribeLeadInput.language`는 `LaunchContentLanguage` 타입.
- 신년운세: 라우트는 6개 언어(ko 포함), 신규 제출 언어는 백엔드 `getActiveServiceLanguages()`가 제한(`unsupported_language` → 일반 에러).
- **톤 2그룹 `TONE_GROUP`**: en/es=`explain-from-scratch`(별자리에 빗대 개념부터), ko/ja=`lean-into-tradition`(사주/四柱推命과의 유사성), pt/vi 값만 유지. **compare·블로그 카피에만** 적용, dictionary 문구 차이로 구현. 백엔드 AI 콘텐츠의 "전 언어 오행명/전문용어 금지" 원칙과는 다른 층.

## 3. 라우팅·구조

- `/[lang]` 세그먼트 라우팅(언어별 SEO 인덱싱). `src/proxy.ts`(Next 16 Proxy, 옛 `middleware.ts` — Node 런타임, `event.waitUntil` 지원): 프리픽스 없는 요청을 `detectPreferredLaunchLanguage()`(Accept-Language q값 순)로 리다이렉트, apex `saju-letter.com` → `www` 308.
- `src/app/[lang]/layout.tsx`가 실질적 루트 레이아웃(별도 `app/layout.tsx` 없음) — `metadataBase`, Organization JSON-LD, `AttributionCapture`, GA·동의 배너·푸터 "쿠키 설정". 레이아웃 자체가 실패하면(콜드 스타트에 서비스 언어 조회 실패 등) `app/global-error.tsx`(자체 `<html>`, 인라인 스타일, 주소 첫 마디로 언어) — 문구는 `[lang]/error.tsx`와 공용 `content/errorCopy.ts`.
- 사전 `src/dictionaries/{lang}.ts`+`types.ts`, 장문 콘텐츠 `src/content/`.
- `LanguageSwitcher.tsx`: `availableSwitcherLanguages(rest, activeLanguages)`가 **경로별로** 고른다 — 트랜잭션 경로(`isTransactionalPath`: lunar-new-year·compat·privacy·disclaimer·unsubscribe)는 켠 언어 그대로, 나머지는 콘텐츠 축만. 블로그 글은 `SwitcherLanguageLimit`(글 페이지가 그 글이 있는 언어를 알림)으로 글이 없는 언어를 `/{lang}/blog`로 보낸다. `buildLanguageSwitchPath()`로 **쿼리스트링(`?token=`) 보존**. `useSearchParams()` 때문에 Suspense 래퍼(`LanguageSwitcherInner`/`LanguageSwitcherFallback`) 필수 — 없으면 정적 생성 깨짐.
- **RSC 경계**: 함수 필드가 있는 객체(예: `COMPAT_CONTENT[lang]`)를 클라이언트 컴포넌트 prop으로 넘기지 말 것 — 클라이언트가 `language`로 직접 조회. 핸들러가 필요한 공용 컴포넌트는 `'use client'`.

## 4. 페이지별 현재 동작

- **홈 `/[lang]`**(4개 언어, ISR 3600): 히어로 + `DainHomeMark` + `AppDownloadLinks` + `DemoForm` + 최신 글 배너(`getLatestPostSummary`) + **`<LeadCaptureForm>`(노출 중, 30일 체험 쿠폰 안내 포함 — 의도된 상태)**. 데모·리드 폼 모두 `showContentLinks` 게이트 안.
- **미니 데모**: `src/lib/saju.ts`가 `lunar-javascript`로 **브라우저에서 사주 계산**(백엔드는 계산 안 함 — 데모·궁합·신년운세 폼 모두 `await import('@/lib/saju')`로 지연 로드, 정적 import 금지)해 천간/지지를 `POST /marketing-site/demo-readings`로. 만 16세 확인용 양력 년/월/일은 서버가 검증만 하고 저장 안 함. 결과(`teaser`)는 DB 미저장.
- **블로그**(4개 언어, ISR 3600) — 하이브리드:
  - 파일 글: `content-posts/{slug}.{lang}.mdx` + `POST_SLUGS`(`@next/mdx`, `export const meta = {...}`, `meta.category` = `observation`/`explainer`/`behind`/`season`).
  - DB 글(백엔드 `MarketingSiteBlogPost`): admin-panel UI 없이 `saju-letter-admin-backend`의 `POST /marketing-site/blog-posts`로 발행. `next-mdx-remote/rsc` 런타임 컴파일 — **`import` 불가**, 태그는 `blogMdxComponents`(문자열 prop만 받는 `FixedVsChangingDiagram`/`NewYearTimelineDiagram`)만 — 배열 prop이 필요한 `RitualFlowDiagram`은 `blockJS`가 `{}` 식을 지워 렌더 중 예외가 나서 DB 맵에서 뺐다(파일 글 전용, DB 글에선 껍데기만 벗겨짐). 이미지는 `public/`에 git 커밋 — **DB 글의 이미지는 이 사이트 상대 주소만**(외부·`//host`는 추적 픽셀이라 삭제). `SafeMdx`가 `remarkSanitizeMdx`(`lib/mdxSanitize.ts`)로 다이어그램 + 서식용 HTML 태그·허용 속성(**`className` 없음** — Tailwind 피싱 오버레이 방지)·안전한 주소만 남기고(script·iframe 등은 내용째 삭제, 모르는 태그는 껍데기만 벗김), `blockJS`가 `{}` 식을 지운다. 요소 스타일(h2·h3·p·ul·ol·li·strong·blockquote·a)은 파일 글·DB 글 공용 `components/blog/mdxElements.tsx`.
  - `posts.ts`: `getAllPostSummaries`가 `date` 문자열로 병합 정렬(발행 게이트 아님), `getPostContent`가 `isPostSlug`로 file/db 분기(DB slug는 정적 slug와 겹치지 않게).
  - `blogApi.ts`는 **네트워크 포함 모든 예외를 흡수**(빈 배열/null) — 백엔드 없이도 빌드 성공해야 함.
  - 주간 칼럼은 **수동 편집**(자동 생성 없음): 화요일, EN 원문 → ko/ja/es(백로그: realignment 문서 §4.5–4.6). `what-is-saju`(입문, ko와 en/ja/es 구조 다름)는 별도 트랙.
- **compare**(+OG, 4개 언어): 별자리 12 vs 일간 10 정적 비교(1:1 매칭표 없음), `CompareInfographic` + `dict.compare.*`. 다이어그램은 인라인 SVG/HTML, 절대 위치 대신 flex 흐름.
- **`compat/[token]`**(+OG, 6개 언어, 동적): 공유 URL엔 언어 없음(middleware가 리다이렉트). 백엔드 `compatibilityPublicRouter`를 `compatApi.ts`/`CompatView.tsx`로 호출. 게스트는 이름+생년월일만 입력, 일간 + `yearStem`/`yearBranch`/`monthStem`/`monthBranch`/`dayBranch` 전송. 음력/윤달 지원(윤달 체크박스는 그해 윤달인 달에만, 연/월/양음력 변경 시 `getLunarLeapMonth()`로 `isLeapMonth` 리셋). 연도 목록은 서버 페이지가 넘긴 `currentYear` 기준(`birthYearOptions`, 하이드레이션 일치). **"OOO님과의 궁합"·OG 제목은 발신자 `requesterName`**(없으면 "a friend" 계열). `logCompatEvent`와 GA 이벤트 병행.
- **`lunar-new-year`**(+`r/[id]`+OG, `unsubscribe`; 6개 언어): 옛 캠페인 이관분, Fortune 톤 유지, 결과(`appBridgeTitle`/`Body`)·오프시즌(`offSeason.cta`)에서만 `AppDownloadLinks`. 백엔드 `/newyear-campaign/*`. `OffSeasonPlaceholder`의 `INTL_LOCALE`은 6개 언어 필수. `EmailSignupForm`(신년운세 드립)은 리드 캡처와 별개. **결과 공유 링크 `r/[id]`는 공개 화면**(결과·공유·"나도 해 보기"): 메일 구독 폼·구독 상태는 결과를 만든 사람만 — 생성 응답의 `ownerToken`을 `ReadingForm`이 `/api/lunar-new-year/owner-token`으로 보내 httpOnly 쿠키 **하나 `nyo`**(`<id>.<토큰>.<발급초36진>`을 `~`로, 최근 10개·결과마다 90일 — 예전 결과별 `nyo_<id>`는 읽기 호환만)로 심고, 페이지가 그 쿠키를 `X-Reading-Owner-Token`으로 넘겨 백엔드가 `isOwner: true`(+`subscriptionAvailable !== false`)일 때만 폼을 그린다(`lib/readingOwner.ts`). 토큰은 주소·GA에 넣지 않는다. 구독 POST는 Turnstile `remoteip`·IP 한도 때문에 여전히 브라우저가 백엔드로 직접 보내므로 토큰이 폼 prop(RSC 페이로드)으로 내려간다 — 같은 사이트 라우트로 옮기려면 백엔드가 내부 키와 함께 방문자 IP를 받아 주는 변경이 먼저 필요. 위기 대체 결과(`isOwner && subscriptionAvailable === false`)엔 공유 버튼·앱 안내도 없다.
- **`privacy`**(6개 언어, `privacyPolicy.ts`, 모바일 `buildPrivacyPolicyUrl`이 직접 링크): ⚠️ AI 초안, 법률 검토 전. **수집·전송(분석 이벤트, 제3자, AI 호출 경로)이 바뀌면 같은 작업에서 6개 언어 §1/§2/§4 + effectiveDate/§10 갱신**, 파일 상단 개정 주석 기록. 데모·신년운세(동기 AI)는 §4 AI 제공업체에 포함, 궁합 공유(배치 캐시)는 제외.
- **`disclaimer`**(6개 언어, `disclaimer.ts` = 모바일 문구 그대로): 로그인 없이 AI 결과를 보는 세 곳(데모, 궁합 `CompletedResult`, 신년운세 결과)에 `DISCLAIMER_CONTENT[language].short` 표시.
- **`unsubscribe`**(6개 언어): 비추측성 `?token=`, `UnsubscribeStatus.tsx`(신년운세 수신거부와 공용) — **확인 버튼을 눌러야 API를 부른다**(메일 보안 검사기가 링크를 열어도 수신거부되지 않게).
- **`/.well-known/assetlinks.json`**: Android App Links(지문 일치 확인, 실기기 검증 미확인).
- 아이콘: `src/app/icon.png`/`apple-icon.png`, 헤더 로고 `public/logo-icon.png`. `public/icon.png` 이름 금지(라우트 충돌).

## 5. 리드·드립·쿠폰 (홈에 노출 중)

- 리드는 이메일만(나이 게이트·개인화 없음). 드립은 백엔드가 `(language × dayNumber)` 단위로 공유 캐시(`dripService.ts`), 다인 페르소나 프롬프트 — 프롬프트 변경은 기존 캐시에 소급 안 됨. 드립 기준일 = max(가입일, 관리자 지정 앱 출시일).
- 쿠폰 모델은 백엔드에서 이벤트→쿠폰→코드(`PromotionEvent`/`PromotionCoupon`/`PromotionCode`)로 통합됨. 이 사이트의 계약은 유지: `LeadCaptureForm`이 `GET /marketing-site/coupon-availability`의 `capacity`/`issued`/`remaining`을 `remainingSlots`로 표시, 소진 시 `soldOut`, 조회 실패는 무시. 캡·오퍼링 관리는 백엔드/관리자 패널/모바일 소관.

## 6. Turnstile (`src/components/Turnstile.tsx`)

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 없으면 위젯·버튼 잠금 없음(로컬). 운영 백엔드는 시크릿(`TURNSTILE_SECRET_KEY`) 없거나 검증 실패면 거부 — **운영엔 둘 다 필요**.
- 5개 폼(`DemoForm`, `LeadCaptureForm`, `CompatView`의 `PendingForm`, `EmailSignupForm`, `ReadingForm`) 모두 `TURNSTILE_ENABLED && !turnstileToken`으로 버튼 잠금.
- **토큰 1회용** — 실패/재시도 시 `setTurnstileToken(undefined)` + `turnstileRef.current?.reset()`. 컴포넌트는 `window.turnstile`이 이미 있으면 즉시 렌더(`next/script` `onLoad` 재호출 안 됨), `forwardRef`로 `reset()` 노출.
- 궁합 제출은 모바일도 같은 API라 백엔드가 토큰이 있을 때만 검증(이 사이트는 항상 전송).

## 7. GA4·동의·유입 귀속

- 같은 GA4 프로퍼티(`saju-letter-20575`)의 웹 스트림, gtag.js 직접(`analytics.ts`의 `trackEvent`, `GoogleAnalytics.tsx`). `NEXT_PUBLIC_GA_MEASUREMENT_ID` 없으면 스크립트·배너 미렌더.
- **Consent Mode v2**: 로드 전 4개 저장소 `denied`, 저장된 선택은 같은 인라인 스크립트에서 동기 반영. **광고를 쓰지 않는 동안 동의로 열리는 건 `analytics_storage`뿐, `ad_storage`·`ad_user_data`·`ad_personalization`은 항상 `denied`**(사용자 결정, `consentModeState()`를 인라인 스크립트·`storeConsent`가 공유 — 광고를 붙이면 배너 문구·처리방침과 함께 바꿀 것). `ConsentBanner.tsx` + `readStoredConsent`/`storeConsent`(localStorage `saju-letter-consent`, 1년 TTL). 푸터 "쿠키 설정"(`ConsentSettingsLink`, `dict.footer.cookieSettingsLabel`)이 `openConsentSettings()` 이벤트로 배너를 다시 연다 — 철회(`denied`)는 보관된 유입 정보와 `_ga`/`_ga_*` 쿠키를 지운다. 처리방침 §1이 이 링크 이름을 그대로 가리킨다. `dict.consent`는 AI 초안.
- 이벤트: `install_cta_click`(`context`/`platform`), `lead_submit`, `compat_result_view`, `demo_submit`, `demo_result_view`. **이메일·토큰 등 식별 값을 파라미터에 넣지 않는다.** 새 이벤트 시 개인정보처리방침 갱신.
- **page_view는 직접 보낸다(주소에 토큰이 있어서)**: 인라인 스크립트가 다듬은 위치·referrer·제목을 `set`으로 넣고(config에 넣으면 뒤의 `set`보다 우선해 이동 뒤 이벤트 위치가 첫 화면에 고정된다) `config`는 `send_page_view: false`만, `GoogleAnalyticsPageView`(`usePathname`, `<body>` 맨 앞)가 경로가 바뀔 때마다 `set`+`page_view`. 다듬기는 `pageLocation.ts` — `/compat/:token`·`/lunar-new-year/r/:id`, 쿼리는 `utm_*`와 Google Ads 클릭 id(`gclid`·`gbraid`·`wbraid`·`dclid`)·`_gl`만, 같은 사이트 referrer도 같은 규칙·외부는 origin만, **제목은 모든 페이지에서 `document.title` 대신 다듬은 경로**(이름·AI 헤드라인이 effect 뒤에 붙을 수 있어 타이밍으로 못 거른다). 중복 전송 판정은 다듬기 전 주소로(다른 토큰 페이지 사이 이동을 삼키지 않게). 인라인 스크립트는 같은 규칙의 JS 원문(`inlinePageContextFunctionSource`)을 쓰고 테스트가 두 구현의 일치를 확인한다 — **토큰이 든 새 경로를 만들면 `PAGE_PATH_RULES`에 추가**. ⚠️ **GA4 콘솔 → 데이터 스트림(웹) → 향상된 측정 → 페이지 조회 고급 설정의 "브라우저 기록 이벤트 기반 페이지 변경"은 반드시 꺼 둔다**(켜면 gtag가 주소 전체로 page_view를 따로 보낸다). 같은 패널의 "양식 상호작용"도 끄는 게 원칙이고, 토큰 페이지의 `<form>`엔 토큰 없는 `action`을 단다(없으면 현재 주소가 `form_destination`으로 나간다).
- **유입 귀속 `attribution.ts`**: UTM(없으면 궁합 직접 진입 `compat_share`, 그다음 referrer 매핑)을 기억 → `buildPlayStoreUrl()`이 Play `referrer`에 utm_* + `utm_content`(=배지 `context`). 기본 `marketing_site / website / direct`. **localStorage(30일, last touch)는 동의 `granted`일 때만**, 미동의는 탭 메모리, 진입 뒤 배너에서 동의하면 `persistAttributionTouch()`가 그때 보관, `storeConsent('denied')`가 삭제. 키 상수는 순환 import 방지로 `analytics.ts`에. `AttributionCapture.tsx`가 배지 없는 페이지 진입도 기록. **진입 유입은 문서당 한 번만 뽑고**(`captureAttribution`), 배지는 `readStoredTouch()`만 읽는다(클라이언트 이동은 `document.referrer`를 바꾸지 않아 다시 뽑으면 진입 UTM을 덮어쓴다).

## 8. 앱 다운로드 배지 (`appLinks.ts`, `AppDownloadLinks.tsx`)

- 스토어 URL(`NEXT_PUBLIC_GOOGLE_PLAY_URL`/`NEXT_PUBLIC_APP_STORE_URL`)과 공개 플래그(`NEXT_PUBLIC_ANDROID_APP_LIVE`/`NEXT_PUBLIC_IOS_APP_LIVE`, `"true"`만)를 분리 — LIVE 아니면 `<a>` 없는 "출시 준비 중" `<span>`.
- 서버 렌더는 기본 링크, 누르는 순간 DOM `href`만 귀속 링크로 교체(상태/이펙트 없음).
- `context`: `home_hero`/`demo_result`/`compat_result`/`newyear_result`/`newyear_offseason` — 이 다섯 곳에만, **푸터엔 두지 않는다**. 문구 `dict.appLinks`.

## 9. SEO

- `seo.ts`(`WEB_BASE_URL`, `languageAlternates()` — `x-default`=en, `NOINDEX_ROBOTS`, `buildSocialMetadata()` — OG+twitter 항상 함께), `structuredData.ts`(`organizationJsonLd`, `articleJsonLd`).
- 모든 정적 페이지에 hreflang(실제 지원 언어 집합) + canonical. 개인화/트랜잭션 페이지(`compat/[token]`, `r/[id]`, 두 `unsubscribe`)는 메타 `noindex, follow`(robots.txt Disallow 금지).
- 기본 OG `[lang]/opengraph-image.tsx`, 다른 세그먼트는 그 URL을 직접 참조(파일 규약 비상속). compare/compat/신년운세 결과는 전용 OG.
- `sitemap.ts`(async, `revalidate = 3600` 필수): 엔트리별 alternates, 블로그 slug는 실제 발행 언어에만(`posts.ts::getSlugLanguageMap` — 글 페이지 hreflang과 공용). `lastModified`는 블로그 글 날짜만, 정적 페이지는 생략(`new Date()` 금지). 홈/블로그(목록·글)/compare는 **콘텐츠 축 ∩ 관리자가 켠 언어**(`activeContentLanguages`) — 페이지 hreflang도 같은 계산(`seo.ts::activeLanguageAlternates`, x-default=관리자 기본 언어 → en → 첫 언어). 신년운세는 켠 언어, privacy/disclaimer는 6개. 홈·블로그(목록·글)·compare는 페이지 언어가 꺼져 있으면(`activeContentLanguages`에 없음) `noindex`(`NOINDEX_ROBOTS`).
- ISR 3600: 홈·블로그 목록/글·sitemap·레이아웃. 새 DB 글은 목록에 최대 1시간 지연.

## 10. 백엔드 연동

- 클라이언트: `apiClient.ts`, `api.ts`(데모/leads/unsubscribe/쿠폰), `compatApi.ts`, `lunarNewYearApi.ts`, `blogApi.ts`, `serviceLanguagesApi.ts`.
- `compat/[token]`·`r/[id]`는 **Next 서버에서** 백엔드를 호출(단일 IP로 보임 — 백엔드가 별도 한도, 서버 요청엔 `MARKETING_INTERNAL_KEY`가 있으면 내부 키 헤더, §11). `getCompatInvite`/`getReading`은 **영구 실패(404 등)만 not_found/null**, 429·5xx·시간 초과는 던져 `[lang]/error.tsx`(`unstable_retry`)가 다시 시도를 보여 준다(메타데이터·OG는 잡아서 일반 문구).
- `apiClient.request()`의 시간 제한 `signal` 때문에 **Next fetch 중복 제거가 꺼진다** — 한 렌더에서 여러 번 부르는 서버 조회 함수(`getCompatInvite`/`getReading`/`getPostContent`/`getAllPostSummaries` 등)는 React `cache()`로 감싼다.

## 11. 환경변수

`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WEB_BASE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_PLAY_URL`, `NEXT_PUBLIC_APP_STORE_URL`, `NEXT_PUBLIC_ANDROID_APP_LIVE`, `NEXT_PUBLIC_IOS_APP_LIVE` — 전부 빌드 타임 인라인. Cloud Run `--source` 배포 시 build-env-vars로 지정(새 변수는 `--update-build-env-vars`). 절차는 `../docs/setup-guide.md`.

**서버 전용(런타임) `MARKETING_INTERNAL_KEY`** — `apiClient.request()`가 **서버에서만**(`typeof window === 'undefined'`) 값이 있을 때 `X-Marketing-Internal-Key` 헤더로 보낸다(`internalKeyHeaders()`). Next 서버 렌더(`compat/[token]`·`r/[id]` 등)가 한 IP로 보여 방문자 전체가 백엔드의 IP별 한도 하나를 나눠 쓰는 문제 대응 — 백엔드가 같은 값을 알면 그 한도에서 뺀다. **build-env-var가 아니라 Cloud Run 런타임 시크릿**(`--update-secrets=MARKETING_INTERNAL_KEY=<시크릿>:latest`, 백엔드와 같은 Secret Manager 값)으로만 넣고, **`NEXT_PUBLIC_` 접두사 절대 금지**(클라이언트 번들에 인라인된다). 없으면 헤더 없이 예전처럼 동작. PowerShell로 시크릿 파일을 만들 땐 UTF-8 BOM 주의.

## 12. 실행·검증

```bash
npm run dev       # 포트 3200, saju-letter-backend가 먼저 떠 있어야 폼 동작
npm test          # vitest (vitest.config.mts가 `@/` 별칭 해석)
npm run lint
npx tsc --noEmit
npm run build     # 라우트/타입 검증 + MDX 컴파일, 백엔드 없이도 성공해야 함
```

- jsdom/컴포넌트 렌더링 테스트 인프라 없음 — 로직은 `src/lib/*` 순수 함수로 뽑아 단위 테스트(전역은 `vi.stubGlobal`). 페이지 게이트는 `page.test.ts` 패턴("지원 언어 전부 notFound 없이 통과 + 미지원 404").
- vitest엔 `@next/mdx` 로더가 없어 파일 글(`{source:'file'}`) 경로는 단위 테스트 불가(알려진 갭).
