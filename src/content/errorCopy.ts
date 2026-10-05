/**
 * 오류 화면 문구 — 사전 없이 짧게 6개 언어(2026-10-07 전체 점검 7차). `[lang]/error.tsx`(본문 자리)와 `app/global-error.tsx`
 * (루트 레이아웃까지 실패했을 때, 2026-10-06 전체 점검 8차)가 함께 쓴다. 두 화면 모두 클라이언트 컴포넌트라 서버 전용
 * `getDictionary`를 쓸 수 없고, 사전 전체를 번들에 싣지 않으려고 여기 따로 둔다.
 */
export interface ErrorCopy {
  title: string;
  body: string;
  retry: string;
}

export const ERROR_COPY: Record<string, ErrorCopy> = {
  ko: { title: '잠시 문제가 생겼어요', body: '잠시 후 다시 시도해 주세요.', retry: '다시 시도' },
  en: { title: 'Something went wrong', body: 'Please try again in a moment.', retry: 'Try again' },
  ja: { title: '問題が発生しました', body: 'しばらくしてからもう一度お試しください。', retry: 'もう一度試す' },
  es: { title: 'Algo salió mal', body: 'Inténtalo de nuevo en un momento.', retry: 'Intentar de nuevo' },
  pt: { title: 'Algo deu errado', body: 'Tente novamente em instantes.', retry: 'Tentar novamente' },
  vi: { title: 'Đã có lỗi xảy ra', body: 'Vui lòng thử lại sau giây lát.', retry: 'Thử lại' },
};

/** 언어 코드로 문구를 고른다 — 모르는 값이면 영어. */
export function errorCopyFor(lang: string | null | undefined): { lang: string; copy: ErrorCopy } {
  if (lang && Object.hasOwn(ERROR_COPY, lang)) return { lang, copy: ERROR_COPY[lang]! };
  return { lang: 'en', copy: ERROR_COPY.en! };
}
