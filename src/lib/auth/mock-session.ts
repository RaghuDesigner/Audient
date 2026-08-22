/**
 * Temporary mock authenticated session — frontend development only.
 * Swap call sites for real Supabase Auth when `USE_MOCK_AUTH` is turned off.
 */

import { MOCK_AUTH_COOKIE, type SsoProvider } from "@/config/auth";
import type { AuthPlanTier, AuthUser } from "@/types/auth";

export const MOCK_AUTH_STORAGE_KEY = "audient_mock_auth_user";

/** Canonical mock identity — single source for display name. */
export const MOCK_USER_DISPLAY_NAME = "Alex Rivera" as const;

export const MOCK_USER_EMAIL = "alex.rivera@audient.mock" as const;

const MOCK_AUTH_PLAN_TIERS: readonly AuthPlanTier[] = [
  "FREE",
  "PRO",
  "ENTERPRISE",
];

export function isMockAuthPlanTier(
  value: string | null | undefined,
): value is AuthPlanTier {
  return (
    value != null &&
    (MOCK_AUTH_PLAN_TIERS as readonly string[]).includes(value)
  );
}

/**
 * Stable mock user for Authenticated Dashboard widgets.
 * `planTier` is selectable in mock SSO (Free · Pro · Business).
 */
export function createMockAuthUser(
  provider: SsoProvider,
  planTier: AuthPlanTier = "FREE",
): AuthUser {
  const tier = isMockAuthPlanTier(planTier) ? planTier : "FREE";
  return {
    id: `mock-${provider}-user`,
    email: `alex.rivera+${provider}@audient.mock`,
    emailVerified: true,
    fullName: MOCK_USER_DISPLAY_NAME,
    avatarUrl: null,
    planTier: tier,
  };
}

export function readMockSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(MOCK_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistMockSession(user: AuthUser): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(user));
  document.cookie = [
    `${MOCK_AUTH_COOKIE.name}=${MOCK_AUTH_COOKIE.value}`,
    "path=/",
    `max-age=${MOCK_AUTH_COOKIE.maxAgeSeconds}`,
    "SameSite=Lax",
  ].join("; ");
}

export function clearMockSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
  document.cookie = [
    `${MOCK_AUTH_COOKIE.name}=`,
    "path=/",
    "max-age=0",
    "SameSite=Lax",
  ].join("; ");
}

export function hasMockAuthCookie(
  cookieHeaderOrGetter: string | { get: (name: string) => { value: string } | undefined },
): boolean {
  if (typeof cookieHeaderOrGetter === "string") {
    return cookieHeaderOrGetter
      .split(";")
      .some((part) => part.trim() === `${MOCK_AUTH_COOKIE.name}=${MOCK_AUTH_COOKIE.value}`);
  }
  return (
    cookieHeaderOrGetter.get(MOCK_AUTH_COOKIE.name)?.value ===
    MOCK_AUTH_COOKIE.value
  );
}
