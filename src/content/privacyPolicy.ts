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
 *      `src/domain/age.ts`(MINIMUM_AGE)가 온보딩 단계에서 이 값을 실제로 강제한다 — 이 문서의
 *      숫자를 바꾸면 그 파일의 상수도 반드시 함께 바꿀 것.
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
    effectiveDate: '시행일자: 2026년 7월 29일 (최종 수정: 2026년 8월 15일)',
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
          '<li>선택 입력 정보: 출생 시간("모름" 선택 가능), 이메일 주소(무료체험 어뷰징 방지 목적으로만 사용)</li>' +
          '<li>자동으로 수집되는 정보: Firebase 인증 식별자(UID), 기기 푸시 토큰(FCM), 구독/결제 상태(RevenueCat 경유), 무료체험 남용 방지를 위한 Google Play Integrity 기기 무결성 신호, 오류·크래시 진단 정보, 공개(비로그인) 페이지 접속 시의 IP 주소(악용 방지를 위한 일시적 요청 빈도 제한 목적으로만 사용하며 장기 저장하지 않음)</li>' +
          '<li>사주 개인화 계산 결과: 온보딩 시 입력한 생년월일시를 바탕으로 계산되는 사주 전체(연주·월주·일주·시주) — 주간/월별 편지 등 개인화된 해석에 사용됩니다</li>' +
          '<li>이용자가 자유롭게 작성하는 내용: "오늘의 이야기" 기능에 입력한 텍스트(답장 생성을 위해 AI 제공업체로 전달됨), "문의하기" 기능에 입력한 제목과 내용</li>' +
          '<li>마케팅 사이트(saju-letter.com) 이용 시 수집되는 정보: 이메일 구독 신청 시 입력한 이메일 주소와 마케팅 수신 동의 여부·시각, 신년운세 공개 페이지 제출 시 입력한 이름·계산된 사주 정보·자유롭게 작성한 텍스트(원본 생년월일은 서버로 전송되지 않고 이용자의 기기에서만 계산됩니다)</li>' +
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
          '<li>서비스 품질 개선 및 오류 대응</li>' +
          '</ul>',
      },
      {
        heading: '3. 개인정보의 보유 및 이용 기간',
        html:
          '<p>원칙적으로 회원 탈퇴 시(또는 삭제 요청 접수 후 지체 없이) 파기합니다.</p>' +
          '<p>생년월일·출생시간, 그리고 "오늘의 이야기" 기능에 입력한 텍스트와 그에 대한 답장은 AES-256 방식으로 암호화해 저장하며, 계산 결과물(일간·월지·시지)은 개인 식별이 어려운 값으로 판단해 암호화 없이 저장합니다.</p>' +
          '<p>관계 법령상 일정 기간 보존이 필요한 정보(예: 결제 기록)는 해당 법령이 정한 기간 동안 보존 후 파기합니다.</p>',
      },
      {
        heading: '4. 개인정보의 제3자 제공 및 처리위탁',
        html:
          '<p>서비스 제공에 필요한 범위 내에서 아래 외부 업체에 개인정보 처리를 위탁하거나 제공합니다.</p>' +
          '<ul>' +
          '<li><strong>Firebase(Google)</strong>: 회원 인증, 푸시 알림 발송</li>' +
          '<li><strong>RevenueCat</strong>: 구독 상태 확인 및 관리(실제 결제는 Google Play 빌링을 통해 처리되며, 카드 등 결제 수단 정보는 회사가 직접 보관하지 않습니다)</li>' +
          '<li><strong>AI 콘텐츠 생성 제공업체</strong>(현재 OpenAI, 설정에 따라 Anthropic 또는 Google로 달라질 수 있음): 편지 및 오늘의 이야기 답장의 문장 생성. 계산된 사주 정보와 "오늘의 이야기" 기능에 직접 작성한 텍스트가 전달될 수 있습니다.</li>' +
          '<li><strong>Resend</strong>: 마케팅 이메일 및 신년운세 결과 이메일 발송</li>' +
          '<li><strong>Sentry</strong>: 오류·크래시 모니터링</li>' +
          '</ul>',
      },
      {
        heading: '5. 궁합 공유 기능과 비회원(친구)의 정보',
        html:
          '<p>회원이 만든 공유 링크로 접속하는 친구(비회원)는 별도 회원가입 없이 이름과 생년월일만 입력하면 됩니다. ' +
          '입력한 실제 생년월일은 서버로 전송되지 않고 접속한 기기(브라우저 또는 앱) 안에서만 계산에 사용되며, ' +
          '계산 결과인 "일간" 값 하나만 서버로 전송·저장됩니다. 입력한 이름은 궁합 결과 화면 표시 목적으로만 사용되며 ' +
          '다른 목적으로 사용되지 않습니다.</p>',
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
          '<li>생년월일·출생시간, "오늘의 이야기" 텍스트와 답장 등 민감할 수 있는 정보는 AES-256 방식으로 암호화하여 저장</li>' +
          '<li>암호화 키는 별도의 키 관리 서비스(KMS)에서 관리하며 코드에 하드코딩하지 않음</li>' +
          '<li>관리자 페이지 접근에는 별도의 인증 체계 적용</li>' +
          '</ul>',
      },
      {
        heading: '8. 만 16세 미만 아동의 개인정보',
        html:
          '<p>본 서비스는 만 16세 이상만 이용할 수 있으며, 가입 시 입력한 생년월일을 기준으로 앱이 ' +
          '실제로 이를 확인합니다. 회사는 만 16세 미만 아동으로부터 고의로 개인정보를 수집하지 않으며, 만 16세 ' +
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
          '수 있습니다(가장 최근 수정: 2026년 8월 15일). 변경 시 앱 공지 또는 본 페이지를 통해 고지합니다.</p>',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    effectiveDate: 'Effective date: July 29, 2026 (last updated: August 15, 2026)',
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
          '<li>Optional: birth time (you may choose "unknown"), email address (used only to prevent free-trial abuse)</li>' +
          '<li>Collected automatically: Firebase authentication identifier (UID), device push token (FCM), subscription/purchase status (via RevenueCat), Google Play Integrity device-integrity signals used to prevent free-trial abuse, crash/error diagnostic data, and — only on the public compatibility page — your IP address, used briefly for abuse-prevention rate limiting and not stored long-term</li>' +
          '<li>Personalization calculations: your full four-pillar saju chart (year, month, day, and hour pillars), calculated from the birth date and time you provide during onboarding — used to personalize weekly and monthly letters</li>' +
          '<li>Content you write: free text you enter in the "Today\'s Story" feature, which is sent to an AI provider to generate a personalized reply; and the subject and message you enter when contacting Support</li>' +
          '<li>Collected when you use our marketing site (saju-letter.com): the email address you provide when signing up, along with whether and when you consented to marketing emails; and, if you submit the Lunar New Year public reading page, the name, calculated saju information, and free text you enter (your actual birth date is never sent to our servers — it is calculated entirely on your own device)</li>' +
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
          '<li>To improve the service and respond to errors</li>' +
          '</ul>',
      },
      {
        heading: '3. Retention Period',
        html:
          '<p>We delete your information when you close your account (or promptly after we receive a deletion request).</p>' +
          '<p>Your birth date and birth time, as well as the text you write in the "Today\'s Story" feature and its reply, are stored encrypted (AES-256). Calculated results (day master, month branch, hour branch) are not personally identifying on their own, so we store them without encryption.</p>' +
          '<p>Where law requires longer retention (e.g., payment records), we retain that data only for the legally required period before deletion.</p>',
      },
      {
        heading: '4. Third Parties We Share Data With',
        html:
          '<p>We share data with the following third parties only as needed to provide the service:</p>' +
          '<ul>' +
          '<li><strong>Firebase (Google)</strong>: authentication and push notifications</li>' +
          '<li><strong>RevenueCat</strong>: subscription status management (actual payment is processed by Google Play Billing; we do not store your card or payment details ourselves)</li>' +
          '<li><strong>Our AI content provider</strong> (currently OpenAI; may be Anthropic or Google depending on configuration): generates the wording of your letters and "Today\'s Story" replies. This may include your calculated saju values and the text you write in the "Today\'s Story" feature.</li>' +
          '<li><strong>Resend</strong>: sending marketing emails and Lunar New Year result emails</li>' +
          '<li><strong>Sentry</strong>: crash and error monitoring</li>' +
          '</ul>',
      },
      {
        heading: '5. The Compatibility-Sharing Feature and Non-Member (Guest) Data',
        html:
          '<p>A friend who opens a compatibility link you share does not need to create an account — they only ' +
          'enter their name and birth date. Their actual birth date is never sent to our servers; it is ' +
          'calculated entirely on their own device or browser, and only the resulting "day master" value (not ' +
          'personally identifying) is sent to us and stored. The name they enter is used only to display it on ' +
          'the result screen and is not used for any other purpose.</p>',
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
          '<li>Sensitive information such as birth date, birth time, and your "Today\'s Story" feature text and replies is stored using AES-256 encryption</li>' +
          '<li>Encryption keys are managed through a dedicated key management service (KMS) and are never hardcoded</li>' +
          '<li>Access to the admin panel requires separate authentication</li>' +
          '</ul>',
      },
      {
        heading: "8. Children's Privacy",
        html:
          '<p>This service is intended for users aged 16 and older, and the app verifies this using the birth ' +
          'date you provide during onboarding. We do not knowingly collect personal information from children ' +
          'under 16. If we become aware that a child under 16 has used the service, we will take appropriate ' +
          'steps to delete the relevant information promptly.</p>',
      },
      {
        heading: '9. Contact Us',
        html: `<p>For privacy-related questions or requests to access, correct, or delete your information, please contact us at:</p><p>Email: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. Changes to This Policy',
        html:
          '<p>This policy is effective as of July 29, 2026, and may be updated as our practices, applicable ' +
          'laws, or the service itself change (most recently updated: August 15, 2026). We will notify you of ' +
          'material changes through the app or this page.</p>',
      },
    ],
  },
  ja: {
    title: 'プライバシーポリシー',
    effectiveDate: '施行日: 2026年7月29日(最終更新: 2026年8月15日)',
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
          '<li>任意項目: 出生時刻(「わからない」を選択可能)、メールアドレス(無料体験の不正利用防止のみに使用)</li>' +
          '<li>自動的に収集される情報: Firebase認証ID(UID)、端末のプッシュ通知トークン(FCM)、サブスクリプション・購入状況(RevenueCat経由)、無料体験の不正利用防止のためのGoogle Play Integrity端末信頼性シグナル、エラー・クラッシュ診断情報、公開ページ(非会員向け)ご利用時のIPアドレス(不正利用防止のための一時的なリクエスト制限のみに使用し、長期保存はしません)</li>' +
          '<li>パーソナライズのための計算結果: オンボーディング時にご入力いただいた生年月日時をもとに計算される四柱全体(年柱・月柱・日柱・時柱) — 週間・月間レターの個人化された解釈に使用されます</li>' +
          '<li>ご自身で入力される内容: 「今日の物語」機能に自由に記入されたテキスト(返信生成のためAIプロバイダーに送信されます)、および「お問い合わせ」機能にご入力いただく件名と内容</li>' +
          '<li>マーケティングサイト(saju-letter.com)ご利用時に収集される情報: メール登録時にご入力いただくメールアドレスと、マーケティングメールへの同意有無・同意日時。旧正月占い公開ページ送信時にご入力いただくお名前・計算された四柱情報・自由記入テキスト(実際の生年月日は当社サーバーに送信されず、ご自身の端末内でのみ計算されます)</li>' +
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
          '<li>サービス品質の向上、障害対応</li>' +
          '</ul>',
      },
      {
        heading: '3. 保有期間',
        html:
          '<p>原則として、退会時(または削除リクエスト受領後、遅滞なく)削除します。</p>' +
          '<p>生年月日・出生時刻、および「今日の物語」機能に入力されたテキストとその返信は、AES-256方式で暗号化して保存し、計算結果(日干・月支・時支)は個人を特定しにくい値と判断し、暗号化せずに保存します。</p>' +
          '<p>法令により一定期間の保存が義務付けられている情報(決済記録など)は、当該法令が定める期間保存した後に削除します。</p>',
      },
      {
        heading: '4. 第三者提供・委託',
        html:
          '<p>本サービスの提供に必要な範囲内で、以下の外部事業者に個人情報の取り扱いを委託または提供しています。</p>' +
          '<ul>' +
          '<li><strong>Firebase(Google)</strong>: 会員認証、プッシュ通知の送信</li>' +
          '<li><strong>RevenueCat</strong>: サブスクリプション状況の管理(実際の決済はGoogle Playの請求システムを通じて行われ、カード情報などの決済手段情報は当社では保管しません)</li>' +
          '<li><strong>AIコンテンツ生成プロバイダー</strong>(現在はOpenAI。設定によりAnthropicまたはGoogleの場合もあります): レターおよび「今日の物語」の返信文の生成。計算済みの四柱情報や「今日の物語」機能にご自身で入力されたテキストが送信される場合があります。</li>' +
          '<li><strong>Resend</strong>: マーケティングメールおよび旧正月占い結果メールの送信</li>' +
          '<li><strong>Sentry</strong>: エラー・クラッシュのモニタリング</li>' +
          '</ul>',
      },
      {
        heading: '5. 相性シェア機能と非会員(友達)の情報',
        html:
          '<p>会員が作成した共有リンクを開く友達は、会員登録なしにお名前と生年月日を入力するだけでご利用いただけます。' +
          '入力された実際の生年月日は当社サーバーに送信されず、友達自身の端末(ブラウザまたはアプリ)内でのみ計算に' +
          '使用され、計算結果である「日干」の値のみがサーバーに送信・保存されます。入力されたお名前は結果画面に' +
          '表示する目的のみに使用され、それ以外の目的には使用しません。</p>',
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
          '<li>生年月日・出生時刻、「今日の物語」のテキストと返信など機微になり得る情報はAES-256方式で暗号化して保存</li>' +
          '<li>暗号化キーは専用の鍵管理サービス(KMS)で管理し、コードに直接記載しません</li>' +
          '<li>管理画面へのアクセスには別途認証を適用</li>' +
          '</ul>',
      },
      {
        heading: '8. 児童のプライバシー',
        html:
          '<p>本サービスは満16歳以上の方のみご利用いただけ、ご登録時にご入力いただいた生年月日をもとに ' +
          'アプリが実際に確認します。当社は満16歳未満のお子様から意図的に個人情報を収集することはありません。' +
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
          '<p>本ポリシーは2026年7月29日より施行します(最終更新: 2026年8月15日)。法令、方針、またはサービス内容' +
          'の変更に応じて内容を追加・削除・修正する場合があります。重要な変更がある場合は、アプリ内または本ページ' +
          'にてお知らせします。</p>',
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    effectiveDate: 'Fecha de vigencia: 29 de julio de 2026 (última actualización: 15 de agosto de 2026)',
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
          '<li>Opcional: hora de nacimiento (puedes elegir "desconocida"), dirección de correo electrónico (usada solo para prevenir el abuso de la prueba gratuita)</li>' +
          '<li>Recopilada automáticamente: identificador de autenticación de Firebase (UID), token de notificaciones push del dispositivo (FCM), estado de suscripción/compra (a través de RevenueCat), señales de integridad del dispositivo de Google Play Integrity usadas para prevenir el abuso de la prueba gratuita, datos de diagnóstico de errores/fallos, y — solo en la página pública de compatibilidad — tu dirección IP, usada brevemente para limitar la frecuencia de solicitudes y prevenir abusos, sin almacenamiento a largo plazo</li>' +
          '<li>Cálculos de personalización: tu carta astral saju completa (los cuatro pilares: año, mes, día y hora), calculada a partir de la fecha y hora de nacimiento que proporcionas durante el proceso de incorporación — usada para personalizar las cartas semanales y mensuales</li>' +
          '<li>Contenido que escribes: el texto libre que ingresas en la función "Historia de Hoy", que se envía a un proveedor de IA para generar una respuesta personalizada; y el asunto y mensaje que ingresas al contactar con Soporte</li>' +
          '<li>Recopilada cuando usas nuestro sitio de marketing (saju-letter.com): la dirección de correo electrónico que proporcionas al registrarte, junto con si diste tu consentimiento para recibir correos de marketing y cuándo; y, si envías el formulario de la página pública de Año Nuevo Lunar, el nombre, la información de saju calculada y el texto libre que ingresas (tu fecha de nacimiento real nunca se envía a nuestros servidores — se calcula por completo en tu propio dispositivo)</li>' +
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
          '<li>Para mejorar el servicio y responder a errores</li>' +
          '</ul>',
      },
      {
        heading: '3. Período de retención',
        html:
          '<p>Eliminamos tu información cuando cierras tu cuenta (o poco después de recibir una solicitud de eliminación).</p>' +
          '<p>Tu fecha y hora de nacimiento, así como el texto que escribes en la función "Historia de Hoy" y su respuesta, se almacenan cifrados (AES-256). Los resultados calculados (día maestro, rama del mes, rama de la hora) no son identificables por sí solos, por lo que los almacenamos sin cifrar.</p>' +
          '<p>Cuando la ley exige una retención más larga (por ejemplo, registros de pago), conservamos esos datos solo durante el período legalmente requerido antes de eliminarlos.</p>',
      },
      {
        heading: '4. Terceros con los que compartimos datos',
        html:
          '<p>Compartimos datos con los siguientes terceros solo en la medida necesaria para prestar el servicio:</p>' +
          '<ul>' +
          '<li><strong>Firebase (Google)</strong>: autenticación y notificaciones push</li>' +
          '<li><strong>RevenueCat</strong>: gestión del estado de la suscripción (el pago real se procesa a través de Google Play Billing; nosotros no almacenamos tu tarjeta ni los datos de pago)</li>' +
          '<li><strong>Nuestro proveedor de contenido de IA</strong> (actualmente OpenAI; puede ser Anthropic o Google según la configuración): genera el texto de tus cartas y las respuestas de "Historia de Hoy". Esto puede incluir tus valores de saju calculados y el texto que escribes en la función "Historia de Hoy".</li>' +
          '<li><strong>Resend</strong>: envío de correos de marketing y de resultados de Año Nuevo Lunar</li>' +
          '<li><strong>Sentry</strong>: monitoreo de errores y fallos</li>' +
          '</ul>',
      },
      {
        heading: '5. La función de compatibilidad compartida y los datos de no miembros (invitados)',
        html:
          '<p>Un amigo que abre un enlace de compatibilidad que compartes no necesita crear una cuenta — solo ' +
          'ingresa su nombre y fecha de nacimiento. Su fecha de nacimiento real nunca se envía a nuestros ' +
          'servidores; se calcula por completo en su propio dispositivo o navegador, y solo el valor resultante ' +
          'del "día maestro" (no identificable) se nos envía y almacena. El nombre que ingresa se usa únicamente ' +
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
          '<li>La información sensible, como la fecha y hora de nacimiento y el texto y las respuestas de la función "Historia de Hoy", se almacena usando cifrado AES-256</li>' +
          '<li>Las claves de cifrado se gestionan mediante un servicio dedicado de gestión de claves (KMS) y nunca se codifican directamente en el código</li>' +
          '<li>El acceso al panel de administración requiere autenticación independiente</li>' +
          '</ul>',
      },
      {
        heading: '8. Privacidad de menores',
        html:
          '<p>Este servicio está destinado a usuarios de 16 años o más, y la app verifica esto usando la fecha ' +
          'de nacimiento que proporcionas durante el proceso de incorporación. No recopilamos intencionalmente ' +
          'información personal de menores de 16 años. Si llegamos a saber que un menor de 16 años ha usado el ' +
          'servicio, tomaremos las medidas adecuadas para eliminar la información correspondiente sin demora.</p>',
      },
      {
        heading: '9. Contáctanos',
        html: `<p>Para preguntas relacionadas con la privacidad o solicitudes de acceso, corrección o eliminación de tu información, contáctanos en:</p><p>Correo electrónico: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. Cambios en esta política',
        html:
          '<p>Esta política entra en vigencia el 29 de julio de 2026 y puede actualizarse a medida que cambien ' +
          'nuestras prácticas, las leyes aplicables o el propio servicio (última actualización: 15 de agosto de ' +
          '2026). Te notificaremos sobre cambios importantes a través de la app o esta página.</p>',
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    effectiveDate: 'Data de vigência: 29 de julho de 2026 (última atualização: 15 de agosto de 2026)',
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
          '<li>Opcional: horário de nascimento (você pode escolher "desconhecido"), endereço de e-mail (usado apenas para prevenir abuso do teste gratuito)</li>' +
          '<li>Coletadas automaticamente: identificador de autenticação do Firebase (UID), token de notificações push do dispositivo (FCM), status de assinatura/compra (via RevenueCat), sinais de integridade do dispositivo do Google Play Integrity usados para prevenir abuso do teste gratuito, dados de diagnóstico de erros/falhas e — somente na página pública de compatibilidade — seu endereço IP, usado brevemente para limitar a frequência de solicitações e prevenir abusos, sem armazenamento de longo prazo</li>' +
          '<li>Cálculos de personalização: seu mapa saju completo (os quatro pilares: ano, mês, dia e hora), calculado a partir da data e hora de nascimento que você fornece durante o processo de integração — usado para personalizar as cartas semanais e mensais</li>' +
          '<li>Conteúdo que você escreve: o texto livre inserido no recurso "História de Hoje", que é enviado a um provedor de IA para gerar uma resposta personalizada; e o assunto e a mensagem que você insere ao entrar em contato com o Suporte</li>' +
          '<li>Coletadas quando você usa nosso site de marketing (saju-letter.com): o endereço de e-mail fornecido ao se cadastrar, junto com se e quando você consentiu em receber e-mails de marketing; e, se você enviar o formulário da página pública de Ano Novo Lunar, o nome, as informações de saju calculadas e o texto livre que você insere (sua data de nascimento real nunca é enviada aos nossos servidores — ela é calculada inteiramente no seu próprio dispositivo)</li>' +
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
          '<li>Para melhorar o serviço e responder a erros</li>' +
          '</ul>',
      },
      {
        heading: '3. Período de retenção',
        html:
          '<p>Excluímos suas informações quando você encerra sua conta (ou logo após recebermos uma solicitação de exclusão).</p>' +
          '<p>Sua data e horário de nascimento, assim como o texto que você escreve no recurso "História de Hoje" e sua resposta, são armazenados de forma criptografada (AES-256). Os resultados calculados (dia mestre, ramo do mês, ramo da hora) não são identificáveis por si só, portanto os armazenamos sem criptografia.</p>' +
          '<p>Quando a lei exige uma retenção mais longa (por exemplo, registros de pagamento), mantemos esses dados apenas pelo período legalmente exigido antes de excluí-los.</p>',
      },
      {
        heading: '4. Terceiros com quem compartilhamos dados',
        html:
          '<p>Compartilhamos dados com os seguintes terceiros apenas na medida necessária para fornecer o serviço:</p>' +
          '<ul>' +
          '<li><strong>Firebase (Google)</strong>: autenticação e notificações push</li>' +
          '<li><strong>RevenueCat</strong>: gerenciamento do status da assinatura (o pagamento real é processado pelo Google Play Billing; não armazenamos seu cartão nem dados de pagamento)</li>' +
          '<li><strong>Nosso provedor de conteúdo de IA</strong> (atualmente OpenAI; pode ser Anthropic ou Google dependendo da configuração): gera o texto das suas cartas e das respostas de "História de Hoje". Isso pode incluir seus valores de saju calculados e o texto que você escreve no recurso "História de Hoje".</li>' +
          '<li><strong>Resend</strong>: envio de e-mails de marketing e de resultados de Ano Novo Lunar</li>' +
          '<li><strong>Sentry</strong>: monitoramento de erros e falhas</li>' +
          '</ul>',
      },
      {
        heading: '5. O recurso de compatibilidade compartilhada e dados de não membros (convidados)',
        html:
          '<p>Um amigo que abre um link de compatibilidade que você compartilha não precisa criar uma conta — ' +
          'ele só precisa inserir o nome e a data de nascimento. A data de nascimento real dele nunca é enviada ' +
          'aos nossos servidores; ela é calculada inteiramente no próprio dispositivo ou navegador, e apenas o ' +
          'valor resultante do "dia mestre" (não identificável) é enviado e armazenado por nós. O nome inserido ' +
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
          '<li>Informações sensíveis, como data e horário de nascimento e o texto e as respostas do recurso "História de Hoje", são armazenadas com criptografia AES-256</li>' +
          '<li>As chaves de criptografia são gerenciadas por um serviço dedicado de gerenciamento de chaves (KMS) e nunca ficam fixas no código</li>' +
          '<li>O acesso ao painel administrativo exige autenticação separada</li>' +
          '</ul>',
      },
      {
        heading: '8. Privacidade de menores',
        html:
          '<p>Este serviço é destinado a usuários com 16 anos ou mais, e o aplicativo verifica isso usando a ' +
          'data de nascimento fornecida durante o processo de integração. Não coletamos intencionalmente ' +
          'informações pessoais de menores de 16 anos. Se tomarmos conhecimento de que um menor de 16 anos usou ' +
          'o serviço, tomaremos as medidas adequadas para excluir as informações relevantes prontamente.</p>',
      },
      {
        heading: '9. Fale conosco',
        html: `<p>Para dúvidas relacionadas à privacidade ou solicitações de acesso, correção ou exclusão de suas informações, entre em contato pelo e-mail:</p><p>E-mail: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. Alterações nesta política',
        html:
          '<p>Esta política entra em vigor em 29 de julho de 2026 e pode ser atualizada conforme nossas ' +
          'práticas, as leis aplicáveis ou o próprio serviço mudarem (última atualização: 15 de agosto de ' +
          '2026). Notificaremos você sobre alterações relevantes por meio do aplicativo ou desta página.</p>',
      },
    ],
  },
  vi: {
    title: 'Chính sách Quyền riêng tư',
    effectiveDate: 'Ngày hiệu lực: 29 tháng 7 năm 2026 (cập nhật lần cuối: 15 tháng 8 năm 2026)',
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
          '<li>Tùy chọn: giờ sinh (bạn có thể chọn "không rõ"), địa chỉ email (chỉ dùng để ngăn chặn lạm dụng bản dùng thử miễn phí)</li>' +
          '<li>Thu thập tự động: mã định danh xác thực Firebase (UID), token thông báo đẩy của thiết bị (FCM), trạng thái đăng ký/mua hàng (qua RevenueCat), tín hiệu toàn vẹn thiết bị từ Google Play Integrity dùng để ngăn chặn lạm dụng bản dùng thử miễn phí, dữ liệu chẩn đoán lỗi/sự cố, và — chỉ trên trang hợp nhau công khai — địa chỉ IP của bạn, được dùng trong thời gian ngắn để giới hạn tần suất yêu cầu nhằm ngăn lạm dụng, không lưu trữ lâu dài</li>' +
          '<li>Kết quả tính toán cá nhân hóa: toàn bộ lá số saju của bạn (tứ trụ: năm, tháng, ngày, giờ), được tính toán từ ngày và giờ sinh bạn cung cấp trong quá trình thiết lập ban đầu — dùng để cá nhân hóa thư hằng tuần và hằng tháng</li>' +
          '<li>Nội dung bạn viết: văn bản tự do bạn nhập trong tính năng "Câu Chuyện Hôm Nay", được gửi đến nhà cung cấp AI để tạo phản hồi cá nhân hóa; và tiêu đề, nội dung bạn nhập khi liên hệ Hỗ trợ</li>' +
          '<li>Thu thập khi bạn dùng trang web tiếp thị của chúng tôi (saju-letter.com): địa chỉ email bạn cung cấp khi đăng ký, cùng với việc bạn có đồng ý nhận email tiếp thị hay không và thời điểm đồng ý; và nếu bạn gửi biểu mẫu trang Tết Nguyên Đán công khai, tên, thông tin saju đã tính toán và văn bản tự do bạn nhập (ngày sinh thực tế của bạn không bao giờ được gửi đến máy chủ của chúng tôi — nó được tính toán hoàn toàn trên thiết bị của chính bạn)</li>' +
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
          '<li>Để cải thiện dịch vụ và xử lý lỗi</li>' +
          '</ul>',
      },
      {
        heading: '3. Thời gian lưu trữ',
        html:
          '<p>Chúng tôi xóa thông tin của bạn khi bạn đóng tài khoản (hoặc ngay sau khi nhận được yêu cầu xóa).</p>' +
          '<p>Ngày sinh và giờ sinh của bạn, cũng như văn bản bạn viết trong tính năng "Câu Chuyện Hôm Nay" và phản hồi của nó, được lưu trữ ở dạng mã hóa (AES-256). Các kết quả đã tính toán (thiên can ngày, địa chi tháng, địa chi giờ) tự thân không thể nhận dạng cá nhân, nên chúng tôi lưu trữ chúng mà không mã hóa.</p>' +
          '<p>Khi pháp luật yêu cầu lưu trữ lâu hơn (ví dụ: hồ sơ thanh toán), chúng tôi chỉ giữ dữ liệu đó trong thời gian pháp luật yêu cầu trước khi xóa.</p>',
      },
      {
        heading: '4. Bên thứ ba mà chúng tôi chia sẻ dữ liệu',
        html:
          '<p>Chúng tôi chỉ chia sẻ dữ liệu với các bên thứ ba sau trong phạm vi cần thiết để cung cấp dịch vụ:</p>' +
          '<ul>' +
          '<li><strong>Firebase (Google)</strong>: xác thực và thông báo đẩy</li>' +
          '<li><strong>RevenueCat</strong>: quản lý trạng thái đăng ký (thanh toán thực tế được xử lý qua Google Play Billing; chúng tôi không tự lưu trữ thẻ hay thông tin thanh toán của bạn)</li>' +
          '<li><strong>Nhà cung cấp nội dung AI của chúng tôi</strong> (hiện tại là OpenAI; có thể là Anthropic hoặc Google tùy theo cấu hình): tạo nội dung câu chữ cho thư của bạn và các phản hồi trong tính năng "Câu Chuyện Hôm Nay". Việc này có thể bao gồm các giá trị saju đã tính toán của bạn và văn bản bạn viết trong tính năng "Câu Chuyện Hôm Nay".</li>' +
          '<li><strong>Resend</strong>: gửi email tiếp thị và email kết quả Tết Nguyên Đán</li>' +
          '<li><strong>Sentry</strong>: giám sát lỗi và sự cố</li>' +
          '</ul>',
      },
      {
        heading: '5. Tính năng chia sẻ mức độ hợp nhau và dữ liệu của người không phải thành viên (khách)',
        html:
          '<p>Một người bạn mở liên kết hợp nhau mà bạn chia sẻ không cần tạo tài khoản — họ chỉ cần nhập tên ' +
          'và ngày sinh. Ngày sinh thực tế của họ không bao giờ được gửi đến máy chủ của chúng tôi; nó được ' +
          'tính toán hoàn toàn trên thiết bị hoặc trình duyệt của chính họ, và chỉ giá trị "thiên can ngày" kết ' +
          'quả (không thể nhận dạng cá nhân) mới được gửi và lưu trữ. Tên họ nhập chỉ được dùng để hiển thị ' +
          'trên màn hình kết quả và không được dùng cho mục đích nào khác.</p>',
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
          '<li>Thông tin nhạy cảm như ngày sinh, giờ sinh và văn bản, phản hồi trong tính năng "Câu Chuyện Hôm Nay" được lưu trữ bằng mã hóa AES-256</li>' +
          '<li>Khóa mã hóa được quản lý thông qua dịch vụ quản lý khóa chuyên dụng (KMS) và không bao giờ được viết cứng trong mã nguồn</li>' +
          '<li>Việc truy cập trang quản trị yêu cầu xác thực riêng biệt</li>' +
          '</ul>',
      },
      {
        heading: '8. Quyền riêng tư của trẻ em',
        html:
          '<p>Dịch vụ này dành cho người dùng từ 16 tuổi trở lên, và ứng dụng xác minh điều này bằng ngày sinh ' +
          'bạn cung cấp trong quá trình thiết lập ban đầu. Chúng tôi không cố ý thu thập thông tin cá nhân từ ' +
          'trẻ em dưới 16 tuổi. Nếu biết được rằng một trẻ em dưới 16 tuổi đã sử dụng dịch vụ, chúng tôi sẽ ' +
          'thực hiện các biện pháp phù hợp để xóa thông tin liên quan kịp thời.</p>',
      },
      {
        heading: '9. Liên hệ với chúng tôi',
        html: `<p>Đối với các câu hỏi liên quan đến quyền riêng tư hoặc yêu cầu truy cập, chỉnh sửa hay xóa thông tin của bạn, vui lòng liên hệ với chúng tôi tại:</p><p>Email: <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a></p>`,
      },
      {
        heading: '10. Thay đổi đối với chính sách này',
        html:
          '<p>Chính sách này có hiệu lực từ ngày 29 tháng 7 năm 2026 và có thể được cập nhật khi các hoạt động ' +
          'của chúng tôi, luật hiện hành hoặc bản thân dịch vụ thay đổi (cập nhật lần cuối: 15 tháng 8 năm ' +
          '2026). Chúng tôi sẽ thông báo cho bạn về những thay đổi quan trọng thông qua ứng dụng hoặc trang này.</p>',
      },
    ],
  },
};
