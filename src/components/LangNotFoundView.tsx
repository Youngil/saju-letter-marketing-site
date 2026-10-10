'use client';

import { useParams } from 'next/navigation';
import { notFoundCopyFor } from '@/content/notFoundCopy';
import { NotFoundView } from './NotFoundView';

/** `[lang]/not-found.tsx`용 — not-found는 params를 받지 못해 주소의 `[lang]`으로 언어를 고른다(`[lang]/error.tsx`와 같은 방식). */
export function LangNotFoundView() {
  const params = useParams<{ lang?: string }>();
  const { lang, copy } = notFoundCopyFor(typeof params?.lang === 'string' ? params.lang : undefined);
  return <NotFoundView lang={lang} copy={copy} />;
}
