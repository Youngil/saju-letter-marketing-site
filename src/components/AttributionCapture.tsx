'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

/**
 * 사이트에 처음 들어온 순간의 유입 채널(UTM·외부 referrer)을 기억해 둔다(2026-10-01).
 * 방문자가 블로그 등 배지가 없는 페이지로 들어왔다가 나중에 홈에서 Play 배지를 눌러도 원래
 * 채널이 설치까지 이어지게 하기 위함이다 — 실제로 링크에 붙이는 건 `AppDownloadLinks`.
 * 화면에는 아무것도 그리지 않는다.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
