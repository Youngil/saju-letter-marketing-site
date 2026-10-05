'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

/** 사전 없이 짧게 6개 언어(2026-10-07 전체 점검 7차 — 예전엔 영어·한국어를 섞어 한 줄에 같이 보였다). */
const ERROR_COPY: Record<string, { title: string; body: string; retry: string }> = {
  ko: { title: '잠시 문제가 생겼어요', body: '잠시 후 다시 시도해 주세요.', retry: '다시 시도' },
  en: { title: 'Something went wrong', body: 'Please try again in a moment.', retry: 'Try again' },
  ja: { title: '問題が発生しました', body: 'しばらくしてからもう一度お試しください。', retry: 'もう一度試す' },
  es: { title: 'Algo salió mal', body: 'Inténtalo de nuevo en un momento.', retry: 'Intentar de nuevo' },
  pt: { title: 'Algo deu errado', body: 'Tente novamente em instantes.', retry: 'Tentar novamente' },
  vi: { title: 'Đã có lỗi xảy ra', body: 'Vui lòng thử lại sau giây lát.', retry: 'Thử lại' },
};

/**
 * 페이지 언어 — 주소의 `[lang]`(서버 렌더·하이드레이션이 같은 값을 보도록 먼저), 없으면 `<html lang>`(`Turnstile.tsx`와
 * 같은 방식), 그것도 없으면 영어.
 */
function useErrorCopy() {
  const params = useParams<{ lang?: string }>();
  const fromPath = typeof params?.lang === 'string' ? params.lang : undefined;
  const lang = fromPath ?? (typeof document === 'undefined' ? 'en' : document.documentElement.lang);
  return ERROR_COPY[lang] ?? ERROR_COPY.en!;
}

/**
 * 언어 경로 아래 페이지가 렌더 중 실패했을 때(2026-10-06) — 예전엔 error.tsx가 없어 기본 500 화면이 떴다.
 * 레이아웃(헤더·언어)은 그대로 두고 본문 자리에만 다시 시도 버튼을 보여 준다. 문구는 사전 없이 짧게 페이지 언어로.
 * 버튼은 `unstable_retry`(서버에서 다시 받아 그린다) — `reset`은 클라이언트에서 다시 그리기만 해서, 서버 렌더 중
 * 난 일시 오류(궁합 초대·신년운세 결과 조회의 429·5xx)는 눌러도 그대로였다(2026-10-06 전체 점검 3차).
 */
export default function LangError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  const copy = useErrorCopy();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="text-lg font-semibold">{copy.title}</p>
      <p className="text-sm text-foreground/60">{copy.body}</p>
      <button type="button" onClick={() => unstable_retry()} className="rounded-full border border-foreground/20 px-5 py-2 text-sm">
        {copy.retry}
      </button>
    </div>
  );
}
