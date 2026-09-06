# Saju Letter Marketing Site — 프로젝트 컨텍스트 (CLAUDE.md)

> 이 파일은 Claude Code가 매 세션 시작 시 자동으로 읽는 프로젝트 컨텍스트입니다.
> 이 저장소는 saju-letter.com **마케팅 허브(Next.js)의 프론트엔드만** 담습니다. 사주 계산 로직과 AI 생성
> API는 `saju-letter-backend/`에 있으며, 전부 별도 git 저장소입니다(2026-08-07 7번째 저장소로 추가).
> 제품 전체 그림의 정본은 형제 폴더로 함께 클론했을 때 유효한 meta 저장소의 `CLAUDE.md`를 참고하세요
> (`../CLAUDE.md` §9 "확장 기능 #9").

## 0. 응답 언어

- **Claude Code는 이 프로젝트에서 항상 한국어로 응답한다.** 이 사이트 자체의 화면 문구는 6개 언어를
  지원하지만(아래 §2 참고), 이 규칙과는 무관하게 그대로 유지한다.

---

## 1. 이 사이트가 존재하는 이유

이 사이트는 사주 교육 허브가 아니라 **다인의 공개 편지함**이다 — 가입 없이 다인의 목소리를 맛보고,
원하면 매일 아침 앱으로 이어받는 곳. (1) 홈 미니 데모(오늘의 편지 미리보기), (2) 검색·교육용
블로그/compare, (3) 이메일 리드 → 웰컴 드립 → 30일 체험 쿠폰 퍼널을 제공한다. 교육은 홈이 아니라
compare·블로그에 둔다.

**2026-08-26 재정렬(Phase 1–6 완료)** — 모바일 앱과 같은 “매일 아침 다인의 짧은 편지” 약속으로
맞춘다(`../docs/marketing-site-realignment-2026-08-26.md`). Phase 1 홈 서사·다인 마크, Phase 2
데모/리드/드립 톤, Phase 3 비주얼(웜 액센트·세리프·`dain-portrait`), Phase 4 `CompareInfographic`,
Phase 5 주간 칼럼(화요일·EN→ko/ja/es), Phase 6 신년운세·궁합 soft connect + 문서 동기화.
남은 후속은 pt/vi 블로그 오픈뿐(§2·§8).

**Phase 3 비주얼** — `globals.css`에서 `--accent`를 웜 테라코타(모바일 `dainAccent`와 동일)로 두고, 예전
스플래시 블루는 `--accent-splash`만 쓴다. 디스플레이는 Playfair / Noto Serif KR·JP 세리프, 편지 면은
`.letter-surface`(compare 인포그래픽에도 사용). 다인 초상은 `public/dain-portrait.png`로 모바일과 통일했다.

## 2. 언어 지원 — 6개 언어 구조 + 1차 출시 4개 언어 + 톤 2그룹

`saju-letter-mobile`/`saju-letter-backend`와 동일하게 ko/en/es/pt/ja/vi 6개 언어를 구조적으로
지원한다(`src/lib/languages.ts`의 `MARKETING_LANGUAGES`) — 홈 미니 데모·리드 캡처는 콘텐츠 제작
비용이 없는 영역이라(데모는 실시간 AI 호출, 리드는 이메일만 받음) 6개 언어 전부 그대로 연다.

**다만 블로그/compare 같은 번역 콘텐츠는 1차 출시 타겟 4개 언어(ko/en/ja/es,
`LAUNCH_CONTENT_LANGUAGES`)에서만 연다(2026-08-07, 사용자 결정)** — 포르투갈어/베트남어는 초기
콘텐츠 제작 비용과 마케팅 포인트를 줄이기 위해 1차 출시 이후로 미뤘다. **한국어는 원래 PR/QA
전용이었다가 이때 정식 타겟으로 전환됐다.** pt/vi로 `/blog`나 `/compare`에 접근하면 `notFound()`
— dictionary 카피와 `compareZodiac.ts`의 데이터는 이미 pt/vi까지 다 채워져 있으므로(1차 구축
시점에 6개 언어 전부 작성했음), 나중에 여는 건 `LAUNCH_CONTENT_LANGUAGES`에 언어를 추가하고
`content-posts/*.pt.mdx`/`*.vi.mdx` 3편씩만 새로 쓰면 끝난다 — 라우팅/타입/컴포넌트는 이미
이 배열 하나만 참조하도록 만들어놔서 추가로 손댈 곳이 없다.

