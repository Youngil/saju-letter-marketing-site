'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiError, unsubscribeLead } from '@/lib/api';
import { unsubscribeFromCampaign } from '@/lib/lunarNewYearApi';
import type { MarketingDictionary } from '@/dictionaries/types';

type Status = 'loading' | 'unsubscribed' | 'already_unsubscribed' | 'not_found' | 'missing_token' | 'error';
type UnsubscribeDict = MarketingDictionary['unsubscribe'];

/**
 * 수신거부 화면 — 마케팅 리드(`kind="lead"`)와 신년운세 드립(`kind="newyear"`)이 같이 쓴다(2026-10-06 공용화, 예전엔
 * 거의 같은 컴포넌트가 두 벌이었다). 두 구독은 서로 다른 시스템이라 부르는 API만 다르다. 일시 오류(네트워크·429·5xx)를
 * 예전엔 "링크를 찾을 수 없음"으로 보여 줘 유저가 링크가 잘못됐다고 오해했다 — 404만 "없음", 나머지는 다시 시도.
 */
export function UnsubscribeStatus({ dict, kind }: { dict: UnsubscribeDict; kind: 'lead' | 'newyear' }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'missing_token');

  const run = useCallback(() => {
    if (!token) return;
    (kind === 'lead' ? unsubscribeLead(token) : unsubscribeFromCampaign(token))
      .then((result) => {
        setStatus(result.status === 'unsubscribed' || result.status === 'already_unsubscribed' ? (result.status as Status) : 'not_found');
      })
      .catch((error) => setStatus(error instanceof ApiError && error.status === 404 ? 'not_found' : 'error'));
  }, [kind, token]);

  useEffect(() => {
    run();
  }, [run]);

  const message =
    status === 'loading'
      ? dict.loading
      : status === 'unsubscribed'
        ? dict.success
        : status === 'already_unsubscribed'
          ? dict.alreadyUnsubscribed
          : status === 'error'
            ? dict.error
            : dict.notFound;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">{dict.title}</h1>
      <p className="text-foreground/70">{message}</p>
      {status === 'error' && (
        <button
          type="button"
          onClick={() => {
            setStatus('loading');
            run();
          }}
          className="rounded-full border border-foreground/20 px-5 py-2 text-sm">
          {dict.retry}
        </button>
      )}
    </div>
  );
}
