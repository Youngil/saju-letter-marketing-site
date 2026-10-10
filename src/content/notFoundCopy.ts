/**
 * 404 화면 문구 — 6개 언어(2026-10-10 전체 점검 14차). `[lang]/not-found.tsx`와 `app/global-not-found.tsx`가 함께 쓴다.
 *
 * 사전(`dictionaries/*`)이 아니라 여기 두는 이유: `not-found`는 props를 받지 못해 서버에서 언어를 모르므로 6개 언어 문구를
 * 함께 넘겨야 하는데, `[lang]/not-found.tsx`의 결과는 Next가 **모든 페이지의 RSC 페이로드**에 미리 실어 보낸다(빌드로 확인 —
 * 사전에서 넘기게 했더니 /ko 홈 HTML에 6개 언어 404 문구가 들어 있었다). 그래서 `errorCopy.ts`처럼 작은 모듈로 두고 클라이언트
 * 컴포넌트가 import한다(페이지 HTML마다 싣지 않고 한 번 받은 JS 조각을 캐시로 쓴다).
 */
export interface NotFoundCopy {
  title: string;
  body: string;
  homeLink: string;
  demoLink: string;
}

export const NOT_FOUND_COPY: Record<string, NotFoundCopy> = {
  ko: {
    title: '찾으시는 페이지가 없어요',
    body: '주소가 바뀌었거나 더 이상 없는 페이지예요. 홈에서 다인의 오늘 편지를 먼저 읽어 보세요.',
    homeLink: '홈으로',
    demoLink: '오늘의 편지 미리 보기',
  },
  en: {
    title: "We couldn't find that page",
    body: "The address may have changed, or the page no longer exists. Start from the home page and read today's letter from Dain.",
    homeLink: 'Go to home',
    demoLink: "Preview today's letter",
  },
  ja: {
    title: 'お探しのページが見つかりません',
    body: 'アドレスが変わったか、ページがなくなった可能性があります。ホームでダインの今日の手紙を読んでみてください。',
    homeLink: 'ホームへ',
    demoLink: '今日の手紙をプレビュー',
  },
  es: {
    title: 'No encontramos esa página',
    body: 'Puede que la dirección haya cambiado o que la página ya no exista. Empieza desde el inicio y lee la carta de hoy de Dain.',
    homeLink: 'Ir al inicio',
    demoLink: 'Ver la carta de hoy',
  },
  pt: {
    title: 'Não encontramos essa página',
    body: 'O endereço pode ter mudado ou a página não existe mais. Comece pela página inicial e leia a carta de hoje da Dain.',
    homeLink: 'Ir para o início',
    demoLink: 'Ver a carta de hoje',
  },
  vi: {
    title: 'Không tìm thấy trang này',
    body: 'Địa chỉ có thể đã thay đổi hoặc trang không còn nữa. Hãy bắt đầu từ trang chủ và đọc lá thư hôm nay của Dain.',
    homeLink: 'Về trang chủ',
    demoLink: 'Xem trước lá thư hôm nay',
  },
};

/** 언어 코드로 문구를 고른다 — 모르는 값이면 영어. */
export function notFoundCopyFor(lang: string | null | undefined): { lang: string; copy: NotFoundCopy } {
  if (lang && Object.hasOwn(NOT_FOUND_COPY, lang)) return { lang, copy: NOT_FOUND_COPY[lang]! };
  return { lang: 'en', copy: NOT_FOUND_COPY.en! };
}