**홈 미니 데모·리드 캡처도 2026-09-05부터 pt/vi를 제외한 4개 언어로 제한됐다** — 원래 이 둘은 콘텐츠
제작 비용이 없다는 이유로 6개 언어 전부 열려 있었는데(위 문단), `saju-letter-backend`가 개인화 콘텐츠
생성을 "현재 서비스 언어"(`ACTIVE_SERVICE_LANGUAGES`, ko/en/ja/es)로 제한하면서 사용자가 "모바일
앱이나 마케팅 사이트에서 제공하는 언어 등에 대해서도 모두 앞으로도 일관성을 가지기를 원한다"고
요청해 이 사이트도 같은 4개 언어로 맞췄다(`AskUserQuestion`으로 확인한 3가지 선택지 중 "함께
4개로 제한(추천)"을 택함). **정본은 백엔드의 `ACTIVE_SERVICE_LANGUAGES` 하나지만 저장소 간 물리적
공유는 하지 않는다** — 이 사이트는 이미 있던 `LAUNCH_CONTENT_LANGUAGES`/`isLaunchContentLanguage()`
(블로그/compare가 써온 것과 정확히 같은 4개 값·같은 가드)를 그대로 재사용했다. `[lang]/page.tsx`의
기존 `showContentLinks` 게이트(다인 소개 링크·compare 링크·"이번 주 다인의 글" 배너에 이미 적용
중이던 것)를 히어로의 "#demo" CTA 앵커와 데모 섹션(`<DemoForm>`) 전체에도 그대로 확장했다 — pt/vi
방문자는 이제 히어로에서 데모로 이어지는 CTA 자체가 보이지 않는다(존재하지 않는 섹션으로 스크롤
유도하는 죽은 링크가 되는 걸 방지). **홈 화면 URL 라우팅 구조(6개 언어 정적 페이지)는 그대로
유지한다** — `middleware.ts`의 언어 프리픽스 리다이렉트, `sitemap.ts`/`generateStaticParams`가
여전히 6개 언어 전부를 대상으로 한다(§8의 `MARKETING_LANGUAGES` 6개 원칙 그대로) — 바뀐 건 그
페이지 안에서 데모 섹션을 보여주느냐뿐이다. `DemoForm`/`LeadCaptureForm`의 `language` prop 타입과
`api.ts`의 `DemoReadingInput`/`SubscribeLeadInput.language`도 `MarketingLanguage`(6개)에서
`LaunchContentLanguage`(4개)로 좁혀 컴파일 타임에도 pt/vi 언어값이 이 두 요청에 흘러들 수 없게
했다(방어적 이중화 — 런타임 게이트가 실수로 빠져도 타입 에러로 걸린다). **리드 캡처
(`LeadCaptureForm`)는 2026-09-02부터 이미 홈 화면 렌더링 자체가 주석 처리돼 있어(§8 참고) 이번
변경으로 당장 동작이 바뀌진 않는다** — 재개 시점을 위해 그 주석 안의 예시 코드에도 미리
`showContentLinks` 게이트를 씌워뒀다(주석을 걷어내기만 하면 바로 4개 언어 제한이 적용됨).
타입체크/전체 스위트(35/35)/프로덕션 빌드(6개 언어 정적 홈 페이지 전부 정상 생성 확인) 통과 +
로컬 dev 서버에서 `curl`로 `/pt`는 데모 섹션이 0회, `/en`은 1회 나오는 것을 직접 확인했다.

**톤 2그룹(`TONE_GROUP`, en/es=`explain-from-scratch`, ko/ja=`lean-into-tradition`, pt/vi는 보류
상태로 값만 유지)** — en/es는 사주를 처음 접하는 독자에게 서양 별자리에 빗대어 개념부터
설명하고, ko/ja는 이미 있는 자신의 전통(사주, 四柱推命)과의 유사성을 강조한다(한국어는 2026-08-07에
PR/QA 전용에서 정식 타겟으로 바뀌면서 ja와 같은 그룹으로 옮겼다 — 한국 독자에게 "사주가 뭔지"부터
설명하는 톤은 어색해서). **이 구분은 `saju-letter-backend`가 2026-08-05에 확정한 "AI 생성 사주
콘텐츠는 6개 언어 전부 동일 취급(오행명/전문용어 노출 금지에 언어별 차등 없음)" 원칙과는 다른
층이다** — 그 원칙은 AI가 매일 생성하는 개인화 리딩의 전문용어 노출을 다루고, 여기는 사람이
쓴(또는 한 번 다듬은) 정적 마케팅 카피의 포지셔닝을 다룬다. **2026-08-26 재정렬 이후 `toneGroup`은
교육 페이지(compare·블로그 카피)에만 적용한다** — 홈 히어로/인포그래픽의 `toneGroup` 레이아웃
분기는 제거됐다(홈은 6개 언어 공통 편지 약속, 인포그래픽은 compare의 `CompareInfographic`으로
이동). 구현은 언어별 dictionary 문구 차이가 본체다.

## 3. `/[lang]` URL 세그먼트 라우팅 — 신년운세 캠페인과 다른 선택

`saju-letter-newyear-campaign`은 URL 세그먼트 없이 브라우저 언어 감지 + localStorage만 쓴다(단일
세션 공유 링크 퍼널이라 SEO가 필요 없었기 때문). **이 사이트는 블로그/compare가 언어별로 독립
인덱싱돼야 하므로 반드시 URL이 언어를 들고 있어야 한다** — 이게 신년운세 캠페인 패턴을 그대로
가져오지 않은 유일한 이유다. `src/middleware.ts`가 언어 프리픽스 없는 요청을 `Accept-Language` 감지
결과로 리다이렉트하고, 이후로는 URL이 언어를 그대로 보존한다(`src/app/[lang]/layout.tsx`가 실질적인
루트 레이아웃 — Next.js App Router는 트리 전체에 `<html>/<body>`가 정확히 한 번만 있어야 해서 별도
`app/layout.tsx`는 없다).

## 4. 사주 계산은 이 저장소가 브라우저에서 직접 한다 (백엔드 아님)

`saju-letter-backend/CLAUDE.md` §2의 "이 백엔드는 계산을 하지 않는다" 원칙을 그대로 지킨다 —
`src/lib/saju.ts`(`saju-letter-mobile`의 계산 모듈을 세 번째로 포팅한 것, `saju-letter-newyear-campaign`에
이어)가 `lunar-javascript`로 브라우저에서 직접 계산하고, 계산된 천간/지지를
`POST /marketing-site/demo-readings`로 보낸다. **만 16세 확인용 양력 년/월/일은 함께 보내지만
서버가 저장하지는 않는다**(2026-08-20, 백엔드 `domain/age.ts`가 재검증).

## 5. 홈 미니 데모 — 세 번째 동기(non-batch) AI 호출 경로

`saju-letter-backend`의 `AIProvider` 인터페이스는 이미 2개의 동기 메서드를 갖고 있었다
(`generateNewYearCampaignReading`, `generateDeepCompatibilityReading`) — 이 사이트의 데모가 세 번째다
(`generateMarketingDemoReading`). "제출 시 즉시 결과 표시"가 요구사항이라 배치 API를 쓸 수 없기
때문. 데모 결과(`teaser` 한 줄)는 DB에 저장하지 않는다 — 공유/재조회 대상이 아닌 일회성 티저라서다
(신년운세 리딩과 다른 점 — 그건 `/r/[id]` 공유 페이지가 있어서 영속화가 필요했다).

## 6. 이메일 리드 캡처 + 웰컴 드립 + 30일 체험 쿠폰

- **리드 폼은 이메일만 받는다** — 이름/사주/사연을 받는 신년운세 캠페인의 리딩 폼과 다르다. 그래서
  나이 확인 게이트도 없고(별도 개인정보 수집 단계 자체가 없어서), 드립 콘텐츠도 개인화되지 않는다.
- **드립 콘텐츠는 리드가 아니라 (언어 × 날짜) 조합 단위로 캐시된다** — 사람마다 다를 이유가 없어서,
  `MarketingSiteDripContent`가 `(language, dayNumber)` 조합 하나당 한 번만 배치 생성되고 모든 리드가
  공유 재사용한다(일간×일진 편지 캐시와 같은 철학). 신년운세 드립처럼 구독(리딩)마다 새로 생성하지
  않는다 — `saju-letter-backend/src/marketingSite/dripService.ts` 참고.
- **드립 보이스(2026-08-26 Phase 2)** — 본문 생성 프롬프트(`marketingLeadDripPrompt.ts`)가 다인
  페르소나를 쓰고, Day1은 사주 교과서 소개가 아니라 아침 편지 소개다. 사이트 리드 카피(“다인의
  소개 노트”)와 맞춘 변경이라, **프롬프트만 바꿔도 기존 캐시 행에는 소급되지 않는다**. 새 목소리로
  통일하려면 백엔드에서 `marketing_site_drip_contents`를 비운 뒤 드립 생성 틱이 다시 채우게 해야
  한다(운영 삭제는 별도 승인).
- **30일 체험 쿠폰**은 웰컴 드립 마지막 회차 발송 시점에 이메일당 영구 1회 발급된다(7일 유효,
  `MarketingCouponRedemption`). 실제 "30일 체험" RevenueCat/Play Console 오퍼링은 사람이 콘솔에서
  직접 만들어야 한다 — 코드는 오퍼링 ID를 환경변수 문자열로만 참조한다(`saju-letter-mobile`의
  `EXPO_PUBLIC_REVENUECAT_COUPON_OFFERING_ID`). 무효/만료 코드는 에러로 막지 않고 표준 7일 오퍼링으로
  조용히 폴백한다.
- **선착순 인원 캡 + 잔여 인원 표시(2026-08-08, 사용자 결정)** — "인원 제한 없이 그냥 배포하는 게
  맞나"는 문제 제기에 따라 초기 500명 선착순으로 정했다(`saju-letter-admin-panel`의 "설정" 화면에서
  재배포 없이 조정 가능, `saju-letter-admin-backend`의 `GET`/`PUT /marketing-coupon-settings`). 캡에
  도달하면 이후 리드는 드립 메일 본문은 그대로 받되 쿠폰 CTA만 빠진다(발급 자체가
  `saju-letter-backend`의 `issueCoupon()`에서 조용히 스킵됨). `LeadCaptureForm.tsx`가 공개
  엔드포인트(`GET /marketing-site/coupon-availability`, 인증 없음)를 마운트 시 조회해 문구로 등록을
  유도하고, 소진되면 `soldOut` 문구로 자연스럽게 전환한다(폼 자체는 계속 동작 — 쿠폰만 없을 뿐 드립
  콘텐츠 자체는 여전히 가치가 있음). 조회 실패는 조용히 무시한다(문구를 숨길 뿐 폼 제출 자체를 막지
  않음). **잔여 인원만 보여주던 것을 총 캡+현재 발급 수까지 함께 보여주도록 확장(2026-08-26,
  사용자가 "몇 명까지 가능한지, 현재 몇 명이 신청했는지가 안 보인다"고 지적)** — 백엔드
  `CouponAvailability` 응답이 이미 `capacity`/`issued`/`remaining` 3개 필드를 전부 갖고 있었는데
  프론트는 `remaining`만 state로 저장·표시하고 있었다. `LeadCaptureForm.tsx`가 전체 객체를 저장하도록
  바꾸고, `remainingSlots` 문구(6개 언어 전부)를 `{capacity}`/`{issued}`/`{remaining}` 3개
  자리표시자를 쓰도록 다시 썼다(예: 한국어 "선착순 {capacity}명 중 {issued}명 신청 완료,
  {remaining}명 남았어요").
- **한국어 리드는 원래 쿠폰을 못 받았다(2026-08-08 발견·수정)** — `dripService.ts`의 `FINAL_DAY_CTA`가
  `ko`를 빼고 있었는데(`Record<Exclude<Language,'ko'>,...>`), `ko.ts`의 리드 캡처 문구는 "30일
  무료체험 쿠폰 받기"라고 쿠폰을 약속하고 있어서 실제 동작과 문구가 어긋나 있었다. 선착순 캡 작업을
  하며 우연히 발견해 사용자 확인 후 `ko`도 포함시켰다 — 이제 6개 언어 전부 쿠폰 발급 대상이다.
- **리드 폼은 앱 출시 전부터 이메일을 모아두는 용도로도 쓰인다(2026-08-08, 사용자 결정)** — 처음엔
  "가입 후 N일" 기준으로만 드립이 돌아서, 출시 전에 가입한 사람에게도 아직 쓸 수 없는 앱의 체험
  쿠폰이 미리 날아가는 문제가 있었다. `saju-letter-admin-panel`의 "설정" 화면에서 관리자가 앱
  출시일을 지정해두면(`saju-letter-admin-backend`의 `GET`/`PUT /app-launch-settings`가 DB
  `app_launch_settings` 단일 행을 관리), 드립 스케줄의 기준일이 가입일이 아니라 **출시일**로
  늦춰진다(`saju-letter-backend`의 `marketingSite/leadService.ts`의 `getAppLaunchDate`/
  `dripAnchorDate` — 가입일이 출시일보다 이르면 출시일을, 아니면 원래대로 가입일을 기준으로 삼는
  한 줄짜리 판정). 쿠폰은 마지막 회차 발송 시점에 발급되므로, 이 기준일 이동만으로 "쿠폰도 출시
  후에만 나간다"까지 자동으로 해결된다 — 발급 로직 자체는 건드릴 필요가 없다. 처음엔 백엔드
  환경변수(`APP_LAUNCH_DATE`)였는데, 값을 바꿀 때마다 재배포해야 하는 게 불편해 이 방식으로
  옮겼다. 설정을 비워두면(또는 실제 출시 후 지난 날짜로 두면) 기존처럼 가입일 기준으로 바로 동작한다.
- 수신거부(`/[lang]/unsubscribe?token=...`)는 신년운세 캠페인과 같은 패턴(비추측성 토큰).

## 7. 봇/스크래핑 방지

Cloudflare Turnstile — `NEXT_PUBLIC_TURNSTILE_SITE_KEY`가 없으면 위젯을 렌더링하지 않는다
(`src/components/Turnstile.tsx`, 신년운세 캠페인과 동일 컴포넌트를 그대로 복사). 백엔드 시크릿
(`TURNSTILE_SECRET_KEY`)도 신년운세 캠페인과 공유한다 — 둘 다 공개 랜딩페이지라 사이트를 나눌
이유가 없다는 판단. **운영 백엔드는 시크릿이 없거나 검증 요청이 실패하면 통과시키지 않는다**
(2026-08-20, `saju-letter-backend` `newYearCampaign/turnstile.ts`). 로컬만 시크릿이 없을 때
토큰 없이 제출된다. 운영 마케팅 사이트에는 사이트 키를, Cloud Run에는 시크릿을 둘 다 넣어야 한다.

**리드 캡처(`LeadCaptureForm.tsx`)와 궁합 초대 제출(`CompatView.tsx`의 `PendingForm`)에도
Turnstile 위젯을 붙였다(2026-08-21)** — 데모 폼만 갖고 있던 이 컴포넌트를 그대로 재사용해
`onVerify`로 받은 토큰을 각각 `subscribeLead`/`submitGuestInvite` 요청에 함께 실어 보낸다.
두 라우트가 백엔드에서 이 토큰을 다루는 방식은 다르다 — leads는 이 폼을 호출하는 경로가
마케팅 사이트뿐이라 데모/신년운세처럼 무조건 요구하지만, 궁합 초대 제출은 모바일 앱의 딥링크
화면도 같은 API를 호출하는데(Cloudflare 위젯을 React Native에서 못 띄움) 토큰이 있을 때만
검증한다 — 이 사이트에서 보내는 요청은 항상 토큰을 포함하므로 실질적으로는 그대로 방어된다.
상세는 `saju-letter-backend/CLAUDE.md` 참고.

**신년운세 드립 구독 폼(`EmailSignupForm.tsx`)에도 같은 방식으로 붙였다(2026-08-24, "신년운세
드립 구독에 Turnstile이 없다" 감사 대응)** — 리딩 생성(`ReadingForm.tsx`)은 이미 처음부터
Turnstile로 막혀 있었지만, 그 결과 페이지에서 임의의 제3자 이메일을 12일 드립에 등록하는 이
폼에는 검증이 전혀 없었다. `LeadCaptureForm.tsx`와 완전히 같은 패턴(사이트 키 없으면 위젯을
렌더하지 않고 버튼도 잠그지 않음)이라 새 컴포넌트 없이 그대로 재사용했다.

**`ReadingForm.tsx` 자체는 백엔드 검증은 처음부터 있었지만 제출 버튼이 `TURNSTILE_ENABLED &&
!turnstileToken` 잠금을 안 쓰고 있었다(같은 날 별도 감사 항목)** — 위젯이 뜨기 전에 누르면
백엔드 403을 generic 에러로만 보여줬다(보안 구멍은 아니고 UX 문제). `DemoForm`/
`LeadCaptureForm`/`EmailSignupForm`과 같은 조건을 버튼에 추가해 통일했다.

## 8. 페이지 구조

- `/[lang]` — 홈(히어로 + 다인 발신자 마크 + 미니 데모 + 리드 캡처 폼). **인포그래픽은 홈에 두지 않는다** —
  compare 링크만 남김. 재설계본은 Phase 4에서 compare에 배치(`docs/marketing-site-realignment-2026-08-26.md`).
- `/[lang]/blog`, `/[lang]/blog/[slug]` — MDX 블로그(`@next/mdx`, 프론트매터는 hand-rolled 파서
  대신 MDX가 원래 지원하는 `export const meta = {...}` 구문을 그대로 쓴다 — 새 의존성 없이 정적
  타입까지 딸려온다). 1차 출시 타겟 4개 언어(ko/en/ja/es, `LAUNCH_CONTENT_LANGUAGES`)만 대상 —
  **pt/vi는 당분간 닫아 둔다**(§2). **콘텐츠 정책: AI 활용 사실을 공개하지 않는다(2026-08-08, 사용자 결정)** —
  `what-is-saju` 글이 원래 "계산은 AI가 아니라 결정론적 알고리즘, 문장화만 AI가 담당"이라고 AI를
  직접 언급하고 있었는데(6개 언어 전부), 사용자가 이 서비스가 AI를 쓴다는 사실 자체를 굳이 밝힐
  필요가 없다고 판단해 전부 제거했다 — "정확한 계산(알고리즘)" 차별점은 그대로 남기되, 그 결과를
  "누가/무엇이" 문장으로 바꾸는지는 언급하지 않는 쪽으로 다시 썼다. 새 마케팅 카피를 쓸 때도 이
  원칙을 유지할 것(개인정보처리방침 같은 법적 고지는 별개 — 여긴 순수 마케팅 카피 얘기다).
  - **Phase 5 주간 칼럼 운영(2026-08-26)** — SEO 아카이브가 아니라 다인이 주 1회 쓰는 칼럼.
    **화요일** 목표 발행, **영어 원문 → ko/ja/es** 패키지 동시(또는 화요일 후 7일 이내) 공개.
    체크리스트·8주 백로그는 `../docs/marketing-site-realignment-2026-08-26.md` §4.5–4.6.
    새 글: `POST_SLUGS`에 slug 추가 + `content-posts/{slug}.{lang}.mdx` 4종 + `meta.category`
    (`observation` / `explainer` / `behind` / `season`).
    - **이 운영은 완전히 수동(편집) 프로세스다 — 자동으로 글을 쓰는 스케줄러/크론/AI 생성
      파이프라인이 코드베이스 어디에도 없다**(2026-09-06, 사용자 질문: "주간 블로그 자동
      작성 스케줄러는 제대로 동작하고 있나요?"에 대한 조사 결과) — 매일 편지 같은 AI 자동
      생성 콘텐츠와 달리, 이 칼럼은 처음부터 "본문 집필은 편집 트랙"(§4.6)이라고 명시된
      사람이 직접(또는 Claude Code 세션이) MDX 파일을 써서 커밋+배포하는 방식이다. 조사
      시점 실제로 1주차(목표일 2026-09-01, `why-a-short-letter`)가 5일 지연된 채 미작성
      상태였음을 확인 — "스케줄러 오작동"이 아니라 그 주에 실제 집필 작업이 진행되지
      않았던 것. 사용자 확인 후 1·2주차(`why-a-short-letter`/`zodiac-and-saju-feel`)를
      이 세션에서 4개 언어씩 작성해 발행했다 — `why-a-short-letter`는 백로그 목표일
      그대로(2026-09-01) 날짜를 매겼고(형식만 지연 발행, 편집 캘린더상 그 주 몫), 아직
      오지 않은 2주차 목표일(2026-09-08)도 그대로 매겨(2일 앞당겨 발행) 정렬 순서를
      유지했다 — `getAllPostSummaries`는 `date` 문자열만 비교해 정렬하므로 실제 발행일과
      `date` 필드가 달라도 동작에는 문제가 없다(스케줄링 게이트가 아니라 순수 메타데이터).
      `why-a-short-letter`(behind)는 `what-is-saju.en.mdx`가 이미 쓰던 `RitualFlowDiagram`을
      재사용해 "짧은 4단 편지" 구조를 시각화했고, `zodiac-and-saju-feel`(explainer)은
      기존 `saju-vs-western-astrology`가 이미 다룬 "구조적 차이" 설명을 반복하지 않고
      "실제로 느껴지는 차이"(별자리=이미 아는 나를 확인하는 느낌, 사주=오늘 하루의 안부를
      묻는 느낌)라는 다른 각도로 써서 두 글을 상호 링크했다(`/compare` 링크도 함께).
      `npx tsc --noEmit`/`npm test`(35/35)/`npm run build`(6개 slug×4언어=24개 블로그
      정적 경로 생성 확인) 통과 + 로컬 dev 서버에서 `curl`로 두 글의 렌더링과 홈 "이번 주
      다인의 글" 배너가 최신 글(`zodiac-and-saju-feel`)을 가리키는 것까지 확인했다.
    - **블로그 콘텐츠 DB 저장 도입(2026-09-06, 같은 날 이어서, 사용자 요청: "블로그를 매번
      작성하여 배포해야 한다면, 자동화를 위해서라도 블로그를 데이터베이스를 이용하여 작성하도록
      변경해주세요. 이미지는 마케팅 사이트에 저장하는 방식으로 하여 읽어오는 식으로 변경")** —
      바로 위 "완전히 수동(편집) 프로세스" 항목이 드러낸 진짜 문제(글을 쓸 때마다 git 커밋+코드
      배포가 필요해, 매주 나가야 할 콘텐츠 케이던스가 배포 사이클에 묶여있다)에 대한 근본 대응.
      **세 가지를 사전에 확인받고 시작했다(AskUserQuestion, 전부 추천안 선택)**: (1) 이미지는
      런타임 업로드 저장 대신 **지금처럼 git에 커밋** — Cloud Run은 배포 간·인스턴스 간
      영속 파일시스템이 없어 "마케팅 사이트에 저장"이 "런타임에 올린 파일을 디스크에 쓴다"는
      뜻이 될 수 없다는 걸 먼저 설명했고(요청 문구의 "마케팅 사이트에 저장"은 사용자 확인 결과
      "지금처럼 git 커밋"을 가리킨 것으로 확정됐다 — 새 GCS 버킷 등 인프라 추가 없음). (2)
      본문 형식은 **`next-mdx-remote`로 MDX 유지**(다이어그램 컴포넌트 임베드 계속 가능) —
      DB 문자열을 마크다운/HTML로 낮추는 대신 런타임 MDX 컴파일러를 새로 들였다. (3) 발행
      경로는 **API/스크립트로만**(admin-panel에 전용 UI를 새로 만들지 않음).
      - **하이브리드 구조** — 기존 6개 정적 파일 글(`content-posts/*.mdx`, git 커밋)은 그대로
        두고, 새 글부터 DB(`saju-letter-backend`의 `MarketingSiteBlogPost` 모델, 마이그레이션
        `20260906090000_add_marketing_site_blog_posts`)로 발행할 수 있다. `posts.ts`의
        `getAllPostSummaries`가 두 소스를 `date` 기준으로 병합하고, 새 `getPostContent(lang, slug)`
        가 `isPostSlug(slug)`로 소스를 가른다 — 알려진 정적 slug는 파일에서(`{source:'file',
        Component}`), 그 외는 DB에서(`{source:'db', bodyMdx}`) 찾는다(두 소스가 같은 slug를
        가질 일은 없다고 가정 — 정적 slug는 `POST_SLUGS`에 코드로 등록된 것뿐이라 DB 발행 시점에
        겹치지 않게 고르면 된다). `blog/[slug]/page.tsx`가 `source`로 렌더 분기 — `'file'`은
        기존처럼 `<Component/>`를, `'db'`는 `next-mdx-remote/rsc`의 `<MDXRemote source={bodyMdx}
        components={blogMdxComponents}/>`를 쓴다. **`next-mdx-remote`는 소스 문자열을 런타임에
        컴파일하는 방식이라 `import` 구문을 지원하지 않는다**(`@next/mdx`의 빌드 시점 파일
        컴파일과의 핵심 차이) — 그래서 `BlogDiagrams.tsx`에 새 export `blogMdxComponents`
        (`RitualFlowDiagram`/`FixedVsChangingDiagram`/`NewYearTimelineDiagram`)를 두어 DB
        본문이 `import` 없이 `<RitualFlowDiagram .../>` 태그만 쓰고, 실제 구현은 렌더러가 이
        맵으로 주입한다 — 새 글을 DB로 발행할 땐 이 세 컴포넌트 이름만 태그로 쓸 수 있다.
      - **ISR로 전환 — SSG만으로는 코드 배포 없는 발행이 성립하지 않는다**: 블로그 목록/상세
        (그리고 "이번 주 다인의 글"을 보여주는 홈)는 원래 `generateStaticParams`로 빌드 시점에만
        생성되는 순수 정적 페이지였다 — `export const revalidate` 없이는 한 번 빌드된 페이지가
        무기한 캐시돼, DB에 새 글을 넣어도 다음 코드 배포 전까지 사이트에 절대 안 나타난다. 세
        페이지(`[lang]/page.tsx`, `[lang]/blog/page.tsx`, `[lang]/blog/[slug]/page.tsx`)
        전부에 `export const revalidate = 3600`(1시간)을 추가했다 — DB 저장 글(`generateStaticParams`
        목록에 없는 slug)은 Next.js의 기본 `dynamicParams: true`가 최초 요청 시점에 렌더해주고,
        이후 1시간 동안 캐시된다.
      - **`blogApi.ts`(신규) — 백엔드 실패를 `compatApi.ts`/`lunarNewYearApi.ts`보다 한 단계
        더 넓게 흡수한다**: 그 두 파일은 `ApiError`(HTTP 응답을 받았지만 실패)만 흡수하고 방문
        시점에만(동적 렌더) 호출되는데, 블로그 목록/상세는 `generateStaticParams` 밖의 슬롯이
        **정적 빌드 시점(`next build`)에도 호출될 수 있어**, `ApiError`가 아닌 네트워크 레벨
        예외(빌드 시점에 백엔드가 아직 안 떠 있을 때 나는 `fetch failed`/`ECONNREFUSED` 등)까지
        놓치면 블로그 글 하나 때문에 전체 사이트 빌드가 깨진다 — 실제로 로컬 `npm run build`
        중 이 문제를 직접 재현해 발견했다(첫 구현은 `ApiError`만 흡수했다가 크래시). 그래서
        `listDbBlogPosts`/`getDbBlogPost` 둘 다 `catch (error)`에서 종류를 가리지 않고
        `console.warn` 후 빈 배열/`null`로 흡수한다 — 정적 파일 글은 이 실패와 무관하게 계속
        보인다는 원칙은 그대로.
      - **`sitemap.ts`도 async로 전환 + slug별 실제 발행 언어만 alternates에 건다** — DB 글이
        언어별로 다른 조합(예: 특정 언어 번역이 아직 없음)으로 존재할 수 있어, 기존처럼
        `BLOG_LANGUAGES × POST_SLUGS` 전체 조합을 기계적으로 나열하는 방식이 더는 안 맞는다 —
        4개 언어 각각 `getAllPostSummaries`를 조회해 slug→실제 발행된 언어 집합을 구성한 뒤,
        그 slug가 실제로 있는 언어에만 `alternates.languages`를 건다(`x-default`는 그 집합에
        `en`이 있으면 `en`, 없으면 집합의 첫 언어로 폴백).
      - **admin-panel에는 이 콘텐츠 전용 UI가 없다**(사용자 결정) — 발행은
        `saju-letter-admin-backend`의 `POST /marketing-site/blog-posts`(관리자 세션 인증)를
        curl/스크립트로 직접 호출한다. 본문에 `import` 구문이 섞여 들어오면 컴파일 단계에서야
        모호하게 실패하는 대신 그 라우트가 발행 시점에 미리 400으로 막는다.
      - **테스트/검증** — `posts.ts`의 병합/분기 로직은 `blogApi.ts`를 목킹해 단위 테스트로
        검증했다(`posts.test.ts`) — 이 저장소의 vitest가 별도 설정 없이 Vite 기본값으로 돌아
        `@next/mdx` 웹팩 로더가 없다는 걸 이번에 발견했다(`content-posts/*.mdx`의 동적 import가
        테스트 환경에서 항상 실패 — `getPostModule`이 이를 이미 try/catch로 흡수해 null을
        반환하므로 테스트가 깨지진 않지만, 정적 파일 slug가 실제로 `{source:'file'}`을 반환하는
        것 자체는 이 환경에서 단위 테스트로 확인할 수 없다 — 이번 기능과 무관한 기존 갭이라 손대지
        않고 테스트 주석에 남겨뒀다). `npx tsc --noEmit`/`npm test`(40/40)/`npm run lint`(무관한
        기존 경고 2건 외 에러 없음)/`npm run build`(블로그 라우트가 `revalidate: 1h`로 표시되는
        것 확인) 전부 통과 — 로컬에 `saju-letter-backend`가 안 떠 있는 상태로 빌드해 위
        네트워크 실패 흡수 경로도 실제로 검증됐다.
  - **UI(Phase 5)** — 목록/상세는 `.letter-surface`. 공용 `BlogByline`(아바타+`dict.blog.byLabel`).
    선택적 카테고리 칩(`meta.category`). 홈 “이번 주 다인의 글”은 `getLatestPostSummary`로
    최신 `date`를 가리키며 **1차 출시 언어만**.
  - **`what-is-saju` en/ko 구조 차이(입문 시리즈 — 주간 칼럼과 분리)** — en(및 유사 es/ja)은
    사주 입문 → 네 기둥 → 사주편지가 그걸 어떻게 쓰는지. ko는 친숙 전제로 제품 프레이밍(매일 편지 vs
    긴 리포트)을 먼저. 주간 칼럼 백로그와 트랙을 섞지 않는다.
  - **"다인" 저자 바이라인(2026-08-25, Phase 5에서 `BlogByline`으로 공용화)** — 서비스 서사(일관된
    화자 페르소나, `saju-letter-backend`의 `content/persona.ts`와 meta 저장소 CLAUDE.md §9 확장 기능
    #13-6 참고)를 이 사이트에 처음 노출한 지점. `PostMeta`에 저자 필드를 두지 않고 UI 고정 문구
    (`dict.blog.byLabel`) — 저자가 하나뿐이라. 블로그 자체는 여전히 1차 출시 4개 언어에서만 열린다.
- `/[lang]/compare` (+`opengraph-image.tsx`) — 서양 별자리 12개 vs 사주 일간(10개, 별도 순환 축이라
  1:1 매칭표를 만들지 않는다) 정적 비교. 블로그와 같은 4개 언어만 대상.
  **Phase 4:** `CompareInfographic`(가로 한 줄) + `dict.compare.opening`/diagram* 키. 옛 `AstrologyInfographic` 삭제.
  - **콘텐츠·블로그 전면 보강(2026-08-25)** — "표 두 개뿐이라 별자리·사주 차이를 이해하기 얕고, 블로그도 이미지 없이 텍스트만 있어 빈약해 보인다"는 사용자 피드백에 대응. `/compare`에 정보량 차이·시주(출생시간)의 의미·"단정하지 않는다"는 철학 3개 섹션을 새로 추가했다 — 기존 별자리 날짜표·일간 목록은 "참고 자료" 절로 격을 낮춰 그 아래 유지. 블로그 3편(`what-is-saju`/`saju-vs-western-astrology`/`how-korean-new-year-works`)은 `AstrologyInfographic`(홈 화면 인포그래픽)과 같은 원칙(외부 이미지 없이 인라인 SVG/HTML)의 새 다이어그램 3종(`src/components/blog/BlogDiagrams.tsx`의 `RitualFlowDiagram`/`FixedVsChangingDiagram`/`NewYearTimelineDiagram`)을 각 글에 하나씩 삽입하고, 1차 출시 4개 언어(ko/en/ja/es) 전부 실제 내용도 늘렸다(패딩이 아니라 매일 편지 4단 구성, 고정값 vs 매일 변하는 조합, 설날/입춘 날짜 분리 같은 구체적 정보 추가). **언어별로 글의 구조 자체가 다르다는 걸 이번에 확인했다** — `what-is-saju`는 ko(이미 사주를 아는 독자에게 "사주편지의 활용법"을 설명)와 en/ja/es(사주 자체를 처음부터 설명)가 서로 다른 글이라, ko는 독자적으로 깊게 다듬고 en/ja/es는 그들끼리 공유하는 기존 구조를 유지한 채 확장했다 — 나머지 두 글은 4개 언어가 같은 구조라 그대로 병렬 확장했다. pt/vi 두 언어분 MDX 파일은 손대지 않았다(블로그 자체가 이 두 언어에서 아직 라우팅되지 않음, §2 참고) — 나중에 그 언어를 열 때 이 개선분도 함께 반영해야 한다.
    - **`NewYearTimelineDiagram` 레이아웃 버그 수정(같은 날, 실사용 확인 중 발견)** — 두 마커를 `position: absolute` + 음수 `translate-y`로 "선 위에 띄우는" 방식으로 짰는데, 부모가 그 실제 콘텐츠 높이(아이콘+2줄 라벨, 약 80px)를 전혀 확보해주지 않아 `how-korean-new-year-works` 글에서 마커가 바로 위 문단 위로 넘쳐 겹쳤다. 절대 위치 방식을 걷어내고 일반 flexbox 흐름(마커 두 개 + 사이의 `flex-1` 연결선)으로 구조 자체를 바꿨다 — 정상 흐름 안의 콘텐츠는 부모 밖으로 넘칠 수 없어 이 버그 클래스 자체가 원천적으로 사라진다.
    - **`/compare`와 홈 인포그래픽 중복 제거(2026-08-25)** — 당시 홈/`AstrologyInfographic` 중복을 피하려 compare에서 그래픽을 뺐다. **2026-08-26 Phase 4:** 홈에는 그래픽 없이, compare에만 재설계 `CompareInfographic`(가로 한 줄)을 둔다 — 옛 `AstrologyInfographic`은 삭제.
  - **새 블로그 글 "이 편지, 누가 쓰고 있을까요"(`who-writes-your-letter`, 2026-08-25)** — 다인 페르소나(`saju-letter-backend`의 `content/persona.ts`, 이 사이트 블로그 바이라인·모바일 앱 "다인 소개" 화면에 이미 노출됨)를 블로그 독자에게도 소개하는 글. 1차 출시 4개 언어(ko/en/ja/es) 전부 같은 구조로 작성했고(이 주제는 언어별 "사주 사전지식 차이" 프레이밍이 필요 없어 4개 언어가 같은 글), 바이라인과 같은 아바타 이미지(`public/dain-avatar.png`)를 본문에도 크게(160×160, 원형) 삽입했다.
  - **ko/ja 본문 문장 자연스럽게 다시 쓰기(2026-08-26, 사용자가 로컬 dev 서버(`localhost:3200/ko/blog/who-writes-your-letter`)에서 직접 읽어보고 "어색하다"고 지적)** — 4개 언어 전부 점검한 결과 en/es는 자연스러웠고 ko/ja만 같은 종류의 문제였다: (1) "목소리"/"声"를 한 편 안에 5~6번씩 반복해 써서 단조롭고 번역체처럼 읽혔다, (2) 배경 이야기를 이미 사실로 제시해놓고 바로 다음 문장에서 "오랫동안 공부해온 **듯한**"/"続けてきた**ような**"처럼 "~인 것 같은"을 붙여 스스로 방금 세운 설정을 애매하게 만들었다, (3) "용한 점쟁이의 신탁"처럼 한국 무속 개념(용한 점쟁이)과 서양식 개념(신탁/oracle)을 어색하게 섞어 쓴 표현이 있었다. 세 가지를 고치되 **필수 법적 고지 문장("다인은 가상의 인물로, 실제로 존재하는 사람이 아니다")은 문구만 다듬고 위치·의미는 그대로 유지**했다(바로 아래 항목의 법적 고지 요건과 충돌하지 않도록 — 이 문장 자체를 없애거나 뒤로 미루면 안 됨). 실제 로컬 dev 서버(hot reload)로 ko/ja 두 언어 모두 반영을 직접 확인했다.
  - **"가상 인물을 실존 인물처럼 서술해도 법적으로 괜찮은가" — 사용자 문제 제기로 고지 문구 추가(같은 날 이어서)** — 이 사이트가 이미 "마케팅 카피에서 AI 활용 사실을 공개하지 않는다"는 결정(§8 블로그 항목 참고)을 갖고 있어서, 그 위에 "오랫동안 회사원이었다가 사주를 공부한 사람"이라는 구체적 인간 전기를 실존 인물처럼 얹으면 "AI라는 걸 안 밝힌다"(누락)를 넘어 "실제로 없는 특정 인간의 개인사를 사실처럼 서술한다"(적극적 서술)가 된다는 우려였다(미국 FTC Section 5, EU 불공정거래관행지침/AI Act 투명성 조항, 한국 표시광고법 모두 거래에 중요한 사실을 오인시키는 표시를 금지). `who-writes-your-letter` 4개 언어 본문을 "다인은 ~한 사람입니다"(전기처럼 서술)에서 "다인은 가상의 캐릭터로, 실제로 존재하는 사람이 아니에요"라는 명시적 문장을 맨 앞에 두고, 이어지는 배경 서술도 "~라는 설정이에요"로 바꿔 전기가 아니라 캐릭터 설정임을 문장 구조로 드러냈다. **이 문구 자체도 다른 법적 고지(개인정보처리방침 등)와 같은 처지로, 법률 전문가 검토 전 상태다.**
    - **블로그 바이라인(`dict.blog.byLabel`)에도 처음엔 같은 "(가상 캐릭터)" 수식어를 넣었다가, 같은 날 다시 되돌렸다** — 사용자가 "그냥 '다인 씀'이라고만 해도 되지 않냐"고 재차 물어와 다시 검토한 결과, 실제 법적 위험은 "다인"이라는 이름을 쓰는 것 자체가 아니라 그 뒤에 붙는 **구체적인 가짜 전기를 사실처럼 서술하는 것**이라는 데 동의했다 — 필명(pen name)으로 글을 쓰는 건 신문 칼럼의 고정 필명처럼 흔하고 합법적인 관행이라, 매 글마다 "이건 필명입니다"를 밝힐 필요는 없다. 위험이 실제로 있는 지점(전기적 서술)에는 이미 위 항목대로 명시적 고지를 뒀으므로, 바이라인 자체는 "다인 씀"/"Written by Dain" 등 원래 문구로 되돌렸다.
- **SEO 전면 보강(2026-08-25)** — 사용자가 "SEO 최적화가 되어 있냐"고 물어와 감사한 결과, 페이지별 title/description·`sitemap.xml`·`robots.txt`·SSG는 이미 돼 있었지만 다국어 사이트로서 필요한 핵심 요소(hreflang·canonical·블로그 목록 자체 메타데이터·구조화 데이터·noindex)가 빠져 있는 걸 확인해 전부 구현했다.
  - **새 공용 헬퍼** — `src/lib/seo.ts`(`WEB_BASE_URL`, `languageAlternates()` — 페이지마다 다른 지원 언어 집합에 맞춰 hreflang 레코드를 만들고 `x-default`는 항상 `DEFAULT_LANGUAGE`(en)를 가리킨다, `NOINDEX_ROBOTS`, `buildSocialMetadata()` — openGraph/twitter를 항상 같은 값으로 나란히 채우는 헬퍼, Next.js가 `twitter` 필드를 생략하면 twitter:* 태그 자체를 안 만든다), `src/lib/structuredData.ts`(`organizationJsonLd()`, `articleJsonLd()`).
  - **hreflang(`alternates.languages`) + canonical** — 지원 언어 집합이 페이지마다 다른(홈/개인정보처리방침 6개, 블로그/compare 4개, 신년운세 5개) 모든 정적 페이지의 `generateMetadata`에 추가했다(홈/블로그 목록/블로그 글/compare/개인정보처리방침/궁합 공유/신년운세 홈).
  - **블로그 목록(`/[lang]/blog`)에 `generateMetadata` 신설** — 원래 자체 메타데이터가 없어 레이아웃의 홈페이지 title/description을 그대로 물려받아 검색결과에서 홈과 제목이 중복되고 있었다. `dict.blog.title`/`subtitle`로 고유 메타데이터를 채웠다.
  - **`/[lang]/lunar-new-year`(신년운세 랜딩)에 `generateMetadata` 신설** — 이 라우트는 메타데이터 자체가 아예 없었다(레이아웃 기본값만 상속).
  - **noindex(`robots: {index:false, follow:true}`)** — 검색결과에 노출될 이유가 없는 개인화/트랜잭션 페이지 4곳(`compat/[token]` 궁합 결과, `lunar-new-year/r/[id]` 신년운세 결과, `unsubscribe`, `lunar-new-year/unsubscribe`)에 적용. robots.txt에서 Disallow하지 않고 메타 태그로만 막았다 — Disallow하면 크롤러가 페이지를 아예 못 읽어 noindex 지시 자체를 못 보고, 이미 색인된 URL이 영영 안 빠질 위험이 있다.
  - **Twitter Card** — openGraph를 쓰는 모든 페이지에 `buildSocialMetadata()`로 나란히 추가(이전엔 compare/compat 2곳만 openGraph가 있었고 twitter는 어디에도 없었다).
  - **JSON-LD 구조화 데이터** — `[lang]/layout.tsx`에 Organization 스키마(모든 페이지 공통, `<body>` 안에 `<script type="application/ld+json">`로 렌더 — Next.js 공식 예제와 같은 패턴, `<head>` 밖이어도 크롤러가 인식한다), 블로그 글에 Article 스키마. **Article의 `publisher`는 다인(Dain) 캐릭터가 아니라 브랜드(Organization)로 표기했다** — 가상 인물을 machine-readable `Person` 스키마로 실존 인물처럼 마크업하면, 위에서 이미 내린 "가상 인물의 구체적 전기를 사실처럼 서술하지 않는다"는 판단과 같은 위험을 구조화 데이터에서 새로 만드는 셈이라 의도적으로 피했다.
  - **기본 OG 이미지 신설(`[lang]/opengraph-image.tsx`)** — compare/compat/신년운세 결과 페이지는 이미 전용 동적 카드가 있었지만 홈/블로그/개인정보처리방침/신년운세 랜딩은 OG 이미지 자체가 없었다. `[lang]` 세그먼트에 브랜드 카드(`dict.brand`+`dict.hero.title`)를 새로 만들어 홈이 자동으로 쓰고, 다른 세그먼트(Next.js는 이 파일 규약을 하위 세그먼트로 자동 상속하지 않는다)는 `openGraph.images: ['${WEB_BASE_URL}/${lang}/opengraph-image']`로 그 URL을 직접 참조해 재사용한다.
  - **`metadataBase`** — `[lang]/layout.tsx`(이 사이트의 실질적 루트 레이아웃)에 `new URL(WEB_BASE_URL)`로 설정, 상대경로 OG 이미지 URL 오해석 방지.
  - **sitemap.xml에도 `alternates.languages` 추가** — Next.js `MetadataRoute.Sitemap`이 URL 엔트리별 hreflang을 지원해, 페이지 태그와 별개로 사이트맵 레벨에서도 언어 간 관계를 명시했다(구글이 권장하는 이중 신호).
  - **의도적으로 범위 밖에 둔 것**: `/compat/[token]`/`lunar-new-year/r/[id]`에는 hreflang을 넣었지만(같은 토큰/id가 모든 언어에서 열리므로), 전용 동적 OG 카드를 블로그 글마다 만들지는 않았다(브랜드 기본 카드로 충분하다는 판단, 콘텐츠 제작 비용 대비 이득이 낮음).
  - **검증**: 타입체크/린트/테스트(신규 `src/lib/seo.test.ts` 2건 포함 17/17) 전부 통과, 프로덕션 빌드 성공. `npm run start`로 띄운 로컬 프로덕션 서버에서 홈/블로그 목록/블로그 글/신년운세/unsubscribe 각각의 실제 렌더링된 HTML을 `curl`로 직접 확인해 hreflang·canonical·JSON-LD·noindex·OG/twitter 태그가 전부 의도대로 나오는 것을 확인했다.
- **안드로이드/iOS 스토어 다운로드 배지 — "준비 중" 상태 신설(2026-08-25)** — 사용자가 "안드로이드/아이폰 앱 준비중이라는 것과, 추후 스토어에 올라가면 링크로 다운받을 수 있도록 하는 것도 필요할 것 같다"고 제안했다. 조사해보니 `NEXT_PUBLIC_GOOGLE_PLAY_URL`(패키지명 `com.sajuletter.app` 기준, meta 저장소 CLAUDE.md §11)이 이미 있어 데모 결과·궁합 결과 화면 CTA가 그 URL로 곧바로 링크되고 있었는데, 앱이 아직 어느 스토어에도 실제로 게시되지 않은 상태(Play Console 배포 트랙 미완료)라 그 버튼을 누르면 "존재하지 않는 항목" 페이지로 연결될 위험이 있었다 — 게다가 iOS 링크는 아예 없었다(`footer.googlePlayCta` dictionary 키도 존재만 하고 실제로는 어디에도 렌더링되지 않는 죽은 코드였다).
  - **URL과 "실제 다운로드 가능 여부"를 분리** — `src/lib/appLinks.ts`가 `NEXT_PUBLIC_GOOGLE_PLAY_URL`/`NEXT_PUBLIC_APP_STORE_URL`(스토어 URL, 패키지명/번들ID가 정해지면 미리 채워둘 수 있음)과 `NEXT_PUBLIC_ANDROID_APP_LIVE`/`NEXT_PUBLIC_IOS_APP_LIVE`(실제로 심사를 통과해 공개된 시점에만 `"true"`로 바꾸는 명시적 플래그)를 별도로 둔다 — URL이 있어도 LIVE가 꺼져 있으면 링크를 렌더링하지 않는다. 안드로이드 우선 출시 방침(meta CLAUDE.md §2)대로 두 플랫폼이 서로 다른 시점에 켜질 수 있도록 독립 플래그로 설계했다. 값 자체는 스토어 심사 통과라는 일회성 이벤트에만 바뀌므로 관리자 패널 런타임 토글이 아니라 배포 시 환경변수로 관리한다(마케팅 쿠폰 캡 등 자주 조정하는 값과는 성격이 다르다는 판단).
  - **공용 컴포넌트 `components/AppDownloadLinks.tsx`** — 안드로이드/iOS 배지를 나란히 렌더한다. LIVE면 실제 스토어 링크(클릭 이벤트 콜백 지원), 아니면 점선 테두리의 "OO에서 다운로드 · 출시 준비 중" 배지로 표시한다(비활성 링크가 아니라 애초에 `<a>` 자체를 렌더하지 않는 `<span>`이라 클릭해도 아무 일도 없음이 명확하다). 순수 프레젠테이션 컴포넌트라 서버 컴포넌트(레이아웃 footer)·클라이언트 컴포넌트(DemoForm/CompatView) 어디서든 그대로 재사용된다. `emphasized` prop으로 전환 지점(무료 미리보기 결과, 궁합 결과)에서는 기존 accent 버튼 스타일을, footer에서는 옅은 아웃라인 pill 스타일을 쓴다.
  - **3곳에 적용** — (1) `[lang]/layout.tsx` footer에 "앱 다운로드" 섹션 라벨과 함께 신설(죽은 `footer.googlePlayCta` 키를 대체) — 전 페이지 공통 노출. (2) `DemoForm.tsx`의 무료 미리보기 결과 화면 — 기존 단일 "Get it on Google Play" 버튼을 이 컴포넌트로 교체. (3) `CompatView.tsx`의 궁합 결과 화면 — 마찬가지로 교체하되, 기존 `install_cta_clicked` 궁합 이벤트 로깅(`logCompatEvent`)은 두 배지 어느 쪽을 눌러도 동일하게 발생하도록 유지했다(백엔드 이벤트 타입/인자 변경 없음).
  - dictionary에 새 최상위 섹션 `appLinks`(androidCta/iosCta/comingSoon) 추가, 6개 언어 전부 채움 — footer/DemoForm/CompatView가 공유하므로 각 콘텐츠 타입 안에 중복 정의하지 않고 별도 섹션으로 분리했다.
  - **검증**: 타입체크/린트/테스트/프로덕션 빌드 전부 통과. 두 LIVE 플래그를 배포에 설정하지 않은(=현재 실제 상태와 같은) 채로 로컬 프로덕션 서버를 띄워 footer가 안드로이드/iOS 둘 다 "출시 준비 중" 배지로 정확히 렌더되는 것을 `curl`로 확인했다. 배포(`saju-letter-marketing-site-00014-ht8`) 후 운영 도메인에서도 동일하게 재확인 — 이때 새로 쓰는 3개 build-env-var(`NEXT_PUBLIC_APP_STORE_URL`/`NEXT_PUBLIC_ANDROID_APP_LIVE`/`NEXT_PUBLIC_IOS_APP_LIVE`)가 이전엔 Cloud Run 서비스의 `run.googleapis.com/build-environment-variables` 어노테이션에 전혀 없었다는 걸 확인해(이 값은 `--source` 배포마다 매번 재지정하지 않아도 서비스에 남아있다) `--update-build-env-vars`로 명시적으로 추가했다(둘 다 `false`/빈 문자열 — 미설정 상태와 동작은 같지만 다음 배포자가 존재를 바로 알 수 있게 명시했다).
  - **푸터만으로는 첫 화면에서 안 보인다는 사용자 피드백(같은 날 이어서)** — "푸터에 있으면 초기화면에서 전혀 보이지 않는다"는 지적으로, 홈 히어로(스크롤 없이 보이는 영역, "무료로 체험하기" 버튼 바로 아래)에도 같은 `AppDownloadLinks`를 추가했다. 두 곳에서 재사용하기 위해 `footer.appSectionLabel`이었던 라벨 필드를 `appLinks.sectionLabel`로 옮겼다(footer 전용이 아니게 됐으므로) — 6개 언어 전부 이동, 값 자체는 변경 없음.
  - **푸터 배지는 완전히 제거(같은 날 이어서)** — 사용자가 "푸터에 있는 것은 삭제해도 되지 않을까요"라고 재차 물어와, 히어로(홈 전용)와 footer(전 페이지 공통) 중 어느 범위로 지울지 확인한 뒤(`AskUserQuestion`) "전 페이지 푸터에서 완전히 제거"를 선택받았다 — `[lang]/layout.tsx`의 footer에서 `AppDownloadLinks` 렌더와 import를 제거했다. 그 결과 **앱 다운로드 배지는 이제 홈 히어로와 두 전환 지점(무료 미리보기 결과·궁합 결과) 3곳에만 남고, 블로그/compare/개인정보처리방침 등 나머지 페이지에는 다운로드 안내가 없다** — 사용자가 이 트레이드오프를 명시적으로 확인한 선택이다. `dict.appLinks`(sectionLabel 포함) 자체는 이 세 곳이 여전히 쓰므로 dictionary에서는 손대지 않았다.
- `/[lang]/privacy` — 개인정보처리방침(2026-08-12, `saju-letter-backend`의 `public/privacy.html`에서 이관, `src/content/privacyPolicy.ts`). 블로그/compare와 다르게 `LAUNCH_CONTENT_LANGUAGES`가 아니라 `MARKETING_LANGUAGES` 6개 전부 대상 — 법적 고지 문서라 1차 출시 언어 축과 무관해야 한다. 이관 이유: `www.saju-letter.com` 커스텀 도메인이 이 사이트에 연결되면서(§9 "왜 Next.js인가" 인접 GCP 배포 내역, `docs/setup-guide.md` 참고) 백엔드가 서빙하던 옛 `saju-letter.com/privacy`가 더 이상 그 도메인으로는 응답하지 못하게 됐는데, 이 사실이 문서에 반영되지 않아 Play Console에 "준비 완료"로 잘못 기록돼 있던 것을 발견해 바로잡았다. 콘텐츠는 문구 변경 없이 그대로 옮겼다(⚠️ 법률 전문가 검토 전 AI 초안 — `privacyPolicy.ts` 상단 주석 참고). `saju-letter-mobile`은 `src/constants/links.ts`의 `buildPrivacyPolicyUrl(language)`로 앱의 현재 언어에 맞는 링크를 설정 화면에서 연다. **§4(제3자 제공) AI 콘텐츠 생성 제공업체 항목이 마케팅 사이트의 홈 미니 데모·신년운세를 빠뜨리고 있었다(2026-08-21 발견·수정)** — §1은 2026-08-20 개정 때 이미 이 두 기능의 "계산된 사주 정보" 수집을 언급했지만, §4는 여전히 "편지 및 오늘의 이야기 답장"만 AI 제공업체로 전달된다고 좁게 서술돼 있었다. 둘 다 "제출 시 즉시 결과 표시" 요구사항 때문에 배치가 아닌 동기 AI 호출을 쓰므로(계산된 사주값이 매 요청마다 실제로 AI 제공업체 프롬프트에 들어감) 6개 언어 전부 §4에 포함시켰다 — 궁합 공유(초대 링크)는 사전 배치 캐시에서 고르는 구조라 게스트 제출 시점에 개인 데이터가 AI로 가지 않아 의도적으로 제외했다. 상세는 `privacyPolicy.ts` 상단 2026-08-21 개정 주석 참고.
  - **Google Analytics for Firebase + Cloudflare Turnstile 미고지 발견·수정(2026-09-02)** — "개인정보처리방침을 최종적으로 다시 한 번 체크해달라"는 사용자 요청으로 전체 재검토하다가, 2026-08-29 재감사("AI 페일오버 충돌 여부"로 범위가 좁았음)에서조차 놓친 진짜 불일치 2건을 발견했다. 둘 다 지난 재감사보다 먼저 도입됐다 — (1) `saju-letter-mobile`의 Google Analytics for Firebase(GA4, `src/services/analytics.ts`, 2026-08-17 도입 — 프로덕션 빌드에서만 수집 켜고 가입 완료 `sign_up` 이벤트를 로그인 수단과 함께 로깅), (2) `saju-letter-marketing-site`의 Cloudflare Turnstile(`src/components/Turnstile.tsx`, 2026-08-21 도입 — 홈 미니 데모·궁합 공유 게스트 제출·리드 캡처·신년운세 리딩/이메일 구독 5개 공개 폼에서 봇 방지용으로 구동, 위젯이 Cloudflare 도메인에서 직접 로드돼 방문자 브라우저가 곧바로 Cloudflare로 신호를 보내는 구조). 둘 다 §1(자동 수집 정보)·§2(이용 목적)·§4(제3자 제공)에 6개 언어 전부 반영했다 — Firebase(Google) 항목은 기존 "회원 인증, 푸시 알림 발송"에 "앱 이용 현황 분석" 목적을 추가했고, Cloudflare Turnstile은 새 항목으로 추가했다. effectiveDate/§10 "최종 수정"도 2026년 9월 2일로 갱신. 같은 재검토에서 함께 확인했지만 문제없다고 판단해 손대지 않은 것: `saju-letter-backend`의 `AiGenerationAttempt` 로그 테이블(2026-08-31, 유저 원문 아닌 사전 정의 진단 문구만 저장 — 기존 "오류·크래시 진단 정보" 범주에 이미 포함), Google Sign-In 라이브러리 교체(2026-09-01, 수집 데이터 종류 변화 없음), `deepCompatibility`의 `personAIsSelf` 자동 채움(2026-09-01, 이미 저장된 파생값만 재사용). 타입체크/테스트/프로덕션 빌드 통과 + 로컬 dev 서버에서 `curl`로 ko/en `/privacy` 페이지의 새 문구(effectiveDate, §1/§2/§4)가 실제로 렌더링되는 것 확인. 상세는 `privacyPolicy.ts` 상단 2026-09-02 개정 주석 참고.
- `/[lang]/disclaimer` — 서비스 이용 안내(오락 목적 고지, 2026-09-02, `src/content/disclaimer.ts`).
  사용자가 "마케팅 사이트에도 앱과 동일하게 표시해야 하지 않냐"고 지적해 신설했다 — 개인정보처리방침은
  이미 이관돼 있었는데 이 고지는 사이트 어디에도 없었다(footer에 개인정보처리방침 링크 하나뿐).
  `saju-letter-mobile`의 `disclaimer.{title,short,body}`(`src/i18n/locales/*.json`) 6개 언어
  문구를 새로 번역하지 않고 그대로 포팅했다 — 같은 서비스의 오락 목적 고지가 앱과 사이트에서
  다른 문구면 오히려 혼란을 준다. `/[lang]/privacy`와 같은 이유로 `LAUNCH_CONTENT_LANGUAGES`가
  아니라 `MARKETING_LANGUAGES` 6개 전부 대상(`generateStaticParams`/`sitemap.ts` 모두 동일 패턴).
  footer에 `dict.footer.disclaimerLinkLabel` 링크를 개인정보처리방침 옆에 추가했다.
  **로그인 없이 실제로 AI 리딩을 즉시 받는 세 곳**(홈 미니 데모 `DemoForm.tsx`, 궁합 공유 결과
  `CompatView.tsx`의 `CompletedResult`, 신년운세 결과 `lunar-new-year/r/[id]/page.tsx`)에는
  앱이 온보딩·저널 작성 전에 `disclaimer.short`를 먼저 보여주는 것과 같은 안전장치가 전혀 없었다
  — 이 세 곳에 `DISCLAIMER_CONTENT[language].short`를 결과 바로 아래 옅은 텍스트로 추가했다(각
  페이지의 dictionary/content에 문구를 중복 정의하지 않고 `content/disclaimer.ts` 하나를 공유
  출처로 삼는다). `disclaimer.short`가 `body`보다 적은 항목(투자 조언 미언급)을 나열하는 앱 쪽
  기존 불일치는 포팅 시점에도 그대로 남아있다(meta 저장소 CLAUDE.md 참고, 축약 과정의 자연스러운
  생략으로 판단해 앱에서도 손대지 않은 것과 같은 이유). 타입체크/테스트/프로덕션 빌드 통과 확인 +
  로컬 dev 서버(`localhost:3200`)에서 `curl`로 `/ko/disclaimer`(제목·4개 문단·footer 링크)와
  `/en/disclaimer` 실제 렌더링을 직접 확인했다.
- `/[lang]/compat/[token]` (+`opengraph-image.tsx`) — 궁합 공유 웹페이지(2026-08-12, `saju-letter-backend`의 `public/compat.html`에서 이관, `src/content/compatContent.ts`/`src/lib/compatApi.ts`/`src/components/compat/CompatView.tsx`). privacy와 같은 이유로 `MARKETING_LANGUAGES` 6개 전부 대상(`generateStaticParams` 없음 — 토큰은 런타임 생성이라 `lunar-new-year/r/[id]`처럼 완전 동적 라우트). 공유 URL 자체(`saju-letter-mobile`의 `buildCompatibilityShareUrl`)는 언어 세그먼트가 없다 — `middleware.ts`의 기존 자동감지 리다이렉트가 옛 compat.js의 브라우저 언어 감지 UX를 코드 추가 없이 재현해준다. 백엔드의 `compatibilityPublicRouter`(초대 조회/제출/이벤트)는 그대로 두고 이 사이트가 `marketingSiteCors`로 cross-origin 호출한다.
  - **Phase 6 — 설치 CTA = 편지 약속, 게스트 페이지에 다인 없음(2026-08-26)** — 결과 화면 설치 CTA는
    편지 약속 문구를 유지하고, 게스트 첫 접점에 다인 초상·서사를 올리지 않는다(의도적). submit/OG
    카피는 reading→result 계열로 부드럽게만 다듬는다.
  - **친구 쪽 폼이 억부 엔진용 연주/월주/일지까지 함께 전송(2026-08-16, `saju-letter-backend`가 진행한 "궁합 공유를 억부 엔진에 연동" 3단계 — 상세는 meta 저장소 `CLAUDE.md` §9 참고)** — 화면/입력 필드는 무수정이다. `CompatView.tsx`의 `handleSubmit`이 `calculateSaju()`가 애초에 계산해두고 버리던 `chart.yearPillar`/`chart.monthPillar`/`chart.dayPillar.branch`를 마저 꺼내 `submitGuestInvite` 요청에 함께 싣도록만 바뀌었다(`compatApi.ts`의 `SubmitGuestInviteInput`에 `yearStem`/`yearBranch`/`monthStem`/`monthBranch`/`dayBranch` 5개 optional 필드 추가) — 새 계산 로직이나 새 입력 필드는 전혀 없다.
  - **"Functions cannot be passed directly to Client Components" 런타임 크래시 — 수정(2026-09-02, 사용자 리포트: 궁합 링크 접속 시 500)** — `page.tsx`(서버 컴포넌트)가 `COMPAT_CONTENT[lang]`(함수 필드 `pairLine`/`og.completed.titleFor`를 포함하는 `CompatContent` 객체, `content/compatContent.ts`)를 통째로 `content` prop으로 `<CompatView>`(`'use client'`)에 넘기고 있었다 — React RSC 경계는 함수를 prop으로 못 건너가므로, 초대 상태(`pending`/`completed`)와 무관하게 이 페이지를 열 때마다 항상 크래시했다(사용자가 우연히 처음 발견했을 뿐 사실상 상시 재현 버그였다). **`generateMetadata`는 무영향** — 거기선 이 함수들을 서버에서 직접 호출해 문자열 결과만 반환하므로 애초에 prop으로 넘어가지 않는다. **수정**: `content`를 prop으로 넘기지 않고, `CompatView.tsx`가 이미 받고 있던 `language`(순수 문자열, 직렬화 가능)로 `COMPAT_CONTENT`를 직접 import해 그 자리에서 조회하도록 바꿨다 — `page.tsx`도 `<CompatView>` 호출에서 `content` prop을 제거했다(`generateMetadata`용 조회는 그대로 유지). 실행 중이던 로컬 dev 서버에 문제의 정확한 URL로 직접 요청해 200 응답 + 정상 렌더를 확인했다.
  - **"OOO님과의 궁합"이 방금 자기가 입력한 이름을 그대로 보여주던 버그 — 수정(2026-09-02, 사용자 리포트: "마케팅 사이트에서 입력한 이름이 출력된다 — 원래는 링크를 보낸 사람의 이름이 표시되어야 하는 것이 맞다")** — 이 사이트는 항상 게스트(링크를 받은 친구)만 이 화면을 보므로, 상단 "OOO님과의 궁합"은 항상 링크를 보낸 회원의 이름이어야 하는데 백엔드가 내려주던 `guestName`(친구 본인이 이 화면에 방금 입력한 이름)을 그대로 쓰고 있었다 — 100% 재현되는 버그였다(saju-letter-backend가 새로 추가한 `requesterName` 필드로 해결, 상세는 그쪽 CLAUDE.md 참고). `InviteView`/`SubmitGuestInviteResult` 타입에 `requesterName` 추가, `CompatView.tsx`의 `CompletedResult`가 `guestName` 대신 `requesterName`을 `content.pairLine()`에 넘기도록 prop을 통째로 교체했다. **같은 파라미터를 쓰던 OG 태그(`generateMetadata`/`opengraph-image.tsx`의 `content.og.completed.titleFor`)도 같은 이유로 함께 고쳤다** — 카카오톡/트위터 미리보기 제목도 똑같이 게스트 자신의 이름을 보여주고 있었다. **"null이면 'you'로 폴백"하던 6개 언어 `pairLine` 문구도 함께 고쳤다** — 파라미터의 의미가 "당신(게스트)"에서 "발신자"로 바뀌면서, 이름이 없을 때의 기본값도 "compatibility with you"(자기 자신을 가리킴, 완전히 틀림)에서 "compatibility with a friend"(중립적인 3인칭) 계열로 en/es/pt/vi 4개 언어를 고쳤다 — ko/ja는 원래도 "친구"/"友達"처럼 방향에 무관한 중립 표현이라 무수정. 타입체크/테스트(20/20)/프로덕션 빌드 전부 통과.
  - **이름 텍스트에 붉은 계열 강조색을 쓰고 있던 문제 — 수정(같은 날 이어서, 사용자 지적: "한국적 정서에서는 이름에 붉은 색을 사용하는 것은 금기입니다")** — 위 수정으로 이 줄이 정확한 사람 이름(`requesterName`)을 보여주게 됐는데, 그 텍스트 전체가 사이트 전역 강조색 `text-accent-warm`(`#b5652f`, 붉은 기가 도는 러스트/테라코타 톤)으로 스타일돼 있었다. 이 색 자체는 링크·섹션 라벨 등 사이트 전반에 쓰는 브랜드 강조색이라(`accent-warm`을 쓰는 다른 12곳은 전부 고정 문구/버튼이라 실제 사람 이름을 담지 않는다, 전수 확인) 사이트 전체 팔레트를 바꾸지 않고, **실제 사람 이름을 담는 이 한 줄만** 본문과 같은 중립색(`text-foreground/70`)으로 바꿨다. 실행 중이던 로컬 dev 서버에서 실제 렌더된 HTML의 클래스가 바뀐 것까지 확인. 타입체크/테스트(20/20)/프로덕션 빌드 재확인.
- **실제 앱 아이콘으로 교체(2026-09-02, 사용자 요청: "마켓팅 사이즈의 사주편지 로고의 아이콘을 현재 아이콘으로 변경해주세요")** — 헤더 로고(`public/logo-icon.png`, `[lang]/layout.tsx`)·브라우저 파비콘(`src/app/icon.png`, Next.js 파일 기반 컨벤션)·애플 터치 아이콘(`src/app/apple-icon.png`) 3개 파일이 전부 동일한 AI 생성 플레이스홀더(하트+반짝임이 그려진 봉투, 1024×1024)였다 — 셋 다 바이트까지 완전히 같은 파일이라 한 곳에서 복붙된 것으로 보인다. 메타 저장소 루트에 사용자가 미리 준비해둔 실제 앱 아이콘 세트(`app_icons/`, 안드로이드/iOS 각 사이즈별)가 있었고, 그중 가장 고해상도·무손실(iOS App Store 스펙, 마스크/패딩 없는 원본)인 `ios_appstore_1024.png`(수채화 톤의 봉투+밀랍 인장 일러스트, 사이트의 `accent-warm` 러스트 톤과 어울림)를 세 파일에 그대로 복사해 넣었다 — 셋 다 원래도 같은 1024×1024 크기였어서 별도 리사이즈 없이 드롭인 교체됐다. `structuredData.ts`의 JSON-LD `Organization.logo`도 같은 `logo-icon.png`를 참조해 함께 갱신된다(코드 변경 없음, 파일 교체만). OG 이미지 생성기(`opengraph-image.tsx`, 궁합/신년운세/compare 각각)는 이 파일을 참조하지 않는 별도의 코드로 그린 그래픽이라 이번 교체 범위 밖이다. 모바일 앱 아이콘(`saju-letter-mobile`)은 EAS 빌드가 필요한 별도 작업이라 이번엔 손대지 않았다. 타입체크/테스트(20/20)/프로덕션 빌드 통과.
- **리드 캡처("다인의 짧은 소개 편지 받기 — 30일 체험 포함") 홈 화면에서 임시 비노출(2026-09-02, 사용자 요청: "현재 쿠폰과 코드와 관련해서 개념을 새롭게 만들어가려고 합니다. 때문에... 잠시동안 화면에 표시하지 않도록 처리해주세요")** — 30일 체험 쿠폰 개념 자체를 재검토 중이라는 이유로, 이 문구를 노출하는 유일한 지점인 `[lang]/page.tsx` 홈 화면의 `<LeadCaptureForm>` 렌더링(import 포함)을 주석 처리했다 — 컴포넌트(`LeadCaptureForm.tsx`)와 6개 언어 문구(`dict.leadCapture`)는 전부 그대로 남겨뒀다(코드/문구 삭제가 아니라 노출만 멈춤 — 재개할 때 주석만 걷어내면 원상복구). 리드 캡처를 렌더링하는 곳이 이 홈 화면 한 곳뿐임을 전체 검색으로 확인했다(신년운세 캠페인의 `EmailSignupForm.tsx`는 이름만 비슷한 완전히 별개 컴포넌트라 무관). 타입체크/테스트(20/20)/프로덕션 빌드 통과(미사용 import 경고 없음).
- `/.well-known/assetlinks.json`(Route Handler, 2026-08-12) — Android App Links 검증 파일. 궁합 공유 도메인이 여기로 옮겨오면서 검증 대상도 이 도메인이 됐다(`saju-letter-backend`에도 같은 파일이 남아있지만 무해함). **SHA-256 지문 검증 완료(2026-09-03, 외부 보안 리뷰로 재점검)** — 파일 안 값이 "실 배포 전 자리표시자"라고 오래 써 있던 걸 발견해, `google-services.json`(SHA-1만 보유)으로는 직접 대조가 불가능함을 확인한 뒤 사용자에게 Play Console(설정 → 앱 무결성 → 앱 서명)에서 실제 지문을 직접 조회해달라고 요청했다 — 받은 값이 파일에 이미 있던 지문과 정확히 일치함을 확인해 두 파일(이 저장소 + `saju-letter-backend`)의 주석을 갱신했다. **실기기 Digital Asset Links 검증(`adb shell pm verify-app-links` 또는 실제 링크 탭)은 여전히 미확인** — 지문 일치는 필요조건이지 충분조건은 아니다.
- `/[lang]/unsubscribe` — 드립 수신거부 처리.
- `/[lang]/lunar-new-year` (+`r/[id]`, +`r/[id]/opengraph-image.tsx`, +`unsubscribe`) — 신년운세
  캠페인 이관분(2026-08-07, `saju-letter-newyear-campaign`에서 옮겨옴). ko는 원래 그 캠페인이
  지원하지 않던 언어라 그대로 제외한다(`generateStaticParams`가 `NON_KOREAN_LANGUAGES` 5개만
  대상). 계산/사전 콘텐츠는 이 사이트가 이미 가진 `src/lib/saju.ts`/`sajuVocabulary.ts`를 그대로
  재사용하고, 언어 감지는 `[lang]` URL 세그먼트로 흡수돼 옛 저장소의 `lib/language.ts`(브라우저
  감지+localStorage)는 이관하지 않았다. 백엔드(`/newyear-campaign/*`)는 무변경 — 유일한 백엔드
  코드 변경은 드립 이메일 수신거부 링크가 언어 프리픽스를 갖도록 `dripService.ts` 한 줄을 고친
  것뿐이다(`saju-letter-backend/CLAUDE.md` §7 참고).
  - **Phase 6 — Fortune 톤 유지 + soft connect만(2026-08-26)** — 캠페인 전체를 다인 편지함으로
    재포장하지 않는다. 랜딩은 Fortune/reading 톤을 유지하고, 결과·오프시즌만 아침 편지/다인으로
    부드럽게 연결한다(`offSeason.cta` + `AppDownloadLinks`, 결과 `appBridgeTitle`/`Body` +
    `AppDownloadLinks`). 캠페인 페이지에 다인 초상은 두지 않는다.

## 8-1. Google Analytics 4 — 마케팅 사이트 웹 스트림(2026-09-07 도입)

"제로 예산 그로스 전략" 문서(claude.ai 아티팩트, 사주편지 성장 원장)의 §2/§6(커뮤니티·PR 채널)
효과를 실측하려면 이 사이트 자체의 유입 소스도 잡아야 한다는 논의에서 시작했다. `saju-letter-mobile`의
Firebase Analytics(GA4 for Firebase, §12 — 이 문서에는 없고 mobile 저장소 CLAUDE.md 참고)와
**같은 GA4 프로퍼티(`saju-letter-20575`)에 별도 "웹" 데이터 스트림**으로 연결해, BigQuery export
(이미 연동된 `analytics_547122318` 데이터셋) 한 곳에서 앱/웹 이벤트를 함께 조회할 수 있게 했다.

- **Firebase JS SDK 대신 gtag.js를 직접 쓴다** — 이 사이트는 Firebase Auth/Firestore 등 다른
  Firebase 서비스를 쓰지 않아, 분석만을 위해 `firebase` 패키지 전체를 새 의존성으로 추가할 이유가
  없다(`src/lib/analytics.ts`의 `trackEvent()` + `src/components/GoogleAnalytics.tsx`의 `<Script>`
  두 개로 동일한 결과). `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 없으면(로컬 개발 기본값) 스크립트 자체를
  렌더링하지 않는다 — Turnstile의 "사이트 키 없으면 위젯을 안 그린다" fail-open과 같은 원칙.
- **`AppDownloadLinks.tsx`를 이번에 `'use client'`로 전환했다** — 홈 히어로/신년운세 결과·오프시즌
  화면은 서버 컴포넌트에서 렌더되는데, 서버 컴포넌트는 자기 JSX에 함수(이벤트 핸들러)를 직접 담을
  수 없다(`compat/[token]` 페이지가 이미 겪은 "Functions cannot be passed directly to Client
  Components" 크래시와 같은 RSC 경계 제약). 이 배지 자체를 클라이언트 컴포넌트로 만들면(순수
  프레젠테이션이라 훅은 여전히 안 씀) 어느 부모가 렌더하든 안전하게 클릭을 잡을 수 있다. 새 `context`
  prop(`'home_hero'` / `'demo_result'` / `'compat_result'` / `'newyear_result'` /
  `'newyear_offseason'`)으로 `install_cta_click` 이벤트에 어느 화면의 CTA인지를 함께 싣는다 —
  `CompatView.tsx`가 이미 쓰던 `onAndroidClick`/`onIosClick`(1st-party `CompatibilityEvent` 기록,
  `logCompatEvent`)은 그대로 유지하고 GA 이벤트를 나란히 추가했을 뿐이다(어느 한쪽을 대체하지 않음).
- **커스텀 이벤트는 3개뿐이다** — `install_cta_click`(위), `lead_submit`(`LeadCaptureForm.tsx`
  제출 성공 시, 이메일 값 자체는 파라미터에 넣지 않음 — 폼이 현재 홈 화면에서 잠시 비노출 중이라
  §8 참고, 재노출 시 자동으로 함께 동작한다), `compat_result_view`(`CompatView.tsx`, 궁합 결과
  열람 — 기존 `logCompatEvent(token, 'result_viewed', 'guest')`와 나란히 남기되 토큰은 GA
  이벤트 파라미터에 넣지 않는다 — mobile CLAUDE.md §12가 세운 "식별 가능한 값을 애널리틱스
  이벤트에 평문으로 남기지 않는다" 원칙을 그대로 따름). 자동 수집되는 표준 이벤트(`page_view` 등)는
  건드리지 않았다.
- **인플루언서(그로스 문서 §3)·궁합 바이럴 루프(§4)는 이 GA 스트림이 아니라 이미 있는 1st-party
  메커니즘이 더 정확하다** — 인플루언서는 `saju-letter-backend`의 `PromotionCode`(코드별
  redeem 기록이 `userId`까지 정확히 남음), 궁합 퍼널은 이미 서버에 쌓이고 있는
  `CompatibilityEvent`. 이 GA 스트림이 실제로 채우는 공백은 §2(커뮤니티 시딩)·§6(무료 PR)처럼
  "어느 채널에서 왔는지"가 전혀 안 잡히던 부분이다 — Play 스토어 설치 링크에 UTM(`referrer`
  파라미터)을 붙이면 Firebase Analytics(모바일 쪽)가 자동으로 채널을 잡아주는 것과 짝을 이룬다.
- **개인정보처리방침 동시 갱신** — 2026-08-17 모바일 GA4 도입 때(2026-09-02 개정, §4·§1)와 같은
  원칙으로, 이번에도 같은 날 §1(자동 수집 정보)·§4(제3자 제공)의 기존 "Firebase" 문구를 "Firebase /
  Google Analytics"로 넓히고 이 사이트가 새로 보내는 3개 커스텀 이벤트가 개인 식별 정보를 담지
  않는다는 점을 명시했다(`src/content/privacyPolicy.ts` 상단 2026-09-07 개정 주석 참고). 6개 언어
  전부 반영, effectiveDate/§10 "최종 수정"도 2026년 9월 7일로 갱신.
- **검증**: 타입체크·테스트(40/40)·프로덕션 빌드 전부 통과. 로컬 프로덕션 서버(`npm run start`)로
  실제 렌더된 HTML에서 `googletagmanager.com/gtag/js?id=G-...` 스크립트 태그와 개인정보처리방침의
  갱신된 문구를 `curl`로 직접 확인했다.

## 9. 왜 Next.js인가 (형제 저장소 스택 선택과 대비)

이 사이트는 관리자 패널(`saju-letter-admin-panel`, Vite + React SPA — 로그인 뒤 내부 직원만 쓰는
CRUD 도구라 SEO가 필요 없음)이나 모바일 앱(`saju-letter-mobile`, React Native — 애초에 웹이 아님)과
달리, **검색엔진에 개별 페이지로 인덱싱돼야 하는 공개 콘텐츠**(블로그, compare)를 다룬다. Next.js App
Router의 파일 기반 라우팅 + 서버 컴포넌트 + `generateStaticParams`/`generateMetadata`/`opengraph-image`
파일 규약이 이 요구사항에 그대로 들어맞아서, 이미 같은 이유로 Next.js를 쓰고 있던
`saju-letter-newyear-campaign`과 같은 스택을 그대로 선택했다.

## 10. 로컬 실행

```bash
npm run dev    # 포트 3200 — NEXT_PUBLIC_API_BASE_URL이 가리키는 saju-letter-backend가 먼저 떠 있어야 데모/리드 폼이 동작한다
npm test        # 사주 계산 로직(src/lib/saju.ts) 회귀 테스트
npm run build   # 프로덕션 빌드 — App Router 라우트/타입 검증 + MDX 컴파일까지 겸한다
```

포트 3200을 쓰는 이유: `saju-letter-newyear-campaign`이 기본 3100/3000을 이미 쓰고 있어서, 이관
전환기에 두 사이트를 동시에 띄울 수 있게 겹치지 않는 포트를 골랐다.

## 11. 초기 구축 이후 발견해 고친 문제들(2026-08-08)

- **`src/middleware.ts`의 언어 자동 감지가 한국어를 일부러 건너뛰고 있었다** — ko가 PR/QA 전용이던
  시절 잔재 코드(`lang !== 'ko' && ...`)가 ko를 정식 타겟으로 바꾼 뒤에도 남아 있어서, 브라우저
  언어가 한국어여도 항상 영어로 리다이렉트됐다. 조건을 제거해 다른 5개 언어와 동일하게 감지되도록
  고쳤다.
- **`AstrologyInfographic.tsx`가 사실상 빈 플레이스홀더였다** — "서양 별자리"/"사주" 두 칸에 흐릿한
  기호(☉, 四柱)만 떠 있어 아무것도 안 보이는 것처럼 보였다(원래 `public/infographic/{lang}.svg`
  에셋을 나중에 채워 넣을 자리로 남겨뒀던 것). 외부 이미지/영상 에셋 없이, dict.subtitle이 설명하는
  핵심 메시지("별자리는 태어난 달 하나로 정해지는 1개 값, 사주는 년/월/일/시 네 값의 조합")를
  그대로 그림으로 옮긴 인라인 SVG(12분할 다이얼 중 1칸 강조)+HTML(4개 기둥×2칸) 조합으로 교체했다.
  기둥 라벨은 새 dict 필드를 추가하지 않고 이미 있는 `dict.demo`의 년/월/일/시 라벨을 재사용한다.
- **전반적인 시각 디자인 보강** — 상업 서비스치고 너무 단조롭다는 피드백에 따라, 히어로 섹션에
  은은한 radial-gradient 배경과 브랜드 배지를 추가하고, 카드형 컴포넌트(데모/리드 폼/인포그래픽)에
  `card-surface` 유틸리티 클래스(부드러운 그림자)를 적용했으며, CTA 버튼에 그림자+hover lift
  효과를 넣었다. `globals.css`에 보조 색상(`--accent-warm`, 기존 amber 계열 사주/설날 페이지와
  통일)을 추가해 인포그래픽의 사주 쪽 칸에 썼다 — 기존 `--accent`(모바일 앱 스플래시 화면과
  통일한 브랜드 컬러)는 그대로 유지했다.
- **파비콘/앱 아이콘이 아예 없었다(2026-08-15)** — `src/app/icon.png`/`apple-icon.png` 같은 Next.js
  아이콘 파일 규약 자체가 처음부터 없어서(`public/` 디렉터리조차 없었다) 브라우저 기본 파비콘으로
  비어 있었다. `saju-letter-mobile`의 실제 앱 아이콘(2026-08-13, `assets/images/icon.png` — 편지봉투에서
  하트가 그려진 카드가 나오는 디자인, 복숭아→코랄 그라데이션 배경, 1024×1024 알파 플래튼 완료본)을
  그대로 복사해 `src/app/icon.png`/`src/app/apple-icon.png` 둘 다에 채워 넣었다 — 리사이즈 없이 원본
  그대로(Next.js가 파일을 읽어 `<link rel="icon">`/`<link rel="apple-touch-icon">` 태그를 자동
  생성하므로 추가 설정 불필요). `src/app/[lang]/layout.tsx`가 실질적 루트 레이아웃이라 별도
  `app/layout.tsx`가 없지만, 아이콘 파일 규약은 레이아웃 유무와 무관하게 세그먼트 계층을 따라
  적용되므로 `src/app/`(최상위)에 두는 것만으로 `/[lang]/...` 하위 모든 경로에 상속된다 — `npm run
  build`로 `/icon.png`/`/apple-icon.png`가 정적 라우트로 생성되는 것을 확인했다.
- **헤더의 브랜드 아이콘도 같은 이미지로 교체(같은 날 이어서)** — `[lang]/layout.tsx` 헤더 왼쪽 위의
  로고 자리가 실제 아이콘이 아니라 원형 배지 안에 "四" 글자 하나만 있는 임시 표시였다. 위 파비콘과
  같은 원본을 `public/logo-icon.png`로 별도 복사해(파비콘 전용 규약 파일인 `src/app/icon.png`를
  직접 재사용하지 않고 분리 — 용도가 다른 자산을 같은 파일에 겹쳐 쓰지 않기 위함, `public/icon.png`로
  이름 지으면 Next.js가 자동 생성하는 `/icon.png` 파비콘 라우트와 경로가 충돌한다) `next/image`로
  28×28(`h-7 w-7`) 크기의 둥근 사각형(`rounded-md`)으로 렌더한다 — 아이콘 원본이 정사각형 디자인이라
  원형(`rounded-full`)보다 사각형 쪽이 실제 앱 아이콘 룩에 더 가깝다는 판단. `alt=""`로 뒀다 — 바로
  옆에 브랜드명 텍스트(`dict.brand`)가 있어 스크린리더가 같은 내용을 두 번 읽지 않도록 순수 장식
  이미지로 처리했다. `npm run dev` + `curl`로 실제 렌더된 `<img>` 마크업과 최적화된 이미지 응답
  (200, image/png)까지 확인했다.
- **SSR 서버사이드 호출 vs 백엔드 레이트리밋 충돌 — 발견·수정(2026-08-17)** — 전체 프로젝트(백엔드↔마케팅
  사이트 연동) 재점검 중 발견했다. `compat/[token]`/`lunar-new-year/r/[id]`의 `generateMetadata`/
  `opengraph-image.tsx`/페이지 컴포넌트가 전부 `getCompatInvite`/`getReading`(`src/lib/compatApi.ts`/
  `lunarNewYearApi.ts`)을 **Next.js 서버에서** 호출한다 — 즉 브라우저가 아니라 이 사이트의 서버가
  백엔드에 요청을 보낸다. `saju-letter-backend`의 `PUBLIC_RATE_LIMIT`이 `req.ip` 기준이라, 실제로는
  방문자마다 다른 IP인데도 백엔드 입장에선 전부 "이 마케팅 사이트 서버" 한 IP로 보여 분당 20건
  한도를 모든 방문자가 나눠 쓰는 꼴이 되고 있었다 — 정확히 공유 링크가 퍼지는 순간(바이럴 트래픽)
  이 기능의 존재 이유를 스스로 막는 구조였다. 백엔드 쪽에서 이 두 GET 라우트만 훨씬 넉넉한 한도로
  분리했다(`saju-letter-backend/CLAUDE.md` 참고). 같은 김에 이 사이트 쪽도 `getCompatInvite`/
  `getReading`이 404만 흡수하고 429/5xx 같은 다른 에러는 그대로 던지던 것을 — 셋 다 서버사이드에서
  호출되므로 레이트리밋(또는 다른 일시적 backend 장애)에 걸리면 SSR 렌더/메타데이터/OG 이미지
  생성이 그대로 크래시했다 — 어떤 `ApiError`든 조회 실패(not_found/null)로 흡수하도록 넓혀 방어를
  이중으로 걸었다.
- **생년월일 입력칸이 카드 왼쪽에 몰려 붙어 보이던 레이아웃 버그 — 3곳 수정(2026-08-26, 사용자
  발견)** — "무료로 편지 미리보기"의 년/월/일 입력칸이 좌측으로 치우쳐 보인다는 지적으로 확인해보니,
  `DemoForm.tsx`가 각 입력칸에 `w-20`/`w-16` 같은 고정폭을 주고 있어서 셋을 합쳐도 카드 폭의
  일부만 차지하고 나머지는 빈 공간으로 남아 왼쪽에 몰려 붙어 보이는 게 원인이었다. 같은 패턴이
  `CompatView.tsx`(즉석 궁합 게스트 폼)와 `lunar-new-year/ReadingForm.tsx`에도 그대로 복사돼 있어
  세 곳 다 함께 고쳤다 — 고정폭 대신 `flex-1`을 줘서 세 입력칸이 카드 폭을 균등하게 나눠 쓰도록
  바꿨다(색상/테두리 등 나머지 스타일은 그대로).

- **전 저장소 종합 버그 점검 — High 2건 수정(2026-09-03, meta 저장소 `docs/audit-2026-09-03-full-sweep.md` 참고)**
  - **Turnstile 토큰 재사용 — 재시도 시 5개 공개 폼이 영구 실패** — Turnstile 토큰은 1회용인데 `DemoForm`/`LeadCaptureForm`/`CompatView`의 `PendingForm`/`EmailSignupForm`/`ReadingForm` 어디도 제출 후 토큰을 리셋하지 않았다. 특히 `DemoForm`의 "다시 시도"는 결과 화면→폼으로 되돌아가며 `<Turnstile>`을 리마운트하는데, `next/script`가 같은 `src`의 스크립트를 전역에서 한 번만 로드된 것으로 캐시해 `onLoad`가 두 번째 마운트부터 다시 안 불려 위젯 자체가 렌더되지 않았다(100% 실패, 제출 버튼도 안 잠겨 그대로 클릭 가능). `Turnstile.tsx`를 두 가지로 고쳤다 — (1) 마운트 시점에 `window.turnstile`이 이미 있으면 `onLoad`를 기다리지 않고 즉시 렌더, (2) `forwardRef`+`useImperativeHandle`로 `reset()`을 노출해, 폼이 언마운트 없이 그대로 남는 나머지 4개 실패 경로에서도 명시적으로 새 토큰을 받을 수 있게 함. 5개 폼 전부 `catch`(또는 `DemoForm`의 "다시 시도" 클릭)에서 `setTurnstileToken(undefined)` + `turnstileRef.current?.reset()`을 호출하도록 수정. 이 저장소에 React 컴포넌트 렌더링 테스트 인프라가 없어 `Turnstile.tsx` 자체의 전용 테스트는 추가하지 않았다 — 타입체크·전체 스위트(29/29)·프로덕션 빌드로 검증.
  - **`Accept-Language` 자동 감지가 우선순위(q값)를 무시함** — `middleware.ts`가 `LAUNCH_CONTENT_LANGUAGES.find(lang => header.includes(lang))`로, 헤더 전체에 대한 단순 부분 문자열 검사를 고정 배열 순서(`ko, en, ja, es`)로만 돌고 있었다 — `es-ES,es;q=0.9,en;q=0.8` 같은 흔한 헤더(스페인어가 실제 1순위)도 `en`이 배열에서 먼저 매치돼 영어 홈으로 잘못 리다이렉트됐다. `src/lib/languages.ts`에 `detectPreferredLaunchLanguage()`를 신설해 헤더를 q값 내림차순으로 정렬(동률은 헤더 순서 유지)한 뒤 전체 태그 → 기본 서브태그 순으로 매치를 시도하도록 바꿨다. 회귀 테스트 9건(`languages.test.ts`) 추가.
- **전 저장소 종합 버그 점검 — Low-Medium 1건 수정(2026-09-03, High 완료 후 이어서)** — **헤더 내비(Blog/Compare)가 pt/vi 방문자에게 죽은 링크** — `app/[lang]/layout.tsx`가 6개 언어 전부에 Blog/Compare 링크를 무조건 노출했는데, 그 두 콘텐츠는 `LAUNCH_CONTENT_LANGUAGES`(ko/en/ja/es) 4개만 지원한다. 신년운세 캠페인은 pt/vi를 지원해 실제로 그 언어로 온 방문자가 있는데, 누르면 404. `LanguageSwitcher.tsx`가 드롭다운에서 이미 같은 이유로 pt/vi를 뺀 것과 같은 원칙(`isLaunchContentLanguage`)을 헤더 내비에도 적용했다.

- **전 저장소 종합 버그 점검 2회차(2026-09-04, meta 저장소 `docs/audit-2026-09-04-full-sweep.md` 참고) — Medium 1건** — 1회차 다음날 재점검. 바로 위 항목(헤더 내비 pt/vi 404)과 반대 방향의 같은 클래스가 `LanguageSwitcher.tsx` 자체에 남아있었다.
  - **언어 스위처가 신년운세 캠페인 페이지에서 지원하지 않는 "한국어"로 안내해 404를 유발** — `LanguageSwitcher.tsx`는 페이지가 무엇이든 `LAUNCH_CONTENT_LANGUAGES`(ko 포함 4개)를 항상 드롭다운에 보여주는데, 신년운세 캠페인(`/[lang]/lunar-new-year/...`)은 원래 캠페인 설계 그대로 한국어를 지원하지 않는 라우트라(`NON_KOREAN_LANGUAGES`만 대상, meta 저장소 CLAUDE.md §9 "확장 기능 #6" 참고) en/es/ja/pt/vi로 그 캠페인에 들어온 방문자가 헤더에서 "한국어"를 누르면 곧바로 `notFound()`에 걸려 404를 만났다. `pathForLanguage()`는 현재 페이지의 언어 제약을 전혀 모른 채 언어 세그먼트만 기계적으로 치환하고 있었다. `src/lib/languages.ts`에 순수 함수 `availableSwitcherLanguages(restOfPath)`를 신설해 — pt/vi를 계속 숨기는 기존 "발견 가능성" 판단(블로그/compare 미지원)은 그대로 두고, `/lunar-new-year` 경로에서만 `LAUNCH_CONTENT_LANGUAGES`에서 ko를 뺀 목록을 반환하도록 했다. `LanguageSwitcher.tsx`는 이 헬퍼를 호출해 드롭다운 목록을 정하도록 교체(로직 자체를 컴포넌트 밖으로 뽑아 이 저장소에 없는 컴포넌트 렌더링 테스트 없이도 단위 테스트 가능하게 함 — 같은 날 앞서 `detectPreferredLaunchLanguage`에 쓴 것과 같은 패턴). `languages.test.ts`에 회귀 테스트 5건(일반 경로/캠페인 루트/캠페인 하위 경로 2종/경로 이름에 우연히 문자열이 겹치는 오탐 방지) 추가 — 33/33 통과, 타입체크 클린, 프로덕션 빌드 성공(전체 라우트 정상 생성 확인).

- **전 저장소 종합 버그 점검 2회차 — Low 1건(2026-09-04, High+Medium 완료 후 이어서, 사용자가 "LOW도 대응해주세요" 요청)**
  - **궁합 게스트 폼(`CompatView.tsx`의 `PendingForm`)이 연/월/양음력 변경 시 `isLeapMonth`를 리셋하지 않아 계속 제출 실패** — `saju-letter-mobile`이 정확히 같은 버그(`compat/deep.tsx`, `saju-letter-mobile@f98ed9b`)를 이미 고쳤는데, 같은 구조(연/월/양음력 select + 윤달 체크박스)를 가진 이 마케팅 사이트의 게스트 폼은 그 수정 대상이 아니었다 — 윤달 있는 달을 고르고 윤달 체크 후 연도/월/양음력만 바꾸면 체크박스는 사라지거나 그대로 있어도 내부 상태(`isLeapMonth`)는 그대로 남아, `lunar-javascript`가 존재하지 않는 (연,월,윤달) 조합에 예외를 던져 계속 제출 실패했다("날짜를 다시 확인해주세요"라는 안내만 뜰 뿐 실제 원인은 안 보임). `src/lib/saju.ts`에 `getLunarLeapMonth(year)`(`saju-letter-mobile`의 `domain/saju/calendarInfo.ts`를 그대로 포팅, `lunar-javascript`의 `LunarYear.fromYear(year).getLeapMonth()`)를 신설하고, `src/lib/lunar-javascript.d.ts`에 `LunarYear` 앰비언트 타입 선언을 추가했다. `CompatView.tsx`는 `onboarding.tsx`/`compat/deep.tsx`와 같은 패턴(연/월/양음력 변경 시 그 조합이 여전히 윤달일 수 있는지 확인해 아니면 `isLeapMonth`를 `false`로 리셋)의 핸들러 3개(`handleCalendarTypeChange`/`handleYearChange`/`handleMonthChange`)로 기존 raw `setCalendarType`/`setYear`/`setMonth` 호출을 교체했다 — 이 폼은 연/월이 `string` state(모바일은 `number | null`)라 파싱 로직만 이 저장소 사정에 맞게 새로 썼다. `saju.test.ts`에 `getLunarLeapMonth` 회귀 테스트 2건(`saju-letter-mobile`의 같은 사실로 검증: 1993년 윤3월/1988년 윤달 없음) 추가 — 35/35 통과, 타입체크 클린, 프로덕션 빌드 성공. 이 저장소에 컴포넌트 렌더링 테스트 인프라가 없어 핸들러 자체의 전용 테스트는 추가하지 않음(순수 함수인 `getLunarLeapMonth`만 단위 테스트).

---

세부 배경(마케팅 사이트 신규 구축 논의, 신년운세 캠페인 이관 계획 등)은 meta 저장소의 `CLAUDE.md`
(`../CLAUDE.md` §9)와 `docs/setup-guide.md`(`../docs/setup-guide.md`) 참고.
