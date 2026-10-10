import type { MarketingLanguage } from '@/lib/languages';
import { DISCLAIMER_CONTENT } from './disclaimer';
import { COMPAT_NAME_LINES } from './compatNameLines';

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
  /** 음력 윤달 판정 모듈이 제출 때 처음 도착했고 고른 달이 그해 윤달인 달일 때(2026-10-06 전체 점검 3차) —
   *  체크박스가 이제 막 나타났으니 확인하고 다시 누르라고 안내한다. */
  leapMonthCheckHint: string;
  /** 사주 계산 모듈(지연 로드)을 받지 못했을 때 — 새로고침을 권한다. */
  loadError: string;
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
  /**
   * 앱 안내 — 매일 편지는 일간·일진·언어·문체·강약 조합별 공용이라 "나만을 위한/written just for you"처럼 한 사람에게만 따로
   * 쓴다고 말하지 않는다(2026-10-10 전체 점검 14차). "내 사주를 바탕으로"까지만.
   */
  ctaBody: string;
  /**
   * 만료·없는 초대 화면(2026-10-10 전체 점검 14차) — 예전엔 빨간 한 줄뿐이라 링크를 받은 친구가 그대로 떠났다. 이제 편지 셸 안에
   * 중립 제목 + 이유(`expired`/`notFound`) + 홈 데모로 가는 링크(`demoLink`) + 앱 배지.
   */
  unavailableTitle: string;
  unavailableBody: string;
  demoLink: string;
  /** 결과는 완료인데 궁합 글(배치 캐시)이 아직 없을 때 — 몇 번 다시 물어본 뒤 보여 주는 안내와 버튼(14차). */
  readingPendingTitle: string;
  readingPendingBody: string;
  refresh: string;
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
    leapMonthCheckHint: '그해에는 고른 달에 윤달이 있어요. 윤달에 태어났다면 아래에 체크하고, 아니면 그대로 다시 눌러주세요.',
    loadError: '화면 일부를 불러오지 못했어요. 페이지를 새로고침한 뒤 다시 시도해주세요.',
    pairLine: COMPAT_NAME_LINES.ko.pairLine,
    cta: '사주편지에서 매일 아침 편지도 받아보기',
    pendingTitleFor: COMPAT_NAME_LINES.ko.pendingTitleFor,
    pendingIntroLetter: '생년월일을 알려주면, 다인이 두 사람의 결을 읽고 짧은 편지로 답해 드려요. 가입하지 않아도 바로 볼 수 있어요.',
    aboutLine: '사주편지 · 다인이 매일 아침 보내는 사주 편지',
    fromName: '다인',
    fromRole: '편지 쓰는 사람',
    signature: '— 다인',
    ctaTitle: '나도 매일 아침, 다인의 편지 받아보기',
    ctaBody: '앱에서는 매일 아침 내 사주를 바탕으로 한 편지가 오고, 궁금한 누구에게나 이렇게 궁합 편지를 보낼 수 있어요.',
    unavailableTitle: '이 궁합 편지는 지금 열 수 없어요',
    unavailableBody: '대신 내 생년월일로 다인의 오늘 편지를 먼저 읽어 보세요. 가입 없이 무료예요.',
    demoLink: '오늘의 편지 미리 받아보기',
    readingPendingTitle: '편지가 곧 도착해요',
    readingPendingBody: '다인이 두 사람의 궁합 편지를 마무리하고 있어요. 잠시 뒤 새로고침하면 볼 수 있어요.',
    refresh: '새로고침',
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
    leapMonthCheckHint: 'The month you picked has a leap month that year. If you were born in the leap month, tick the box below; otherwise just tap the button again.',
    loadError: "Part of this page didn't load. Please refresh the page and try again.",
    pairLine: COMPAT_NAME_LINES.en.pairLine,
    cta: 'Get your own daily letter from Saju Letter',
    pendingTitleFor: COMPAT_NAME_LINES.en.pendingTitleFor,
    pendingIntroLetter: 'Share your birthdate and Dain will read how the two of you fit together, then answer in a short letter. No sign-up needed.',
    aboutLine: 'Saju Letter · a Korean saju letter from Dain, every morning',
    fromName: 'Dain',
    fromRole: 'The one who writes your letters',
    signature: '— Dain',
    ctaTitle: 'Get a letter from Dain every morning',
    ctaBody: 'In the app, a letter based on your own birth chart arrives each morning — and you can send a compatibility letter like this to anyone you are curious about.',
    unavailableTitle: "This compatibility letter can't be opened right now",
    unavailableBody: "In the meantime, read today's letter from Dain with your own birth date — free, no sign-up needed.",
    demoLink: "Preview today's letter",
    readingPendingTitle: 'Your letter is almost here',
    readingPendingBody: 'Dain is still finishing the compatibility letter for the two of you. Refresh in a moment to read it.',
    refresh: 'Refresh',
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
    leapMonthCheckHint: '選んだ月は、その年に閏月がある月です。閏月生まれなら下のチェックを入れ、そうでなければそのままもう一度押してください。',
    loadError: 'ページの一部を読み込めませんでした。ページを再読み込みしてから、もう一度お試しください。',
    pairLine: COMPAT_NAME_LINES.ja.pairLine,
    cta: 'サジュレターで毎日の手紙を受け取る',
    pendingTitleFor: COMPAT_NAME_LINES.ja.pendingTitleFor,
    pendingIntroLetter: '生年月日を教えてくれたら、ダインがふたりの相性を読んで短い手紙で返します。登録しなくてもすぐ見られます。',
    aboutLine: 'サジュレター · ダインが毎朝届ける四柱の手紙',
    fromName: 'ダイン',
    fromRole: '手紙を書く人',
    signature: '— ダイン',
    ctaTitle: '毎朝、ダインの手紙を受け取る',
    ctaBody: 'アプリでは毎朝あなたの生年月日をもとにした手紙が届き、気になる人にこんな相性の手紙を送ることもできます。',
    unavailableTitle: 'この相性の手紙は、いまは開けません',
    unavailableBody: 'そのかわりに、ご自身の生年月日でダインの今日の手紙を読んでみてください。登録不要・無料です。',
    demoLink: '今日の手紙をプレビュー',
    readingPendingTitle: 'まもなく手紙が届きます',
    readingPendingBody: 'ダインがおふたりの相性の手紙を仕上げているところです。少したってから再読み込みしてください。',
    refresh: '再読み込み',
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
    leapMonthCheckHint: 'Ese año, el mes que elegiste tiene un mes bisiesto. Si naciste en el mes bisiesto, marca la casilla de abajo; si no, vuelve a pulsar el botón.',
    loadError: 'No se pudo cargar parte de la página. Recárgala e inténtalo de nuevo.',
    pairLine: COMPAT_NAME_LINES.es.pairLine,
    cta: 'Recibe tu propia carta diaria de Saju Letter',
    pendingTitleFor: COMPAT_NAME_LINES.es.pendingTitleFor,
    pendingIntroLetter: 'Comparte tu fecha de nacimiento y Dain leerá cómo encajan los dos y te responderá con una carta breve. No necesitas registrarte.',
    aboutLine: 'Saju Letter · una carta de saju coreano de Dain, cada mañana',
    fromName: 'Dain',
    fromRole: 'Quien escribe tus cartas',
    signature: '— Dain',
    ctaTitle: 'Recibe una carta de Dain cada mañana',
    ctaBody: 'En la app, cada mañana llega una carta basada en tu propia carta natal, y puedes enviar una carta de compatibilidad como esta a quien quieras.',
    unavailableTitle: 'Esta carta de compatibilidad no se puede abrir ahora',
    unavailableBody: 'Mientras tanto, lee la carta de hoy de Dain con tu propia fecha de nacimiento: gratis y sin registrarte.',
    demoLink: 'Ver la carta de hoy',
    readingPendingTitle: 'Tu carta está por llegar',
    readingPendingBody: 'Dain está terminando la carta de compatibilidad para ustedes dos. Vuelve a cargar la página en un momento para leerla.',
    refresh: 'Volver a cargar',
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
    leapMonthCheckHint: 'Nesse ano, o mês escolhido tem um mês bissexto. Se você nasceu no mês bissexto, marque a caixa abaixo; se não, toque no botão de novo.',
    loadError: 'Não foi possível carregar parte da página. Recarregue a página e tente novamente.',
    pairLine: COMPAT_NAME_LINES.pt.pairLine,
    cta: 'Receba sua própria carta diária do Saju Letter',
    pendingTitleFor: COMPAT_NAME_LINES.pt.pendingTitleFor,
    pendingIntroLetter: 'Conte sua data de nascimento e Dain vai ler como vocês dois combinam e responder com uma carta curta. Não precisa se cadastrar.',
    aboutLine: 'Saju Letter · uma carta de saju coreano de Dain, toda manhã',
    fromName: 'Dain',
    fromRole: 'Quem escreve suas cartas',
    signature: '— Dain',
    ctaTitle: 'Receba uma carta de Dain toda manhã',
    ctaBody: 'No app, toda manhã chega uma carta com base no seu próprio mapa natal — e você pode mandar uma carta de compatibilidade como esta para quem quiser.',
    unavailableTitle: 'Esta carta de compatibilidade não pode ser aberta agora',
    unavailableBody: 'Enquanto isso, leia a carta de hoje da Dain com a sua própria data de nascimento — grátis e sem cadastro.',
    demoLink: 'Ver a carta de hoje',
    readingPendingTitle: 'Sua carta está quase chegando',
    readingPendingBody: 'A Dain está terminando a carta de compatibilidade de vocês dois. Recarregue a página daqui a pouco para ler.',
    refresh: 'Recarregar',
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
    leapMonthCheckHint: 'Năm đó, tháng bạn chọn có tháng nhuận. Nếu bạn sinh vào tháng nhuận, hãy đánh dấu ô bên dưới; nếu không, chỉ cần bấm nút lần nữa.',
    loadError: 'Không tải được một phần trang. Vui lòng tải lại trang rồi thử lại.',
    pairLine: COMPAT_NAME_LINES.vi.pairLine,
    cta: 'Nhận lá thư mỗi sáng từ Saju Letter',
    pendingTitleFor: COMPAT_NAME_LINES.vi.pendingTitleFor,
    pendingIntroLetter: 'Cho biết ngày sinh của bạn, Dain sẽ đọc xem hai người hợp nhau thế nào và trả lời bằng một lá thư ngắn. Không cần đăng ký.',
    aboutLine: 'Saju Letter · lá thư saju Hàn Quốc từ Dain mỗi sáng',
    fromName: 'Dain',
    fromRole: 'Người viết thư cho bạn',
    signature: '— Dain',
    ctaTitle: 'Nhận thư của Dain mỗi sáng',
    ctaBody: 'Trong ứng dụng, mỗi sáng sẽ có một lá thư dựa trên lá số của chính bạn, và bạn có thể gửi lá thư hợp nhau như thế này cho bất kỳ ai.',
    unavailableTitle: 'Hiện chưa thể mở lá thư hợp nhau này',
    unavailableBody: 'Trong lúc chờ, hãy đọc lá thư hôm nay của Dain bằng ngày sinh của chính bạn — miễn phí, không cần đăng ký.',
    demoLink: 'Xem trước lá thư hôm nay',
    readingPendingTitle: 'Lá thư sắp đến rồi',
    readingPendingBody: 'Dain đang hoàn thiện lá thư hợp nhau cho hai bạn. Hãy tải lại trang sau ít phút để đọc.',
    refresh: 'Tải lại',
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

