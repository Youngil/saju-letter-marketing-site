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

saju-letter.com에는 회원가입/설치 없이 "사주가 뭔지" 보여줄 공개 페이지가 그동안 전혀 없었다. 이
저장소는 (1) 생년월일만 입력하면 즉석에서 한 줄 티저를 보여주는 홈 미니 데모, (2) 검색 유입을 위한
블로그/compare(별자리 vs 사주) 페이지, (3) 이메일 리드 캡처 → 웰컴 드립 시퀀스 → 30일 체험 쿠폰으로
이어지는 전환 퍼널을 제공한다.

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

**톤 2그룹(`TONE_GROUP`, en/es=`explain-from-scratch`, ko/ja=`lean-into-tradition`, pt/vi는 보류
상태로 값만 유지)** — en/es는 사주를 처음 접하는 독자에게 서양 별자리에 빗대어 개념부터
설명하고, ko/ja는 이미 있는 자신의 전통(사주, 四柱推命)과의 유사성을 강조한다(한국어는 2026-08-07에
PR/QA 전용에서 정식 타겟으로 바뀌면서 ja와 같은 그룹으로 옮겼다 — 한국 독자에게 "사주가 뭔지"부터
설명하는 톤은 어색해서). **이 구분은 `saju-letter-backend`가 2026-08-05에 확정한 "AI 생성 사주
콘텐츠는 6개 언어 전부 동일 취급(오행명/전문용어 노출 금지에 언어별 차등 없음)" 원칙과는 다른
층이다** — 그 원칙은 AI가 매일 생성하는 개인화 리딩의 전문용어 노출을 다루고, 여기는 사람이
쓴(또는 한 번 다듬은) 정적 마케팅 카피의 포지셔닝을 다룬다. 구현도 코드 분기가 아니라 언어별
dictionary 문구 차이로 대부분 해결하고, 레이아웃 자체가 달라야 하는 홈 히어로/인포그래픽만
`toneGroup` prop 하나로 분기한다(6개 언어별 분기가 아니라 2그룹 축 하나).

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
  엔드포인트(`GET /marketing-site/coupon-availability`, 인증 없음)를 마운트 시 조회해 "선착순
  {count}명에게만 드려요" 문구로 등록을 유도하고, 소진되면 `soldOut` 문구로 자연스럽게 전환한다(폼
  자체는 계속 동작 — 쿠폰만 없을 뿐 드립 콘텐츠 자체는 여전히 가치가 있음). 조회 실패는 조용히
  무시한다(문구를 숨길 뿐 폼 제출 자체를 막지 않음).
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

