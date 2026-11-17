import type { MarketingLanguage } from '@/lib/languages';

/**
 * 서비스 종료 안내(2026-11-17 사용자 확정 — 종료일 2026-12-18, meta `docs/shutdown-plan-2026-12-18.md`).
 *
 * `SERVICE_ENDING`이 true인 동안:
 * - 모든 페이지 맨 위에 종료 안내 띠(`ServiceEndingBanner`)를 띄운다.
 * - 앱 설치 버튼(`AppDownloadLinks`)을 그리지 않는다 — Play 앱은 11-18에 게시 중단, 구독 상품은 11-17에 비활성화.
 * - 홈·데모 결과의 소식 메일 등록 폼(`LeadCaptureForm`)을 그리지 않는다 — 보낼 소식이 없다.
 * - 신년운세 랜딩(`/[lang]/lunar-new-year`)은 기간과 상관없이 열지 않고 종료 안내만 보인다 — 백엔드 기간 계산으로는 12-15에
 *   자동으로 열린다. 이미 만든 결과(`r/[id]`)·수신거부 링크는 종료일까지 그대로 둔다.
 *
 * 문구는 브랜드 이름 자리 `{brand}`(사전 `brand`)와 문의 메일 `{contact}`를 채워 쓴다. ko 외 언어는 원어민 검토 전 초안.
 */
export const SERVICE_ENDING = true;

export const SERVICE_END_CONTACT = 'contact@mikomaru.com';

export interface ServiceEndingCopy {
  /** 모든 페이지 맨 위 한 줄 */
  banner: string;
  /** 신년운세 랜딩 제목 */
  newYearTitle: string;
  /** 신년운세 랜딩 본문 — `{contact}`를 채운다 */
  newYearBody: string;
}

export const SERVICE_ENDING_COPY: Record<MarketingLanguage, ServiceEndingCopy> = {
  ko: {
    banner: '{brand}는 2026년 12월 18일에 서비스를 마쳐요. 이제 새로 시작할 수 없고, 그날 계정과 모든 정보가 지워져요.',
    newYearTitle: '올해는 신년운세를 열지 않아요',
    newYearBody:
      '{brand}가 2026년 12월 18일에 서비스를 마치게 되어, 이번 새해에는 신년운세를 준비하지 않았어요. 그동안 찾아 주셔서 고마워요. 궁금한 점은 {contact}로 보내 주세요.',
  },
  en: {
    banner:
      '{brand} will close on December 18, 2026. New sign-ups are no longer possible, and all accounts and data will be deleted that day.',
    newYearTitle: 'No New Year reading this year',
    newYearBody:
      "{brand} is closing on December 18, 2026, so we won't be opening the New Year reading this season. Thank you for visiting. If you have questions, write to {contact}.",
  },
  ja: {
    banner: '{brand}は2026年12月18日にサービスを終了します。新しくご利用いただくことはできず、同日にアカウントとすべての情報を削除します。',
    newYearTitle: '今年は新年の運勢をお休みします',
    newYearBody:
      '{brand}は2026年12月18日にサービスを終了するため、今シーズンの新年の運勢はご用意していません。これまでありがとうございました。お問い合わせは{contact}までお願いします。',
  },
  es: {
    banner:
      '{brand} cerrará el 18 de diciembre de 2026. Ya no es posible registrarse, y ese día se eliminarán todas las cuentas y los datos.',
    newYearTitle: 'Este año no habrá lectura de Año Nuevo',
    newYearBody:
      '{brand} cerrará el 18 de diciembre de 2026, así que esta temporada no abriremos la lectura de Año Nuevo. Gracias por tu visita. Si tienes preguntas, escribe a {contact}.',
  },
  pt: {
    banner:
      '{brand} será encerrado em 18 de dezembro de 2026. Não é mais possível se cadastrar, e todas as contas e dados serão excluídos nesse dia.',
    newYearTitle: 'Não haverá leitura de Ano Novo este ano',
    newYearBody:
      '{brand} será encerrado em 18 de dezembro de 2026, por isso não vamos abrir a leitura de Ano Novo nesta temporada. Obrigado pela visita. Se tiver dúvidas, escreva para {contact}.',
  },
  vi: {
    banner:
      '{brand} sẽ ngừng hoạt động vào ngày 18 tháng 12 năm 2026. Không thể đăng ký mới nữa, và mọi tài khoản cùng dữ liệu sẽ bị xóa vào ngày đó.',
    newYearTitle: 'Năm nay không mở xem vận năm mới',
    newYearBody:
      '{brand} sẽ ngừng hoạt động vào ngày 18 tháng 12 năm 2026 nên mùa này chúng tôi không mở xem vận năm mới. Cảm ơn bạn đã ghé thăm. Mọi thắc mắc xin gửi về {contact}.',
  },
};

export function serviceEndingText(template: string, brand: string): string {
  return template.replaceAll('{brand}', brand).replaceAll('{contact}', SERVICE_END_CONTACT);
}
