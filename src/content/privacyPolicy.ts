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
    effectiveDate: '시행일자: 2026년 7월 29일 (최종 수정: 2026년 9월 3일)',
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
          '<li>선택 입력 정보: 출생 시간("모름" 선택 가능), 이메일 주소(무료체험 어뷰징 방지 목적으로만 사용), 궁합 공유·즉석 궁합 이용 시 상대를 구분하기 위해 입력하는 메모(상대방에게는 노출되지 않음)</li>' +
          '<li>자동으로 수집되는 정보: Firebase 인증 식별자(UID), 기기 푸시 토큰(FCM), 프로덕션 빌드에서만 수집되는 앱 이용 분석 이벤트(Google Analytics for Firebase — 가입 완료 시 로그인 수단 포함), 구독/결제 상태(RevenueCat 경유), 무료체험 남용 방지를 위한 Google Play Integrity 기기 무결성 신호, 오류·크래시 진단 정보, 공개(비로그인) 페이지 접속 시의 IP 주소(악용 방지를 위한 일시적 요청 빈도 제한 목적으로만 사용하며 장기 저장하지 않음), 마케팅 사이트의 공개 제출 폼(홈 미니 데모·궁합 공유·리드 등록·신년운세)에서 봇 방지를 위해 구동되는 Cloudflare Turnstile을 통해 Cloudflare로 전달되는 브라우저 정보</li>' +
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
          '<li>구독 결제 처리 및 무료체험 어뷰징 방지</li>' +
          '<li>"오늘의 이야기" 기능에 대한 개인화된 답장 생성</li>' +
          '<li>고객 문의 응대</li>' +
          '<li>마케팅 이메일 발송(명시적으로 동의한 이용자에 한함) 및 신년운세 리딩 생성</li>' +
          '<li>서비스 이용 현황 분석 및 품질 개선, 오류 대응, 부정 이용(봇·스팸) 방지</li>' +
          '</ul>',
      },
      {
        heading: '3. 개인정보의 보유 및 이용 기간',
        html:
          '<p>회원 탈퇴 또는 삭제 요청은 접수 즉시 처리되며, 별도의 유예 기간 없이 그 자리에서 파기 또는 익명화됩니다.</p>' +
          '<p>생년월일·출생시간, "오늘의 이야기" 기능에 입력한 텍스트와 답장, 궁합 공유·즉석 궁합에서 상대를 구분하기 위해 입력한 메모, 신년운세 제출 시 자유롭게 작성한 텍스트, "문의하기" 기능에 입력한 내용은 AES-256 방식으로 암호화해 저장하며, 계산 결과물(일간·월지·시지)은 개인 식별이 어려운 값으로 판단해 암호화 없이 저장합니다.</p>' +
          '<p>관계 법령상 일정 기간 보존이 필요한 정보(예: 결제 기록)는 해당 법령이 정한 기간 동안 보존 후 파기합니다.</p>',
      },
      {
        heading: '4. 개인정보의 제3자 제공 및 처리위탁',
        html:
          '<p>서비스 제공에 필요한 범위 내에서 아래 외부 업체에 개인정보 처리를 위탁하거나 제공합니다.</p>' +
          '<ul>' +
          '<li><strong>Firebase(Google)</strong>: 회원 인증, 푸시 알림 발송, 앱 이용 현황 분석(Google Analytics for Firebase, 프로덕션 빌드에서만 수집)</li>' +
          '<li><strong>RevenueCat</strong>: 구독 상태 확인 및 관리(실제 결제는 Google Play 빌링을 통해 처리되며, 카드 등 결제 수단 정보는 회사가 직접 보관하지 않습니다)</li>' +
          '<li><strong>AI 콘텐츠 생성 제공업체</strong>(현재 OpenAI, 설정에 따라 Anthropic 또는 Google로 달라질 수 있음): 편지 및 오늘의 이야기 답장의 문장 생성과, 마케팅 사이트(saju-letter.com)의 홈 미니 데모·신년운세 리딩 생성. 계산된 사주 정보, "오늘의 이야기" 기능에 직접 작성한 텍스트, 신년운세 제출 시 입력한 이름·자유 텍스트가 전달될 수 있습니다.</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: 마케팅 사이트 공개 제출 폼의 봇·스팸 방지(위젯이 구동되는 동안 방문자의 브라우저 정보가 Cloudflare로 전달됩니다)</li>' +
          '<li><strong>Resend</strong>: 마케팅 이메일 및 신년운세 결과 이메일 발송</li>' +
          '<li><strong>Sentry</strong>: 오류·크래시 모니터링</li>' +
          '</ul>',
      },
      {
        heading: '5. 궁합 공유 기능과 비회원(친구)의 정보',
        html:
          '<p>회원이 만든 공유 링크로 접속하는 친구(비회원)는 별도 회원가입 없이 이름과 생년월일만 입력하면 됩니다. ' +
          '사주 계산은 접속한 기기(브라우저 또는 앱) 안에서만 이뤄지며, 서버에는 계산된 천간·지지(연주·월주·일주)와 이름이 ' +
          '전송·저장됩니다. 만 16세 확인을 위해 양력 생년월일(년·월·일)을 함께 보내지만 저장하지는 않습니다. ' +
          '입력한 이름은 궁합 결과 화면 표시 목적으로만 사용되며 다른 목적으로 사용되지 않습니다.</p>',
      },
      {
        heading: '6. 이용자의 권리와 행사 방법',
        html:
          '<p>이용자는 앱의 설정 화면에서 언제든지 직접 회원 탈퇴를 신청할 수 있습니다. 탈퇴하면 이름·이메일·성별· ' +
          '생년월일시 등 식별 가능한 정보는 즉시 알아볼 수 없는 값으로 대체되고 다시 로그인할 수 없으며, 구독 ' +
          '중이었다면 자동 결제 갱신도 함께 취소되지만 남은 기간에 대한 환불은 되지 않습니다. 계속 이용하면서 ' +
          '결제만 멈추고 싶다면, 탈퇴 대신 앱의 설정 화면에서 구독만 별도로 취소할 수 있습니다. 마케팅 이메일 ' +
          '수신을 원하지 않으시면 각 이메일 하단의 수신거부 링크로 언제든지 거부하실 수 있습니다. 탈퇴 외에 ' +
          '개인정보 열람·정정 등을 원하시면 아래 연락처로 요청해 주십시오.</p>',
      },
      {
        heading: '7. 개인정보의 안전성 확보 조치',
        html:
          '<ul>' +
          '<li>생년월일·출생시간, "오늘의 이야기" 텍스트와 답장, 궁합·즉석 궁합의 메모, 신년운세 자유 작성 텍스트, 문의하기 내용 등 민감할 수 있는 정보는 AES-256 방식으로 암호화하여 저장</li>' +
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
          '수 있습니다(가장 최근 수정: 2026년 9월 3일). 변경 시 앱 공지 또는 본 페이지를 통해 고지합니다.</p>',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    effectiveDate: 'Effective date: July 29, 2026 (last updated: September 3, 2026)',
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
          '<li>Optional: birth time (you may choose "unknown"), email address (used only to prevent free-trial abuse), a note you enter in compatibility-sharing or deep compatibility to help you tell people apart (never shown to the other person)</li>' +
          '<li>Collected automatically: Firebase authentication identifier (UID), device push token (FCM), app-usage analytics events collected only in production builds (Google Analytics for Firebase — including the sign-in method on the sign-up event), subscription/purchase status (via RevenueCat), Google Play Integrity device-integrity signals used to prevent free-trial abuse, crash/error diagnostic data, and — only on public pages — your IP address, used briefly for abuse-prevention rate limiting and not stored long-term, plus browser information sent to Cloudflare while the Cloudflare Turnstile bot-protection widget is active on our marketing site\'s public submission forms (home demo, compatibility-sharing, lead sign-up, and Lunar New Year)</li>' +
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
          '<li>To process subscription payments and prevent free-trial abuse</li>' +
          '<li>To generate a personalized reply in the "Today\'s Story" feature</li>' +
          '<li>To respond to customer support inquiries</li>' +
          '<li>To send marketing emails (only to users who have explicitly opted in) and to generate Lunar New Year readings</li>' +
          '<li>To analyze usage, improve the service, respond to errors, and prevent abuse (bots/spam)</li>' +
          '</ul>',
      },
      {
        heading: '3. Retention Period',
        html:
          '<p>We delete your information immediately when you close your account or when we receive a deletion request — there is no additional grace period or delay.</p>' +
          '<p>Your birth date and birth time; the text you write in the "Today\'s Story" feature and its reply; the notes you enter in compatibility-sharing or deep compatibility to tell people apart; the free text you submit for a Lunar New Year reading; and the messages you send through Support are all stored encrypted (AES-256). Calculated results (day master, month branch, hour branch) are not personally identifying on their own, so we store them without encryption.</p>' +
          '<p>Where law requires longer retention (e.g., payment records), we retain that data only for the legally required period before deletion.</p>',
      },
      {
        heading: '4. Third Parties We Share Data With',
        html:
          '<p>We share data with the following third parties only as needed to provide the service:</p>' +
          '<ul>' +
          '<li><strong>Firebase (Google)</strong>: authentication, push notifications, and app-usage analytics (Google Analytics for Firebase, collected only in production builds)</li>' +
          '<li><strong>RevenueCat</strong>: subscription status management (actual payment is processed by Google Play Billing; we do not store your card or payment details ourselves)</li>' +
          '<li><strong>Our AI content provider</strong> (currently OpenAI; may be Anthropic or Google depending on configuration): generates the wording of your letters and "Today\'s Story" replies, as well as the home mini demo and Lunar New Year readings on our marketing site (saju-letter.com). This may include your calculated saju values, the text you write in the "Today\'s Story" feature, and the name and free text you submit for a Lunar New Year reading.</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: bot and spam prevention on our marketing site\'s public submission forms (your browser information is sent to Cloudflare while the widget is active)</li>' +
          '<li><strong>Resend</strong>: sending marketing emails and Lunar New Year result emails</li>' +
          '<li><strong>Sentry</strong>: crash and error monitoring</li>' +
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
          'screen and is not used for any other purpose.</p>',
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
          'opt out anytime using the unsubscribe link at the bottom of each email. For any other requests — ' +
          'such as accessing or correcting your information — please contact us using the information below.</p>',
      },
      {
        heading: '7. Security Measures',
        html:
          '<ul>' +
          '<li>Sensitive information — including birth date, birth time, "Today\'s Story" text and replies, compatibility/deep-compatibility notes, Lunar New Year free text, and Support messages — is stored using AES-256 encryption</li>' +
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
          'laws, or the service itself change (most recently updated: September 3, 2026). We will notify you of ' +
          'material changes through the app or this page.</p>',
      },
    ],
  },
  ja: {
    title: 'プライバシーポリシー',
    effectiveDate: '施行日: 2026年7月29日(最終更新: 2026年9月3日)',
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
          '<li>任意項目: 出生時刻(「わからない」を選択可能)、メールアドレス(無料体験の不正利用防止のみに使用)、相性シェア・その場でわかる相性のご利用時に相手を区別するために入力するメモ(相手には表示されません)</li>' +
          '<li>自動的に収集される情報: Firebase認証ID(UID)、端末のプッシュ通知トークン(FCM)、プロダクションビルドでのみ収集されるアプリ利用分析イベント(Google Analytics for Firebase — 会員登録完了イベントにログイン手段を含む)、サブスクリプション・購入状況(RevenueCat経由)、無料体験の不正利用防止のためのGoogle Play Integrity端末信頼性シグナル、エラー・クラッシュ診断情報、公開ページ(非会員向け)ご利用時のIPアドレス(不正利用防止のための一時的なリクエスト制限のみに使用し、長期保存はしません)、マーケティングサイトの公開フォーム(ホームのミニデモ・相性シェア・リード登録・旧正月占い)でボット対策として動作するCloudflare Turnstileを通じてCloudflareに送信されるブラウザ情報</li>' +
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
          '<li>サブスクリプション決済の処理および無料体験の不正利用防止</li>' +
          '<li>「今日の物語」機能へのパーソナライズされた返信生成</li>' +
          '<li>お問い合わせへの対応</li>' +
          '<li>マーケティングメールの送信(明示的に同意した利用者のみ)および旧正月占い結果の生成</li>' +
          '<li>サービス利用状況の分析、品質向上、障害対応、および不正利用(ボット・スパム)防止</li>' +
          '</ul>',
      },
      {
        heading: '3. 保有期間',
        html:
          '<p>退会または削除リクエストは受領後直ちに処理され、猶予期間を設けずその場で削除または匿名化されます。</p>' +
          '<p>生年月日・出生時刻、「今日の物語」機能に入力されたテキストとその返信、相性シェア・その場でわかる相性で相手を区別するために入力したメモ、旧正月占い送信時に自由に記入したテキスト、「お問い合わせ」機能に入力された内容は、AES-256方式で暗号化して保存し、計算結果(日干・月支・時支)は個人を特定しにくい値と判断し、暗号化せずに保存します。</p>' +
          '<p>法令により一定期間の保存が義務付けられている情報(決済記録など)は、当該法令が定める期間保存した後に削除します。</p>',
      },
      {
        heading: '4. 第三者提供・委託',
        html:
          '<p>本サービスの提供に必要な範囲内で、以下の外部事業者に個人情報の取り扱いを委託または提供しています。</p>' +
          '<ul>' +
          '<li><strong>Firebase(Google)</strong>: 会員認証、プッシュ通知の送信、アプリ利用状況の分析(Google Analytics for Firebase、プロダクションビルドのみ収集)</li>' +
          '<li><strong>RevenueCat</strong>: サブスクリプション状況の管理(実際の決済はGoogle Playの請求システムを通じて行われ、カード情報などの決済手段情報は当社では保管しません)</li>' +
          '<li><strong>AIコンテンツ生成プロバイダー</strong>(現在はOpenAI。設定によりAnthropicまたはGoogleの場合もあります): レターおよび「今日の物語」の返信文の生成、およびマーケティングサイト(saju-letter.com)のホームミニデモ・旧正月占いリーディングの生成。計算済みの四柱情報、「今日の物語」機能にご自身で入力されたテキスト、旧正月占い送信時に入力されたお名前・自由記述テキストが送信される場合があります。</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: マーケティングサイトの公開フォームにおけるボット・スパム対策(ウィジェット動作中、訪問者のブラウザ情報がCloudflareに送信されます)</li>' +
          '<li><strong>Resend</strong>: マーケティングメールおよび旧正月占い結果メールの送信</li>' +
          '<li><strong>Sentry</strong>: エラー・クラッシュのモニタリング</li>' +
          '</ul>',
      },
      {
        heading: '5. 相性シェア機能と非会員(友達)の情報',
        html:
          '<p>会員が作成した共有リンクを開く友達は、会員登録なしにお名前と生年月日を入力するだけでご利用いただけます。' +
          '四柱の計算は友達自身の端末(ブラウザまたはアプリ)内でのみ行い、サーバーには計算された天干・地支(年柱・月柱・日柱)と' +
          'お名前を送信・保存します。満16歳確認のため太陽暦の生年月日(年・月・日)も送りますが、その日付は保存しません。' +
          '入力されたお名前は結果画面に表示する目的のみに使用され、それ以外の目的には使用しません。</p>',
      },
      {
        heading: '6. 利用者の権利',
        html:
          '<p>利用者はアプリの設定画面からいつでもご自身で退会(アカウント削除)を申請できます。退会すると、お名前・' +
          'メールアドレス・性別・生年月日時など識別可能な情報は直ちに匿名化された値に置き換えられ、二度とログイン' +
          'できなくなり、サブスクリプションをご利用中の場合は自動更新も解約されますが、残りの期間分の返金はあり' +
          'ません。引き続きアプリを利用しながら支払いだけ止めたい場合は、退会の代わりにアプリの設定画面から' +
          'サブスクリプションだけを解約することもできます。マーケティングメールの受信を希望されない場合は、各' +
          'メール下部の配信停止リンクからいつでも解除できます。退会以外に個人情報の閲覧・訂正などをご希望の場合' +
          'は、下記の連絡先までご請求ください。</p>',
      },
      {
        heading: '7. 安全管理措置',
        html:
          '<ul>' +
          '<li>生年月日・出生時刻、「今日の物語」のテキストと返信、相性シェア・その場でわかる相性のメモ、旧正月占いの自由記入テキスト、お問い合わせ内容など機微になり得る情報はAES-256方式で暗号化して保存</li>' +
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
          '<p>本ポリシーは2026年7月29日より施行します(最終更新: 2026年9月3日)。法令、方針、またはサービス内容' +
          'の変更に応じて内容を追加・削除・修正する場合があります。重要な変更がある場合は、アプリ内または本ページ' +
          'にてお知らせします。</p>',
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    effectiveDate: 'Fecha de vigencia: 29 de julio de 2026 (última actualización: 3 de septiembre de 2026)',
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
          '<li>Opcional: hora de nacimiento (puedes elegir "desconocida"), dirección de correo electrónico (usada solo para prevenir el abuso de la prueba gratuita), una nota que ingresas en la compatibilidad compartida o la compatibilidad detallada para distinguir a las personas (nunca se muestra a la otra persona)</li>' +
          '<li>Recopilada automáticamente: identificador de autenticación de Firebase (UID), token de notificaciones push del dispositivo (FCM), eventos de análisis de uso de la app recopilados solo en compilaciones de producción (Google Analytics for Firebase — incluye el método de inicio de sesión en el evento de registro), estado de suscripción/compra (a través de RevenueCat), señales de integridad del dispositivo de Google Play Integrity usadas para prevenir el abuso de la prueba gratuita, datos de diagnóstico de errores/fallos, y — solo en páginas públicas — tu dirección IP, usada brevemente para limitar la frecuencia de solicitudes y prevenir abusos, sin almacenamiento a largo plazo, además de información del navegador enviada a Cloudflare mientras el widget de protección contra bots Cloudflare Turnstile está activo en los formularios públicos de nuestro sitio de marketing (demo de inicio, compatibilidad compartida, registro de contacto y Año Nuevo Lunar)</li>' +
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
          '<li>Para procesar los pagos de suscripción y prevenir el abuso de la prueba gratuita</li>' +
          '<li>Para generar una respuesta personalizada en la función "Historia de Hoy"</li>' +
          '<li>Para responder a las consultas de soporte</li>' +
          '<li>Para enviar correos de marketing (solo a usuarios que hayan dado su consentimiento explícito) y generar lecturas de Año Nuevo Lunar</li>' +
          '<li>Para analizar el uso, mejorar el servicio, responder a errores y prevenir el abuso (bots/spam)</li>' +
          '</ul>',
      },
      {
        heading: '3. Período de retención',
        html:
          '<p>Eliminamos tu información de inmediato cuando cierras tu cuenta o cuando recibimos una solicitud de eliminación — no hay período de gracia adicional ni demora.</p>' +
          '<p>Tu fecha y hora de nacimiento; el texto que escribes en la función "Historia de Hoy" y su respuesta; las notas que ingresas en la compatibilidad compartida o la compatibilidad detallada para distinguir a las personas; el texto libre que envías para una lectura de Año Nuevo Lunar; y los mensajes que envías a Soporte se almacenan cifrados (AES-256). Los resultados calculados (día maestro, rama del mes, rama de la hora) no son identificables por sí solos, por lo que los almacenamos sin cifrar.</p>' +
          '<p>Cuando la ley exige una retención más larga (por ejemplo, registros de pago), conservamos esos datos solo durante el período legalmente requerido antes de eliminarlos.</p>',
      },
      {
        heading: '4. Terceros con los que compartimos datos',
        html:
          '<p>Compartimos datos con los siguientes terceros solo en la medida necesaria para prestar el servicio:</p>' +
          '<ul>' +
          '<li><strong>Firebase (Google)</strong>: autenticación, notificaciones push y análisis de uso de la app (Google Analytics for Firebase, recopilado solo en compilaciones de producción)</li>' +
          '<li><strong>RevenueCat</strong>: gestión del estado de la suscripción (el pago real se procesa a través de Google Play Billing; nosotros no almacenamos tu tarjeta ni los datos de pago)</li>' +
          '<li><strong>Nuestro proveedor de contenido de IA</strong> (actualmente OpenAI; puede ser Anthropic o Google según la configuración): genera el texto de tus cartas y las respuestas de "Historia de Hoy", así como el mini demo de inicio y las lecturas de Año Nuevo Lunar en nuestro sitio de marketing (saju-letter.com). Esto puede incluir tus valores de saju calculados, el texto que escribes en la función "Historia de Hoy", y el nombre y el texto libre que envías para una lectura de Año Nuevo Lunar.</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: prevención de bots y spam en los formularios públicos de nuestro sitio de marketing (tu información del navegador se envía a Cloudflare mientras el widget está activo)</li>' +
          '<li><strong>Resend</strong>: envío de correos de marketing y de resultados de Año Nuevo Lunar</li>' +
          '<li><strong>Sentry</strong>: monitoreo de errores y fallos</li>' +
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
          'para mostrarlo en la pantalla de resultados y no se usa para ningún otro propósito.</p>',
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
          'en cualquier momento usando el enlace de cancelación al final de cada correo. Para cualquier otra ' +
          'solicitud — como acceder o corregir tu información — contáctanos usando los datos a continuación.</p>',
      },
      {
        heading: '7. Medidas de seguridad',
        html:
          '<ul>' +
          '<li>La información sensible — incluyendo la fecha y hora de nacimiento, el texto y las respuestas de "Historia de Hoy", las notas de compatibilidad/compatibilidad detallada, el texto libre de Año Nuevo Lunar y los mensajes de Soporte — se almacena usando cifrado AES-256</li>' +
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
          'nuestras prácticas, las leyes aplicables o el propio servicio (última actualización: 3 de septiembre ' +
          'de 2026). Te notificaremos sobre cambios importantes a través de la app o esta página.</p>',
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    effectiveDate: 'Data de vigência: 29 de julho de 2026 (última atualização: 3 de setembro de 2026)',
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
          '<li>Opcional: horário de nascimento (você pode escolher "desconhecido"), endereço de e-mail (usado apenas para prevenir abuso do teste gratuito), uma nota que você insere na compatibilidade compartilhada ou na compatibilidade detalhada para diferenciar as pessoas (nunca é exibida para a outra pessoa)</li>' +
          '<li>Coletadas automaticamente: identificador de autenticação do Firebase (UID), token de notificações push do dispositivo (FCM), eventos de análise de uso do app coletados apenas em builds de produção (Google Analytics for Firebase — inclui o método de login no evento de cadastro), status de assinatura/compra (via RevenueCat), sinais de integridade do dispositivo do Google Play Integrity usados para prevenir abuso do teste gratuito, dados de diagnóstico de erros/falhas e — somente em páginas públicas — seu endereço IP, usado brevemente para limitar a frequência de solicitações e prevenir abusos, sem armazenamento de longo prazo, além de informações do navegador enviadas ao Cloudflare enquanto o widget de proteção contra bots Cloudflare Turnstile está ativo nos formulários públicos do nosso site de marketing (demo da home, compatibilidade compartilhada, cadastro de contato e Ano Novo Lunar)</li>' +
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
          '<li>Para processar pagamentos de assinatura e prevenir abuso do teste gratuito</li>' +
          '<li>Para gerar uma resposta personalizada no recurso "História de Hoje"</li>' +
          '<li>Para responder a solicitações de suporte</li>' +
          '<li>Para enviar e-mails de marketing (apenas para usuários que deram consentimento explícito) e gerar leituras de Ano Novo Lunar</li>' +
          '<li>Para analisar o uso, melhorar o serviço, responder a erros e prevenir abusos (bots/spam)</li>' +
          '</ul>',
      },
      {
        heading: '3. Período de retenção',
        html:
          '<p>Excluímos suas informações imediatamente quando você encerra sua conta ou quando recebemos uma solicitação de exclusão — não há período de carência adicional nem atraso.</p>' +
          '<p>Sua data e horário de nascimento; o texto que você escreve no recurso "História de Hoje" e sua resposta; as notas que você insere na compatibilidade compartilhada ou na compatibilidade detalhada para diferenciar as pessoas; o texto livre que você envia para uma leitura de Ano Novo Lunar; e as mensagens que você envia ao Suporte são armazenados de forma criptografada (AES-256). Os resultados calculados (dia mestre, ramo do mês, ramo da hora) não são identificáveis por si só, portanto os armazenamos sem criptografia.</p>' +
          '<p>Quando a lei exige uma retenção mais longa (por exemplo, registros de pagamento), mantemos esses dados apenas pelo período legalmente exigido antes de excluí-los.</p>',
      },
      {
        heading: '4. Terceiros com quem compartilhamos dados',
        html:
          '<p>Compartilhamos dados com os seguintes terceiros apenas na medida necessária para fornecer o serviço:</p>' +
          '<ul>' +
          '<li><strong>Firebase (Google)</strong>: autenticação, notificações push e análise de uso do app (Google Analytics for Firebase, coletado apenas em builds de produção)</li>' +
          '<li><strong>RevenueCat</strong>: gerenciamento do status da assinatura (o pagamento real é processado pelo Google Play Billing; não armazenamos seu cartão nem dados de pagamento)</li>' +
          '<li><strong>Nosso provedor de conteúdo de IA</strong> (atualmente OpenAI; pode ser Anthropic ou Google dependendo da configuração): gera o texto das suas cartas e das respostas de "História de Hoje", bem como o mini demo da home e as leituras de Ano Novo Lunar em nosso site de marketing (saju-letter.com). Isso pode incluir seus valores de saju calculados, o texto que você escreve no recurso "História de Hoje", e o nome e o texto livre que você envia para uma leitura de Ano Novo Lunar.</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: prevenção de bots e spam nos formulários públicos do nosso site de marketing (suas informações do navegador são enviadas ao Cloudflare enquanto o widget está ativo)</li>' +
          '<li><strong>Resend</strong>: envio de e-mails de marketing e de resultados de Ano Novo Lunar</li>' +
          '<li><strong>Sentry</strong>: monitoramento de erros e falhas</li>' +
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
          'é usado apenas para exibição na tela de resultado e não é usado para nenhum outro fim.</p>',
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
          'usando o link no rodapé de cada e-mail. Para qualquer outra solicitação — como acessar ou corrigir ' +
          'suas informações — entre em contato conosco usando as informações abaixo.</p>',
      },
      {
        heading: '7. Medidas de segurança',
        html:
          '<ul>' +
          '<li>Informações sensíveis — incluindo data e horário de nascimento, texto e respostas de "História de Hoje", notas de compatibilidade/compatibilidade detalhada, texto livre de Ano Novo Lunar e mensagens do Suporte — são armazenadas com criptografia AES-256</li>' +
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
          'práticas, as leis aplicáveis ou o próprio serviço mudarem (última atualização: 3 de setembro de ' +
          '2026). Notificaremos você sobre alterações relevantes por meio do aplicativo ou desta página.</p>',
      },
    ],
  },
  vi: {
    title: 'Chính sách Quyền riêng tư',
    effectiveDate: 'Ngày hiệu lực: 29 tháng 7 năm 2026 (cập nhật lần cuối: 3 tháng 9 năm 2026)',
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
          '<li>Tùy chọn: giờ sinh (bạn có thể chọn "không rõ"), địa chỉ email (chỉ dùng để ngăn chặn lạm dụng bản dùng thử miễn phí), ghi chú bạn nhập trong tính năng chia sẻ mức độ hợp nhau hoặc xem mức độ hợp nhau chi tiết để phân biệt mọi người (không bao giờ hiển thị cho người kia)</li>' +
          '<li>Thu thập tự động: mã định danh xác thực Firebase (UID), token thông báo đẩy của thiết bị (FCM), sự kiện phân tích sử dụng ứng dụng chỉ thu thập trên bản dựng production (Google Analytics for Firebase — bao gồm phương thức đăng nhập trong sự kiện đăng ký), trạng thái đăng ký/mua hàng (qua RevenueCat), tín hiệu toàn vẹn thiết bị từ Google Play Integrity dùng để ngăn chặn lạm dụng bản dùng thử miễn phí, dữ liệu chẩn đoán lỗi/sự cố, và — chỉ trên các trang công khai — địa chỉ IP của bạn, được dùng trong thời gian ngắn để giới hạn tần suất yêu cầu nhằm ngăn lạm dụng, không lưu trữ lâu dài, cùng với thông tin trình duyệt được gửi đến Cloudflare khi tiện ích chống bot Cloudflare Turnstile đang hoạt động trên các biểu mẫu công khai của trang web tiếp thị (bản demo trang chủ, chia sẻ mức độ hợp nhau, đăng ký nhận tin và Tết Nguyên Đán)</li>' +
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
          '<li>Để xử lý thanh toán đăng ký và ngăn chặn lạm dụng bản dùng thử miễn phí</li>' +
          '<li>Để tạo phản hồi cá nhân hóa trong tính năng "Câu Chuyện Hôm Nay"</li>' +
          '<li>Để phản hồi các yêu cầu hỗ trợ khách hàng</li>' +
          '<li>Để gửi email tiếp thị (chỉ cho người dùng đã đồng ý rõ ràng) và tạo bài đọc Tết Nguyên Đán</li>' +
          '<li>Để phân tích việc sử dụng, cải thiện dịch vụ, xử lý lỗi và ngăn chặn lạm dụng (bot/spam)</li>' +
          '</ul>',
      },
      {
        heading: '3. Thời gian lưu trữ',
        html:
          '<p>Chúng tôi xóa thông tin của bạn ngay lập tức khi bạn đóng tài khoản hoặc khi nhận được yêu cầu xóa — không có thời gian gia hạn hoặc trì hoãn bổ sung.</p>' +
          '<p>Ngày sinh và giờ sinh của bạn; văn bản bạn viết trong tính năng "Câu Chuyện Hôm Nay" và phản hồi của nó; ghi chú bạn nhập trong tính năng hợp nhau để phân biệt mọi người; văn bản tự do bạn gửi cho bài đọc Tết Nguyên Đán; và các tin nhắn bạn gửi cho Hỗ trợ đều được lưu trữ ở dạng mã hóa (AES-256). Các kết quả đã tính toán (thiên can ngày, địa chi tháng, địa chi giờ) tự thân không thể nhận dạng cá nhân, nên chúng tôi lưu trữ chúng mà không mã hóa.</p>' +
          '<p>Khi pháp luật yêu cầu lưu trữ lâu hơn (ví dụ: hồ sơ thanh toán), chúng tôi chỉ giữ dữ liệu đó trong thời gian pháp luật yêu cầu trước khi xóa.</p>',
      },
      {
        heading: '4. Bên thứ ba mà chúng tôi chia sẻ dữ liệu',
        html:
          '<p>Chúng tôi chỉ chia sẻ dữ liệu với các bên thứ ba sau trong phạm vi cần thiết để cung cấp dịch vụ:</p>' +
          '<ul>' +
          '<li><strong>Firebase (Google)</strong>: xác thực, thông báo đẩy và phân tích sử dụng ứng dụng (Google Analytics for Firebase, chỉ thu thập trên bản dựng production)</li>' +
          '<li><strong>RevenueCat</strong>: quản lý trạng thái đăng ký (thanh toán thực tế được xử lý qua Google Play Billing; chúng tôi không tự lưu trữ thẻ hay thông tin thanh toán của bạn)</li>' +
          '<li><strong>Nhà cung cấp nội dung AI của chúng tôi</strong> (hiện tại là OpenAI; có thể là Anthropic hoặc Google tùy theo cấu hình): tạo nội dung câu chữ cho thư của bạn và các phản hồi trong tính năng "Câu Chuyện Hôm Nay", cũng như bản demo trang chủ và các bài đọc Tết Nguyên Đán trên trang web tiếp thị của chúng tôi (saju-letter.com). Việc này có thể bao gồm các giá trị saju đã tính toán của bạn, văn bản bạn viết trong tính năng "Câu Chuyện Hôm Nay", và tên cùng văn bản tự do bạn gửi khi xem bài đọc Tết Nguyên Đán.</li>' +
          '<li><strong>Cloudflare Turnstile</strong>: ngăn chặn bot và spam trên các biểu mẫu công khai của trang web tiếp thị (thông tin trình duyệt của bạn được gửi đến Cloudflare trong khi tiện ích đang hoạt động)</li>' +
          '<li><strong>Resend</strong>: gửi email tiếp thị và email kết quả Tết Nguyên Đán</li>' +
          '<li><strong>Sentry</strong>: giám sát lỗi và sự cố</li>' +
          '</ul>',
      },
      {
        heading: '5. Tính năng chia sẻ mức độ hợp nhau và dữ liệu của người không phải thành viên (khách)',
        html:
          '<p>Một người bạn mở liên kết hợp nhau mà bạn chia sẻ không cần tạo tài khoản — họ chỉ cần nhập tên ' +
          'và ngày sinh. Lá số saju được tính toán hoàn toàn trên thiết bị hoặc trình duyệt của chính họ. Chúng ' +
          'tôi lưu thiên can và địa chi kết quả (trụ năm, tháng và ngày) cùng với tên họ nhập. Chúng tôi cũng ' +
          'nhận ngày sinh dương lịch (năm, tháng, ngày) chỉ để xác nhận họ từ 16 tuổi trở lên, và không lưu ngày ' +
          'đó. Tên họ nhập chỉ được dùng để hiển thị trên màn hình kết quả và không được dùng cho mục đích nào khác.</p>',
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
          'nữa, bạn có thể hủy đăng ký bất cứ lúc nào bằng liên kết ở cuối mỗi email. Với các yêu cầu khác — ' +
          'như truy cập hoặc chỉnh sửa thông tin của bạn — vui lòng liên hệ với chúng tôi theo thông tin bên dưới.</p>',
      },
      {
        heading: '7. Biện pháp bảo mật',
        html:
          '<ul>' +
          '<li>Thông tin nhạy cảm — bao gồm ngày sinh, giờ sinh, văn bản và phản hồi trong "Câu Chuyện Hôm Nay", ghi chú hợp nhau, văn bản tự do của Tết Nguyên Đán và tin nhắn Hỗ trợ — được lưu trữ bằng mã hóa AES-256</li>' +
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
          'của chúng tôi, luật hiện hành hoặc bản thân dịch vụ thay đổi (cập nhật lần cuối: 3 tháng 9 năm ' +
          '2026). Chúng tôi sẽ thông báo cho bạn về những thay đổi quan trọng thông qua ứng dụng hoặc trang này.</p>',
      },
    ],
  },
};
