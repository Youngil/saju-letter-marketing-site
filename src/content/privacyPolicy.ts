import type { MarketingLanguage } from '@/lib/languages';

/**
 * 개인정보처리방침 — 원래 saju-letter-backend/public/privacy.js(compat.js와 같은 브라우저
 * 언어감지+수동전환 패턴, 빌드 도구 없는 순수 JS)에 있던 내용을 이 사이트의 /[lang]/privacy
 * 라우트로 그대로 옮긴 것이다(2026-08-12). 문구 자체는 바뀌지 않았다 — 이관 이유는 도메인
 * 재배치 때문이다: GCP 배포(2026-08-09)로 www.saju-letter.com 커스텀 도메인이
 * saju-letter-marketing-site에 연결됐는데, saju-letter-backend는 아직 커스텀 도메인이 없어서
 * Google Play Console에 제출해둔 "https://saju-letter.com/privacy"가 실제로는 이 마케팅
 * 사이트로 들어오는 요청이 됐다 — 백엔드의 정적 페이지는 그 경로에서 더 이상 응답하지 않는
 * 상태였다.
 *
 * ⚠️⚠️ 이 문서는 AI가 코드베이스의 실제 데이터 처리 방식을 근거로 작성한 초안이다.
 * 법적 효력이 있는 개인정보처리방침으로 실제 게시하기 전에 반드시 법률 전문가 검토를
 * 받을 것 — crisisResponseBank.ts/disclaimer 문구와 동일한 수준의 검토가 필요하다.
 * 특히 아래 항목은 검토 시 반드시 확인할 것:
 *   1. 최소 이용 연령 — 만 16세로 통일 확정(국가별 아동 개인정보 동의 연령이 13~16세로
 *      갈리는데(한국/중국 14, 미국 COPPA 13, EU GDPR 기본 16), 국가별 분기 없이 전역 하나의
 *      기준을 쓰기로 하면서 가장 엄격한 값을 택함). saju-letter-mobile의
 *      `src/domain/age.ts`(MINIMUM_AGE)와 백엔드 `domain/age.ts`가 온보딩뿐 아니라 공개
 *      궁합·홈 미니 데모·신년운세 제출에서도 이 값을 실제로 강제한다 — 이 문서의
 *      숫자를 바꾸면 그 파일들의 상수도 반드시 함께 바꿀 것.
 *   2. 문의처 이메일(contact@mikomaru.com)이 실제로 운영되는 주소인지.
 *
 * ⚠️⚠️ 2026-08-15 개정 — 사용자 요청으로 실제 코드 동작과 대조해 6개 언어 전부 아래 항목을
 * 고쳤다(반드시 법률 전문가 재검토 대상):
 *   3. §6 "탈퇴하면... 이미 결제한 기간이 끝날 때까지는 계속 이용 가능"이 accountDeletionService.ts의
 *      실제 동작(즉시 Firebase 계정 삭제 → 로그인 자체가 불가능)과 모순돼 있던 걸 발견해 "환불 없음
 *      + 계속 쓰려면 구독만 별도로 취소 가능(2026-08-15 신설된 셀프서비스 구독취소 기능,
 *      POST /users/:id/cancel-subscription)"으로 정정했다 — saju-letter-mobile의
 *      deleteAccountConfirmMessage에서 같은 날 먼저 발견·수정한 것과 동일한 버그.
 *   4. §1에 그동안 전혀 언급되지 않았던 데이터 수집 항목 4종을 추가했다: (a) 억부 엔진용 전체
 *      사주 원국(연/월/일/시 8글자, UsefulGodProfile.chartFacts), (b) 고객 문의(SupportInquiry)
 *      제목/내용, (c) Google Play Integrity 기기 무결성 신호(무료체험 어뷰징 3차 방어),
 *      (d) 마케팅 사이트 리드 이메일+마케팅 동의 여부/시각+신년운세 캠페인 제출 데이터.
 *   5. intro의 범위 설명이 "앱 + 궁합 공유 페이지"로만 한정돼 있었는데, 이 문서 자체가 지금
 *      마케팅 사이트(www.saju-letter.com)의 대표 개인정보처리방침으로 쓰이고 있어(그 사이트의
 *      다른 데이터 수집 — 리드 캡처, 신년운세 캠페인 — 이 전혀 disclose 안 되고 있었음)
 *      사용자 확인 후 범위를 사이트 전체로 확장했다.
 *   6. §4에 Resend(마케팅 이메일/신년운세 결과 발송 대행사)를 제3자 목록에 추가했다.
 *   7. intro의 URL "saju-letter.com/compat"이 실제 현재 구조(www.saju-letter.com, 이관 완료)와
 *      달라 최신화했다.
 * 이 개정 자체도 AI가 코드를 근거로 작성한 것이라 법적 충분성은 여전히 변호사 확인이 필요하다 —
 * 특히 GDPR/CCPA 등 특정 관할권이 요구하는 문구(예: 정보주체 권리 세부 목록, 데이터 이전 근거)가
 * 빠져있지 않은지는 이 개정에서 검토하지 못했다.
 *
 * ⚠️⚠️ 2026-08-15 추가 개정 — "오늘의 이야기" 텍스트/답장(Question.text/replyText) 필드 암호화
 * (saju-letter-backend) 작업에 맞춰 §3/§7을 갱신했다: 이 두 필드도 생년월일·출생시간과 같은
 * AES-256 방식으로 암호화 저장된다는 사실을 명시했다(6개 언어 전부, "계산 결과물은 암호화 없이
 * 저장"이라는 기존 문장과 대비되도록). §1에는 이미 이 필드가 수집 항목으로 disclose돼 있었지만,
 * 그 시점엔 아직 암호화되기 전이라 §3/§7(보유기간·안전성 확보 조치)에는 반영돼 있지 않았다.
 * 같은 날 곧바로 — 이 기능이 앱 안에서 "궁금한 점"이 아니라 "오늘의 이야기"로 이미 리프레이밍돼
 * 있다는 지적을 받아, 이 문서에서 이 기능을 지칭하던 표현("궁금한 점"/"Ask"/"Preguntar"/
 * "Perguntar"/「気になること」/"Hỏi") 전부를 6개 언어 모두 "오늘의 이야기"(및 각 언어의 대응
 * 번역)로 통일했다 — §1/§2/§3/§4/§7 다섯 곳.
 *
 * ⚠️⚠️ 2026-08-20 개정 — 공개 궁합·홈 미니 데모·신년운세에 만 16세 서버 검증을 넣으면서
 * §1/§5/§8을 고쳤다. 양력 생년월일(년·월·일)은 나이 확인을 위해 서버로 보내지만 저장하지
 * 않는다. 같은 김에 §5의 "일간 값 하나만 저장" 고지도 실제 저장 범위(이름+계산된 천간·지지)에
 * 맞게 정정했다.
 *
 * ⚠️⚠️ 2026-08-21 개정 — "방침이 홈 미니 데모의 원국 전송을 고지하지 않음"(감사 보고서 ★ 항목)
 * 대응. §1은 2026-08-20 개정 때 이미 "홈 미니 데모·신년운세·궁합 공유 제출 시... 계산된 사주
 * 정보"를 수집 항목으로 언급하고 있었지만, §4(제3자 제공 및 처리위탁 — 실제로 어느 회사가
 * 무엇을 처리하는지)의 "AI 콘텐츠 생성 제공업체" 항목은 여전히 "편지 및 오늘의 이야기 답장"만
 * 언급해 앱 기능으로만 좁게 서술돼 있었다 — 즉 데이터가 "수집된다"는 사실은 §1에 있었지만
 * "그 데이터가 실제로 AI 제공업체(OpenAI/Anthropic/Google)로 전달된다"는 사실은 어디에도
 * 없었다. 마케팅 사이트의 홈 미니 데모(`marketingSite/service.ts::generateDemoReading`)와
 * 신년운세 리딩(`newYearCampaign/service.ts`)은 둘 다 "제출 시 즉시 결과 표시"가 요구사항이라
 * 배치가 아닌 동기 AI 호출을 쓰므로(계산된 사주값이 매 요청마다 실제로 AI 제공업체 프롬프트에
 * 들어감), §4를 6개 언어 전부 이 두 기능을 포함하도록 넓혔다. **궁합 공유(초대 링크)는
 * 의도적으로 제외했다** — 그 리딩은 (일간쌍×강약×언어×변형) 조합 단위로 미리 배치 생성해둔
 * 캐시에서 고르는 구조라(`compatibilityPrompt.ts`), 게스트가 제출하는 시점에는 그 사람의
 * 이름이나 데이터가 AI 제공업체로 전달되지 않는다 — AI 호출 자체는 그 조합이 아직 캐시에 없을
 * 때 관리자가 트리거하는 배치 생성 시점에만 일어나며, 그때 넘어가는 건 특정 개인이 아니라
 * 추상화된 조합 키뿐이다.
 *
 * ⚠️⚠️ 2026-08-29 개정 — "이번 세션의 AI 자동 페일오버(OpenAI↔Anthropic)가 방침과 충돌하는지,
 * 그리고 다른 불일치 여지가 있는지 재점검해달라"는 사용자 요청으로 전체 재감사. 페일오버 자체는
 * §4가 이미 "설정에 따라 Anthropic 또는 Google로 달라질 수 있음"이라 조건부로 명시해둔 상태라
 * 새로 고칠 필요가 없었다. 대신 이 재감사 과정에서 이전에 반영되지 않았던 진짜 불일치 2건을
 * 찾아 고쳤다:
 *   9. §1(수집 항목)이 궁합 공유·즉석 궁합에서 회원이 상대를 구분하려고 입력하는 메모
 *      (`CompatibilityInvite.requesterLabel`/`DeepCompatibilityCheck.guestLabel`, 상대에게는
 *      노출 안 됨)를 전혀 언급하지 않고 있었다 — 순수 수집 항목 누락. 6개 언어 §1에 추가했다.
 *   10. §3/§7(암호화 범위)이 여전히 "생년월일·출생시간, 오늘의 이야기 텍스트/답장"만
 *       AES-256으로 암호화된다고 서술하고 있었지만, `saju-letter-backend`는 2026-08-23에
 *       암호화 범위를 4개 필드 더 확장했다(위 9번의 궁합 라벨 2종 + `NewYearCampaignReading.
 *       memorableEvent` + `SupportInquiryMessage.text`) — 문서가 실제 보안 수준을 과소
 *       서술하고 있었다. 6개 언어 §3/§7 모두 이 4개 필드를 추가해 실제 암호화 범위와 맞췄다.
 * 두 항목 모두 법적 리스크보다는 "실제 운용과 문서가 어긋나 있었다"는 정확성 문제에 가깝다 —
 * 9번은 수집 사실 자체가 안 알려진 쪽이라 10번보다 우선순위가 높다고 판단했다. effectiveDate와
 * §10의 "최종 수정"도 6개 언어 전부 2026년 8월 29일로 갱신했다. 이 개정도 AI가 코드를 근거로
 * 작성한 것이라 법적 충분성은 여전히 변호사 확인이 필요하다.
 *
 * ⚠️⚠️ 같은 재감사에서 확인했지만 이번엔 손대지 않은 항목 — 콘텐츠 품질 검증(LanguageTool,
 * en/es/pt)이 AI가 생성한 개인화 편지(사용자가 "오늘의 이야기"에 쓴 내용을 반영한 다음날 편지
 * 개인화 등) 텍스트를 검사한다. 운영은 2026-08-28부터 자체 호스팅 Cloud Run 인스턴스를 쓰므로
 * (같은 GCP 프로젝트 내부 인프라) 통상적 의미의 "제3자 제공"으로 보기 어렵다고 판단해 §4에
 * 추가하지 않았다. 다만 로컬 개발과 자체호스팅 전환 이전 기간엔 공개 LanguageTool API를 썼는데
 * (이 시점까지 실사용자 0명이라 실질적 피해는 없었음), 향후 자체 호스팅 없이 새 언어(예:
 * 베트남어)를 열게 되면 이 판단을 다시 검토해야 한다.
 *
 * ⚠️⚠️ 2026-09-02 개정 — "마케팅 사이트의 개인정보처리방침을 최종적으로 다시 한 번 체크해달라"는
 * 사용자 요청으로 전체 재검토. 2026-08-29 재감사가 "AI 페일오버 충돌 여부"로 범위를 좁혔던
 * 탓에 놓친, 실제 코드 vs 문서 간 진짜 불일치 2건을 이번에 새로 찾았다 — 둘 다 지난 재감사보다
 * 먼저 도입됐는데도(각각 2026-08-17, 2026-08-21) 그 재감사에서조차 빠져 있었다:
 *   11. **Google Analytics for Firebase(GA4)**(`saju-letter-mobile/src/services/analytics.ts`,
 *       2026-08-17 도입) — 프로덕션 빌드에서만 수집을 켜고(`setAnalyticsCollectionEnabled`),
 *       가입 완료 시 로그인 수단을 포함한 `sign_up` 이벤트를 명시적으로 로깅하며, 그 외에도
 *       Firebase가 기본으로 자동 수집하는 표준 이벤트(앱 실행·세션 등)가 함께 켜진다. §1/§2/§4
 *       어디에도 언급이 없었다 — Firebase(Google)를 "회원 인증, 푸시 알림 발송" 두 목적으로만
 *       서술하고 있었는데, 실제로는 이용 분석이라는 세 번째 목적이 이미 운영 중이었다.
 *   12. **Cloudflare Turnstile**(`saju-letter-marketing-site/src/components/Turnstile.tsx`,
 *       2026-08-21 도입) — 홈 미니 데모·궁합 공유(게스트 제출)·리드 캡처·신년운세 리딩/이메일
 *       구독 5개 공개 폼에서 봇/스팸 방지용으로 구동된다. 위젯이 Cloudflare 도메인에서 직접
 *       로드돼 방문자의 브라우저에서 곧바로 Cloudflare로 신호를 보내는 구조라, 우리가 수집해서
 *       보관하는 데이터는 아니지만 방문자 정보가 제3자(Cloudflare)로 전달되는 진짜 데이터
 *       흐름이다 — §4(제3자 제공 및 처리위탁) 목록에 전혀 없었다.
 * 두 항목 모두 §1(수집 항목)에 자동 수집 정보로, §4에 각각 처리 목적/제3자 항목으로, §2(이용
 * 목적)에도 "이용 분석"·"부정 이용 방지" 문구로 반영했다 — 6개 언어 전부. effectiveDate와
 * §10의 "최종 수정"도 2026년 9월 2일로 갱신했다. 이 개정도 AI가 코드를 근거로 작성한 것이라
 * 법적 충분성은 여전히 변호사 확인이 필요하다. **이번 재검토에서 함께 확인했지만 문제없다고
 * 판단해 손대지 않은 것들**: `saju-letter-backend`의 신규 `AiGenerationAttempt` 로그 테이블
 * (2026-08-31 도입, 유저 원문이 아니라 사전 정의된 진단 문구만 저장 — 기존 "오류·크래시 진단
 * 정보" 범주에 이미 포함되는 성격), Google Sign-In 라이브러리 교체(`react-native-nitro-google-
 * signin`, 2026-09-01) — 수집 데이터 종류 변화 없이 내부 구현만 바뀜, `deepCompatibility`의
 * `personAIsSelf` 자동 채움(2026-09-01) — 이미 저장된 파생값(chartFacts)만 재사용하고 원본
 * 생년월일은 건드리지 않음.
 *
 * ⚠️⚠️ 2026-09-03 개정 — Play Console 데이터 보안(Data Safety) 위저드의 "계정 삭제 URL"
 * 요건(수집/공유 항목, 삭제 절차, **보유 기간 명시** 3가지)을 점검하던 중, §3(보유 및 이용
 * 기간)이 "회원 탈퇴 시(또는 삭제 요청 접수 후 지체 없이) 파기"라고만 써서 Play가 요구하는
 * "구체적인 보유 기간 명시"를 정확히 충족하지 못하고 있는 걸 발견해 "즉시 처리되며, 별도의
 * 유예 기간 없이 그 자리에서 파기 또는 익명화"로 6개 언어 전부 더 구체적으로 다듬었다. 이
 * 표현이 실제로 정확한지 Cloud SQL 백업 설정을 직접 확인했다 — 자동 백업(`backupConfiguration.
 * enabled`)이 현재 꺼져 있어(운영 DB, 2026-09-03 확인) 삭제 후 남는 "백업 보관 꼬리"가 아예
 * 없다. 즉 "지체 없이"라는 모호한 표현 대신 "즉시, 추가 유예 없이"라고 단정적으로 써도 실제
 * 인프라 상태와 어긋나지 않는다 — 자동 백업이 켜지는 시점이 오면 이 문장도 그에 맞게 다시
 * 검토해야 한다. **같은 점검 중 §3/§7의 AES-256 암호화 대상 서술("문의하기" 내용 포함)이
 * 부정확한 게 아닌지 의심했으나, 코드 재확인 결과 `supportInquiryService.ts`가 실제로
 * `fieldEncryptor.encrypt`/`.decrypt`를 메시지 저장/조회마다 호출하고 있어 — 이는 위 9번
 * 항목이 이미 기록한 2026-08-23 암호화 범위 확장의 결과다 — 서술이 정확함을 재확인했다(수정
 * 없음, 최초 의심은 오탐이었다).** effectiveDate와 §10의 "최종 수정"도 6개 언어 전부 2026년
 * 9월 3일로 갱신했다. 이 개정도 AI가 코드를 근거로 작성한 것이라 법적 충분성은 여전히 변호사
 * 확인이 필요하다.
 *
 * ⚠️⚠️ 2026-09-07 개정 — 이 마케팅 사이트에도 Google Analytics 4(gtag.js) 웹 스트림을 새로
 * 붙였다(그로스 전략 실행을 위한 채널별 유입 추적, `saju-letter-marketing-site/src/lib/
 * analytics.ts`). `saju-letter-mobile`의 Google Analytics for Firebase(위 11번 항목, 2026-08-17)와
 * 같은 GA4 프로퍼티에 딸린 별도 데이터 스트림이라 처리 주체(Google)는 동일하지만, 이 사이트
 * 자체가 새로운 자동 수집 지점이 되는 건 처음이라 §1/§4의 기존 Firebase 문장을 "앱"에서
 * "앱 및 이 마케팅 사이트"로 넓혀 6개 언어 전부 반영했다. 수집되는 커스텀 이벤트는 페이지뷰
 * 외에 `install_cta_click`(앱 다운로드 배지 클릭, 어느 화면인지만 포함)·`lead_submit`(리드
 * 캡처 제출, 이메일 자체는 포함하지 않음)·`compat_result_view`(궁합 결과 열람, 토큰은 포함하지
 * 않음) 3종 — 전부 식별 가능한 개인정보(이메일/이름/생년월일/토큰)를 이벤트 파라미터에 담지
 * 않는다. effectiveDate와 §10의 "최종 수정"도 6개 언어 전부 2026년 9월 7일로 갱신했다.
 *
 * ⚠️⚠️ 2026-09-07 개정(같은 날 이어서) — Play Console에서 7일 무료체험 Play Offer가 실제로는
 * 존재하지 않았던 걸 발견해 재생성하는 과정에서, "구독 취소 시 결제한 기간이 끝난 뒤 어떻게
 * 되는지"를 알려주는 곳이 이 방침에도 앱 UI에도 없다는 걸 사용자가 지적했다. §6(이용자의 권리와
 * 행사 방법)의 구독 취소 관련 문장이 "남은 기간에 대한 환불은 되지 않는다"까지만 말하고, 그
 * 기간이 끝난 뒤 무료 상태(구독 전용 기능 잠김)로 전환된다는 사실은 명시하지 않고 있었다 — 6개
 * 언어 §6 전부에 이 문장을 추가했다(`saju-letter-mobile`의 구독 취소 확인/완료 다이얼로그
 * 문구도 같은 날 같은 문장으로 함께 보강 — 그쪽 CLAUDE.md 참고). effectiveDate/§10 날짜는 이미
 * 같은 날 위 GA4 개정으로 2026년 9월 7일로 갱신돼 있어 추가로 바꾸지 않았다.
 *
 * ⚠️⚠️ 2026-09-13 개정 — 프로덕션 스토어 제출을 앞두고 사용자가 재점검을 요청해 발견했다. 문서의
 * 최종 수정일(2026-09-07)보다 이틀 늦게(2026-09-09) 추가된 친구 초대(리퍼럴) 기능(meta CLAUDE.md
 * §9 확장 기능 #16)이 §1(수집 항목)에 전혀 반영돼 있지 않았다 — `users.referralCode`(자동 부여되는
 * 본인의 추천 코드)와 `users.referredByUserId`(가입 시 다른 회원의 추천 코드를 입력한 경우 그
 * 회원과의 연결 정보)를 새로 수집하는데도 다른 항목들(궁합 메모 등)은 세세히 나열하면서 이것만
 * 누락돼 있었다. 6개 언어 §1에 새 항목을 추가하고, effectiveDate와 §10의 "최종 수정"도 2026년
 * 9월 13일로 갱신했다. 이 개정도 AI가 코드를 근거로 작성한 것이라 법적 충분성은 여전히 변호사
 * 확인이 필요하다 — 특히 이 문서 전체가 지금까지 한 번도 변호사 검토를 받지 않은 AI 초안이라는
 * 점은 이 개정으로도 바뀌지 않는다(사용자에게 별도로 안내함).
 *
 * ⚠️⚠️ 2026-10-01 개정 — 마케팅 채널별 효과를 설치까지 이어 재기 위해 Play 스토어 배지 링크에
 * 방문자의 유입 경로(UTM 꼬리표, `src/lib/attribution.ts`)를 실어 보내기 시작했고, 무료 미리보기
 * GA 이벤트 2개(`demo_submit`/`demo_result_view`)를 추가했다. 6개 언어 §1의 웹 분석 괄호 문구에
 * "무료 미리보기 이용"과 "유입 경로만 Google Play에 전달, 분석 쿠키 동의 시에만 브라우저에 최대
 * 30일 보관"을 추가하고, effectiveDate와 §10 "최종 수정"을 2026년 10월 1일로 갱신했다. 역시
 * AI 초안이라 변호사 검토 대상이다.
 *
 * ⚠️⚠️ 2026-10-06 개정 — 신년운세 공유 링크 가로채기 방지로 결과를 만든 브라우저에 httpOnly 기능용 쿠키(무작위 소유자 토큰,
 * 결과마다 최대 90일)를 심기 시작했다(`src/lib/readingOwner.ts`). 개인정보보호법의 "자동 수집 장치의 설치·운영" 고지와
 * GDPR의 쿠키 고지를 위해 6개 언어 §1 자동 수집 정보에 한 항목을 추가하고, effectiveDate와 §10 "최종 수정"을 갱신했다(처음엔
 * 시스템 날짜보다 미래인 2026년 10월 8일로 적었다가 전체 점검 8차에서 실제 날짜 2026년 10월 6일로 바로잡음). 꼭 필요한 기능
 * 쿠키라 동의 배너 대상은 아니다. 같은 날 전체 점검 8차로 — 동의 배너를 다시 여는 푸터 "쿠키 설정"을 만들면서 6개 언어 §1 웹
 * 분석 괄호에 "분석 쿠키는 동의한 경우에만, 각 페이지 맨 아래 '쿠키 설정'에서 언제든 변경·철회"를 덧붙였다(동의해도 광고
 * 저장소는 열지 않으므로 광고 관련 문구는 없다 — 광고를 붙이면 이 문단과 배너 문구를 함께 고칠 것). AI 초안 — 변호사 검토 대상.
 *
 * ⚠️⚠️ 2026-10-06 개정(운영 보조 에이전트) — 마케팅 서버의 `saju-letter-ops-agent`가 답장을 기다리는 고객 문의의 제목·본문·
 * 대화를 Anthropic(Claude API)으로 보내 답장 초안을 만든다(`docs/ops-agent-design.md`). 기존 "AI 콘텐츠 생성 제공업체"
 * 항목은 편지 생성용으로 설정에 따라 바뀌는 업체라 별개로, 6개 언어 §4에 Anthropic 항목을 따로 추가했다. 관리자 API가
 * agent 역할 응답에서 유저 이메일·이름·관리자 이메일을 빼므로 "이메일 주소와 이름은 보내지 않는다"고 적었다 — 그 처리를
 * 바꾸면 이 문장도 고칠 것. 답장 발송은 항상 사람이 한다. effectiveDate/§10 날짜는 이미 같은 날짜라 그대로. AI 초안 — 변호사 검토 대상.
 *
 * ⚠️⚠️ 2026-10-06 개정(전체 점검 9차) — 위 Anthropic 항목을 실제 동작에 맞게 다시 썼다(6개 언어). (a) 운영 보조 에이전트의
 * 주간 보고서가 최근 약 31일 고객 문의의 **제목만**(답변·종료된 문의 포함, 위기 신호가 든 제목은 가림)과 건수로 주제 통계를
 * 만든다 — 대화 내용은 읽지 않는다. 그래서 목적에 "서비스 개선을 위한 주간 주제 통계"를 추가했다. (b) 답장 초안은 여전히
 * 답장을 기다리는 문의의 제목·본문·대화를 보낸다. (c) 보내지 않는 건 **계정 필드의** 이메일·이름뿐이라 범위를 "계정의"로
 * 좁히고, 본문에 직접 적은 이름 등은 그대로 갈 수 있다고 밝혔다. (d) 마지막 문장 "생년월일시와 '오늘의 이야기'는 전달되지
 * 않는다"를 "이 작업들에는"으로 좁혔다 — 위 AI 콘텐츠 생성 제공업체 항목이 설정·페일오버에 따라 Anthropic일 수 있다고 적고
 * 있어, 무조건 문장이면 그 항목과 모순된다. §1 공개 페이지 IP 문장("일시적 빈도 제한에만, 장기 저장 안 함")은 백엔드가 공개
 * 페이지 방문자 IP 저장을 멈추고 기존 값을 지우기로 해(사용자 결정) 그대로 둔다 — 백엔드가 다시 IP를 저장하면 이 문장을 고칠 것.
 * effectiveDate/§10 날짜는 이미 같은 날짜라 그대로. AI 초안 — 변호사 검토 대상.
 *
 * ⚠️⚠️ 2026-10-06 개정(전체 점검 10차) — (a) §3/§7의 "'문의하기' 내용은 AES-256 암호화" 서술을 정확히 했다(6개 언어, 사용자
 * 결정). 실제로 암호화되는 건 문의 대화의 **메시지 본문**(`support_inquiry_messages.text` — 이용자 메시지는 backend
 * `supportInquiryService.ts`, 운영자 답장은 admin-backend `supportInquiryService.ts`가 `fieldEncryptor.encrypt`)뿐이고, 문의
 * **제목**(`SupportInquiry.subject`)은 목록 표시를 위해 평문으로 저장된다 — 2026-09-03 점검이 "서술이 정확함"이라 본 건 메시지
 * 본문만 확인한 것이었다. 제목을 암호화하게 되면 이 문장들도 함께 고칠 것. (b) §4 Anthropic 항목의 마지막 문장을 "계정에 등록된
 * 생년월일시와 '오늘의 이야기'는 이 작업들에 전달되지 않는다(문의 대화에 이용자나 운영자가 직접 적은 내용은 적힌 그대로
 * 전달)"로 고치고, 같은 단서가 두 번 나오지 않게 앞의 "계정의 이메일·이름은 보내지 않는다(본문에 적은 이름 등은 전달)" 문장과
 * 한 문장으로 합쳤다. 단서의 주체는 이용자뿐 아니라 운영자까지 넣었다 — 답장 초안 작업은 지금까지의 대화
 * 전체(운영자 답장 포함)를 보내므로 "직접 적은" 주체가 이용자만이 아니다. "AI 콘텐츠 생성 제공업체" 항목(설정·페일오버에 따라
 * Anthropic일 수 있음)과 모순되지 않도록 "이 작업들에는" 한정은 유지했다. effectiveDate/§10 날짜는 이미 같은 날짜라 그대로.
 * AI 초안 — 변호사 검토 대상.
 *
 * ⚠️⚠️ 2026-10-06 개정(전체 점검 11차) — AI 초안, 법률 검토 대상. 백엔드가 같은 점검에서 함께 바꾸는 동작을 기준으로 6개 언어를
 * 고쳤다 — **백엔드 변경과 같은 시점에 배포할 것**(먼저 나가면 아직 지키지 않는 약속이 된다).
 *   (a) §3 백업: 데이터베이스 백업은 최대 7일 보관 후 삭제, 탈퇴로 지운 정보도 그 기간 안에 백업에서 사라진다(2026-09-03 개정의
 *       "자동 백업이 꺼져 있어 백업 꼬리가 없다" 전제가 바뀜 — 보관 기간을 늘리면 이 문장도 고칠 것).
 *   (b) §3 보유 기간 목록 신설: 수신거부한 리드 이메일 30일, 신년운세 리딩(이름·텍스트·메일 구독) 그해 캠페인 종료 후 1년, 궁합 게스트
 *       이름 결과 완성 후 1년(§5에도 한 문장), 관리자 접근·감사 로그 1년, 운영 알림 기록 180일, 운영 보조 AI 초안(문의 답장 초안·보고서)
 *       180일, 웹 서버 요청 로그(IP 포함, Cloud Run 로깅) 최대 30일, 이메일 해시(키 기반 단방향)는 무료체험·친구 초대 남용 방지로 탈퇴 후에도
 *       보관. §1 공개 페이지 IP 문장의 "장기 저장하지 않음"은 요청 로그(30일)와 모순돼 "데이터베이스에 저장하지 않음"으로 좁히고, 요청
 *       로그를 자동 수집 항목으로 따로 적었다.
 *   (c) §1 이메일 용도: "무료체험 어뷰징 방지 목적으로만"은 사실이 아니어서 로그인·계정 관리, 계정 복구·본인 확인, 친구 초대 혜택 자격
 *       확인, (이메일 구독 신청 시) 마케팅 쿠폰 발급, 무료체험 남용 방지, 고객 문의 응대로 바꾸고, 이메일 가입이면 필수·Google 로그인이면
 *       그 계정 이메일을 받는다는 사실(backend가 Firebase 토큰의 이메일을 저장)을 적었다. §2의 결제 항목에 친구 초대 혜택을 함께 넣었다.
 *   (d) §4 처리위탁: Google Cloud(호스팅·DB·암호화 키·로그), Slack(내부 운영 알림 — 회원 식별자 등 운영 정보만, 글·문의 내용 없음) 추가.
 *       Sentry는 요청 내용 없이 오류 진단 정보만, Turnstile은 확인을 위해 방문자 IP도 받을 수 있음, 푸시 알림(FCM)엔 일반 안내 문구만 담기고
 *       "오늘의 이야기"·문의 답장 내용은 담기지 않음(Firebase 항목)을 적었다. §1 Turnstile 문구에도 IP를 넣었다.
 *   (e) §4 AI 콘텐츠 생성 제공업체: 즉석 궁합(바로 보는 궁합)을 목록에 넣되 이름 없이(플레이스홀더) 두 사람의 계산된 사주 정보만 간다고
 *       적었다. 홈 미니 데모는 `marketingSite/service.ts::generateDemoReading`이 요청 때 AI를 부르지 않고 미리 만든 공용 편지 캐시(없으면
 *       정적 폴백)를 고르므로 "AI가 생성"을 지우고 "입력한 정보가 AI 제공업체로 가지 않는다"로 바꿨다 — 2026-08-21 개정의 "데모는 동기 AI
 *       호출" 서술은 더 이상 맞지 않는다. 데모가 다시 AI를 부르게 되면 이 문장을 고칠 것.
 *   (f) 앱 광고 ID: 지금 설치된 앱 버전은 Google Analytics for Firebase 기본 설정이라 광고 ID(AD_ID)가 수집될 수 있다 — 모바일이 다음 버전에서
 *       끄더라도 구버전이 남아 있는 동안 "광고 ID를 사용하지 않는다"는 정확하지 않다. 그래서 §1 앱 분석 괄호에 "광고 ID는 광고 목적으로
 *       사용하지 않음"(광고를 붙이지 않았고 GA 광고 신호도 켜지 않음)만 적었다. 광고 ID 수집을 끈 버전만 남게 되면 "광고 ID를 수집하지
 *       않음"으로 강화할 수 있다.
 * effectiveDate/§10 날짜는 이미 같은 날짜(2026-10-06)라 그대로. AI 초안 — 변호사 검토 대상.
 *
 * ⚠️⚠️ 2026-10-07 개정(전체 점검 12차) — AI 초안, 법률 검토 대상. 11차 문구가 실제 동작과 어긋난 곳(리뷰 R12-6-1·2·4·7·8,
 * R12-3-2·4·6·7)을 백엔드가 같은 점검에서 함께 바꾸는 동작에 맞춰 6개 언어 모두 고쳤다 — **백엔드 12차 변경과 같은 시점에
 * 배포할 것**(11차와 마찬가지로 먼저 나가면 아직 지키지 않는 약속이 된다).
 *   (a) §1 IP: 11차의 "데이터베이스에 저장하지 않음"은 틀렸다 — 요청 빈도 제한 버킷(`rate_limit_buckets`)이 IP 원문을 키로
 *       저장하고 있었다. 백엔드가 이제 IP의 키 기반 단방향 해시만 저장하고 최대 1일 뒤 지우므로 "IP 원문은 저장하지 않고 해시만
 *       최대 1일"로 바꾸고, 범위를 "공개 페이지 등 서비스 접속 시"로 넓혔다. §3 목록에 "요청 빈도 제한 기록: 최대 1일(백업 최대
 *       7일)"을 추가했다. 해시 대신 원문을 다시 저장하게 되면 이 두 곳을 고칠 것.
 *   (b) §4 Firebase 푸시: 11차의 "푸시엔 일반 안내 문구만"은 틀렸다 — 매일 편지 알림 본문이 편지 첫 문장(hook)이고, 다음날
 *       개인화 편지는 그 hook에 전날 저널을 녹일 수 있었다. 백엔드가 이제 '오늘의 이야기' 답장·문의 답장·위기 안내·개인화 편지가
 *       온 날의 아침·주간/월말 편지 공개 알림을 고정 문구로 보내므로 그 목록을 적고, 미리보기가 담길 수 있는 알림(개인화되지 않은
 *       매일 편지 = 첫 문장, 기념일(마일스톤) 편지 = 제목 — 저널이 아니라 활동 수치로 쓰는 편지, 궁합 결과 = 두 사람이 입력한
 *       이름)을 사실대로 적었다. FCM 경유·잠금 화면 노출도 한 문장. 알림 본문 규칙을 바꾸면 이 문단도 고칠 것.
 *   (c) §1/§3/§7 즉석 궁합 이름: 11차부터 즉석 궁합(바로 보는 궁합)에 입력한 두 사람의 이름을 결과 표시용으로 암호화 저장하는데
 *       수집 항목·암호화 목록에 없었다(상대방 이름·사주 정보 = 제3자 정보). §1에 항목을 추가하고(결과 표시용, 암호화, AI로 안 보냄,
 *       탈퇴 시 삭제), §3 암호화 문단과 §7에 넣었다. §4의 "즉석 궁합엔 이름이 AI로 가지 않는다"는 그대로 사실.
 *   (d) §3 보유 기간: 수신거부 30일을 홈 리드와 신년운세 이메일 시리즈 둘 다로 명시(백엔드가 신년운세 구독의 수신거부 이메일도
 *       30일 뒤 지움 — 신년운세 리딩 항목엔 "수신거부한 이메일은 그보다 먼저"를 덧붙임), "관리자 접근 기록 및 감사 로그"를
 *       "관리자 열람·변경 기록"으로(⚠️ 검수 감사 기록 `review_actions`도 1년 정리 대상인지는 이 개정 시점에 확인하지 못했다 —
 *       백엔드 정리 작업에 없으면 넣거나 이 문구를 좁힐 것), 운영 알림·AI 초안 180일의 기준을 "처리·결정이 끝난 뒤"로
 *       고치고 처리 전 항목은 처리될 때까지 보관한다고 적었다.
 * effectiveDate/§10 날짜는 6개 언어 모두 2026년 10월 7일로 갱신. AI 초안 — 변호사 검토 대상.
 */

