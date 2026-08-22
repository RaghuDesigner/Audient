"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { AUTH_ROUTES } from "@/config/auth";
import { useAuth } from "@/hooks/use-auth";
import type { AuthUser, LoginIntentType } from "@/types/auth";
import { buildSignInUrl } from "@/utils/auth-redirect";
import { saveLoginIntent } from "@/utils/login-intent";

export type RequireAuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

export type UseRequireAuthOptions = {
  /**
   * Destination to preserve across sign-in (`?next=` + login intent).
   * Defaults to the current pathname (plus search when available in the browser).
   */
  redirectTo?: string;
  /** Intent type stored for post-login resume. Default: `deep_link`. */
  intentType?: LoginIntentType;
  /**
   * When false, skip client redirect (rare — prefer middleware + default).
   * Default: true.
   */
  redirect?: boolean;
};

export type UseRequireAuthResult = {
  status: RequireAuthStatus;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** True only when authenticated and the screen may render protected UI. */
  isReady: boolean;
};

function resolveRedirectTarget(
  explicit: string | undefined,
  pathname: string,
): string {
  if (explicit) return explicit;
  if (typeof window !== "undefined") {
    return `${window.location.pathname}${window.location.search}`;
  }
  return pathname;
}

/**
 * Shared client auth guard — loading / guest redirect / authenticated.
 * Complements middleware route protection; not a security boundary alone.
 * Works with `USE_MOCK_AUTH` and future Supabase sessions via `useAuth`.
 */
export function useRequireAuth(
  options: UseRequireAuthOptions = {},
): UseRequireAuthResult {
  const {
    redirectTo: redirectToOption,
    intentType = "deep_link",
    redirect = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { user, isGuest, isLoading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!redirect) return;
    if (isLoading) return;
    if (!isGuest) return;

    const redirectTo = resolveRedirectTarget(redirectToOption, pathname);
    saveLoginIntent({ type: intentType, payload: redirectTo });
    router.replace(buildSignInUrl(AUTH_ROUTES.signIn, redirectTo));
  }, [
    intentType,
    isGuest,
    isLoading,
    pathname,
    redirect,
    redirectToOption,
    router,
  ]);

  if (isLoading) {
    return {
      status: "loading",
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isReady: false,
    };
  }

  if (isGuest || !user) {
    return {
      status: "unauthenticated",
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isReady: false,
    };
  }

  return {
    status: "authenticated",
    user,
    isLoading: false,
    isAuthenticated,
    isReady: true,
  };
}
