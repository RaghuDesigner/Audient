"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  AUTH_ROUTES,
  shouldUseMockOAuth,
  type SsoProvider,
} from "@/config/auth";
import { useAuth } from "@/hooks/use-auth";
import { authAnalytics } from "@/lib/analytics/auth-events";
import { placeholderSignInWithOAuth } from "@/lib/auth/oauth-placeholders";
import type {
  AuthPlanTier,
  LoginIntent,
  LoginModalError,
  LoginModalPhase,
  LoginModalSource,
} from "@/types/auth";
import {
  resolveLoginDestination,
  saveLoginIntent,
} from "@/utils/login-intent";

export type UseLoginModalOptions = {
  /** Controlled open state from the parent. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: LoginModalSource;
  intent?: LoginIntent;
  /** Called after mock / OAuth success (AUTH-STATE-007). */
  onSuccess?: (provider: SsoProvider) => void;
  /** Mock SSO plan tier (Free · Pro · Business). */
  mockPlanTier?: AuthPlanTier;
};

export type UseLoginModalReturn = {
  phase: LoginModalPhase;
  activeProvider: SsoProvider | null;
  error: LoginModalError | null;
  isBusy: boolean;
  /** True while a provider redirect/auth is in flight — block dismiss. */
  preventDismiss: boolean;
  clearError: () => void;
  handleOpenChange: (next: boolean) => void;
  signInWithProvider: (provider: SsoProvider) => Promise<void>;
};

/**
 * MDL-001 controller — STATE_MANAGEMENT AUTH-STATE-002…008.
 * Mock OAuth: placeholder delay → local session → intent destination.
 * Real Google (controlled path / cutover): Supabase `signInWithOAuth` → IdP.
 */
export function useLoginModal({
  open,
  onOpenChange,
  source = "unknown",
  intent,
  onSuccess,
  mockPlanTier = "FREE",
}: UseLoginModalOptions): UseLoginModalReturn {
  const router = useRouter();
  const { signInWithOAuth } = useAuth();
  const [activeProvider, setActiveProvider] =
    React.useState<SsoProvider | null>(null);
  const [error, setError] = React.useState<LoginModalError | null>(null);
  const [phase, setPhase] = React.useState<LoginModalPhase>("idle");
  const openedTracked = React.useRef(false);

  const isBusy = activeProvider !== null || phase === "hydrating";
  const preventDismiss = isBusy;

  React.useEffect(() => {
    if (open && !openedTracked.current) {
      authAnalytics.loginModalOpened(source);
      openedTracked.current = true;
      setPhase("idle");
      setError(null);
      setActiveProvider(null);
    }
    if (!open) {
      openedTracked.current = false;
      setActiveProvider(null);
      setPhase("idle");
    }
  }, [open, source]);

  const clearError = React.useCallback(() => {
    setError(null);
    if (phase === "error") {
      setPhase("idle");
    }
  }, [phase]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next && preventDismiss) {
        return;
      }
      if (!next && open) {
        authAnalytics.loginModalDismissed(source);
        setError(null);
        setActiveProvider(null);
        setPhase("idle");
      }
      onOpenChange(next);
    },
    [open, onOpenChange, preventDismiss, source],
  );

  const signInWithProvider = React.useCallback(
    async (provider: SsoProvider) => {
      if (isBusy) return;

      setError(null);
      setActiveProvider(provider);
      setPhase("provider_loading");
      authAnalytics.oauthStarted(provider);

      // Resume modal intent when present; home (`/`) → afterLogin (dashboard in mock).
      const resolved = resolveLoginDestination(
        intent ?? null,
        AUTH_ROUTES.afterLogin,
      );
      const destination =
        resolved === "/" ? AUTH_ROUTES.afterLogin : resolved;

      if (intent) {
        saveLoginIntent(intent);
      }

      if (shouldUseMockOAuth(provider)) {
        const placeholder = await placeholderSignInWithOAuth(provider);
        if (!placeholder.ok) {
          authAnalytics.loginFailed(provider, placeholder.error.code);
          authAnalytics.oauthFailed(provider, placeholder.error.code);
          setError(placeholder.error);
          setActiveProvider(null);
          setPhase("error");
          return;
        }

        setPhase("hydrating");
        const { error: authError } = await signInWithOAuth({
          provider,
          next: destination,
          planTier: mockPlanTier,
        });

        if (authError) {
          authAnalytics.loginFailed(provider, authError.code);
          setError(authError);
          setActiveProvider(null);
          setPhase("error");
          return;
        }

        authAnalytics.oauthSucceeded(provider);
        authAnalytics.loginSuccess(provider, true);
        setPhase("success");
        setActiveProvider(null);
        onOpenChange(false);
        onSuccess?.(provider);
        router.push(destination);
        return;
      }

      const { error: authError } = await signInWithOAuth({
        provider,
        next: destination,
      });

      if (authError) {
        authAnalytics.loginFailed(provider, authError.code);
        authAnalytics.oauthFailed(provider, authError.code);
        setError(authError);
        setActiveProvider(null);
        setPhase("error");
        return;
      }

      // Real OAuth redirects away; keep busy until navigation.
      setPhase("hydrating");
    },
    [
      intent,
      isBusy,
      mockPlanTier,
      onOpenChange,
      onSuccess,
      router,
      signInWithOAuth,
    ],
  );

  return {
    phase,
    activeProvider,
    error,
    isBusy,
    preventDismiss,
    clearError,
    handleOpenChange,
    signInWithProvider,
  };
}