/**
 * 궁합 화면(`CompatView`, 클라이언트)에 넘기는 문구 — 현재 언어의 **문자열 필드만**(2026-10-06 전체 점검 9차). 예전엔
 * 클라이언트가 `COMPAT_CONTENT`(6개 언어 전체 + OG 문구)와 `DISCLAIMER_CONTENT`(6개 언어 전문)를 import해 궁합 링크 첫 화면
 * 번들에 통째로 실렸다. 함수 필드(`pairLine`·`pendingTitleFor`·`og`)는 RSC 경계를 못 건너므로 빼고, 이름이 들어가는 두
 * 줄은 클라이언트가 작은 `COMPAT_NAME_LINES`에서 `language`로 직접 고른다.
 */
export type CompatViewCopy = Omit<CompatContent, 'pairLine' | 'pendingTitleFor' | 'og'> & {
  /** 결과 옆 오락 목적 고지(`DISCLAIMER_CONTENT[lang].short`). */
  disclaimerShort: string;
};

export function pickCompatViewCopy(language: MarketingLanguage): CompatViewCopy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 함수 필드를 빼고 문자열만 넘긴다.
  const { pairLine, pendingTitleFor, og, ...strings } = COMPAT_CONTENT[language];
  return { ...strings, disclaimerShort: DISCLAIMER_CONTENT[language].short };
}
