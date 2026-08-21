import type { MarketingLanguage } from '@/lib/languages';

/**
 * 궁합 공유 웹페이지 문구 — saju-letter-backend/public/compat.js의 STRINGS(폼/결과 화면 UI)와
 * src/services/compatOgTags.ts의 상태별 OG 제목/설명을 한 파일로 합쳤다(2026-08-12 이관). 원래
 * 두 개가 다른 런타임(브라우저 vs 서버)에 있어서 나뉘어 있었을 뿐, 같은 기능의 카피라 이제
 * 같은 Next.js 앱 안에 있으니 합치는 게 자연스럽다. 옛 OG 문구는 크롤러가 Accept-Language를
 * 잘 안 보낸다는 이유로 영어 고정이었는데, 이제 진짜 `/{lang}/...` 라우트를 갖게 됐으니 함께
 * 번역했다 — 링크를 사람이 직접 붙여넣는 경우(크롤러가 아니라)도 있어서 손해 볼 게 없다.
 *
 * privacyPolicy.ts와 같은 이유로 6개 언어(MARKETING_LANGUAGES) 전부 지원한다 — 궁합 공유는
 * 번역 비용이 드는 마케팅 카피가 아니라 트랜잭션성 UI 문구이고, 옛 compat.js도 이미 6개
 * 언어를 지원했다(축소하면 실제 기능 후퇴가 된다).
 */

export interface CompatOgCopy {
  title: string;
  description: string;
}

export interface CompatContent {
  loading: string;
  notFound: string;
  expired: string;
  pendingTitle: string;
  pendingIntro: string;
  nameLabel: string;
  namePlaceholder: string;
  calendarSolar: string;
  calendarLunar: string;
  yearLabel: string;
  monthLabel: string;
  dayLabel: string;
  leapMonthLabel: string;
  submit: string;
  submitting: string;
  formError: string;
  calcError: string;
  underageError: string;
  submitError: string;
  pairLine: (guestName: string | null) => string;
  cta: string;
  og: {
    not_found: CompatOgCopy;
    expired: CompatOgCopy;
    completed: { titleFor: (guestName: string | null) => string; description: string };
    pending: CompatOgCopy;
  };
}

