import type { MarketingLanguage } from '@/lib/languages';

/**
 * 서비스 이용 안내(오락 목적 고지) — saju-letter-mobile의 `disclaimer.{title,short,body}`
 * (`src/i18n/locales/*.json`)를 그대로 포팅한 것이다(2026-09-02). 앱은 이 고지를
 * 온보딩 확인 화면·"오늘의 이야기" 작성 박스에 축약본(`short`)으로, 설정 화면의
 * "서비스 이용 안내"에 전문(`body`)을 상시 노출하는데, 마케팅 사이트(비로그인 상태에서
 * 실제로 AI 리딩을 즉시 받는 홈 미니 데모·궁합 공유 결과·신년운세 결과)에는 이 고지가
 * 전혀 없다는 걸 사용자가 지적해 신설했다 — 개인정보처리방침(privacyPolicy.ts)이 이미
 * 2026-08-12에 이 사이트로 이관된 것과 같은 이유(법적/안전 고지는 앱 밖에서도 동일하게
 * 보여야 한다)다.
 *
 * 문구 자체는 앱과 완전히 동일하게 유지한다(번역을 새로 하지 않고 그대로 포팅) — 같은
 * 서비스에 대해 앱과 사이트가 서로 다른 문구로 오락 목적을 고지하면 오히려 혼란을 준다.
 * 앱의 `disclaimer.short`가 `body`보다 적은 항목(투자 조언 미언급 등)을 나열하는
 * 불일치는 포팅 시점에도 그대로 남아있다 — meta 저장소 CLAUDE.md 참고, 축약 과정의
 * 자연스러운 생략으로 판단해 앱 쪽에서도 손대지 않은 것과 같은 이유로 이 파일에서도
 * 정정하지 않았다.
 *
 * `short`는 홈 미니 데모(`DemoForm.tsx`)·궁합 공유 결과(`CompatView.tsx`)·신년운세 결과
 * (`lunar-new-year/r/[id]/page.tsx`) 세 곳이 AI 생성 결과 바로 옆에 직접 import해서 쓴다
 * (각 언어 dictionaries에 문구를 중복 정의하는 대신 이 파일 하나를 공유 출처로 둔다).
 * `title`/`body`는 `/[lang]/disclaimer` 전용 페이지가 쓴다.
 */
export interface DisclaimerContent {
  title: string;
  short: string;
  body: string;
}

export const DISCLAIMER_CONTENT: Record<MarketingLanguage, DisclaimerContent> = {
  ko: {
    title: '서비스 이용 안내',
    short: '이 서비스는 오락 목적의 사주 해석이며, 전문적인 상담·의료·법률 자문을 대체하지 않아요.',
    body: '사주편지는 전통 사주(四柱) 정보를 바탕으로 한 오락 목적의 개인화 콘텐츠 서비스입니다.\n\n여기서 제공하는 모든 해석과 답장은 재미와 위로를 드리기 위한 것이며, 의학적 진단, 심리 상담, 법률 자문, 투자 조언을 대신하지 않습니다.\n\n건강, 정서적 문제, 법률, 재정 문제로 어려움을 겪고 계시다면 반드시 해당 분야의 전문가나 관련 기관의 도움을 받으시길 권합니다.\n\n서비스 이용에 따른 결정과 그 결과는 전적으로 이용자 본인의 판단과 책임에 따릅니다.',
  },
  en: {
    title: 'About This Service',
    short: 'This service offers entertainment-based Saju readings and is not a substitute for professional counseling, medical, or legal advice.',
    body: "Saju Letter is a personalized content service based on traditional Korean Saju (four pillars) readings, provided for entertainment purposes.\n\nAll interpretations and replies are meant to entertain and offer comfort — they are not medical diagnoses, psychological counseling, legal advice, or financial/investment advice.\n\nIf you're dealing with health, mental health, legal, or financial difficulties, please seek help from a qualified professional or relevant support service.\n\nDecisions you make based on this service, and their outcomes, are entirely your own responsibility.",
  },
  ja: {
    title: 'サービスのご案内',
    short: '本サービスは娯楽目的の四柱推命コンテンツであり、専門的なカウンセリング・医療・法律相談の代わりにはなりません。',
    body: 'サジュレターは、伝統的な四柱推命の情報をもとにした、娯楽目的の個人向けコンテンツサービスです。\n\nここで提供されるすべての解釈や返信は、楽しみや励ましのためのものであり、医学的診断、心理カウンセリング、法律相談、投資助言に代わるものではありません。\n\n健康、心の悩み、法律、金銭面の問題でお困りの場合は、必ず専門家や関連機関にご相談ください。\n\n本サービスの利用に基づく判断とその結果は、すべて利用者ご自身の責任となります。',
  },
  es: {
    title: 'Sobre este servicio',
    short: 'Este servicio ofrece lecturas de Saju con fines de entretenimiento y no sustituye el asesoramiento profesional, médico o legal.',
    body: 'Saju Letter es un servicio de contenido personalizado basado en las lecturas tradicionales coreanas de Saju (cuatro pilares), ofrecido con fines de entretenimiento.\n\nTodas las interpretaciones y respuestas están pensadas para entretener y ofrecer consuelo — no son diagnósticos médicos, asesoramiento psicológico, asesoría legal ni consejo financiero o de inversión.\n\nSi estás lidiando con dificultades de salud, salud mental, legales o financieras, por favor busca ayuda de un profesional calificado o un servicio de apoyo relevante.\n\nLas decisiones que tomes basándote en este servicio, y sus resultados, son enteramente tu propia responsabilidad.',
  },
  pt: {
    title: 'Sobre este serviço',
    short: 'Este serviço oferece leituras de Saju com fins de entretenimento e não substitui aconselhamento profissional, médico ou jurídico.',
    body: 'O Saju Letter é um serviço de conteúdo personalizado baseado nas leituras tradicionais coreanas de Saju (quatro pilares), oferecido para fins de entretenimento.\n\nTodas as interpretações e respostas têm o objetivo de entreter e oferecer conforto — elas não são diagnósticos médicos, aconselhamento psicológico, assessoria jurídica ou conselho financeiro/de investimento.\n\nSe você estiver lidando com dificuldades de saúde, saúde mental, jurídicas ou financeiras, procure ajuda de um profissional qualificado ou de um serviço de apoio relevante.\n\nAs decisões que você tomar com base neste serviço, e seus resultados, são inteiramente de sua própria responsabilidade.',
  },
  vi: {
    title: 'Về dịch vụ này',
    short: 'Dịch vụ này cung cấp các bài đọc Saju mang tính giải trí và không thay thế cho tư vấn chuyên môn, y tế hoặc pháp lý.',
    body: 'Saju Letter là dịch vụ nội dung cá nhân hóa dựa trên các bài đọc Saju (tứ trụ) truyền thống của Hàn Quốc, được cung cấp cho mục đích giải trí.\n\nMọi diễn giải và phản hồi đều nhằm mục đích giải trí và mang lại sự an ủi — chúng không phải là chẩn đoán y tế, tư vấn tâm lý, tư vấn pháp lý hay lời khuyên tài chính/đầu tư.\n\nNếu bạn đang gặp khó khăn về sức khỏe, sức khỏe tâm thần, pháp lý hoặc tài chính, vui lòng tìm kiếm sự giúp đỡ từ một chuyên gia có trình độ hoặc dịch vụ hỗ trợ liên quan.\n\nCác quyết định bạn đưa ra dựa trên dịch vụ này, và kết quả của chúng, hoàn toàn là trách nhiệm của riêng bạn.',
  },
};
