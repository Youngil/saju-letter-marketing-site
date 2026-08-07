'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { unsubscribeLead } from '@/lib/api';
import type { MarketingDictionary } from '@/dictionaries/types';

type Status = 'loading' | 'unsubscribed' | 'already_unsubscribed' | 'not_found' | 'missing_token';

export function UnsubscribeStatus({ dict }: { dict: MarketingDictionary['unsubscribe'] }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>(token ? 'loading' : 'missing_token');

  useEffect(() => {
    if (!token) return;
    unsubscribeLead(token)
      .then((result) => {
        setStatus(result.status === 'unsubscribed' || result.status === 'already_unsubscribed' ? (result.status as Status) : 'not_found');
      })
      .catch(() => setStatus('not_found'));
  }, [token]);

  const message =
    status === 'loading'
      ? dict.loading
      : status === 'unsubscribed'
        ? dict.success
        : status === 'already_unsubscribed'
          ? dict.alreadyUnsubscribed
          : dict.notFound;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">{dict.title}</h1>
      <p className="text-foreground/70">{message}</p>
    </div>
  );
}