export const COMPAT_CONTENT: Record<MarketingLanguage, CompatContent> = {
  ko: {
    loading: '불러오는 중…',
    notFound: '이 링크를 찾을 수 없어요. 링크를 다시 확인해주세요.',
    expired: '이 초대 링크는 만료됐어요. 초대를 보낸 사람에게 새 링크를 요청해주세요.',
    pendingTitle: '궁합을 확인해보세요',
    pendingIntro: '친구가 당신과의 궁합을 보내왔어요. 이름과 생년월일을 입력하면 바로 결과를 볼 수 있어요.',
    nameLabel: '이름',
    namePlaceholder: '이름을 입력하세요',
    calendarSolar: '양력',
    calendarLunar: '음력',
    yearLabel: '년',
    monthLabel: '월',
    dayLabel: '일',
    leapMonthLabel: '윤달이에요',
    submit: '궁합 보기',
    submitting: '확인하는 중…',
    formError: '이름과 생년월일을 정확히 입력해주세요.',
    calcError: '입력하신 날짜를 계산할 수 없어요. 날짜를 다시 확인해주세요.',
    underageError: '이 서비스는 만 16세 이상만 이용할 수 있어요.',
    submitError: '문제가 발생했어요. 잠시 후 다시 시도해주세요.',
    pairLine: (guestName) => `${guestName || '친구'}님과의 궁합`,
    cta: '사주편지에서 나만의 편지도 받아보기',
    og: {
      not_found: { title: '사주편지 — 궁합 보기', description: '이 링크를 찾을 수 없어요. 보낸 사람에게 다시 확인해주세요.' },
      expired: { title: '사주편지 — 궁합 보기', description: '이 초대 링크는 만료됐어요. 초대를 보낸 사람에게 새 링크를 요청해주세요.' },
      completed: {
        titleFor: (guestName) => (guestName ? `${guestName}님과의 궁합 — 사주편지` : '사주편지에서 확인한 궁합'),
        description: '두 사람의 일간이 어떻게 어울리는지, 짧고 유쾌한 한마디로 확인해보세요.',
      },
      pending: {
        title: '사주편지 — 궁합 보기',
        description: '친구가 궁합 확인을 보내왔어요. 생년월일을 입력하면 바로 결과를 볼 수 있어요.',
      },
    },
  },
  en: {
    loading: 'Loading…',
    notFound: "We couldn't find this link. Please double-check it.",
    expired: 'This invite link has expired — ask your friend to send a new one.',
    pendingTitle: 'Check your compatibility',
    pendingIntro: 'A friend shared a compatibility check with you. Enter your name and birthdate to see it instantly.',
    nameLabel: 'Name',
    namePlaceholder: 'Enter your name',
    calendarSolar: 'Solar calendar',
    calendarLunar: 'Lunar calendar',
    yearLabel: 'Year',
    monthLabel: 'Month',
    dayLabel: 'Day',
    leapMonthLabel: 'Leap month',
    submit: 'See the reading',
    submitting: 'Checking…',
    formError: 'Please fill in your name and birthdate correctly.',
    calcError: "We couldn't calculate that date. Please double-check it.",
    underageError: 'This service is only available to users aged 16 and older.',
    submitError: 'Something went wrong — please try again shortly.',
    pairLine: (guestName) => `Compatibility with ${guestName || 'you'}`,
    cta: 'Get your own daily letter from Saju Letter',
    og: {
      not_found: { title: 'Saju Letter — Compatibility Check', description: "This link isn't valid. Please double-check it with whoever sent it to you." },
      expired: { title: 'Saju Letter — Compatibility Check', description: 'This invite link has expired — ask your friend to send a new one.' },
      completed: {
        titleFor: (guestName) => (guestName ? `${guestName}'s compatibility on Saju Letter` : 'A compatibility reading on Saju Letter'),
        description: 'See how these two day masters match — a short, playful read from Saju Letter.',
      },
      pending: {
        title: 'Saju Letter — Compatibility Check',
        description: 'A friend invited you to check your compatibility on Saju Letter. Enter your birthdate to see it instantly.',
      },
    },
  },
  ja: {
    loading: '読み込み中…',
    notFound: 'このリンクが見つかりませんでした。リンクをご確認ください。',
    expired: 'この招待リンクは期限切れです。招待した相手に新しいリンクをお願いしてください。',
    pendingTitle: '相性をチェック',
    pendingIntro: '友達があなたとの相性を送ってくれました。お名前と生年月日を入力するとすぐに結果が見られます。',
    nameLabel: 'お名前',
    namePlaceholder: 'お名前を入力',
    calendarSolar: '新暦',
    calendarLunar: '旧暦',
    yearLabel: '年',
    monthLabel: '月',
    dayLabel: '日',
    leapMonthLabel: '閏月です',
    submit: '結果を見る',
    submitting: '確認中…',
    formError: 'お名前と生年月日を正しく入力してください。',
    calcError: 'その日付を計算できませんでした。もう一度ご確認ください。',
    underageError: '本サービスは満16歳以上の方のみご利用いただけます。',
    submitError: '問題が発生しました。しばらくしてからもう一度お試しください。',
    pairLine: (guestName) => `${guestName || 'あなた'}さんとの相性`,
    cta: 'サジュレターで毎日の手紙を受け取る',
    og: {
      not_found: { title: 'サジュレター — 相性チェック', description: 'このリンクが見つかりませんでした。送ってくれた相手にご確認ください。' },
      expired: { title: 'サジュレター — 相性チェック', description: 'この招待リンクは期限切れです。招待した相手に新しいリンクをお願いしてください。' },
      completed: {
        titleFor: (guestName) => (guestName ? `${guestName}さんとの相性 — サジュレター` : 'サジュレターでの相性診断結果'),
        description: '二人の日干がどう響き合うか、短く楽しい一言でチェック。',
      },
      pending: {
        title: 'サジュレター — 相性チェック',
        description: '友達があなたとの相性を送ってくれました。生年月日を入力するとすぐに結果が見られます。',
      },
    },
  },
  es: {
    loading: 'Cargando…',
    notFound: 'No pudimos encontrar este enlace. Por favor, verifícalo de nuevo.',
    expired: 'Este enlace de invitación ha caducado — pide a tu amigo que te envíe uno nuevo.',
    pendingTitle: 'Revisa tu compatibilidad',
    pendingIntro: 'Un amigo compartió contigo una prueba de compatibilidad. Ingresa tu nombre y fecha de nacimiento para verla al instante.',
    nameLabel: 'Nombre',
    namePlaceholder: 'Ingresa tu nombre',
    calendarSolar: 'Calendario solar',
    calendarLunar: 'Calendario lunar',
    yearLabel: 'Año',
    monthLabel: 'Mes',
    dayLabel: 'Día',
    leapMonthLabel: 'Mes bisiesto',
    submit: 'Ver el resultado',
    submitting: 'Verificando…',
    formError: 'Por favor completa correctamente tu nombre y fecha de nacimiento.',
    calcError: 'No pudimos calcular esa fecha. Por favor, verifícala de nuevo.',
    underageError: 'Este servicio solo está disponible para usuarios de 16 años o más.',
    submitError: 'Algo salió mal — inténtalo de nuevo en un momento.',
    pairLine: (guestName) => `Compatibilidad con ${guestName || 'ti'}`,
    cta: 'Recibe tu propia carta diaria de Saju Letter',
    og: {
      not_found: { title: 'Saju Letter — Prueba de compatibilidad', description: 'Este enlace no es válido. Verifícalo con quien te lo envió.' },
      expired: { title: 'Saju Letter — Prueba de compatibilidad', description: 'Este enlace de invitación ha caducado — pide a tu amigo que te envíe uno nuevo.' },
      completed: {
        titleFor: (guestName) => (guestName ? `Compatibilidad de ${guestName} en Saju Letter` : 'Una lectura de compatibilidad en Saju Letter'),
        description: 'Descubre cómo conectan sus días maestros — una lectura breve y divertida de Saju Letter.',
      },
      pending: {
        title: 'Saju Letter — Prueba de compatibilidad',
        description: 'Un amigo te invitó a revisar tu compatibilidad en Saju Letter. Ingresa tu fecha de nacimiento para verla al instante.',
      },
    },
  },
  pt: {
    loading: 'Carregando…',
    notFound: 'Não conseguimos encontrar este link. Verifique novamente.',
    expired: 'Este link de convite expirou — peça ao seu amigo para enviar um novo.',
    pendingTitle: 'Confira sua compatibilidade',
    pendingIntro: 'Um amigo compartilhou uma verificação de compatibilidade com você. Digite seu nome e data de nascimento para ver instantaneamente.',
    nameLabel: 'Nome',
    namePlaceholder: 'Digite seu nome',
    calendarSolar: 'Calendário solar',
    calendarLunar: 'Calendário lunar',
    yearLabel: 'Ano',
    monthLabel: 'Mês',
    dayLabel: 'Dia',
    leapMonthLabel: 'Mês bissexto',
    submit: 'Ver o resultado',
    submitting: 'Verificando…',
    formError: 'Preencha corretamente seu nome e data de nascimento.',
    calcError: 'Não conseguimos calcular essa data. Verifique novamente.',
    underageError: 'Este serviço está disponível apenas para usuários com 16 anos ou mais.',
    submitError: 'Algo deu errado — tente novamente em instantes.',
    pairLine: (guestName) => `Compatibilidade com ${guestName || 'você'}`,
    cta: 'Receba sua própria carta diária do Saju Letter',
    og: {
      not_found: { title: 'Saju Letter — Verificação de compatibilidade', description: 'Este link não é válido. Verifique com quem te enviou.' },
      expired: { title: 'Saju Letter — Verificação de compatibilidade', description: 'Este link de convite expirou — peça ao seu amigo para enviar um novo.' },
      completed: {
        titleFor: (guestName) => (guestName ? `Compatibilidade de ${guestName} no Saju Letter` : 'Uma leitura de compatibilidade no Saju Letter'),
        description: 'Veja como os dias mestres combinam — uma leitura curta e divertida do Saju Letter.',
      },
      pending: {
        title: 'Saju Letter — Verificação de compatibilidade',
        description: 'Um amigo te convidou para conferir sua compatibilidade no Saju Letter. Digite sua data de nascimento para ver na hora.',
      },
    },
  },
  vi: {
    loading: 'Đang tải…',
    notFound: 'Chúng tôi không tìm thấy liên kết này. Vui lòng kiểm tra lại.',
    expired: 'Liên kết mời này đã hết hạn — hãy nhờ bạn của bạn gửi liên kết mới.',
    pendingTitle: 'Xem mức độ hợp nhau của bạn',
    pendingIntro: 'Một người bạn đã chia sẻ kết quả hợp nhau với bạn. Nhập tên và ngày sinh để xem ngay.',
    nameLabel: 'Tên',
    namePlaceholder: 'Nhập tên của bạn',
    calendarSolar: 'Lịch dương',
    calendarLunar: 'Lịch âm',
    yearLabel: 'Năm',
    monthLabel: 'Tháng',
    dayLabel: 'Ngày',
    leapMonthLabel: 'Tháng nhuận',
    submit: 'Xem kết quả',
    submitting: 'Đang kiểm tra…',
    formError: 'Vui lòng nhập đúng tên và ngày sinh của bạn.',
    calcError: 'Chúng tôi không thể tính toán ngày này. Vui lòng kiểm tra lại.',
    underageError: 'Dịch vụ này chỉ dành cho người dùng từ 16 tuổi trở lên.',
    submitError: 'Đã xảy ra lỗi — vui lòng thử lại sau giây lát.',
    pairLine: (guestName) => `Mức độ hợp nhau với ${guestName || 'bạn'}`,
    cta: 'Nhận lá thư hằng ngày của riêng bạn từ Saju Letter',
    og: {
      not_found: { title: 'Saju Letter — Kiểm tra mức độ hợp nhau', description: 'Liên kết này không hợp lệ. Vui lòng kiểm tra lại với người đã gửi cho bạn.' },
      expired: { title: 'Saju Letter — Kiểm tra mức độ hợp nhau', description: 'Liên kết mời này đã hết hạn — hãy nhờ bạn của bạn gửi liên kết mới.' },
      completed: {
        titleFor: (guestName) => (guestName ? `Mức độ hợp nhau của ${guestName} trên Saju Letter` : 'Một kết quả hợp nhau trên Saju Letter'),
        description: 'Xem thiên can ngày của hai người hợp nhau ra sao — một bài đọc ngắn gọn, thú vị từ Saju Letter.',
      },
      pending: {
        title: 'Saju Letter — Kiểm tra mức độ hợp nhau',
        description: 'Một người bạn đã mời bạn kiểm tra mức độ hợp nhau trên Saju Letter. Nhập ngày sinh để xem ngay.',
      },
    },
  },
};