export const PRIVACY_CONTACT_EMAIL = 'contact@mikomaru.com';

export interface PrivacyPolicySection {
  heading: string;
  /** 원문이 <ul>/<li>/<strong>/<a> 등 단순 서식만 쓰는 신뢰된 정적 콘텐츠라 그대로 HTML 문자열로 둔다(사용자 입력 아님). */
  html: string;
}

export interface PrivacyPolicyContent {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: PrivacyPolicySection[];
}

export const PRIVACY_POLICY_CONTENT: Record<MarketingLanguage, PrivacyPolicyContent> = {
  ko: {
    title: '개인정보처리방침',
    effectiveDate: '시행일자: 2026년 7월 29일 (최종 수정: 2026년 10월 7일)',
    intro:
      '사주편지(이하 "회사" 또는 "서비스")는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수합니다. ' +
      '본 방침은 사주편지 앱과 saju-letter.com(마케팅 사이트, 궁합 공유·신년운세 공개 페이지, 이메일 구독 신청 ' +
      '포함)을 이용하는 과정에서 수집되는 개인정보의 처리에 대해 안내합니다.',
    sections: [
      {
        heading: '1. 수집하는 개인정보 항목',
        html:
          '<ul>' +
          '<li>이용자가 직접 입력하는 정보: 이름(또는 별칭), 생년월일, 성별(선택), 기기 시간대</li>' +
          '<li>선택 입력 정보: 출생 시간("모름" 선택 가능), 이메일 주소(이메일로 가입할 때는 필수이며, Google 계정으로 로그인하면 그 계정의 이메일 주소를 받습니다. 로그인과 계정 관리, 계정 복구와 본인 확인, 친구 초대 혜택 자격 확인, 이메일 소식 구독을 신청한 경우 마케팅 쿠폰 발급, 무료체험 남용 방지, 고객 문의 응대에 사용), 궁합 공유·즉석 궁합 이용 시 상대를 구분하기 위해 입력하는 메모(상대방에게는 노출되지 않음)</li>' +
          '<li>친구 초대(리퍼럴) 기능 이용 시 수집되는 정보: 본인에게 자동으로 부여되는 추천 코드, 그리고 가입 시 다른 회원의 추천 코드를 입력한 경우 그 회원과의 연결 정보(추천인 식별자)</li>' +
          '<li>즉석 궁합 이용 시 입력하는 정보: 궁합을 볼 두 사람의 이름과 계산된 사주 정보(상대방의 정보 포함 — 결과를 보여 주기 위해 저장하며, 이름은 암호화해 보관하고 AI 제공업체로 보내지 않음. 회원 탈퇴 시 함께 삭제)</li>' +
          '<li>자동으로 수집되는 정보: Firebase 인증 식별자(UID), 기기 푸시 토큰(FCM), 프로덕션 빌드에서만 수집되는 앱 이용 분석 이벤트(Google Analytics for Firebase — 가입 완료 시 로그인 수단 포함. 광고 ID는 광고 목적으로 사용하지 않음), 이 마케팅 사이트 방문 시 수집되는 웹 이용 분석 이벤트(Google Analytics — 앱 다운로드 버튼 클릭, 리드 등록 제출, 궁합 결과 열람, 무료 미리보기 이용 등. 이메일·이름·생년월일·궁합 링크 토큰 등 식별 가능한 개인정보는 이벤트에 포함하지 않음. 앱 다운로드 버튼을 누르면 이 사이트에 들어온 경로(예: "tiktok")만 Google Play에 함께 전달되며, 이 경로 정보는 분석 쿠키에 동의한 경우에만 브라우저에 최대 30일 보관됨. 분석 쿠키는 동의한 경우에만 쓰며, 동의는 모든 페이지 맨 아래 "쿠키 설정"에서 언제든 바꾸거나 철회할 수 있음), 신년운세 결과를 만든 브라우저에만 저장되는 기능용 쿠키(결과를 만든 본인만 이메일 시리즈를 신청할 수 있게 하는 무작위 값으로, 최대 90일 보관하며 광고·분석에 쓰지 않고 브라우저 설정에서 언제든 지울 수 있음), 구독/결제 상태(RevenueCat 경유), 무료체험 남용 방지를 위한 Google Play Integrity 기기 무결성 신호, 오류·크래시 진단 정보, 공개(비로그인) 페이지 등 서비스 접속 시의 IP 주소(악용 방지를 위한 요청 빈도 제한에만 사용하며, 데이터베이스에는 IP 주소 원문을 저장하지 않고 원래 주소로 되돌릴 수 없는 키 기반 단방향 해시값만 최대 1일 보관), 서비스 이용 시 웹 서버가 남기는 요청 기록(IP 주소, 접속 시각, 요청한 주소 등 — 최대 30일 보관), 마케팅 사이트의 공개 제출 폼(홈 미니 데모·궁합 공유·리드 등록·신년운세)에서 봇 방지를 위해 구동되는 Cloudflare Turnstile을 통해 Cloudflare로 전달되는 브라우저 정보와 IP 주소</li>' +
          '<li>사주 개인화 계산 결과: 온보딩 시 입력한 생년월일시를 바탕으로 계산되는 사주 전체(연주·월주·일주·시주) — 주간/월별 편지 등 개인화된 해석에 사용됩니다</li>' +
          '<li>이용자가 자유롭게 작성하는 내용: "오늘의 이야기" 기능에 입력한 텍스트(답장 생성을 위해 AI 제공업체로 전달됨), "문의하기" 기능에 입력한 제목과 내용</li>' +
          '<li>마케팅 사이트(saju-letter.com) 이용 시 수집되는 정보: 이메일 구독 신청 시 입력한 이메일 주소와 마케팅 수신 동의 여부·시각, 홈 미니 데모·신년운세·궁합 공유 제출 시 입력한 이름(해당되는 경우)·계산된 사주 정보·자유롭게 작성한 텍스트. 만 16세 확인을 위해 양력 생년월일(년·월·일)을 서버로 보내지만 저장하지 않으며, 사주 계산 자체는 이용자의 기기에서 이뤄집니다</li>' +
          '</ul>',
      },
      {
        heading: '2. 개인정보의 수집 및 이용 목적',
        html:
          '<ul>' +
          '<li>회원 식별 및 서비스 제공(사주 정보 계산, 매일/주간/월별 편지 생성 및 발송)</li>' +
          '<li>푸시 알림 발송</li>' +
          '<li>구독 결제 처리, 무료체험·친구 초대 혜택 지급 및 남용 방지</li>' +
          '<li>"오늘의 이야기" 기능에 대한 개인화된 답장 생성</li>' +
          '<li>고객 문의 응대</li>' +
          '<li>마케팅 이메일 발송(명시적으로 동의한 이용자에 한함) 및 신년운세 리딩 생성</li>' +
          '<li>서비스 이용 현황 분석 및 품질 개선, 오류 대응, 부정 이용(봇·스팸) 방지</li>' +
          '</ul>',
      },
      {
        heading: '3. 개인정보의 보유 및 이용 기간',
        html:
          '<p>회원 탈퇴 또는 삭제 요청은 접수 즉시 처리되며, 별도의 유예 기간 없이 그 자리에서 파기 또는 익명화됩니다. 데이터베이스 백업은 최대 7일간 보관한 뒤 삭제하므로, 탈퇴로 지워진 정보도 이 기간 안에 백업에서까지 사라집니다.</p>' +
          '<p>그 밖의 정보는 아래 기간이 지나면 파기합니다.</p>' +
          '<ul>' +
          '<li>마케팅 이메일(홈 이메일 소식 구독, 신년운세 이메일 시리즈) 수신을 거부한 이메일 주소: 수신거부 후 30일</li>' +
          '<li>신년운세 리딩 정보(이름, 작성한 텍스트, 이메일 구독 정보): 해당 연도 캠페인이 끝난 뒤 1년(수신을 거부한 이메일 주소는 위 기준에 따라 그보다 먼저 삭제)</li>' +
          '<li>궁합 공유에서 친구(비회원)가 입력한 이름: 궁합 결과가 완성된 뒤 1년</li>' +
          '<li>관리자 열람·변경 기록: 1년</li>' +
          '<li>운영 알림 기록: 처리가 끝난 뒤 180일(처리 중인 항목은 처리될 때까지 보관)</li>' +
          '<li>운영 보조 AI가 작성한 초안(고객 문의 답장 초안, 보고서): 채택·반려 등 결정이 끝난 뒤 180일(결정 전인 초안은 결정될 때까지 보관)</li>' +
          '<li>웹 서버 요청 기록(IP 주소 포함, Google Cloud 로그): 최대 30일</li>' +
          '<li>요청 빈도 제한 기록(IP 주소의 키 기반 단방향 해시값): 최대 1일(데이터베이스 백업에는 최대 7일)</li>' +
          '<li>이메일 주소의 해시값(원래 주소로 되돌릴 수 없는 키 기반 단방향 해시): 무료체험과 친구 초대 혜택이 반복해서 쓰이는 것을 막기 위해 회원 탈퇴 후에도 보관</li>' +
          '</ul>' +
          '<p>생년월일·출생시간, "오늘의 이야기" 기능에 입력한 텍스트와 답장, 궁합 공유·즉석 궁합에서 상대를 구분하기 위해 입력한 메모, 즉석 궁합에 입력한 두 사람의 이름, 신년운세 제출 시 자유롭게 작성한 텍스트, "문의하기" 대화에서 주고받은 메시지 본문(이용자의 메시지와 운영자의 답장)은 AES-256 방식으로 암호화해 저장합니다. 다만 "문의하기"의 제목은 문의 목록에 표시하기 위해 암호화하지 않고 저장하며, 계산 결과물(일간·월지·시지)은 개인 식별이 어려운 값으로 판단해 암호화 없이 저장합니다.</p>' +
          '<p>관계 법령상 일정 기간 보존이 필요한 정보(예: 결제 기록)는 해당 법령이 정한 기간 동안 보존 후 파기합니다.</p>',
      },
      {
        heading: '4. 개인정보의 제3자 제공 및 처리위탁',
        html:
          '<p>서비스 제공에 필요한 범위 내에서 아래 외부 업체에 개인정보 처리를 위탁하거나 제공합니다.</p>' +
          '<ul>' +
          '<li><strong>Firebase / Google Analytics(Google)</strong>: 회원 인증, 푸시 알림 발송, 앱 및 이 마케팅 사이트의 이용 현황 분석(앱은 Google Analytics for Firebase, 프로덕션 빌드에서만 수집 / 마케팅 사이트는 같은 GA4 프로퍼티의 별도 웹 스트림). 푸시 알림은 FCM을 거쳐 기기로 전달되며 잠금 화면에 표시될 수 있습니다. "오늘의 이야기" 답장, 문의 답장, 위기 상황 안내, 전날 쓴 "오늘의 이야기"를 반영한 개인화 편지가 도착한 날의 아침 알림, 주간·월말 편지 공개 알림에는 정해진 안내 문구만 담깁니다. 개인화되지 않은 매일 편지 알림에는 그 편지의 첫 문장이, 기념일 편지 알림에는 편지 제목이, 궁합 결과 알림에는 두 사람이 입력한 이름이 미리보기로 담길 수 있습니다</li>' +
          '<li><strong>Google Cloud</strong>: 서비스 서버 운영(호스팅), 데이터베이스, 암호화 키 관리, 서버 로그 보관</li>' +
          '<li><strong>RevenueCat</strong>: 구독 상태 확인 및 관리(실제 결제는 Google Play 빌링을 통해 처리되며, 카드 등 결제 수단 정보는 회사가 직접 보관하지 않습니다)</li>' +
          '<li><strong>AI 콘텐츠 생성 제공업체</strong>(현재 OpenAI, 설정에 따라 Anthropic 또는 Google로 달라질 수 있음): 편지·오늘의 이야기 답장·즉석 궁합 결과의 문장 생성과, 마케팅 사이트(saju-letter.com)의 신년운세 리딩 생성. 계산된 사주 정보, "오늘의 이야기" 기능에 직접 작성한 텍스트, 신년운세 제출 시 입력한 이름·자유 텍스트가 전달될 수 있습니다. 즉석 궁합에는 두 사람의 계산된 사주 정보만 전달되고 이름은 전달되지 않습니다. 홈 미니 데모는 요청 시점에 AI를 호출하지 않고 미리 만들어 둔 편지 중에서 골라 보여 주므로, 입력한 정보가 AI 제공업체로 전달되지 않습니다.</li>' +
          '<li><strong>Anthropic</strong>: 고객 문의 답장 초안 작성 보조, 서비스 개선을 위한 최근 고객 문의의 주간 주제 통계 작성. 답장 초안 작성에는 답장을 기다리는 문의의 제목·본문과 지금까지 주고받은 대화가 전달될 수 있으며, 답장은 항상 운영자가 확인한 뒤 직접 보냅니다. 주제 통계 작성에는 최근 문의(답변이 끝난 문의 포함)의 제목만 전달됩니다. 계정의 이메일 주소와 이름, 계정에 등록된 생년월일시, "오늘의 이야기" 내용은 이 작업들에 전달되지 않습니다(다만 문의 대화에 이용자나 운영자가 직접 적은 내용은 적힌 그대로 전달됩니다).</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: 마케팅 사이트 공개 제출 폼의 봇·스팸 방지(위젯이 구동되는 동안 확인을 위해 방문자의 브라우저 정보와 IP 주소가 Cloudflare로 전달됩니다)</li>' +
          '<li><strong>Resend</strong>: 마케팅 이메일 및 신년운세 결과 이메일 발송</li>' +
          '<li><strong>Sentry</strong>: 오류·크래시 모니터링(오류 진단 정보만 받으며, 입력한 텍스트 등 요청에 담긴 내용은 보내지 않습니다)</li>' +
          '<li><strong>Slack</strong>: 내부 운영 알림(회원 식별자 등 운영 정보만 담기며, 이용자가 쓴 글이나 문의 내용은 담기지 않습니다)</li>' +
          '</ul>',
      },
      {
        heading: '5. 궁합 공유 기능과 비회원(친구)의 정보',
        html:
          '<p>회원이 만든 공유 링크로 접속하는 친구(비회원)는 별도 회원가입 없이 이름과 생년월일만 입력하면 됩니다. ' +
          '사주 계산은 접속한 기기(브라우저 또는 앱) 안에서만 이뤄지며, 서버에는 계산된 천간·지지(연주·월주·일주)와 이름이 ' +
          '전송·저장됩니다. 만 16세 확인을 위해 양력 생년월일(년·월·일)을 함께 보내지만 저장하지는 않습니다. ' +
          '입력한 이름은 궁합 결과 화면 표시 목적으로만 사용되며 다른 목적으로 사용되지 않고, 궁합 결과가 완성된 지 1년이 지나면 ' +
          '삭제됩니다.</p>',
      },
      {
        heading: '6. 이용자의 권리와 행사 방법',
        html:
          '<p>이용자는 앱의 설정 화면에서 언제든지 직접 회원 탈퇴를 신청할 수 있습니다. 탈퇴하면 이름·이메일·성별· ' +
          '생년월일시 등 식별 가능한 정보는 즉시 알아볼 수 없는 값으로 대체되고 다시 로그인할 수 없으며, 구독 ' +
          '중이었다면 자동 결제 갱신도 함께 취소되지만 남은 기간에 대한 환불은 되지 않습니다. 계속 이용하면서 ' +
          '결제만 멈추고 싶다면, 탈퇴 대신 앱의 설정 화면에서 구독만 별도로 취소할 수 있습니다. 마케팅 이메일 ' +
          '수신을 원하지 않으시면 각 이메일 하단의 수신거부 링크로 언제든지 거부하실 수 있습니다. 취소한 ' +
          '구독은 이미 결제한 기간이 끝나면 무료 상태로 전환되어 구독 전용 기능은 다시 잠깁니다. 탈퇴 외에 ' +
          '개인정보 열람·정정 등을 원하시면 아래 연락처로 요청해 주십시오.</p>',
      },
      {
        heading: '7. 개인정보의 안전성 확보 조치',
        html:
          '<ul>' +
          '<li>생년월일·출생시간, "오늘의 이야기" 텍스트와 답장, 궁합·즉석 궁합의 메모, 즉석 궁합의 이름, 신년운세 자유 작성 텍스트, 문의하기 메시지 본문 등 민감할 수 있는 정보는 AES-256 방식으로 암호화하여 저장(문의 제목은 목록 표시를 위해 암호화하지 않음)</li>' +
          '<li>암호화 키는 별도의 키 관리 서비스(KMS)에서 관리하며 코드에 하드코딩하지 않음</li>' +
          '<li>관리자 페이지 접근에는 별도의 인증 체계 적용</li>' +
          '</ul>',
      },
      {
        heading: '8. 만 16세 미만 아동의 개인정보',
        html:
          '<p>본 서비스는 만 16세 이상만 이용할 수 있으며, 앱 가입(온보딩)과 공개 페이지(궁합 공유·홈 미니 데모·신년운세) ' +
          '제출 시 입력한 양력 생년월일을 기준으로 서버가 실제로 이를 확인합니다. 공개 페이지에서 만 16세 확인을 위해 ' +
          '받은 생년월일은 저장하지 않습니다. 회사는 만 16세 미만 아동으로부터 고의로 개인정보를 수집하지 않으며, 만 16세 ' +
          '미만 아동이 이용 중임을 알게 될 경우 관련 정보를 지체 없이 삭제하는 등 필요한 조치를 취합니다.</p>',
      },
      {
        heading: '9. 문의처',
        html: `<p>개인정보 관련 문의, 열람·정정·삭제 요청은 아래 이메일로 연락해 주십시오.</p><p>이메일: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. 고지의 의무',
        html:
          '<p>본 방침은 2026년 7월 29일부터 적용되며, 법령·정책 또는 서비스 변경에 따라 내용이 추가·삭제·수정될 ' +
          '수 있습니다(가장 최근 수정: 2026년 10월 7일). 변경 시 앱 공지 또는 본 페이지를 통해 고지합니다.</p>',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    effectiveDate: 'Effective date: July 29, 2026 (last updated: October 7, 2026)',
    intro:
      'Saju Letter ("we", "us", or "the Service") respects your privacy and is committed to protecting your ' +
      'personal information. This Privacy Policy explains what information we collect and how we use it when ' +
      'you use the Saju Letter app and saju-letter.com (our marketing site, the compatibility-sharing and Lunar ' +
      'New Year public pages, and email sign-up).',
    sections: [
      {
        heading: '1. Information We Collect',
        html:
          '<ul>' +
          '<li>Provided by you: name (or nickname), birth date, gender (optional), device timezone</li>' +
          '<li>Optional: birth time (you may choose "unknown"), email address (required if you sign up with email; if you sign in with a Google account, we receive that account\'s email address. Used for sign-in and account management, account recovery and verification, checking eligibility for referral rewards, issuing marketing coupons if you sign up for our emails, preventing free-trial abuse, and responding to support requests), a note you enter in compatibility-sharing or deep compatibility to help you tell people apart (never shown to the other person)</li>' +
          '<li>Referral program: a referral code automatically assigned to your account, and — if you entered another member\'s referral code when signing up — a record linking your account to that referrer</li>' +
          '<li>Deep compatibility: the names of the two people you enter and their calculated saju information (including the other person\'s), stored so we can show you the result. The names are stored encrypted, are never sent to the AI provider, and are deleted when you delete your account</li>' +
          '<li>Collected automatically: Firebase authentication identifier (UID), device push token (FCM), app-usage analytics events collected only in production builds (Google Analytics for Firebase — including the sign-in method on the sign-up event; we do not use the advertising ID for advertising), web-usage analytics events collected when you visit this marketing site (Google Analytics — app-download button clicks, lead sign-up submissions, viewing a compatibility result, using the free preview; we do not include identifying data such as email, name, birth date, or compatibility-link tokens in these events. When you tap the app-download button, only the channel that brought you to this site (for example "tiktok") is passed along to Google Play; that channel tag is kept in your browser for up to 30 days only if you accept analytics cookies. Analytics cookies are used only with your consent, which you can change or withdraw at any time via "Cookie settings" at the bottom of every page), a functional cookie stored only in the browser that created a Lunar New Year reading (a random value that lets only the reading\'s creator sign up for its email series; kept for up to 90 days, never used for ads or analytics, and you can delete it in your browser settings at any time), subscription/purchase status (via RevenueCat), Google Play Integrity device-integrity signals used to prevent free-trial abuse, crash/error diagnostic data, your IP address when you use public pages and other parts of the service (used only for abuse-prevention rate limiting; we never store the IP address itself in our database — only a keyed, one-way hash that cannot be turned back into the address, kept for up to 1 day), request logs that our web servers keep when you use the service (including IP address, time, and the address requested; kept for up to 30 days), and browser information and your IP address sent to Cloudflare while the Cloudflare Turnstile bot-protection widget is active on our marketing site\'s public submission forms (home demo, compatibility-sharing, lead sign-up, and Lunar New Year)</li>' +
          '<li>Personalization calculations: your full four-pillar saju chart (year, month, day, and hour pillars), calculated from the birth date and time you provide during onboarding — used to personalize weekly and monthly letters</li>' +
          '<li>Content you write: free text you enter in the "Today\'s Story" feature, which is sent to an AI provider to generate a personalized reply; and the subject and message you enter when contacting Support</li>' +
          '<li>Collected when you use our marketing site (saju-letter.com): the email address you provide when signing up, along with whether and when you consented to marketing emails; and, if you submit the home demo, compatibility-sharing, or Lunar New Year public pages, the name (where applicable), calculated saju information, and free text you enter. We send your Gregorian date of birth (year, month, day) only to confirm you are 16 or older and do not store it; the chart itself is calculated on your device</li>' +
          '</ul>',
      },
      {
        heading: '2. How We Use Your Information',
        html:
          '<ul>' +
          '<li>To identify your account and provide the service (calculating your saju information and generating/delivering daily, weekly, and monthly letters)</li>' +
          '<li>To send push notifications</li>' +
          '<li>To process subscription payments, grant free-trial and referral rewards, and prevent their abuse</li>' +
          '<li>To generate a personalized reply in the "Today\'s Story" feature</li>' +
          '<li>To respond to customer support inquiries</li>' +
          '<li>To send marketing emails (only to users who have explicitly opted in) and to generate Lunar New Year readings</li>' +
          '<li>To analyze usage, improve the service, respond to errors, and prevent abuse (bots/spam)</li>' +
          '</ul>',
      },
      {
        heading: '3. Retention Period',
        html:
          '<p>We delete your information immediately when you close your account or when we receive a deletion request — there is no additional grace period or delay. Database backups are kept for at most 7 days and then deleted, so information erased when you delete your account also disappears from our backups within that period.</p>' +
          '<p>Other information is deleted once the periods below have passed:</p>' +
          '<ul>' +
          '<li>Email addresses unsubscribed from our marketing emails (the home-page email sign-up and the Lunar New Year email series): 30 days after you unsubscribe</li>' +
          '<li>Lunar New Year reading data (name, the text you wrote, and email subscription details): 1 year after that year\'s campaign ends (an email address you unsubscribed is deleted sooner, under the rule above)</li>' +
          '<li>Names entered by friends (guests) in compatibility sharing: 1 year after the compatibility result was completed</li>' +
          '<li>Records of what administrators viewed and changed: 1 year</li>' +
          '<li>Operational alert records: 180 days after they are resolved (open items are kept until they are handled)</li>' +
          '<li>Drafts written by our AI operations assistant (support reply drafts and reports): 180 days after they are accepted, rejected, or otherwise decided (drafts awaiting a decision are kept until then)</li>' +
          '<li>Web server request logs (including IP addresses, kept in Google Cloud logging): up to 30 days</li>' +
          '<li>Rate-limiting records (a keyed, one-way hash of your IP address): up to 1 day (up to 7 days in database backups)</li>' +
          '<li>Hashes of email addresses (a keyed, one-way hash that cannot be turned back into the address): kept even after account deletion to prevent repeated free trials and referral-reward abuse</li>' +
          '</ul>' +
          '<p>Your birth date and birth time; the text you write in the "Today\'s Story" feature and its reply; the notes you enter in compatibility-sharing or deep compatibility to tell people apart; the names you enter for deep compatibility; the free text you submit for a Lunar New Year reading; and the message bodies of your Support conversations (both your messages and our replies) are all stored encrypted (AES-256). The subject line of a Support inquiry is stored without encryption so it can be shown in inquiry lists. Calculated results (day master, month branch, hour branch) are not personally identifying on their own, so we store them without encryption.</p>' +
          '<p>Where law requires longer retention (e.g., payment records), we retain that data only for the legally required period before deletion.</p>',
      },
      {
        heading: '4. Third Parties We Share Data With',
        html:
          '<p>We share data with the following third parties only as needed to provide the service:</p>' +
          '<ul>' +
          '<li><strong>Firebase / Google Analytics (Google)</strong>: authentication, push notifications, and usage analytics for both the app (Google Analytics for Firebase, production builds only) and this marketing site (a separate web stream in the same GA4 property). Push notifications are delivered through FCM and may appear on your lock screen. Notifications for "Today\'s Story" replies, support replies, and crisis-support guidance, the morning notification on days you receive a letter personalized from the previous day\'s "Today\'s Story", and notices that a weekly or month-end letter is ready contain only fixed, generic text. A notification for an ordinary (non-personalized) daily letter may show the letter\'s first sentence as a preview, a milestone letter notification may show the letter\'s title, and a compatibility-result notification may show the names the two people entered</li>' +
          '<li><strong>Google Cloud</strong>: hosting our servers, databases, encryption key management, and server logs</li>' +
          '<li><strong>RevenueCat</strong>: subscription status management (actual payment is processed by Google Play Billing; we do not store your card or payment details ourselves)</li>' +
          '<li><strong>Our AI content provider</strong> (currently OpenAI; may be Anthropic or Google depending on configuration): generates the wording of your letters, "Today\'s Story" replies, and deep compatibility results, as well as Lunar New Year readings on our marketing site (saju-letter.com). This may include your calculated saju values, the text you write in the "Today\'s Story" feature, and the name and free text you submit for a Lunar New Year reading. For deep compatibility, only the two people\'s calculated saju values are shared — not their names. The home mini demo does not call an AI when you submit it: it shows a letter we generated in advance, so what you enter there is not sent to the AI provider.</li>' +
          '<li><strong>Anthropic</strong>: helps us draft replies to your support inquiries and compile weekly topic statistics from recent support inquiries to improve the service. For reply drafts, the subject, messages and conversation of an inquiry awaiting a reply may be shared, and a staff member always reviews and sends each reply personally. For topic statistics, only the subject lines of recent inquiries (including ones already answered) are shared. The email address and name on your account, the birth date and time registered to your account, and your "Today\'s Story" entries are not shared for these tasks (anything written directly in an inquiry conversation — by you or our staff — is shared as written).</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: bot and spam prevention on our marketing site\'s public submission forms (your browser information and IP address are sent to Cloudflare for verification while the widget is active)</li>' +
          '<li><strong>Resend</strong>: sending marketing emails and Lunar New Year result emails</li>' +
          '<li><strong>Sentry</strong>: crash and error monitoring (it receives error diagnostics only, not the contents of your requests such as the text you enter)</li>' +
          '<li><strong>Slack</strong>: internal operational alerts (these contain only operational information such as member identifiers — never what you write or the content of your inquiries)</li>' +
          '</ul>',
      },
      {
        heading: '5. The Compatibility-Sharing Feature and Non-Member (Guest) Data',
        html:
          '<p>A friend who opens a compatibility link you share does not need to create an account — they only ' +
          'enter their name and birth date. The saju chart is calculated entirely on their own device or browser. ' +
          'We store the resulting heavenly stems and earthly branches (year, month, and day pillars) together with ' +
          'the name they enter. We also receive their Gregorian date of birth (year, month, day) only to confirm ' +
          'they are 16 or older, and we do not store that date. The name is used only to display it on the result ' +
          'screen and is not used for any other purpose; it is deleted 1 year after the compatibility result was ' +
          'completed.</p>',
      },
      {
        heading: '6. Your Rights',
        html:
          "<p>You can delete your account yourself at any time from the app's Settings screen. Deleting your " +
          'account immediately replaces identifying information (name, email, gender, birth date and time) ' +
          'with anonymized values and signs you out for good, and cancels auto-renewal if you have an active ' +
          'subscription — but any remaining paid time is not refunded. If you just want to stop future charges ' +
          "while continuing to use the app, you can cancel only your subscription from the app's Settings " +
          'screen instead of deleting your account. If you no longer want to receive marketing emails, you can ' +
          'opt out anytime using the unsubscribe link at the bottom of each email. After a cancelled ' +
          'subscription reaches the end of its paid period, your account reverts to the free tier and ' +
          'subscription-only features are locked again. For any other requests — ' +
          'such as accessing or correcting your information — please contact us using the information below.</p>',
      },
      {
        heading: '7. Security Measures',
        html:
          '<ul>' +
          '<li>Sensitive information — including birth date, birth time, "Today\'s Story" text and replies, compatibility/deep-compatibility notes, deep-compatibility names, Lunar New Year free text, and Support message bodies — is stored using AES-256 encryption (Support inquiry subject lines are not encrypted, so they can be shown in lists)</li>' +
          '<li>Encryption keys are managed through a dedicated key management service (KMS) and are never hardcoded</li>' +
          '<li>Access to the admin panel requires separate authentication</li>' +
          '</ul>',
      },
      {
        heading: "8. Children's Privacy",
        html:
          '<p>This service is intended for users aged 16 and older. We verify this using the Gregorian birth ' +
          'date you provide during app onboarding and when submitting public pages (compatibility sharing, the ' +
          'home demo, and Lunar New Year). Birth dates sent only for that age check on public pages are not ' +
          'stored. We do not knowingly collect personal information from children under 16. If we become aware ' +
          'that a child under 16 has used the service, we will take appropriate steps to delete the relevant ' +
          'information promptly.</p>',
      },
      {
        heading: '9. Contact Us',
        html: `<p>For privacy-related questions or requests to access, correct, or delete your information, please contact us at:</p><p>Email: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. Changes to This Policy',
        html:
          '<p>This policy is effective as of July 29, 2026, and may be updated as our practices, applicable ' +
          'laws, or the service itself change (most recently updated: October 7, 2026). We will notify you of ' +
          'material changes through the app or this page.</p>',
      },
    ],
  },
  ja: {
    title: 'プライバシーポリシー',
    effectiveDate: '施行日: 2026年7月29日(最終更新: 2026年10月7日)',
    intro:
      'サジュレター(以下「当社」または「本サービス」)は、利用者のプライバシーを尊重し、個人情報の保護に努めて' +
      'います。本ポリシーは、サジュレターアプリおよびsaju-letter.com(マーケティングサイト、相性シェア・旧正月' +
      '占い公開ページ、メール登録を含む)をご利用いただく際に収集する個人情報の取り扱いについて説明するものです。',
    sections: [
      {
        heading: '1. 収集する個人情報の項目',
        html:
          '<ul>' +
          '<li>ご入力いただく情報: お名前(またはニックネーム)、生年月日、性別(任意)、端末のタイムゾーン</li>' +
          '<li>任意項目: 出生時刻(「わからない」を選択可能)、メールアドレス(メールアドレスで登録する場合は必須。Googleアカウントでログインした場合はそのアカウントのメールアドレスを受け取ります。ログインとアカウント管理、アカウントの復旧と本人確認、友達招待特典の対象確認、メール配信に登録した場合のマーケティング用クーポンの発行、無料体験の不正利用防止、お問い合わせへの対応に使用)、相性シェア・その場でわかる相性のご利用時に相手を区別するために入力するメモ(相手には表示されません)</li>' +
          '<li>友達招待(リファラル)機能: ご自身のアカウントに自動的に付与される紹介コード、および登録時に他の会員の紹介コードを入力した場合、その会員との連携情報(紹介者の識別子)</li>' +
          '<li>その場でわかる相性のご利用時に入力される情報: 相性を見るお二人のお名前と計算済みの四柱情報(相手の方の情報を含みます。結果を表示するために保存し、お名前は暗号化して保管し、AIプロバイダーには送信しません。退会時に併せて削除します)</li>' +
          '<li>自動的に収集される情報: Firebase認証ID(UID)、端末のプッシュ通知トークン(FCM)、プロダクションビルドでのみ収集されるアプリ利用分析イベント(Google Analytics for Firebase — 会員登録完了イベントにログイン手段を含む。広告IDを広告目的で使用することはありません)、本マーケティングサイトご利用時に収集されるウェブ利用分析イベント(Google Analytics — アプリダウンロードボタンのクリック、リード登録の送信、相性診断結果の閲覧、無料プレビューの利用など。メールアドレス・氏名・生年月日・相性共有リンクのトークンなど識別可能な個人情報はイベントに含めません。アプリダウンロードボタンを押すと、本サイトへの流入経路(例: 「tiktok」)のみがGoogle Playに渡され、この経路情報は分析Cookieに同意した場合に限りブラウザに最長30日間保存されます。分析Cookieは同意いただいた場合にのみ使用し、同意は各ページ下部の「Cookie設定」からいつでも変更・撤回できます)、旧正月占いの結果を作成したブラウザにのみ保存される機能用Cookie(結果を作成したご本人だけがメールシリーズに登録できるようにするためのランダムな値。最長90日間保存し、広告・分析には使用せず、ブラウザの設定からいつでも削除できます)、サブスクリプション・購入状況(RevenueCat経由)、無料体験の不正利用防止のためのGoogle Play Integrity端末信頼性シグナル、エラー・クラッシュ診断情報、公開ページ(非会員向け)など本サービスご利用時のIPアドレス(不正利用防止のためのリクエスト制限のみに使用します。データベースにはIPアドレスそのものは保存せず、元のアドレスに戻せない鍵を用いた一方向ハッシュ値のみを最長1日間保管します)、サービスご利用時にウェブサーバーが残すリクエスト記録(IPアドレス、アクセス日時、リクエスト先のアドレスなど。最長30日間保存)、マーケティングサイトの公開フォーム(ホームのミニデモ・相性シェア・リード登録・旧正月占い)でボット対策として動作するCloudflare Turnstileを通じてCloudflareに送信されるブラウザ情報とIPアドレス</li>' +
          '<li>パーソナライズのための計算結果: オンボーディング時にご入力いただいた生年月日時をもとに計算される四柱全体(年柱・月柱・日柱・時柱) — 週間・月間レターの個人化された解釈に使用されます</li>' +
          '<li>ご自身で入力される内容: 「今日の物語」機能に自由に記入されたテキスト(返信生成のためAIプロバイダーに送信されます)、および「お問い合わせ」機能にご入力いただく件名と内容</li>' +
          '<li>マーケティングサイト(saju-letter.com)ご利用時に収集される情報: メール登録時にご入力いただくメールアドレスと、マーケティングメールへの同意有無・同意日時。ホームのミニデモ・相性シェア・旧正月占い公開ページ送信時にご入力いただくお名前(該当する場合)・計算された四柱情報・自由記入テキスト。満16歳確認のため太陽暦の生年月日(年・月・日)をサーバーに送りますが保存はせず、四柱の計算自体はご自身の端末内で行います</li>' +
          '</ul>',
      },
      {
        heading: '2. 個人情報の利用目的',
        html:
          '<ul>' +
          '<li>会員の識別およびサービス提供(四柱情報の計算、毎日・毎週・毎月のレター生成と配信)</li>' +
          '<li>プッシュ通知の送信</li>' +
          '<li>サブスクリプション決済の処理、無料体験・友達招待特典の付与および不正利用防止</li>' +
          '<li>「今日の物語」機能へのパーソナライズされた返信生成</li>' +
          '<li>お問い合わせへの対応</li>' +
          '<li>マーケティングメールの送信(明示的に同意した利用者のみ)および旧正月占い結果の生成</li>' +
          '<li>サービス利用状況の分析、品質向上、障害対応、および不正利用(ボット・スパム)防止</li>' +
          '</ul>',
      },
      {
        heading: '3. 保有期間',
        html:
          '<p>退会または削除リクエストは受領後直ちに処理され、猶予期間を設けずその場で削除または匿名化されます。データベースのバックアップは最長7日間保管した後に削除するため、退会により消去された情報もこの期間内にバックアップからも消えます。</p>' +
          '<p>その他の情報は、以下の期間が経過した後に削除します。</p>' +
          '<ul>' +
          '<li>マーケティングメール(ホームのメール配信登録、旧正月占いのメールシリーズ)の配信を停止したメールアドレス: 配信停止から30日後</li>' +
          '<li>旧正月占いのリーディング情報(お名前、記入したテキスト、メール配信の登録情報): その年のキャンペーン終了から1年後(配信を停止したメールアドレスは、上記の基準によりそれより早く削除)</li>' +
          '<li>相性シェアで友達(非会員)が入力したお名前: 相性結果の完成から1年後</li>' +
          '<li>管理者の閲覧・変更記録: 1年</li>' +
          '<li>運用アラートの記録: 対応完了から180日(対応中の項目は対応が終わるまで保管)</li>' +
          '<li>運用支援AIが作成した下書き(お問い合わせへの返信の下書き、レポート): 採用・却下などの判断が済んでから180日(判断前の下書きは判断されるまで保管)</li>' +
          '<li>ウェブサーバーのリクエスト記録(IPアドレスを含む、Google Cloudのログ): 最長30日</li>' +
          '<li>リクエスト制限の記録(IPアドレスの、鍵を用いた一方向ハッシュ値): 最長1日(データベースのバックアップには最長7日)</li>' +
          '<li>メールアドレスのハッシュ値(元のアドレスに戻せない、鍵を用いた一方向ハッシュ): 無料体験や友達招待特典の繰り返し利用を防ぐため、退会後も保管</li>' +
          '</ul>' +
          '<p>生年月日・出生時刻、「今日の物語」機能に入力されたテキストとその返信、相性シェア・その場でわかる相性で相手を区別するために入力したメモ、その場でわかる相性で入力したお二人のお名前、旧正月占い送信時に自由に記入したテキスト、「お問い合わせ」のやり取りのメッセージ本文(お客様のメッセージと運営担当者の返信)は、AES-256方式で暗号化して保存します。ただし、「お問い合わせ」の件名はお問い合わせ一覧に表示するため暗号化せずに保存し、計算結果(日干・月支・時支)も個人を特定しにくい値と判断し、暗号化せずに保存します。</p>' +
          '<p>法令により一定期間の保存が義務付けられている情報(決済記録など)は、当該法令が定める期間保存した後に削除します。</p>',
      },
      {
        heading: '4. 第三者提供・委託',
        html:
          '<p>本サービスの提供に必要な範囲内で、以下の外部事業者に個人情報の取り扱いを委託または提供しています。</p>' +
          '<ul>' +
          '<li><strong>Firebase / Google Analytics(Google)</strong>: 会員認証、プッシュ通知の送信、アプリおよび本マーケティングサイトの利用状況分析(アプリはGoogle Analytics for Firebase、プロダクションビルドのみ収集 / マーケティングサイトは同じGA4プロパティの別のウェブストリーム)。プッシュ通知はFCMを通じて端末に届き、ロック画面に表示されることがあります。「今日の物語」への返信、お問い合わせへの返信、危機的な状況でのご案内、前日の「今日の物語」を反映したパーソナライズレターが届く日の朝の通知、週間・月末レターの公開通知には、決まったお知らせ文のみを載せます。パーソナライズしていない毎日のレターの通知にはそのレターの最初の一文が、記念日レターの通知にはレターのタイトルが、相性結果の通知にはお二人が入力したお名前が、プレビューとして含まれる場合があります</li>' +
          '<li><strong>Google Cloud</strong>: サーバーの運用(ホスティング)、データベース、暗号化キーの管理、サーバーログの保管</li>' +
          '<li><strong>RevenueCat</strong>: サブスクリプション状況の管理(実際の決済はGoogle Playの請求システムを通じて行われ、カード情報などの決済手段情報は当社では保管しません)</li>' +
          '<li><strong>AIコンテンツ生成プロバイダー</strong>(現在はOpenAI。設定によりAnthropicまたはGoogleの場合もあります): レター、「今日の物語」の返信文、その場でわかる相性の結果の生成、およびマーケティングサイト(saju-letter.com)の旧正月占いリーディングの生成。計算済みの四柱情報、「今日の物語」機能にご自身で入力されたテキスト、旧正月占い送信時に入力されたお名前・自由記述テキストが送信される場合があります。その場でわかる相性では、お二人の計算済みの四柱情報のみを送信し、お名前は送信しません。ホームのミニデモはリクエスト時にAIを呼び出さず、あらかじめ作成しておいたレターの中から選んで表示するため、入力された情報がAIプロバイダーに送信されることはありません。</li>' +
          '<li><strong>Anthropic</strong>: お問い合わせへの返信文の下書き作成の補助、およびサービス改善のための最近のお問い合わせの週次テーマ統計の作成。返信の下書きには、返信待ちのお問い合わせの件名・本文とこれまでのやり取りが送信される場合があり、返信は必ず運営担当者が確認したうえで送信します。テーマ統計には、最近のお問い合わせ(回答済みのものを含む)の件名のみが送信されます。これらの作業で、アカウントのメールアドレスとお名前、アカウントに登録された生年月日時、「今日の物語」の内容が送信されることはありません(ただし、お問い合わせのやり取りにお客様または運営担当者が直接書いた内容は、書かれたとおりに送信されます)。</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: マーケティングサイトの公開フォームにおけるボット・スパム対策(ウィジェット動作中、確認のため訪問者のブラウザ情報とIPアドレスがCloudflareに送信されます)</li>' +
          '<li><strong>Resend</strong>: マーケティングメールおよび旧正月占い結果メールの送信</li>' +
          '<li><strong>Sentry</strong>: エラー・クラッシュのモニタリング(エラーの診断情報のみを受け取り、入力されたテキストなどリクエストの内容は送信しません)</li>' +
          '<li><strong>Slack</strong>: 社内向けの運用アラート(会員IDなどの運用情報のみを含み、利用者が書いた文章やお問い合わせの内容は含みません)</li>' +
          '</ul>',
      },
      {
        heading: '5. 相性シェア機能と非会員(友達)の情報',
        html:
          '<p>会員が作成した共有リンクを開く友達は、会員登録なしにお名前と生年月日を入力するだけでご利用いただけます。' +
          '四柱の計算は友達自身の端末(ブラウザまたはアプリ)内でのみ行い、サーバーには計算された天干・地支(年柱・月柱・日柱)と' +
          'お名前を送信・保存します。満16歳確認のため太陽暦の生年月日(年・月・日)も送りますが、その日付は保存しません。' +
          '入力されたお名前は結果画面に表示する目的のみに使用され、それ以外の目的には使用せず、相性結果の完成から1年が経過すると' +
          '削除します。</p>',
      },
      {
        heading: '6. 利用者の権利',
        html:
          '<p>利用者はアプリの設定画面からいつでもご自身で退会(アカウント削除)を申請できます。退会すると、お名前・' +
          'メールアドレス・性別・生年月日時など識別可能な情報は直ちに匿名化された値に置き換えられ、二度とログイン' +
          'できなくなり、サブスクリプションをご利用中の場合は自動更新も解約されますが、残りの期間分の返金はあり' +
          'ません。引き続きアプリを利用しながら支払いだけ止めたい場合は、退会の代わりにアプリの設定画面から' +
          'サブスクリプションだけを解約することもできます。マーケティングメールの受信を希望されない場合は、各' +
          'メール下部の配信停止リンクからいつでも解除できます。解約したサブスクリプションはお支払い済みの期間が' +
          '終了すると無料状態に戻り、サブスク限定の機能は再びご利用いただけなくなります。退会以外に個人情報の閲覧・訂正などをご希望の場合' +
          'は、下記の連絡先までご請求ください。</p>',
      },
      {
        heading: '7. 安全管理措置',
        html:
          '<ul>' +
          '<li>生年月日・出生時刻、「今日の物語」のテキストと返信、相性シェア・その場でわかる相性のメモ、その場でわかる相性のお名前、旧正月占いの自由記入テキスト、お問い合わせのメッセージ本文など機微になり得る情報はAES-256方式で暗号化して保存(お問い合わせの件名は一覧表示のため暗号化しません)</li>' +
          '<li>暗号化キーは専用の鍵管理サービス(KMS)で管理し、コードに直接記載しません</li>' +
          '<li>管理画面へのアクセスには別途認証を適用</li>' +
          '</ul>',
      },
      {
        heading: '8. 児童のプライバシー',
        html:
          '<p>本サービスは満16歳以上の方のみご利用いただけます。アプリ登録(オンボーディング)および公開ページ' +
          '(相性シェア・ホームのミニデモ・旧正月占い)送信時にご入力いただいた太陽暦の生年月日をもとにサーバーが実際に確認します。' +
          '公開ページで満16歳確認のためだけに受け取った生年月日は保存しません。当社は満16歳未満のお子様から意図的に個人情報を収集することはありません。' +
          '満16歳未満のお子様がご利用されていることが判明した場合、当該情報を速やかに削除するなど必要な措置を' +
          '講じます。</p>',
      },
      {
        heading: '9. お問い合わせ',
        html: `<p>個人情報に関するお問い合わせ、閲覧・訂正・削除のご請求は下記までご連絡ください。</p><p>メール: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. 本ポリシーの変更',
        html:
          '<p>本ポリシーは2026年7月29日より施行します(最終更新: 2026年10月7日)。法令、方針、またはサービス内容' +
          'の変更に応じて内容を追加・削除・修正する場合があります。重要な変更がある場合は、アプリ内または本ページ' +
          'にてお知らせします。</p>',
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    effectiveDate: 'Fecha de vigencia: 29 de julio de 2026 (última actualización: 7 de octubre de 2026)',
    intro:
      'Saju Letter ("nosotros" o "el Servicio") respeta tu privacidad y se compromete a proteger tu información ' +
      'personal. Esta Política de Privacidad explica qué información recopilamos y cómo la usamos cuando ' +
      'utilizas la app Saju Letter y saju-letter.com (nuestro sitio de marketing, las páginas públicas de ' +
      'compatibilidad y Año Nuevo Lunar, y el registro por correo electrónico).',
    sections: [
      {
        heading: '1. Información que recopilamos',
        html:
          '<ul>' +
          '<li>Proporcionada por ti: nombre (o apodo), fecha de nacimiento, género (opcional), zona horaria del dispositivo</li>' +
          '<li>Opcional: hora de nacimiento (puedes elegir "desconocida"), dirección de correo electrónico (obligatoria si te registras con correo electrónico; si inicias sesión con una cuenta de Google, recibimos el correo de esa cuenta. La usamos para el inicio de sesión y la gestión de tu cuenta, la recuperación de la cuenta y la verificación, comprobar si cumples los requisitos de las recompensas por referidos, emitir cupones de marketing si te suscribes a nuestros correos, prevenir el abuso de la prueba gratuita y responder a tus consultas de soporte), una nota que ingresas en la compatibilidad compartida o la compatibilidad detallada para distinguir a las personas (nunca se muestra a la otra persona)</li>' +
          '<li>Programa de referidos: un código de referido asignado automáticamente a tu cuenta y, si ingresaste el código de referido de otro miembro al registrarte, un registro que vincula tu cuenta con ese miembro</li>' +
          '<li>Compatibilidad detallada: los nombres de las dos personas que ingresas y su información de saju calculada (incluida la de la otra persona), que guardamos para mostrarte el resultado. Los nombres se almacenan cifrados, nunca se envían al proveedor de IA y se eliminan cuando eliminas tu cuenta</li>' +
          '<li>Recopilada automáticamente: identificador de autenticación de Firebase (UID), token de notificaciones push del dispositivo (FCM), eventos de análisis de uso de la app recopilados solo en compilaciones de producción (Google Analytics for Firebase — incluye el método de inicio de sesión en el evento de registro; no usamos el ID de publicidad con fines publicitarios), eventos de análisis de uso web recopilados al visitar este sitio de marketing (Google Analytics — clics en el botón de descarga de la app, envíos del formulario de contacto, visualización de un resultado de compatibilidad, uso de la vista previa gratuita; no incluimos datos identificables como el correo, nombre, fecha de nacimiento o el token del enlace de compatibilidad en estos eventos. Al tocar el botón de descarga, solo se envía a Google Play el canal por el que llegaste a este sitio (por ejemplo, "tiktok"); esa etiqueta se guarda en tu navegador hasta 30 días solo si aceptas las cookies de análisis. Las cookies de análisis solo se usan con tu consentimiento, que puedes cambiar o retirar en cualquier momento desde "Configuración de cookies", al final de cada página), una cookie funcional guardada solo en el navegador con el que se creó una lectura de Año Nuevo Lunar (un valor aleatorio que permite que solo quien creó la lectura se suscriba a su serie de correos; se conserva hasta 90 días, nunca se usa para publicidad ni análisis y puedes borrarla en cualquier momento desde la configuración del navegador), estado de suscripción/compra (a través de RevenueCat), señales de integridad del dispositivo de Google Play Integrity usadas para prevenir el abuso de la prueba gratuita, datos de diagnóstico de errores/fallos, tu dirección IP al usar las páginas públicas y otras partes del servicio (usada solo para limitar la frecuencia de solicitudes y prevenir abusos; nunca guardamos la dirección IP en sí en nuestra base de datos, solo un hash unidireccional con clave que no permite recuperarla, durante un máximo de 1 día), los registros de solicitudes que guardan nuestros servidores web cuando usas el servicio (incluyen la dirección IP, la hora y la dirección solicitada; se conservan hasta 30 días), e información del navegador y tu dirección IP enviadas a Cloudflare mientras el widget de protección contra bots Cloudflare Turnstile está activo en los formularios públicos de nuestro sitio de marketing (demo de inicio, compatibilidad compartida, registro de contacto y Año Nuevo Lunar)</li>' +
          '<li>Cálculos de personalización: tu carta astral saju completa (los cuatro pilares: año, mes, día y hora), calculada a partir de la fecha y hora de nacimiento que proporcionas durante el proceso de incorporación — usada para personalizar las cartas semanales y mensuales</li>' +
          '<li>Contenido que escribes: el texto libre que ingresas en la función "Historia de Hoy", que se envía a un proveedor de IA para generar una respuesta personalizada; y el asunto y mensaje que ingresas al contactar con Soporte</li>' +
          '<li>Recopilada cuando usas nuestro sitio de marketing (saju-letter.com): la dirección de correo electrónico que proporcionas al registrarte, junto con si diste tu consentimiento para recibir correos de marketing y cuándo; y, si envías el demo de inicio, la compatibilidad compartida o las páginas públicas de Año Nuevo Lunar, el nombre (cuando corresponda), la información de saju calculada y el texto libre que ingresas. Enviamos tu fecha de nacimiento gregoriana (año, mes, día) solo para confirmar que tienes 16 años o más y no la almacenamos; la carta en sí se calcula en tu dispositivo</li>' +
          '</ul>',
      },
      {
        heading: '2. Cómo usamos tu información',
        html:
          '<ul>' +
          '<li>Para identificar tu cuenta y prestar el servicio (calcular tu información de saju y generar/enviar cartas diarias, semanales y mensuales)</li>' +
          '<li>Para enviar notificaciones push</li>' +
          '<li>Para procesar los pagos de suscripción, otorgar la prueba gratuita y las recompensas por referidos, y prevenir su abuso</li>' +
          '<li>Para generar una respuesta personalizada en la función "Historia de Hoy"</li>' +
          '<li>Para responder a las consultas de soporte</li>' +
          '<li>Para enviar correos de marketing (solo a usuarios que hayan dado su consentimiento explícito) y generar lecturas de Año Nuevo Lunar</li>' +
          '<li>Para analizar el uso, mejorar el servicio, responder a errores y prevenir el abuso (bots/spam)</li>' +
          '</ul>',
      },
      {
        heading: '3. Período de retención',
        html:
          '<p>Eliminamos tu información de inmediato cuando cierras tu cuenta o cuando recibimos una solicitud de eliminación — no hay período de gracia adicional ni demora. Las copias de seguridad de la base de datos se conservan como máximo 7 días y luego se eliminan, así que la información borrada al eliminar tu cuenta también desaparece de las copias de seguridad dentro de ese plazo.</p>' +
          '<p>El resto de la información se elimina una vez transcurridos los siguientes plazos:</p>' +
          '<ul>' +
          '<li>Direcciones de correo dadas de baja de nuestros correos de marketing (el registro por correo de la página de inicio y la serie de correos de Año Nuevo Lunar): 30 días después de darte de baja</li>' +
          '<li>Datos de las lecturas de Año Nuevo Lunar (nombre, texto que escribiste y datos de la suscripción por correo): 1 año después de que termine la campaña de ese año (una dirección de correo dada de baja se elimina antes, según la regla anterior)</li>' +
          '<li>Nombres que ingresan los amigos (invitados) en la compatibilidad compartida: 1 año después de completarse el resultado de compatibilidad</li>' +
          '<li>Registros de lo que los administradores consultan y modifican: 1 año</li>' +
          '<li>Registros de alertas operativas: 180 días después de resolverse (las que siguen abiertas se conservan hasta que se atienden)</li>' +
          '<li>Borradores escritos por nuestro asistente de operaciones con IA (borradores de respuesta a consultas de soporte e informes): 180 días después de que se acepten, se rechacen o se decida sobre ellos de otro modo (los que esperan una decisión se conservan hasta entonces)</li>' +
          '<li>Registros de solicitudes de los servidores web (incluidas las direcciones IP, guardados en el registro de Google Cloud): hasta 30 días</li>' +
          '<li>Registros de limitación de frecuencia (un hash unidireccional con clave de tu dirección IP): hasta 1 día (hasta 7 días en las copias de seguridad de la base de datos)</li>' +
          '<li>Hashes de direcciones de correo (un hash unidireccional con clave que no permite recuperar la dirección): se conservan incluso después de eliminar la cuenta para evitar pruebas gratuitas repetidas y el abuso de las recompensas por referidos</li>' +
          '</ul>' +
          '<p>Tu fecha y hora de nacimiento; el texto que escribes en la función "Historia de Hoy" y su respuesta; las notas que ingresas en la compatibilidad compartida o la compatibilidad detallada para distinguir a las personas; los nombres que ingresas en la compatibilidad detallada; el texto libre que envías para una lectura de Año Nuevo Lunar; y el cuerpo de los mensajes de tus conversaciones con Soporte (tanto tus mensajes como nuestras respuestas) se almacenan cifrados (AES-256). El asunto de una consulta de Soporte se almacena sin cifrar para poder mostrarlo en la lista de consultas. Los resultados calculados (día maestro, rama del mes, rama de la hora) no son identificables por sí solos, por lo que los almacenamos sin cifrar.</p>' +
          '<p>Cuando la ley exige una retención más larga (por ejemplo, registros de pago), conservamos esos datos solo durante el período legalmente requerido antes de eliminarlos.</p>',
      },
      {
        heading: '4. Terceros con los que compartimos datos',
        html:
          '<p>Compartimos datos con los siguientes terceros solo en la medida necesaria para prestar el servicio:</p>' +
          '<ul>' +
          '<li><strong>Firebase / Google Analytics (Google)</strong>: autenticación, notificaciones push y análisis de uso tanto de la app (Google Analytics for Firebase, solo en compilaciones de producción) como de este sitio de marketing (un flujo web independiente en la misma propiedad de GA4). Las notificaciones push se entregan a través de FCM y pueden verse en la pantalla de bloqueo. Las notificaciones de respuestas de "Historia de Hoy", de respuestas a tus consultas de soporte y de orientación en situaciones de crisis, la notificación de la mañana del día en que recibes una carta personalizada a partir de tu "Historia de Hoy" del día anterior y los avisos de que una carta semanal o de fin de mes está lista solo contienen un texto fijo y genérico. La notificación de una carta diaria normal (no personalizada) puede mostrar la primera frase de la carta como vista previa, la de una carta de aniversario puede mostrar su título y la de un resultado de compatibilidad puede mostrar los nombres que ingresaron las dos personas</li>' +
          '<li><strong>Google Cloud</strong>: alojamiento de nuestros servidores, bases de datos, gestión de claves de cifrado y registros del servidor</li>' +
          '<li><strong>RevenueCat</strong>: gestión del estado de la suscripción (el pago real se procesa a través de Google Play Billing; nosotros no almacenamos tu tarjeta ni los datos de pago)</li>' +
          '<li><strong>Nuestro proveedor de contenido de IA</strong> (actualmente OpenAI; puede ser Anthropic o Google según la configuración): genera el texto de tus cartas, las respuestas de "Historia de Hoy" y los resultados de la compatibilidad detallada, así como las lecturas de Año Nuevo Lunar en nuestro sitio de marketing (saju-letter.com). Esto puede incluir tus valores de saju calculados, el texto que escribes en la función "Historia de Hoy", y el nombre y el texto libre que envías para una lectura de Año Nuevo Lunar. En la compatibilidad detallada solo se comparten los valores de saju calculados de las dos personas, no sus nombres. El mini demo de inicio no llama a la IA cuando lo envías: muestra una carta que generamos de antemano, así que lo que ingresas allí no se envía al proveedor de IA.</li>' +
          '<li><strong>Anthropic</strong>: nos ayuda a redactar borradores de respuesta a tus consultas de soporte y a elaborar estadísticas semanales de los temas de las consultas recientes para mejorar el servicio. Para los borradores, se pueden compartir el asunto, los mensajes y la conversación de una consulta pendiente de respuesta, y una persona del equipo siempre revisa y envía cada respuesta. Para las estadísticas de temas, solo se comparten los asuntos de las consultas recientes (incluidas las ya respondidas). En estas tareas no se comparten el correo electrónico ni el nombre de tu cuenta, la fecha y hora de nacimiento registradas en tu cuenta ni tus entradas de "Historia de Hoy" (aunque lo que se escriba directamente en la conversación de una consulta —por ti o por nuestro equipo— se comparte tal cual).</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: prevención de bots y spam en los formularios públicos de nuestro sitio de marketing (tu información del navegador y tu dirección IP se envían a Cloudflare para la verificación mientras el widget está activo)</li>' +
          '<li><strong>Resend</strong>: envío de correos de marketing y de resultados de Año Nuevo Lunar</li>' +
          '<li><strong>Sentry</strong>: monitoreo de errores y fallos (solo recibe datos de diagnóstico de errores, no el contenido de tus solicitudes, como el texto que ingresas)</li>' +
          '<li><strong>Slack</strong>: alertas operativas internas (solo contienen información operativa, como identificadores de miembros; nunca lo que escribes ni el contenido de tus consultas)</li>' +
          '</ul>',
      },
      {
        heading: '5. La función de compatibilidad compartida y los datos de no miembros (invitados)',
        html:
          '<p>Un amigo que abre un enlace de compatibilidad que compartes no necesita crear una cuenta — solo ' +
          'ingresa su nombre y fecha de nacimiento. La carta saju se calcula por completo en su propio dispositivo ' +
          'o navegador. Almacenamos los tallos celestiales y ramas terrestres resultantes (pilares de año, mes y ' +
          'día) junto con el nombre que ingresa. También recibimos su fecha de nacimiento gregoriana (año, mes, ' +
          'día) solo para confirmar que tiene 16 años o más, y no almacenamos esa fecha. El nombre se usa únicamente ' +
          'para mostrarlo en la pantalla de resultados, no se usa para ningún otro propósito y se elimina 1 año después de ' +
          'completarse el resultado de compatibilidad.</p>',
      },
      {
        heading: '6. Tus derechos',
        html:
          '<p>Puedes eliminar tu cuenta tú mismo en cualquier momento desde la pantalla de Configuración de la ' +
          'app. Al eliminar tu cuenta, la información identificable (nombre, correo electrónico, género, fecha ' +
          'y hora de nacimiento) se reemplaza de inmediato por valores anonimizados y se cierra tu sesión de ' +
          'forma permanente, y se cancela la renovación automática si tienes una suscripción activa — pero no ' +
          'se reembolsará el tiempo restante ya pagado. Si solo quieres detener los próximos cobros mientras ' +
          'sigues usando la app, puedes cancelar únicamente tu suscripción desde la pantalla de Configuración ' +
          'en lugar de eliminar tu cuenta. Si ya no deseas recibir correos de marketing, puedes darte de baja ' +
          'en cualquier momento usando el enlace de cancelación al final de cada correo. Cuando una suscripción ' +
          'cancelada llega al final del período ya pagado, tu cuenta pasa al plan gratuito y las funciones de ' +
          'suscripción quedan bloqueadas de nuevo. Para cualquier otra ' +
          'solicitud — como acceder o corregir tu información — contáctanos usando los datos a continuación.</p>',
      },
      {
        heading: '7. Medidas de seguridad',
        html:
          '<ul>' +
          '<li>La información sensible — incluyendo la fecha y hora de nacimiento, el texto y las respuestas de "Historia de Hoy", las notas de compatibilidad/compatibilidad detallada, los nombres de la compatibilidad detallada, el texto libre de Año Nuevo Lunar y el cuerpo de los mensajes de Soporte — se almacena usando cifrado AES-256 (el asunto de las consultas de Soporte no se cifra para poder mostrarlo en listas)</li>' +
          '<li>Las claves de cifrado se gestionan mediante un servicio dedicado de gestión de claves (KMS) y nunca se codifican directamente en el código</li>' +
          '<li>El acceso al panel de administración requiere autenticación independiente</li>' +
          '</ul>',
      },
      {
        heading: '8. Privacidad de menores',
        html:
          '<p>Este servicio está destinado a usuarios de 16 años o más. Lo verificamos usando la fecha de ' +
          'nacimiento gregoriana que proporcionas durante el proceso de incorporación de la app y al enviar ' +
          'páginas públicas (compatibilidad compartida, el demo de inicio y Año Nuevo Lunar). Las fechas de ' +
          'nacimiento enviadas solo para esa comprobación de edad en páginas públicas no se almacenan. No ' +
          'recopilamos intencionalmente información personal de menores de 16 años. Si llegamos a saber que un ' +
          'menor de 16 años ha usado el servicio, tomaremos las medidas adecuadas para eliminar la información ' +
          'correspondiente sin demora.</p>',
      },
      {
        heading: '9. Contáctanos',
        html: `<p>Para preguntas relacionadas con la privacidad o solicitudes de acceso, corrección o eliminación de tu información, contáctanos en:</p><p>Correo electrónico: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. Cambios en esta política',
        html:
          '<p>Esta política entra en vigencia el 29 de julio de 2026 y puede actualizarse a medida que cambien ' +
          'nuestras prácticas, las leyes aplicables o el propio servicio (última actualización: 7 de octubre ' +
          'de 2026). Te notificaremos sobre cambios importantes a través de la app o esta página.</p>',
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    effectiveDate: 'Data de vigência: 29 de julho de 2026 (última atualização: 7 de outubro de 2026)',
    intro:
      'O Saju Letter ("nós" ou "o Serviço") respeita sua privacidade e se compromete a proteger suas ' +
      'informações pessoais. Esta Política de Privacidade explica quais informações coletamos e como as usamos ' +
      'quando você utiliza o aplicativo Saju Letter e o saju-letter.com (nosso site de marketing, as páginas ' +
      'públicas de compatibilidade e Ano Novo Lunar, e o cadastro por e-mail).',
    sections: [
      {
        heading: '1. Informações que coletamos',
        html:
          '<ul>' +
          '<li>Fornecidas por você: nome (ou apelido), data de nascimento, gênero (opcional), fuso horário do dispositivo</li>' +
          '<li>Opcional: horário de nascimento (você pode escolher "desconhecido"), endereço de e-mail (obrigatório se você se cadastrar com e-mail; se você entrar com uma conta Google, recebemos o e-mail dessa conta. Usado para login e gerenciamento da conta, recuperação da conta e verificação, conferir a elegibilidade para recompensas de indicação, emitir cupons de marketing se você se inscrever nos nossos e-mails, prevenir abuso do teste gratuito e responder a solicitações de suporte), uma nota que você insere na compatibilidade compartilhada ou na compatibilidade detalhada para diferenciar as pessoas (nunca é exibida para a outra pessoa)</li>' +
          '<li>Programa de indicação: um código de indicação atribuído automaticamente à sua conta e, se você inseriu o código de indicação de outro membro ao se cadastrar, um registro vinculando sua conta a esse membro</li>' +
          '<li>Compatibilidade detalhada: os nomes das duas pessoas que você insere e as informações de saju calculadas delas (incluindo as da outra pessoa), que guardamos para mostrar o resultado. Os nomes são armazenados com criptografia, nunca são enviados ao provedor de IA e são excluídos quando você exclui sua conta</li>' +
          '<li>Coletadas automaticamente: identificador de autenticação do Firebase (UID), token de notificações push do dispositivo (FCM), eventos de análise de uso do app coletados apenas em builds de produção (Google Analytics for Firebase — inclui o método de login no evento de cadastro; não usamos o ID de publicidade para fins de publicidade), eventos de análise de uso da web coletados ao visitar este site de marketing (Google Analytics — cliques no botão de download do app, envios do formulário de cadastro, visualização de um resultado de compatibilidade, uso da prévia gratuita; não incluímos dados identificáveis como e-mail, nome, data de nascimento ou o token do link de compatibilidade nesses eventos. Ao tocar no botão de download, apenas o canal pelo qual você chegou a este site (por exemplo, "tiktok") é repassado ao Google Play; essa etiqueta fica guardada no seu navegador por até 30 dias somente se você aceitar os cookies de análise. Os cookies de análise só são usados com o seu consentimento, que você pode alterar ou retirar a qualquer momento em "Configurações de cookies", no fim de cada página), um cookie funcional guardado apenas no navegador em que uma leitura de Ano Novo Lunar foi criada (um valor aleatório que permite que só quem criou a leitura se inscreva na série de e-mails; guardado por até 90 dias, nunca usado para publicidade ou análise, e você pode apagá-lo a qualquer momento nas configurações do navegador), status de assinatura/compra (via RevenueCat), sinais de integridade do dispositivo do Google Play Integrity usados para prevenir abuso do teste gratuito, dados de diagnóstico de erros/falhas, seu endereço IP ao usar as páginas públicas e outras partes do serviço (usado apenas para limitar a frequência de solicitações e prevenir abusos; nunca guardamos o endereço IP em si no nosso banco de dados, apenas um hash unidirecional com chave que não permite recuperá-lo, por no máximo 1 dia), os registros de solicitações que nossos servidores web mantêm quando você usa o serviço (incluem o endereço IP, o horário e o endereço solicitado; guardados por até 30 dias), e informações do navegador e seu endereço IP enviados ao Cloudflare enquanto o widget de proteção contra bots Cloudflare Turnstile está ativo nos formulários públicos do nosso site de marketing (demo da home, compatibilidade compartilhada, cadastro de contato e Ano Novo Lunar)</li>' +
          '<li>Cálculos de personalização: seu mapa saju completo (os quatro pilares: ano, mês, dia e hora), calculado a partir da data e hora de nascimento que você fornece durante o processo de integração — usado para personalizar as cartas semanais e mensais</li>' +
          '<li>Conteúdo que você escreve: o texto livre inserido no recurso "História de Hoje", que é enviado a um provedor de IA para gerar uma resposta personalizada; e o assunto e a mensagem que você insere ao entrar em contato com o Suporte</li>' +
          '<li>Coletadas quando você usa nosso site de marketing (saju-letter.com): o endereço de e-mail fornecido ao se cadastrar, junto com se e quando você consentiu em receber e-mails de marketing; e, se você enviar o demo da home, a compatibilidade compartilhada ou as páginas públicas de Ano Novo Lunar, o nome (quando aplicável), as informações de saju calculadas e o texto livre que você insere. Enviamos sua data de nascimento gregoriana (ano, mês, dia) apenas para confirmar que você tem 16 anos ou mais e não a armazenamos; o mapa em si é calculado no seu dispositivo</li>' +
          '</ul>',
      },
      {
        heading: '2. Como usamos suas informações',
        html:
          '<ul>' +
          '<li>Para identificar sua conta e fornecer o serviço (calcular suas informações de saju e gerar/enviar cartas diárias, semanais e mensais)</li>' +
          '<li>Para enviar notificações push</li>' +
          '<li>Para processar pagamentos de assinatura, conceder o teste gratuito e as recompensas de indicação, e prevenir abusos</li>' +
          '<li>Para gerar uma resposta personalizada no recurso "História de Hoje"</li>' +
          '<li>Para responder a solicitações de suporte</li>' +
          '<li>Para enviar e-mails de marketing (apenas para usuários que deram consentimento explícito) e gerar leituras de Ano Novo Lunar</li>' +
          '<li>Para analisar o uso, melhorar o serviço, responder a erros e prevenir abusos (bots/spam)</li>' +
          '</ul>',
      },
      {
        heading: '3. Período de retenção',
        html:
          '<p>Excluímos suas informações imediatamente quando você encerra sua conta ou quando recebemos uma solicitação de exclusão — não há período de carência adicional nem atraso. Os backups do banco de dados são mantidos por no máximo 7 dias e depois excluídos, então as informações apagadas quando você exclui sua conta também desaparecem dos backups dentro desse prazo.</p>' +
          '<p>As demais informações são excluídas depois dos prazos abaixo:</p>' +
          '<ul>' +
          '<li>Endereços de e-mail descadastrados dos nossos e-mails de marketing (o cadastro por e-mail da página inicial e a série de e-mails de Ano Novo Lunar): 30 dias após o descadastramento</li>' +
          '<li>Dados das leituras de Ano Novo Lunar (nome, texto que você escreveu e dados da inscrição por e-mail): 1 ano após o fim da campanha daquele ano (um endereço de e-mail descadastrado é excluído antes, conforme a regra acima)</li>' +
          '<li>Nomes inseridos por amigos (convidados) na compatibilidade compartilhada: 1 ano após a conclusão do resultado de compatibilidade</li>' +
          '<li>Registros do que os administradores consultam e alteram: 1 ano</li>' +
          '<li>Registros de alertas operacionais: 180 dias após serem resolvidos (os que continuam abertos são mantidos até serem tratados)</li>' +
          '<li>Rascunhos escritos pelo nosso assistente de operações com IA (rascunhos de resposta ao suporte e relatórios): 180 dias após serem aceitos, rejeitados ou decididos de outra forma (os que aguardam uma decisão são mantidos até lá)</li>' +
          '<li>Registros de solicitações dos servidores web (incluindo endereços IP, guardados no registro do Google Cloud): até 30 dias</li>' +
          '<li>Registros de limite de frequência (um hash unidirecional com chave do seu endereço IP): até 1 dia (até 7 dias nos backups do banco de dados)</li>' +
          '<li>Hashes de endereços de e-mail (um hash unidirecional com chave, que não permite recuperar o endereço): mantidos mesmo após a exclusão da conta para evitar testes gratuitos repetidos e abuso das recompensas de indicação</li>' +
          '</ul>' +
          '<p>Sua data e horário de nascimento; o texto que você escreve no recurso "História de Hoje" e sua resposta; as notas que você insere na compatibilidade compartilhada ou na compatibilidade detalhada para diferenciar as pessoas; os nomes que você insere na compatibilidade detalhada; o texto livre que você envia para uma leitura de Ano Novo Lunar; e o corpo das mensagens das suas conversas com o Suporte (tanto as suas mensagens quanto as nossas respostas) são armazenados de forma criptografada (AES-256). O assunto de uma solicitação de Suporte é armazenado sem criptografia para que possa ser exibido na lista de solicitações. Os resultados calculados (dia mestre, ramo do mês, ramo da hora) não são identificáveis por si só, portanto os armazenamos sem criptografia.</p>' +
          '<p>Quando a lei exige uma retenção mais longa (por exemplo, registros de pagamento), mantemos esses dados apenas pelo período legalmente exigido antes de excluí-los.</p>',
      },
      {
        heading: '4. Terceiros com quem compartilhamos dados',
        html:
          '<p>Compartilhamos dados com os seguintes terceiros apenas na medida necessária para fornecer o serviço:</p>' +
          '<ul>' +
          '<li><strong>Firebase / Google Analytics (Google)</strong>: autenticação, notificações push e análise de uso tanto do app (Google Analytics for Firebase, apenas em builds de produção) quanto deste site de marketing (um fluxo web separado na mesma propriedade do GA4). As notificações push são entregues pelo FCM e podem aparecer na tela de bloqueio. As notificações de respostas de "História de Hoje", de respostas às suas solicitações de suporte e de orientação em situações de crise, a notificação da manhã do dia em que você recebe uma carta personalizada a partir da sua "História de Hoje" do dia anterior e os avisos de que uma carta semanal ou de fim de mês está pronta contêm apenas um texto fixo e genérico. A notificação de uma carta diária comum (não personalizada) pode mostrar a primeira frase da carta como prévia, a de uma carta comemorativa pode mostrar o título dela e a de um resultado de compatibilidade pode mostrar os nomes que as duas pessoas inseriram</li>' +
          '<li><strong>Google Cloud</strong>: hospedagem dos nossos servidores, bancos de dados, gerenciamento de chaves de criptografia e registros do servidor</li>' +
          '<li><strong>RevenueCat</strong>: gerenciamento do status da assinatura (o pagamento real é processado pelo Google Play Billing; não armazenamos seu cartão nem dados de pagamento)</li>' +
          '<li><strong>Nosso provedor de conteúdo de IA</strong> (atualmente OpenAI; pode ser Anthropic ou Google dependendo da configuração): gera o texto das suas cartas, das respostas de "História de Hoje" e dos resultados da compatibilidade detalhada, bem como as leituras de Ano Novo Lunar em nosso site de marketing (saju-letter.com). Isso pode incluir seus valores de saju calculados, o texto que você escreve no recurso "História de Hoje", e o nome e o texto livre que você envia para uma leitura de Ano Novo Lunar. Na compatibilidade detalhada, apenas os valores de saju calculados das duas pessoas são compartilhados, não os nomes. O mini demo da home não chama a IA quando você o envia: ele mostra uma carta que geramos com antecedência, então o que você insere ali não é enviado ao provedor de IA.</li>' +
          '<li><strong>Anthropic</strong>: nos ajuda a redigir rascunhos de resposta às suas solicitações de suporte e a elaborar estatísticas semanais dos temas das solicitações recentes para melhorar o serviço. Para os rascunhos, o assunto, as mensagens e a conversa de uma solicitação aguardando resposta podem ser compartilhados, e uma pessoa da equipe sempre revisa e envia cada resposta. Para as estatísticas de temas, apenas os assuntos das solicitações recentes (incluindo as já respondidas) são compartilhados. Nessas tarefas, o e-mail e o nome da sua conta, a data e hora de nascimento cadastradas na sua conta e suas entradas de "História de Hoje" não são compartilhados (mas o que for escrito diretamente na conversa de uma solicitação — por você ou pela nossa equipe — é compartilhado como está).</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: prevenção de bots e spam nos formulários públicos do nosso site de marketing (suas informações do navegador e seu endereço IP são enviados ao Cloudflare para verificação enquanto o widget está ativo)</li>' +
          '<li><strong>Resend</strong>: envio de e-mails de marketing e de resultados de Ano Novo Lunar</li>' +
          '<li><strong>Sentry</strong>: monitoramento de erros e falhas (recebe apenas dados de diagnóstico de erros, não o conteúdo das suas solicitações, como o texto que você insere)</li>' +
          '<li><strong>Slack</strong>: alertas operacionais internos (contêm apenas informações operacionais, como identificadores de membros — nunca o que você escreve nem o conteúdo das suas solicitações)</li>' +
          '</ul>',
      },
      {
        heading: '5. O recurso de compatibilidade compartilhada e dados de não membros (convidados)',
        html:
          '<p>Um amigo que abre um link de compatibilidade que você compartilha não precisa criar uma conta — ' +
          'ele só precisa inserir o nome e a data de nascimento. O mapa saju é calculado inteiramente no próprio ' +
          'dispositivo ou navegador. Armazenamos os troncos celestiais e ramos terrestres resultantes (pilares de ' +
          'ano, mês e dia) junto com o nome inserido. Também recebemos a data de nascimento gregoriana (ano, mês, ' +
          'dia) apenas para confirmar que a pessoa tem 16 anos ou mais, e não armazenamos essa data. O nome inserido ' +
          'é usado apenas para exibição na tela de resultado, não é usado para nenhum outro fim e é excluído 1 ano após a ' +
          'conclusão do resultado de compatibilidade.</p>',
      },
      {
        heading: '6. Seus direitos',
        html:
          '<p>Você pode excluir sua conta a qualquer momento na tela de Configurações do aplicativo. Ao excluir ' +
          'sua conta, informações identificáveis (nome, e-mail, gênero, data e horário de nascimento) são ' +
          'imediatamente substituídas por valores anonimizados e sua sessão é encerrada permanentemente, e a ' +
          'renovação automática é cancelada caso você tenha uma assinatura ativa — mas o período restante já ' +
          'pago não será reembolsado. Se você só quer parar as próximas cobranças enquanto continua usando o ' +
          'app, pode cancelar apenas sua assinatura na tela de Configurações em vez de excluir sua conta. Se ' +
          'não quiser mais receber e-mails de marketing, você pode cancelar a inscrição a qualquer momento ' +
          'usando o link no rodapé de cada e-mail. Quando uma assinatura cancelada chega ao fim do período já ' +
          'pago, sua conta passa para o plano gratuito e os recursos de assinatura ficam bloqueados novamente. ' +
          'Para qualquer outra solicitação — como acessar ou corrigir ' +
          'suas informações — entre em contato conosco usando as informações abaixo.</p>',
      },
      {
        heading: '7. Medidas de segurança',
        html:
          '<ul>' +
          '<li>Informações sensíveis — incluindo data e horário de nascimento, texto e respostas de "História de Hoje", notas de compatibilidade/compatibilidade detalhada, nomes da compatibilidade detalhada, texto livre de Ano Novo Lunar e o corpo das mensagens do Suporte — são armazenadas com criptografia AES-256 (o assunto das solicitações de Suporte não é criptografado, para que possa ser exibido em listas)</li>' +
          '<li>As chaves de criptografia são gerenciadas por um serviço dedicado de gerenciamento de chaves (KMS) e nunca ficam fixas no código</li>' +
          '<li>O acesso ao painel administrativo exige autenticação separada</li>' +
          '</ul>',
      },
      {
        heading: '8. Privacidade de menores',
        html:
          '<p>Este serviço é destinado a usuários com 16 anos ou mais. Verificamos isso usando a data de ' +
          'nascimento gregoriana fornecida durante o processo de integração do aplicativo e ao enviar páginas ' +
          'públicas (compatibilidade compartilhada, o demo da home e Ano Novo Lunar). As datas de nascimento ' +
          'enviadas apenas para essa verificação de idade em páginas públicas não são armazenadas. Não coletamos ' +
          'intencionalmente informações pessoais de menores de 16 anos. Se tomarmos conhecimento de que um menor ' +
          'de 16 anos usou o serviço, tomaremos as medidas adequadas para excluir as informações relevantes ' +
          'prontamente.</p>',
      },
      {
        heading: '9. Fale conosco',
        html: `<p>Para dúvidas relacionadas à privacidade ou solicitações de acesso, correção ou exclusão de suas informações, entre em contato pelo e-mail:</p><p>E-mail: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. Alterações nesta política',
        html:
          '<p>Esta política entra em vigor em 29 de julho de 2026 e pode ser atualizada conforme nossas ' +
          'práticas, as leis aplicáveis ou o próprio serviço mudarem (última atualização: 7 de outubro de ' +
          '2026). Notificaremos você sobre alterações relevantes por meio do aplicativo ou desta página.</p>',
      },
    ],
  },
  vi: {
    title: 'Chính sách Quyền riêng tư',
    effectiveDate: 'Ngày hiệu lực: 29 tháng 7 năm 2026 (cập nhật lần cuối: 7 tháng 10 năm 2026)',
    intro:
      'Saju Letter ("chúng tôi" hoặc "Dịch vụ") tôn trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá ' +
      'nhân của bạn. Chính sách Quyền riêng tư này giải thích thông tin nào chúng tôi thu thập và cách chúng ' +
      'tôi sử dụng khi bạn dùng ứng dụng Saju Letter và saju-letter.com (trang web tiếp thị của chúng tôi, các ' +
      'trang công khai về mức độ hợp nhau và Tết Nguyên Đán, và đăng ký nhận email).',
    sections: [
      {
        heading: '1. Thông tin chúng tôi thu thập',
        html:
          '<ul>' +
          '<li>Do bạn cung cấp: tên (hoặc biệt danh), ngày sinh, giới tính (không bắt buộc), múi giờ thiết bị</li>' +
          '<li>Tùy chọn: giờ sinh (bạn có thể chọn "không rõ"), địa chỉ email (bắt buộc nếu bạn đăng ký bằng email; nếu bạn đăng nhập bằng tài khoản Google, chúng tôi nhận địa chỉ email của tài khoản đó. Dùng để đăng nhập và quản lý tài khoản, khôi phục tài khoản và xác minh, kiểm tra điều kiện nhận ưu đãi giới thiệu bạn bè, cấp mã ưu đãi tiếp thị nếu bạn đăng ký nhận email, ngăn chặn lạm dụng bản dùng thử miễn phí và phản hồi yêu cầu hỗ trợ), ghi chú bạn nhập trong tính năng chia sẻ mức độ hợp nhau hoặc xem mức độ hợp nhau chi tiết để phân biệt mọi người (không bao giờ hiển thị cho người kia)</li>' +
          '<li>Tính năng giới thiệu bạn bè: mã giới thiệu được tự động gán cho tài khoản của bạn, và nếu bạn nhập mã giới thiệu của thành viên khác khi đăng ký, thông tin liên kết tài khoản của bạn với thành viên đó</li>' +
          '<li>Xem mức độ hợp nhau chi tiết: tên của hai người bạn nhập và thông tin saju đã tính toán của họ (bao gồm cả của người kia), được lưu để hiển thị kết quả cho bạn. Tên được lưu ở dạng mã hóa, không bao giờ được gửi đến nhà cung cấp AI và sẽ bị xóa khi bạn xóa tài khoản</li>' +
          '<li>Thu thập tự động: mã định danh xác thực Firebase (UID), token thông báo đẩy của thiết bị (FCM), sự kiện phân tích sử dụng ứng dụng chỉ thu thập trên bản dựng production (Google Analytics for Firebase — bao gồm phương thức đăng nhập trong sự kiện đăng ký; chúng tôi không dùng mã nhận dạng quảng cáo cho mục đích quảng cáo), sự kiện phân tích sử dụng web thu thập khi bạn truy cập trang tiếp thị này (Google Analytics — nhấp vào nút tải ứng dụng, gửi biểu mẫu đăng ký nhận tin, xem kết quả mức độ hợp nhau, dùng bản xem trước miễn phí; chúng tôi không đưa dữ liệu định danh như email, tên, ngày sinh hay token liên kết mức độ hợp nhau vào các sự kiện này. Khi bạn nhấn nút tải ứng dụng, chỉ kênh đã đưa bạn đến trang này (ví dụ "tiktok") được chuyển cho Google Play; nhãn kênh đó chỉ được lưu trong trình duyệt tối đa 30 ngày nếu bạn đồng ý cookie phân tích. Cookie phân tích chỉ được dùng khi bạn đồng ý, và bạn có thể thay đổi hoặc rút lại sự đồng ý bất cứ lúc nào tại "Cài đặt cookie" ở cuối mỗi trang), một cookie chức năng chỉ được lưu trên trình duyệt đã tạo bài đọc Tết Nguyên Đán (một giá trị ngẫu nhiên giúp chỉ người tạo bài đọc mới đăng ký được chuỗi email; lưu tối đa 90 ngày, không dùng cho quảng cáo hay phân tích, và bạn có thể xóa bất cứ lúc nào trong cài đặt trình duyệt), trạng thái đăng ký/mua hàng (qua RevenueCat), tín hiệu toàn vẹn thiết bị từ Google Play Integrity dùng để ngăn chặn lạm dụng bản dùng thử miễn phí, dữ liệu chẩn đoán lỗi/sự cố, địa chỉ IP của bạn khi dùng các trang công khai và các phần khác của dịch vụ (chỉ dùng để giới hạn tần suất yêu cầu nhằm ngăn lạm dụng; chúng tôi không lưu chính địa chỉ IP vào cơ sở dữ liệu, mà chỉ lưu giá trị băm một chiều có khóa không thể khôi phục lại địa chỉ, tối đa 1 ngày), nhật ký yêu cầu mà máy chủ web lưu lại khi bạn dùng dịch vụ (gồm địa chỉ IP, thời gian và địa chỉ được yêu cầu; lưu tối đa 30 ngày), cùng với thông tin trình duyệt và địa chỉ IP của bạn được gửi đến Cloudflare khi tiện ích chống bot Cloudflare Turnstile đang hoạt động trên các biểu mẫu công khai của trang web tiếp thị (bản demo trang chủ, chia sẻ mức độ hợp nhau, đăng ký nhận tin và Tết Nguyên Đán)</li>' +
          '<li>Kết quả tính toán cá nhân hóa: toàn bộ lá số saju của bạn (tứ trụ: năm, tháng, ngày, giờ), được tính toán từ ngày và giờ sinh bạn cung cấp trong quá trình thiết lập ban đầu — dùng để cá nhân hóa thư hằng tuần và hằng tháng</li>' +
          '<li>Nội dung bạn viết: văn bản tự do bạn nhập trong tính năng "Câu Chuyện Hôm Nay", được gửi đến nhà cung cấp AI để tạo phản hồi cá nhân hóa; và tiêu đề, nội dung bạn nhập khi liên hệ Hỗ trợ</li>' +
          '<li>Thu thập khi bạn dùng trang web tiếp thị của chúng tôi (saju-letter.com): địa chỉ email bạn cung cấp khi đăng ký, cùng với việc bạn có đồng ý nhận email tiếp thị hay không và thời điểm đồng ý; và nếu bạn gửi bản demo trang chủ, chia sẻ mức độ hợp nhau hoặc các trang Tết Nguyên Đán công khai, tên (nếu có), thông tin saju đã tính toán và văn bản tự do bạn nhập. Chúng tôi gửi ngày sinh dương lịch (năm, tháng, ngày) chỉ để xác nhận bạn từ 16 tuổi trở lên và không lưu trữ; bản thân lá số được tính trên thiết bị của bạn</li>' +
          '</ul>',
      },
      {
        heading: '2. Cách chúng tôi sử dụng thông tin của bạn',
        html:
          '<ul>' +
          '<li>Để xác định tài khoản của bạn và cung cấp dịch vụ (tính toán thông tin saju và tạo/gửi thư hằng ngày, hằng tuần, hằng tháng)</li>' +
          '<li>Để gửi thông báo đẩy</li>' +
          '<li>Để xử lý thanh toán đăng ký, cấp bản dùng thử miễn phí và ưu đãi giới thiệu bạn bè, và ngăn chặn lạm dụng</li>' +
          '<li>Để tạo phản hồi cá nhân hóa trong tính năng "Câu Chuyện Hôm Nay"</li>' +
          '<li>Để phản hồi các yêu cầu hỗ trợ khách hàng</li>' +
          '<li>Để gửi email tiếp thị (chỉ cho người dùng đã đồng ý rõ ràng) và tạo bài đọc Tết Nguyên Đán</li>' +
          '<li>Để phân tích việc sử dụng, cải thiện dịch vụ, xử lý lỗi và ngăn chặn lạm dụng (bot/spam)</li>' +
          '</ul>',
      },
      {
        heading: '3. Thời gian lưu trữ',
        html:
          '<p>Chúng tôi xóa thông tin của bạn ngay lập tức khi bạn đóng tài khoản hoặc khi nhận được yêu cầu xóa — không có thời gian gia hạn hoặc trì hoãn bổ sung. Bản sao lưu cơ sở dữ liệu được giữ tối đa 7 ngày rồi bị xóa, nên thông tin đã bị xóa khi bạn xóa tài khoản cũng sẽ biến mất khỏi bản sao lưu trong khoảng thời gian đó.</p>' +
          '<p>Các thông tin khác được xóa sau các thời hạn dưới đây:</p>' +
          '<ul>' +
          '<li>Địa chỉ email đã hủy đăng ký nhận email tiếp thị (đăng ký nhận email trên trang chủ và chuỗi email Tết Nguyên Đán): 30 ngày sau khi hủy đăng ký</li>' +
          '<li>Dữ liệu bài đọc Tết Nguyên Đán (tên, văn bản bạn đã viết và thông tin đăng ký nhận email): 1 năm sau khi chiến dịch của năm đó kết thúc (địa chỉ email đã hủy đăng ký sẽ bị xóa sớm hơn theo quy định ở trên)</li>' +
          '<li>Tên do bạn bè (khách) nhập trong tính năng chia sẻ mức độ hợp nhau: 1 năm sau khi kết quả hợp nhau được hoàn tất</li>' +
          '<li>Nhật ký những gì quản trị viên đã xem và thay đổi: 1 năm</li>' +
          '<li>Bản ghi cảnh báo vận hành: 180 ngày sau khi được xử lý xong (các mục chưa xử lý được giữ cho đến khi xử lý)</li>' +
          '<li>Bản nháp do trợ lý vận hành AI soạn (bản nháp trả lời yêu cầu hỗ trợ và báo cáo): 180 ngày sau khi được chấp nhận, từ chối hoặc có quyết định khác (bản nháp đang chờ quyết định được giữ cho đến lúc đó)</li>' +
          '<li>Nhật ký yêu cầu của máy chủ web (bao gồm địa chỉ IP, lưu trong hệ thống ghi nhật ký của Google Cloud): tối đa 30 ngày</li>' +
          '<li>Bản ghi giới hạn tần suất (giá trị băm một chiều có khóa của địa chỉ IP): tối đa 1 ngày (tối đa 7 ngày trong bản sao lưu cơ sở dữ liệu)</li>' +
          '<li>Giá trị băm của địa chỉ email (băm một chiều có khóa, không thể khôi phục lại địa chỉ): được giữ lại kể cả sau khi xóa tài khoản để ngăn việc dùng thử miễn phí lặp lại và lạm dụng ưu đãi giới thiệu</li>' +
          '</ul>' +
          '<p>Ngày sinh và giờ sinh của bạn; văn bản bạn viết trong tính năng "Câu Chuyện Hôm Nay" và phản hồi của nó; ghi chú bạn nhập trong tính năng hợp nhau để phân biệt mọi người; tên hai người bạn nhập khi xem mức độ hợp nhau chi tiết; văn bản tự do bạn gửi cho bài đọc Tết Nguyên Đán; và nội dung các tin nhắn trong cuộc trao đổi với bộ phận Hỗ trợ (cả tin nhắn của bạn lẫn câu trả lời của chúng tôi) đều được lưu trữ ở dạng mã hóa (AES-256). Tiêu đề của yêu cầu hỗ trợ được lưu trữ không mã hóa để có thể hiển thị trong danh sách yêu cầu. Các kết quả đã tính toán (thiên can ngày, địa chi tháng, địa chi giờ) tự thân không thể nhận dạng cá nhân, nên chúng tôi lưu trữ chúng mà không mã hóa.</p>' +
          '<p>Khi pháp luật yêu cầu lưu trữ lâu hơn (ví dụ: hồ sơ thanh toán), chúng tôi chỉ giữ dữ liệu đó trong thời gian pháp luật yêu cầu trước khi xóa.</p>',
      },
      {
        heading: '4. Bên thứ ba mà chúng tôi chia sẻ dữ liệu',
        html:
          '<p>Chúng tôi chỉ chia sẻ dữ liệu với các bên thứ ba sau trong phạm vi cần thiết để cung cấp dịch vụ:</p>' +
          '<ul>' +
          '<li><strong>Firebase / Google Analytics (Google)</strong>: xác thực, thông báo đẩy và phân tích sử dụng cho cả ứng dụng (Google Analytics for Firebase, chỉ thu thập trên bản dựng production) và trang tiếp thị này (một luồng web riêng trong cùng thuộc tính GA4). Thông báo đẩy được gửi qua FCM và có thể hiển thị trên màn hình khóa. Thông báo về phản hồi "Câu Chuyện Hôm Nay", câu trả lời cho yêu cầu hỗ trợ, hướng dẫn khi gặp khủng hoảng, thông báo buổi sáng vào ngày bạn nhận thư được cá nhân hóa từ "Câu Chuyện Hôm Nay" của ngày hôm trước, và thông báo thư hằng tuần hoặc thư cuối tháng đã sẵn sàng chỉ chứa nội dung thông báo chung cố định. Thông báo thư hằng ngày thông thường (không cá nhân hóa) có thể hiển thị câu đầu tiên của thư làm bản xem trước, thông báo thư kỷ niệm có thể hiển thị tiêu đề thư, và thông báo kết quả hợp nhau có thể hiển thị tên mà hai người đã nhập</li>' +
          '<li><strong>Google Cloud</strong>: vận hành máy chủ (lưu trữ), cơ sở dữ liệu, quản lý khóa mã hóa và lưu nhật ký máy chủ</li>' +
          '<li><strong>RevenueCat</strong>: quản lý trạng thái đăng ký (thanh toán thực tế được xử lý qua Google Play Billing; chúng tôi không tự lưu trữ thẻ hay thông tin thanh toán của bạn)</li>' +
          '<li><strong>Nhà cung cấp nội dung AI của chúng tôi</strong> (hiện tại là OpenAI; có thể là Anthropic hoặc Google tùy theo cấu hình): tạo nội dung câu chữ cho thư của bạn, các phản hồi trong tính năng "Câu Chuyện Hôm Nay" và kết quả mức độ hợp nhau chi tiết, cũng như các bài đọc Tết Nguyên Đán trên trang web tiếp thị của chúng tôi (saju-letter.com). Việc này có thể bao gồm các giá trị saju đã tính toán của bạn, văn bản bạn viết trong tính năng "Câu Chuyện Hôm Nay", và tên cùng văn bản tự do bạn gửi khi xem bài đọc Tết Nguyên Đán. Với mức độ hợp nhau chi tiết, chỉ các giá trị saju đã tính toán của hai người được chia sẻ, không bao gồm tên. Bản demo trang chủ không gọi AI khi bạn gửi mà hiển thị một lá thư chúng tôi đã tạo sẵn, nên thông tin bạn nhập ở đó không được gửi đến nhà cung cấp AI.</li>' +
          '<li><strong>Anthropic</strong>: hỗ trợ soạn bản nháp trả lời các yêu cầu hỗ trợ của bạn và lập thống kê hằng tuần về chủ đề của các yêu cầu hỗ trợ gần đây để cải thiện dịch vụ. Với bản nháp trả lời, tiêu đề, nội dung và cuộc trao đổi của một yêu cầu đang chờ trả lời có thể được chia sẻ, và nhân viên của chúng tôi luôn xem lại rồi tự gửi từng câu trả lời. Với thống kê chủ đề, chỉ tiêu đề của các yêu cầu gần đây (kể cả những yêu cầu đã được trả lời) được chia sẻ. Các công việc này không chia sẻ địa chỉ email và tên trong tài khoản, ngày giờ sinh đã đăng ký trong tài khoản hay các mục "Câu Chuyện Hôm Nay" của bạn (nhưng những gì được viết trực tiếp trong cuộc trao đổi của một yêu cầu — dù là bạn hay nhân viên của chúng tôi viết — vẫn được chia sẻ nguyên văn).</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: ngăn chặn bot và spam trên các biểu mẫu công khai của trang web tiếp thị (thông tin trình duyệt và địa chỉ IP của bạn được gửi đến Cloudflare để xác minh trong khi tiện ích đang hoạt động)</li>' +
          '<li><strong>Resend</strong>: gửi email tiếp thị và email kết quả Tết Nguyên Đán</li>' +
          '<li><strong>Sentry</strong>: giám sát lỗi và sự cố (chỉ nhận thông tin chẩn đoán lỗi, không nhận nội dung yêu cầu của bạn như văn bản bạn nhập)</li>' +
          '<li><strong>Slack</strong>: cảnh báo vận hành nội bộ (chỉ chứa thông tin vận hành như mã định danh thành viên — không bao giờ chứa nội dung bạn viết hay nội dung yêu cầu hỗ trợ của bạn)</li>' +
          '</ul>',
      },
      {
        heading: '5. Tính năng chia sẻ mức độ hợp nhau và dữ liệu của người không phải thành viên (khách)',
        html:
          '<p>Một người bạn mở liên kết hợp nhau mà bạn chia sẻ không cần tạo tài khoản — họ chỉ cần nhập tên ' +
          'và ngày sinh. Lá số saju được tính toán hoàn toàn trên thiết bị hoặc trình duyệt của chính họ. Chúng ' +
          'tôi lưu thiên can và địa chi kết quả (trụ năm, tháng và ngày) cùng với tên họ nhập. Chúng tôi cũng ' +
          'nhận ngày sinh dương lịch (năm, tháng, ngày) chỉ để xác nhận họ từ 16 tuổi trở lên, và không lưu ngày ' +
          'đó. Tên họ nhập chỉ được dùng để hiển thị trên màn hình kết quả, không được dùng cho mục đích nào khác và sẽ bị ' +
          'xóa 1 năm sau khi kết quả hợp nhau được hoàn tất.</p>',
      },
      {
        heading: '6. Quyền của bạn',
        html:
          '<p>Bạn có thể tự xóa tài khoản của mình bất cứ lúc nào từ màn hình Cài đặt của ứng dụng. Việc xóa ' +
          'tài khoản sẽ ngay lập tức thay thế thông tin nhận dạng (tên, email, giới tính, ngày và giờ sinh) ' +
          'bằng các giá trị ẩn danh và đăng xuất vĩnh viễn, đồng thời hủy gia hạn tự động nếu bạn đang có gói ' +
          'đăng ký đang hoạt động — nhưng thời gian còn lại đã thanh toán sẽ không được hoàn tiền. Nếu bạn chỉ ' +
          'muốn dừng các khoản thanh toán tiếp theo trong khi vẫn tiếp tục sử dụng ứng dụng, bạn có thể chỉ ' +
          'hủy gói đăng ký từ màn hình Cài đặt thay vì xóa tài khoản. Nếu bạn không muốn nhận email tiếp thị ' +
          'nữa, bạn có thể hủy đăng ký bất cứ lúc nào bằng liên kết ở cuối mỗi email. Khi gói đăng ký đã hủy ' +
          'hết thời gian đã thanh toán, tài khoản của bạn sẽ chuyển về gói miễn phí và các tính năng dành cho ' +
          'người đăng ký sẽ bị khóa lại. Với các yêu cầu khác — ' +
          'như truy cập hoặc chỉnh sửa thông tin của bạn — vui lòng liên hệ với chúng tôi theo thông tin bên dưới.</p>',
      },
      {
        heading: '7. Biện pháp bảo mật',
        html:
          '<ul>' +
          '<li>Thông tin nhạy cảm — bao gồm ngày sinh, giờ sinh, văn bản và phản hồi trong "Câu Chuyện Hôm Nay", ghi chú hợp nhau, tên trong tính năng hợp nhau chi tiết, văn bản tự do của Tết Nguyên Đán và nội dung tin nhắn Hỗ trợ — được lưu trữ bằng mã hóa AES-256 (tiêu đề yêu cầu hỗ trợ không được mã hóa để có thể hiển thị trong danh sách)</li>' +
          '<li>Khóa mã hóa được quản lý thông qua dịch vụ quản lý khóa chuyên dụng (KMS) và không bao giờ được viết cứng trong mã nguồn</li>' +
          '<li>Việc truy cập trang quản trị yêu cầu xác thực riêng biệt</li>' +
          '</ul>',
      },
      {
        heading: '8. Quyền riêng tư của trẻ em',
        html:
          '<p>Dịch vụ này dành cho người dùng từ 16 tuổi trở lên. Chúng tôi xác minh điều này bằng ngày sinh ' +
          'dương lịch bạn cung cấp trong quá trình thiết lập ứng dụng và khi gửi các trang công khai (chia sẻ ' +
          'mức độ hợp nhau, bản demo trang chủ và Tết Nguyên Đán). Ngày sinh gửi chỉ để kiểm tra độ tuổi trên ' +
          'các trang công khai không được lưu trữ. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới ' +
          '16 tuổi. Nếu biết được rằng một trẻ em dưới 16 tuổi đã sử dụng dịch vụ, chúng tôi sẽ thực hiện các ' +
          'biện pháp phù hợp để xóa thông tin liên quan kịp thời.</p>',
      },
      {
        heading: '9. Liên hệ với chúng tôi',
        html: `<p>Đối với các câu hỏi liên quan đến quyền riêng tư hoặc yêu cầu truy cập, chỉnh sửa hay xóa thông tin của bạn, vui lòng liên hệ với chúng tôi tại:</p><p>Email: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. Thay đổi đối với chính sách này',
        html:
          '<p>Chính sách này có hiệu lực từ ngày 29 tháng 7 năm 2026 và có thể được cập nhật khi các hoạt động ' +
          'của chúng tôi, luật hiện hành hoặc bản thân dịch vụ thay đổi (cập nhật lần cuối: 7 tháng 10 năm ' +
          '2026). Chúng tôi sẽ thông báo cho bạn về những thay đổi quan trọng thông qua ứng dụng hoặc trang này.</p>',
      },
    ],
  },
};
