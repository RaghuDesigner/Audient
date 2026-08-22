"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { MockAuthPlanPicker } from "@/components/auth/MockAuthPlanPicker";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { Alert } from "@/components/ui/alert";
import { BodySmall, H2 } from "@/components/ui/typography";
import {
  AUTH_ROUTES,
  OAUTH_SLOW_THRESHOLD_MS,
  SSO_PROVIDERS,
  shouldUseMockOAuth,
  type SsoProvider,
} from "@/config/auth";
import { useAuth } from "@/hooks/use-auth";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { authAnalytics } from "@/lib/analytics/auth-events";
import { mapAuthCallbackErrorParam } from "@/lib/auth/callback-errors";
import type {
  AuthPlanTier,
  LoginIntent,
  LoginModalError,
} from "@/types/auth";
import { sanitizeAuthRedirect } from "@/utils/auth-redirect";

export type SsoLoginPanelProps = {
  /** Path to resume after OAuth callback. */
  nextPath?: string;
  intent?: LoginIntent;
  initialError?: string | null;
  /** When true, focus Google on mount (modal open). */
  autoFocusFirst?: boolean;
  /** Notify parent that a provider redirect is in flight (block dismiss). */
  onBusyChange?: (busy: boolean) => void;
  title?: string;
  description?: string;
  /** Hide heading when parent Dialog already exposes title (MDL-001). */
  showHeading?: boolean;
};

/**
 * SSO body — Google → Apple → Microsoft (LOGIN_SCREEN §7–11).
 * Shared by MDL-001 modal and the `/sign-in` route-guard surface.
 */
export function SsoLoginPanel({
  nextPath = "/",
  intent,
  initialError = null,
  autoFocusFirst = false,
  onBusyChange,
  title = "Log in to Audient",
  description = "Sign in with a trusted account to unlock audits and credits.",
  showHeading = true,
}: SsoLoginPanelProps) {
  const router = useRouter();
  const { signInWithOAuth } = useAuth();
  const online = useOnlineStatus();

  const [activeProvider, setActiveProvider] =
    React.useState<SsoProvider | null>(null);
  const [slow, setSlow] = React.useState(false);
  const [mockPlanTier, setMockPlanTier] =
    React.useState<AuthPlanTier>("FREE");
  const [error, setError] = React.useState<LoginModalError | null>(() => {
    const mapped = mapAuthCallbackErrorParam(initialError);
    if (mapped) return mapped;
    if (initialError) {
      return { code: "ERR-AUTH-001", message: "Sign-in failed. Please try again." };
    }
    return null;
  });

  const googleRef = React.useRef<HTMLButtonElement>(null);
  const alertRef = React.useRef<HTMLDivElement>(null);
  const safeNext = sanitizeAuthRedirect(
    intent?.payload ?? nextPath,
  );
  const busy = activeProvider !== null;

  React.useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  React.useEffect(() => {
    if (!autoFocusFirst || busy) return;
    googleRef.current?.focus();
  }, [autoFocusFirst, busy]);

  React.useEffect(() => {
    if (!busy) {
      setSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), OAUTH_SLOW_THRESHOLD_MS);
    return () => window.clearTimeout(timer);
  }, [busy]);

  React.useEffect(() => {
    if (error) {
      alertRef.current?.focus();
    }
  }, [error]);

  const handleProvider = async (provider: SsoProvider) => {
    if (busy || !online) return;

    setError(null);
    setActiveProvider(provider);
    authAnalytics.oauthStarted(provider);

    const { error: oauthError } = await signInWithOAuth({
      provider,
      next: safeNext,
      intentPayload: intent?.payload,
      planTier: mockPlanTier,
    });

    if (oauthError) {
      authAnalytics.loginFailed(provider, oauthError.code);
      authAnalytics.oauthFailed(provider, oauthError.code);
      setError(oauthError);
      setActiveProvider(null);
      return;
    }

    // Mock OAuth never leaves the page — navigate here.
    if (shouldUseMockOAuth(provider)) {
      authAnalytics.oauthSucceeded(provider);
      authAnalytics.loginSuccess(provider, true);
      setActiveProvider(null);
      const destination =
        safeNext === "/" ? AUTH_ROUTES.afterLogin : safeNext;
      router.push(destination);
      return;
    }

    // Real OAuth → browser navigates to IdP; keep busy state.
  };

  return (
    <div className="flex w-full flex-col gap-lg">
      {showHeading ? (
        <header className="flex flex-col gap-sm pr-md text-left sm:pr-lg">
          <H2 id="sso-login-title">{title}</H2>
          <BodySmall className="text-muted-foreground" id="sso-login-desc">
            {description}
          </BodySmall>
        </header>
      ) : null}

      {!online ? (
        <Alert variant="offline" assertive={false} ref={alertRef} tabIndex={-1}>
          You’re offline. Reconnect to sign in with Google, Apple, or Microsoft.
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="error" ref={alertRef} tabIndex={-1}>
          {error.message}
        </Alert>
      ) : null}

      {busy && slow ? (
        <Alert variant="info" assertive={false}>
          Taking longer than usual… Hang tight while we connect you.
        </Alert>
      ) : null}

      <MockAuthPlanPicker
        value={mockPlanTier}
        onChange={setMockPlanTier}
        disabled={busy}
      />

      <div
        className="flex flex-col gap-sm"
        role="group"
        aria-labelledby="sso-login-title"
        aria-describedby="sso-login-desc"
      >
        {SSO_PROVIDERS.map((provider) => (
          <OAuthButton
            key={provider}
            provider={provider}
            buttonRef={provider === "google" ? googleRef : undefined}
            loading={activeProvider === provider}
            disabled={!online || (busy && activeProvider !== provider)}
            onClick={() => void handleProvider(provider)}
          />
        ))}
      </div>
    </div>
  );
}
