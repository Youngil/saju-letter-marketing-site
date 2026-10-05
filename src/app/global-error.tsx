'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { errorCopyFor } from '@/content/errorCopy';

/**
 * 루트 레이아웃(`[lang]/layout.tsx`)까지 실패했을 때의 화면(2026-10-06 전체 점검 8차). 레이아웃이 서비스 언어 목록
 * (`fetchActiveServiceLanguages`)을 받다가, 인스턴스가 막 떠서 마지막 성공 값이 없을 때 백엔드가 응답하지 않으면 일부러
 * 던진다(빌드 때 받은 값은 내부 키 헤더 때문에 캐시 키가 달라 실행 중엔 못 쓴다). `[lang]/error.tsx`는 같은 세그먼트의
 * 레이아웃 오류를 잡지 못해 예전엔 Next 기본 영어 오류 화면이 떴다.
 *
 * 이 화면은 루트 레이아웃을 대신하므로 `<html>`/`<body>`를 직접 그리고, 전역 CSS가 실리지 않아 스타일은 인라인으로 둔다.
 * 언어는 주소 첫 마디(`/ko/...`)로 고르고, 문구는 `[lang]/error.tsx`와 같은 `ERROR_COPY`.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();
  const { lang, copy } = errorCopyFor(pathname?.split('/')[1]);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={lang}>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fbf6ee',
          color: '#2b2621',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <title>{copy.title}</title>
        <main style={{ maxWidth: 480, padding: '80px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px' }}>{copy.title}</p>
          <p style={{ fontSize: 14, opacity: 0.6, margin: '0 0 20px' }}>{copy.body}</p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              border: '1px solid rgba(43, 38, 33, 0.2)',
              borderRadius: 9999,
              background: 'transparent',
              color: 'inherit',
              padding: '8px 20px',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {copy.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