- `/[lang]` — 홈(히어로 + 인포그래픽 + 미니 데모 + 리드 캡처 폼).
- `/[lang]/blog`, `/[lang]/blog/[slug]` — MDX 블로그(`@next/mdx`, 프론트매터는 hand-rolled 파서
  대신 MDX가 원래 지원하는 `export const meta = {...}` 구문을 그대로 쓴다 — 새 의존성 없이 정적
  타입까지 딸려온다). 1차 출시 타겟 4개 언어(ko/en/ja/es, `LAUNCH_CONTENT_LANGUAGES`)만 대상 —
  pt/vi는 §2 참고. **콘텐츠 정책: AI 활용 사실을 공개하지 않는다(2026-08-08, 사용자 결정)** —
  `what-is-saju` 글이 원래 "계산은 AI가 아니라 결정론적 알고리즘, 문장화만 AI가 담당"이라고 AI를
  직접 언급하고 있었는데(6개 언어 전부), 사용자가 이 서비스가 AI를 쓴다는 사실 자체를 굳이 밝힐
  필요가 없다고 판단해 전부 제거했다 — "정확한 계산(알고리즘)" 차별점은 그대로 남기되, 그 결과를
  "누가/무엇이" 문장으로 바꾸는지는 언급하지 않는 쪽으로 다시 썼다. 새 마케팅 카피를 쓸 때도 이
  원칙을 유지할 것(개인정보처리방침 같은 법적 고지는 별개 — 여긴 순수 마케팅 카피 얘기다).
  - **"다인" 저자 바이라인 추가(2026-08-25)** — 서비스 서사(일관된 화자 페르소나, `saju-letter-backend`의 `content/persona.ts`와 meta 저장소 CLAUDE.md §9 확장 기능 #13-6 참고)를 이 사이트에 처음 노출한 지점. 목록/상세 페이지의 날짜 줄 옆에 작은 아바타(`public/dain-avatar.png`)+"다인 씀"류 라벨(`dict.blog.byLabel`, 6개 언어)을 추가했다 — `PostMeta`에 저자 필드를 새로 만드는 대신 저자가 하나뿐이라 UI에서 고정 문구로 처리했다(향후 여러 저자가 생기면 그때 필드화). 6개 언어 전부 라벨을 채웠지만 블로그 자체는 여전히 1차 출시 4개 언어에서만 열린다.
- `/[lang]/compare` (+`opengraph-image.tsx`) — 서양 별자리 12개 vs 사주 일간(10개, 별도 순환 축이라
  1:1 매칭표를 만들지 않는다) 정적 비교. 블로그와 같은 4개 언어만 대상.
  - **콘텐츠·블로그 전면 보강(2026-08-25)** — "표 두 개뿐이라 별자리·사주 차이를 이해하기 얕고, 블로그도 이미지 없이 텍스트만 있어 빈약해 보인다"는 사용자 피드백에 대응. `/compare`는 홈 화면이 이미 쓰던 `AstrologyInfographic`(인라인 SVG, 새 이미지 에셋 불필요)을 그대로 재사용해 상단에 배치하고, 정보량 차이·시주(출생시간)의 의미·"단정하지 않는다"는 철학 3개 섹션을 새로 추가했다 — 기존 별자리 날짜표·일간 목록은 "참고 자료" 절로 격을 낮춰 그 아래 유지. 블로그 3편(`what-is-saju`/`saju-vs-western-astrology`/`how-korean-new-year-works`)은 `AstrologyInfographic`과 같은 원칙(외부 이미지 없이 인라인 SVG/HTML)의 새 다이어그램 3종(`src/components/blog/BlogDiagrams.tsx`의 `RitualFlowDiagram`/`FixedVsChangingDiagram`/`NewYearTimelineDiagram`)을 각 글에 하나씩 삽입하고, 1차 출시 4개 언어(ko/en/ja/es) 전부 실제 내용도 늘렸다(패딩이 아니라 매일 편지 4단 구성, 고정값 vs 매일 변하는 조합, 설날/입춘 날짜 분리 같은 구체적 정보 추가). **언어별로 글의 구조 자체가 다르다는 걸 이번에 확인했다** — `what-is-saju`는 ko(이미 사주를 아는 독자에게 "사주편지의 활용법"을 설명)와 en/ja/es(사주 자체를 처음부터 설명)가 서로 다른 글이라, ko는 독자적으로 깊게 다듬고 en/ja/es는 그들끼리 공유하는 기존 구조를 유지한 채 확장했다 — 나머지 두 글은 4개 언어가 같은 구조라 그대로 병렬 확장했다. pt/vi 두 언어분 MDX 파일은 손대지 않았다(블로그 자체가 이 두 언어에서 아직 라우팅되지 않음, §2 참고) — 나중에 그 언어를 열 때 이 개선분도 함께 반영해야 한다.
- `/[lang]/privacy` — 개인정보처리방침(2026-08-12, `saju-letter-backend`의 `public/privacy.html`에서 이관, `src/content/privacyPolicy.ts`). 블로그/compare와 다르게 `LAUNCH_CONTENT_LANGUAGES`가 아니라 `MARKETING_LANGUAGES` 6개 전부 대상 — 법적 고지 문서라 1차 출시 언어 축과 무관해야 한다. 이관 이유: `www.saju-letter.com` 커스텀 도메인이 이 사이트에 연결되면서(§9 "왜 Next.js인가" 인접 GCP 배포 내역, `docs/setup-guide.md` 참고) 백엔드가 서빙하던 옛 `saju-letter.com/privacy`가 더 이상 그 도메인으로는 응답하지 못하게 됐는데, 이 사실이 문서에 반영되지 않아 Play Console에 "준비 완료"로 잘못 기록돼 있던 것을 발견해 바로잡았다. 콘텐츠는 문구 변경 없이 그대로 옮겼다(⚠️ 법률 전문가 검토 전 AI 초안 — `privacyPolicy.ts` 상단 주석 참고). `saju-letter-mobile`은 `src/constants/links.ts`의 `buildPrivacyPolicyUrl(language)`로 앱의 현재 언어에 맞는 링크를 설정 화면에서 연다. **§4(제3자 제공) AI 콘텐츠 생성 제공업체 항목이 마케팅 사이트의 홈 미니 데모·신년운세를 빠뜨리고 있었다(2026-08-21 발견·수정)** — §1은 2026-08-20 개정 때 이미 이 두 기능의 "계산된 사주 정보" 수집을 언급했지만, §4는 여전히 "편지 및 오늘의 이야기 답장"만 AI 제공업체로 전달된다고 좁게 서술돼 있었다. 둘 다 "제출 시 즉시 결과 표시" 요구사항 때문에 배치가 아닌 동기 AI 호출을 쓰므로(계산된 사주값이 매 요청마다 실제로 AI 제공업체 프롬프트에 들어감) 6개 언어 전부 §4에 포함시켰다 — 궁합 공유(초대 링크)는 사전 배치 캐시에서 고르는 구조라 게스트 제출 시점에 개인 데이터가 AI로 가지 않아 의도적으로 제외했다. 상세는 `privacyPolicy.ts` 상단 2026-08-21 개정 주석 참고.
- `/[lang]/compat/[token]` (+`opengraph-image.tsx`) — 궁합 공유 웹페이지(2026-08-12, `saju-letter-backend`의 `public/compat.html`에서 이관, `src/content/compatContent.ts`/`src/lib/compatApi.ts`/`src/components/compat/CompatView.tsx`). privacy와 같은 이유로 `MARKETING_LANGUAGES` 6개 전부 대상(`generateStaticParams` 없음 — 토큰은 런타임 생성이라 `lunar-new-year/r/[id]`처럼 완전 동적 라우트). 공유 URL 자체(`saju-letter-mobile`의 `buildCompatibilityShareUrl`)는 언어 세그먼트가 없다 — `middleware.ts`의 기존 자동감지 리다이렉트가 옛 compat.js의 브라우저 언어 감지 UX를 코드 추가 없이 재현해준다. 백엔드의 `compatibilityPublicRouter`(초대 조회/제출/이벤트)는 그대로 두고 이 사이트가 `marketingSiteCors`로 cross-origin 호출한다.
  - **친구 쪽 폼이 억부 엔진용 연주/월주/일지까지 함께 전송(2026-08-16, `saju-letter-backend`가 진행한 "궁합 공유를 억부 엔진에 연동" 3단계 — 상세는 meta 저장소 `CLAUDE.md` §9 참고)** — 화면/입력 필드는 무수정이다. `CompatView.tsx`의 `handleSubmit`이 `calculateSaju()`가 애초에 계산해두고 버리던 `chart.yearPillar`/`chart.monthPillar`/`chart.dayPillar.branch`를 마저 꺼내 `submitGuestInvite` 요청에 함께 싣도록만 바뀌었다(`compatApi.ts`의 `SubmitGuestInviteInput`에 `yearStem`/`yearBranch`/`monthStem`/`monthBranch`/`dayBranch` 5개 optional 필드 추가) — 새 계산 로직이나 새 입력 필드는 전혀 없다.
- `/.well-known/assetlinks.json`(Route Handler, 2026-08-12) — Android App Links 검증 파일. 궁합 공유 도메인이 여기로 옮겨오면서 검증 대상도 이 도메인이 됐다(`saju-letter-backend`에도 같은 파일이 남아있지만 무해함).
- `/[lang]/unsubscribe` — 드립 수신거부 처리.
- `/[lang]/lunar-new-year` (+`r/[id]`, +`r/[id]/opengraph-image.tsx`, +`unsubscribe`) — 신년운세
  캠페인 이관분(2026-08-07, `saju-letter-newyear-campaign`에서 옮겨옴). ko는 원래 그 캠페인이
  지원하지 않던 언어라 그대로 제외한다(`generateStaticParams`가 `NON_KOREAN_LANGUAGES` 5개만
  대상). 계산/사전 콘텐츠는 이 사이트가 이미 가진 `src/lib/saju.ts`/`sajuVocabulary.ts`를 그대로
  재사용하고, 언어 감지는 `[lang]` URL 세그먼트로 흡수돼 옛 저장소의 `lib/language.ts`(브라우저
  감지+localStorage)는 이관하지 않았다. 백엔드(`/newyear-campaign/*`)는 무변경 — 유일한 백엔드
  코드 변경은 드립 이메일 수신거부 링크가 언어 프리픽스를 갖도록 `dripService.ts` 한 줄을 고친
  것뿐이다(`saju-letter-backend/CLAUDE.md` §7 참고).

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

---

세부 배경(마케팅 사이트 신규 구축 논의, 신년운세 캠페인 이관 계획 등)은 meta 저장소의 `CLAUDE.md`
(`../CLAUDE.md` §9)와 `docs/setup-guide.md`(`../docs/setup-guide.md`) 참고.
