import { DEFAULT_LANGUAGE, LAUNCH_CONTENT_LANGUAGES, isMarketingLanguage, isLaunchContentLanguage, type LaunchContentLanguage } from './languages';
import { request } from './apiClient';

/**
 * 서비스 언어 통합 관리(2026-09-07) — saju-letter-backend/saju-letter-admin-panel에서 관리자가
 * 켜고 끄는 활성 언어 목록을 이 사이트의 런타임 UI 게이팅(LanguageSwitcher 드롭다운, 홈 CTA
 * 노출 여부)에 반영한다. `generateStaticParams`(빌드 타임 정적 라우트 생성)는 이 값과 무관하게
 * `LAUNCH_CONTENT_LANGUAGES` 정적 배열을 계속 쓴다 — 새 언어의 정적 페이지 자체는 코드
 * 배포 없이는 어차피 안 생기므로 그 축까지 실시간화할 이유가 없다(meta 저장소 CLAUDE.md 참고).
 *
 * `blogApi.ts`와 같은 "그래서 실패든 뭐든 조용히 안전값으로 흡수" 원칙 — `[lang]/layout.tsx`가
 * `revalidate=3600`로 이 함수를 부르므로 정적 빌드 시점에도 호출될 수 있다.
 */
const FALLBACK_ACTIVE: LaunchContentLanguage[] = LAUNCH_CONTENT_LANGUAGES;
const FALLBACK_DEFAULT: LaunchContentLanguage = DEFAULT_LANGUAGE as LaunchContentLanguage;

export interface ActiveServiceLanguages {
  active: LaunchContentLanguage[];
  default: LaunchContentLanguage;
}

export async function fetchActiveServiceLanguages(): Promise<ActiveServiceLanguages> {
  try {
    const result = await request<{ languages: string[]; defaultLanguage: string }>('/marketing-site/service-languages');
    const active = result.languages.filter(
      (lang): lang is LaunchContentLanguage => isMarketingLanguage(lang) && isLaunchContentLanguage(lang),
    );
    const def =
      isMarketingLanguage(result.defaultLanguage) && isLaunchContentLanguage(result.defaultLanguage)
        ? result.defaultLanguage
        : FALLBACK_DEFAULT;
    return { active: active.length > 0 ? active : FALLBACK_ACTIVE, default: def };
  } catch (error) {
    console.warn('fetchActiveServiceLanguages failed', error);
    return { active: FALLBACK_ACTIVE, default: FALLBACK_DEFAULT };
  }
}
