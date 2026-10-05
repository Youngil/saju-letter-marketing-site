import { cache } from 'react';
import { DEFAULT_LANGUAGE, LAUNCH_CONTENT_LANGUAGES, isMarketingLanguage, type MarketingLanguage } from './languages';
import { request } from './apiClient';

/**
 * 서비스 언어 통합 관리(2026-09-07) — saju-letter-backend/saju-letter-admin-panel에서 관리자가
 * 켜고 끄는 활성 언어 목록을 이 사이트의 런타임 UI 게이팅(LanguageSwitcher 드롭다운, 홈 CTA
 * 노출 여부)에 반영한다. `generateStaticParams`(빌드 타임 정적 라우트 생성)는 이 값과 무관하게
 * `LAUNCH_CONTENT_LANGUAGES` 정적 배열을 계속 쓴다 — 새 언어의 정적 페이지 자체는 코드
 * 배포 없이는 어차피 안 생기므로 그 축까지 실시간화할 이유가 없다(meta 저장소 CLAUDE.md 참고).
 *
 * **반환값은 관리자가 켠 언어 그대로(6개 축, `MarketingLanguage`)다**(2026-10-06 전체 점검 3차) — 예전엔 여기서
 * 콘텐츠 축 4개로 걸러, 6개 언어 트랜잭션 페이지인 신년운세 랜딩·hreflang·sitemap이 pt/vi를 켜도 열리지 않았다.
 * 콘텐츠 축 소비처(언어 스위처·홈·middleware 자동 감지)가 각자 `isLaunchContentLanguage`로 좁힌다.
 *
 * **실패 처리**(같은 날, blogApi.ts의 블로그 오류 캐시 수정과 같은 원칙) — 예전엔 실행 중 실패도 정적 목록으로
 * 흡수해, 그 값이 레이아웃 ISR(1시간)·신년운세 ISR(5분)·middleware 메모리(10분)에 그대로 굳었다. 이제
 * (1) 성공한 값을 인스턴스 메모리에 두고 실패하면 그 값을 쓰고, (2) 한 번도 성공한 적 없으면 빌드 중에만 정적
 * 목록으로, 실행 중엔 던진다 — ISR 재검증이면 Next가 직전에 잘 만든 페이지를 계속 보여 준다. middleware는
 * 던진 오류를 잡아 정적 목록을 짧게(30초)만 쓴다.
 */
export interface ActiveServiceLanguages {
  active: MarketingLanguage[];
  default: MarketingLanguage;
}

/** 한 번도 조회에 성공하지 못했을 때만 쓰는 정적 값 — 지금 운영과 같은 1차 출시 4개 언어 + en. */
export const STATIC_SERVICE_LANGUAGES: ActiveServiceLanguages = { active: [...LAUNCH_CONTENT_LANGUAGES], default: DEFAULT_LANGUAGE };

/** 백엔드 응답을 사이트가 아는 언어로만 거른다. 쓸 수 있는 언어가 하나도 없으면 null(실패로 본다). */
export function parseServiceLanguages(result: { languages?: unknown; defaultLanguage?: unknown }): ActiveServiceLanguages | null {
  const languages = Array.isArray(result.languages) ? result.languages : [];
  const active = languages.filter((lang): lang is MarketingLanguage => typeof lang === 'string' && isMarketingLanguage(lang));
  if (active.length === 0) return null;
  const def = typeof result.defaultLanguage === 'string' && isMarketingLanguage(result.defaultLanguage) ? result.defaultLanguage : DEFAULT_LANGUAGE;
  return { active, default: def };
}

let lastGood: ActiveServiceLanguages | null = null;

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/** 요청 단위 캐시 없는 원본 — middleware용(렌더 밖이라 `cache()`가 의미 없다). 실패 규칙은 파일 상단 주석. */
export async function loadActiveServiceLanguages(): Promise<ActiveServiceLanguages> {
  try {
    // 동적 라우트(/compat/[token] 등)에서도 매 요청 백엔드를 부르지 않게 데이터 캐시를 명시한다(2026-10-06).
    const result = await request<{ languages?: unknown; defaultLanguage?: unknown }>('/marketing-site/service-languages', {
      next: { revalidate: 3600 },
    });
    const parsed = parseServiceLanguages(result ?? {});
    if (!parsed) throw new Error('service-languages returned no usable language');
    lastGood = parsed;
    return parsed;
  } catch (error) {
    if (lastGood) {
      console.warn('fetchActiveServiceLanguages failed — using last successful value', error);
      return lastGood;
    }
    if (isBuildPhase()) {
      console.warn('fetchActiveServiceLanguages failed during build — using static fallback', error);
      return STATIC_SERVICE_LANGUAGES;
    }
    throw error;
  }
}

/** 렌더용 — 레이아웃·페이지·generateMetadata가 한 요청에서 여러 번 불러도 한 번만 조회한다. */
export const fetchActiveServiceLanguages = cache(loadActiveServiceLanguages);

/** 테스트 전용 — 모듈 메모리의 "마지막 성공 값"을 비운다. */
export function resetServiceLanguagesMemoryForTest(): void {
  lastGood = null;
}
