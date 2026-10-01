import type { MarketingLanguage } from '@/lib/languages';

/**
 * 궁합 공유 웹페이지 문구 — saju-letter-backend/public/compat.js의 STRINGS(폼/결과 화면 UI)와
 * src/services/compatOgTags.ts의 상태별 OG 제목/설명을 한 파일로 합쳤다(2026-08-12 이관). 원래
 * 두 개가 다른 런타임(브라우저 vs 서버)에 있어서 나뉘어 있었을 뿐, 같은 기능의 카피라 이제
 * 같은 Next.js 앱 안에 있으니 합치는 게 자연스럽다. 옛 OG 문구는 크롤러가 Accept-Language를
 * 잘 안 보낸다는 이유로 영어 고정이었는데, 이제 진짜 `/{lang}/...` 라우트를 갖게 됐으니 함께
 * 번역했다 — 링크를 사람이 직접 붙여넣는 경우(크롤러가 아니라)도 있어서 손해 볼 게 없다.
 *
 * privacyPolicy.ts와 같은 이유로 6개 언어(MARKETING_LANGUAGES) 전부 실제 서비스 대상이다 —
 * 궁합 공유는 번역 비용이 드는 마케팅 카피가 아니라, 이미 발급된 링크가 언어와 무관하게 계속
 * 동작해야 하는 트랜잭션성 UI 문구라는 논리다. **2026-09-07 커밋이 "모든 서비스를 1차 출시
 * 4개 언어로 좁힌다"는 결정을 이 콘텐츠에도 잘못 적용해 `compat/[token]/page.tsx`가 잠깐
 * pt/vi를 404 처리했으나, 2026-09-08 3차 종합 버그 점검(항목 2)으로 원복했다** — 이미
 * pt/vi로 공유된 궁합 링크를 조용히 깨뜨리는 부작용이 있었다.
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
  /** 링크를 보낸 회원의 이름을 받는다(2026-09-02) — 이 화면은 항상 게스트만 보므로 "OOO님과의
   *  궁합"의 OOO은 게스트 자신이 아니라 초대를 보낸 사람이어야 한다. */
  pairLine: (requesterName: string | null) => string;
  cta: string;
  /** 2026-10-02 편지 세계로 재구성 — 대기 화면 제목에 보낸 사람 이름(없으면 일반 문구). */
  pendingTitleFor: (requesterName: string | null) => string;
  pendingIntroLetter: string;
  /** 앱을 모르는 친구에게 이 서비스가 무엇인지 한 줄로. */
  aboutLine: string;
  fromName: string;
  fromRole: string;
  signature: string;
  ctaTitle: string;
  ctaBody: string;
  og: {
    not_found: CompatOgCopy;
    expired: CompatOgCopy;
    completed: { titleFor: (requesterName: string | null) => string; description: string };
    pending: { titleFor: (requesterName: string | null) => string; description: string };
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
    pairLine: (requesterName) => (requesterName ? `${requesterName}님과의 궁합` : '친구와의 궁합'),
    cta: '사주편지에서 나만의 편지도 받아보기',
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName}님이 궁합 편지를 보냈어요` : '궁합 편지가 도착했어요'),
    pendingIntroLetter: '생년월일을 알려주면, 다인이 두 사람의 결을 읽고 짧은 편지로 답해 드려요. 가입하지 않아도 바로 볼 수 있어요.',
    aboutLine: '사주편지 · 다인이 매일 아침 보내는 사주 편지',
    fromName: '다인',
    fromRole: '편지 쓰는 사람',
    signature: '— 다인',
    ctaTitle: '나도 매일 아침, 다인의 편지 받아보기',
    ctaBody: '앱에서는 매일 아침 나만을 위한 편지가 오고, 궁금한 누구에게나 이렇게 궁합 편지를 보낼 수 있어요.',
    og: {
      not_found: { title: '사주편지 — 궁합 보기', description: '이 링크를 찾을 수 없어요. 보낸 사람에게 다시 확인해주세요.' },
      expired: { title: '사주편지 — 궁합 보기', description: '이 초대 링크는 만료됐어요. 초대를 보낸 사람에게 새 링크를 요청해주세요.' },
      completed: {
        titleFor: (requesterName) => (requesterName ? `${requesterName}님과의 궁합 — 사주편지` : '사주편지에서 확인한 궁합'),
        description: '두 사람의 일간이 어떻게 어울리는지, 짧고 유쾌한 한마디로 확인해보세요.',
      },
      pending: {
        titleFor: (requesterName) => (requesterName ? `${requesterName}님이 보낸 궁합 편지 — 사주편지` : '궁합 편지가 도착했어요 — 사주편지'),
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
    submit: 'See the result',
    submitting: 'Checking…',
    formError: 'Please fill in your name and birthdate correctly.',
    calcError: "We couldn't calculate that date. Please double-check it.",
    underageError: 'This service is only available to users aged 16 and older.',
    submitError: 'Something went wrong — please try again shortly.',
    pairLine: (requesterName) => `Compatibility with ${requesterName || 'a friend'}`,
    cta: 'Get your own daily letter from Saju Letter',
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName} sent you a compatibility letter` : 'A compatibility letter for you'),
    pendingIntroLetter: 'Share your birthdate and Dain will read how the two of you fit together, then answer in a short letter. No sign-up needed.',
    aboutLine: 'Saju Letter · a Korean saju letter from Dain, every morning',
    fromName: 'Dain',
    fromRole: 'The one who writes your letters',
    signature: '— Dain',
    ctaTitle: 'Get a letter from Dain every morning',
    ctaBody: 'In the app, a letter written just for you arrives each morning — and you can send a compatibility letter like this to anyone you are curious about.',
    og: {
      not_found: { title: 'Saju Letter — Compatibility Check', description: "This link isn't valid. Please double-check it with whoever sent it to you." },
      expired: { title: 'Saju Letter — Compatibility Check', description: 'This invite link has expired — ask your friend to send a new one.' },
      completed: {
        titleFor: (requesterName) => (requesterName ? `${requesterName}'s compatibility on Saju Letter` : 'A compatibility check on Saju Letter'),
        description: 'See how these two day masters match — a short, playful look from Saju Letter.',
      },
      pending: {
        titleFor: (requesterName) => (requesterName ? `${requesterName} sent you a compatibility letter — Saju Letter` : 'A compatibility letter for you — Saju Letter'),
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
    pairLine: (requesterName) => (requesterName ? `${requesterName}さんとの相性` : '友達との相性'),
    cta: 'サジュレターで毎日の手紙を受け取る',
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName}さんから相性の手紙が届きました` : '相性の手紙が届きました'),
    pendingIntroLetter: '生年月日を教えてくれたら、ダインがふたりの相性を読んで短い手紙で返します。登録しなくてもすぐ見られます。',
    aboutLine: 'サジュレター · ダインが毎朝届ける四柱の手紙',
    fromName: 'ダイン',
    fromRole: '手紙を書く人',
    signature: '— ダイン',
    ctaTitle: '毎朝、ダインの手紙を受け取る',
    ctaBody: 'アプリでは毎朝あなただけの手紙が届き、気になる人にこんな相性の手紙を送ることもできます。',
    og: {
      not_found: { title: 'サジュレター — 相性チェック', description: 'このリンクが見つかりませんでした。送ってくれた相手にご確認ください。' },
      expired: { title: 'サジュレター — 相性チェック', description: 'この招待リンクは期限切れです。招待した相手に新しいリンクをお願いしてください。' },
      completed: {
        titleFor: (requesterName) => (requesterName ? `${requesterName}さんとの相性 — サジュレター` : 'サジュレターでの相性診断結果'),
        description: '二人の日干がどう響き合うか、短く楽しい一言でチェック。',
      },
      pending: {
        titleFor: (requesterName) => (requesterName ? `${requesterName}さんからの相性の手紙 — サジュレター` : '相性の手紙が届きました — サジュレター'),
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
    pairLine: (requesterName) => `Compatibilidad con ${requesterName || 'un amigo'}`,
    cta: 'Recibe tu propia carta diaria de Saju Letter',
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName} te envió una carta de compatibilidad` : 'Tienes una carta de compatibilidad'),
    pendingIntroLetter: 'Comparte tu fecha de nacimiento y Dain leerá cómo encajan los dos y te responderá con una carta breve. No necesitas registrarte.',
    aboutLine: 'Saju Letter · una carta de saju coreano de Dain, cada mañana',
    fromName: 'Dain',
    fromRole: 'Quien escribe tus cartas',
    signature: '— Dain',
    ctaTitle: 'Recibe una carta de Dain cada mañana',
    ctaBody: 'En la app, cada mañana llega una carta escrita solo para ti, y puedes enviar una carta de compatibilidad como esta a quien quieras.',
    og: {
      not_found: { title: 'Saju Letter — Prueba de compatibilidad', description: 'Este enlace no es válido. Verifícalo con quien te lo envió.' },
      expired: { title: 'Saju Letter — Prueba de compatibilidad', description: 'Este enlace de invitación ha caducado — pide a tu amigo que te envíe uno nuevo.' },
      completed: {
        titleFor: (requesterName) => (requesterName ? `Compatibilidad de ${requesterName} en Saju Letter` : 'Una prueba de compatibilidad en Saju Letter'),
        description: 'Descubre cómo conectan sus días maestros — un vistazo breve y divertido de Saju Letter.',
      },
      pending: {
        titleFor: (requesterName) => (requesterName ? `${requesterName} te envió una carta de compatibilidad — Saju Letter` : 'Tienes una carta de compatibilidad — Saju Letter'),
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
    pairLine: (requesterName) => `Compatibilidade com ${requesterName || 'um amigo'}`,
    cta: 'Receba sua própria carta diária do Saju Letter',
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName} te enviou uma carta de compatibilidade` : 'Você recebeu uma carta de compatibilidade'),
    pendingIntroLetter: 'Conte sua data de nascimento e Dain vai ler como vocês dois combinam e responder com uma carta curta. Não precisa se cadastrar.',
    aboutLine: 'Saju Letter · uma carta de saju coreano de Dain, toda manhã',
    fromName: 'Dain',
    fromRole: 'Quem escreve suas cartas',
    signature: '— Dain',
    ctaTitle: 'Receba uma carta de Dain toda manhã',
    ctaBody: 'No app, toda manhã chega uma carta escrita só para você — e você pode mandar uma carta de compatibilidade como esta para quem quiser.',
    og: {
      not_found: { title: 'Saju Letter — Verificação de compatibilidade', description: 'Este link não é válido. Verifique com quem te enviou.' },
      expired: { title: 'Saju Letter — Verificação de compatibilidade', description: 'Este link de convite expirou — peça ao seu amigo para enviar um novo.' },
      completed: {
        titleFor: (requesterName) => (requesterName ? `Compatibilidade de ${requesterName} no Saju Letter` : 'Uma verificação de compatibilidade no Saju Letter'),
        description: 'Veja como os dias mestres combinam — um olhar curto e divertido do Saju Letter.',
      },
      pending: {
        titleFor: (requesterName) => (requesterName ? `${requesterName} te enviou uma carta de compatibilidade — Saju Letter` : 'Você recebeu uma carta de compatibilidade — Saju Letter'),
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
    pairLine: (requesterName) => `Mức độ hợp nhau với ${requesterName || 'một người bạn'}`,
    cta: 'Nhận lá thư hằng ngày của riêng bạn từ Saju Letter',
    pendingTitleFor: (requesterName) => (requesterName ? `${requesterName} đã gửi bạn một lá thư hợp nhau` : 'Bạn có một lá thư hợp nhau'),
    pendingIntroLetter: 'Cho biết ngày sinh của bạn, Dain sẽ đọc xem hai người hợp nhau thế nào và trả lời bằng một lá thư ngắn. Không cần đăng ký.',
    aboutLine: 'Saju Letter · lá thư saju Hàn Quốc từ Dain mỗi sáng',
    fromName: 'Dain',
    fromRole: 'Người viết thư cho bạn',
    signature: '— Dain',
    ctaTitle: 'Nhận thư của Dain mỗi sáng',
    ctaBody: 'Trong ứng dụng, mỗi sáng sẽ có một lá thư viết riêng cho bạn, và bạn có thể gửi lá thư hợp nhau như thế này cho bất kỳ ai.',
    og: {
      not_found: { title: 'Saju Letter — Kiểm tra mức độ hợp nhau', description: 'Liên kết này không hợp lệ. Vui lòng kiểm tra lại với người đã gửi cho bạn.' },
      expired: { title: 'Saju Letter — Kiểm tra mức độ hợp nhau', description: 'Liên kết mời này đã hết hạn — hãy nhờ bạn của bạn gửi liên kết mới.' },
      completed: {
        titleFor: (requesterName) => (requesterName ? `Mức độ hợp nhau của ${requesterName} trên Saju Letter` : 'Một kết quả hợp nhau trên Saju Letter'),
        description: 'Xem thiên can ngày của hai người hợp nhau ra sao — một kết quả ngắn gọn, thú vị từ Saju Letter.',
      },
      pending: {
        titleFor: (requesterName) => (requesterName ? `${requesterName} đã gửi bạn một lá thư hợp nhau — Saju Letter` : 'Bạn có một lá thư hợp nhau — Saju Letter'),
        description: 'Một người bạn đã mời bạn kiểm tra mức độ hợp nhau trên Saju Letter. Nhập ngày sinh để xem ngay.',
      },
    },
  },
};

/**
 * 상태별 OG 제목·설명(2026-10-02) — 대기 중에도 보낸 사람 이름을 미리보기 카드에 넣는다(카톡 등에서
 * "사주편지 — 궁합 보기"만 보이면 눌러 볼 이유가 약했다). page.tsx 메타데이터와 opengraph-image.tsx가 함께 쓴다.
 */
export function resolveCompatOg(
  content: CompatContent,
  view: { status: 'not_found' } | { status: 'expired' } | { status: 'pending'; requesterName?: string | null } | { status: 'completed'; requesterName: string | null },
): CompatOgCopy {
  if (view.status === 'completed') return { title: content.og.completed.titleFor(view.requesterName), description: content.og.completed.description };
  if (view.status === 'pending') return { title: content.og.pending.titleFor(view.requesterName ?? null), description: content.og.pending.description };
  return content.og[view.status];
}
