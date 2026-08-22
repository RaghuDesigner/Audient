"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { BodyMedium, Caption, H1, H2 } from "@/components/ui/typography";
import { useAuth } from "@/hooks/use-auth";
import type {
  AuthMethod,
  EmailAuthMode,
  LoginModalError,
} from "@/types/auth";
import { sanitizeAuthRedirect } from "@/utils/auth-redirect";

export type LoginFormProps = {
  /** Sanitized path to resume after auth. */
  nextPath?: string;
  /** Optional banner from callback `?error=`. */
  initialError?: string | null;
  title?: string;
  description?: string;
  /** Use h2 inside modals so the page keeps a single h1. */
  titleAs?: "h1" | "h2";
};

/**
 * Full login surface — Google, Microsoft, and email (SCREEN-003 + email).
 */
export function LoginForm({
  nextPath = "/",
  initialError = null,
  title = "Log in to Audient",
  description = "Continue with Google, Microsoft, or email to unlock audits and credits.",
  titleAs = "h1",
}: LoginFormProps) {
  const router = useRouter();
  const { signInWithOAuth, signInWithEmail } = useAuth();

  const [emailMode, setEmailMode] = React.useState<EmailAuthMode>("sign_in");
  const [loadingProvider, setLoadingProvider] =
    React.useState<AuthMethod | null>(null);
  const [error, setError] = React.useState<LoginModalError | null>(
    initialError
      ? { code: "ERR-AUTH-001", message: initialError }
      : null,
  );
  const [signUpNotice, setSignUpNotice] = React.useState<string | null>(null);

  const safeNext = sanitizeAuthRedirect(nextPath);
  const busy = loadingProvider !== null;

  const handleOAuth = async (provider: "google" | "microsoft") => {
    setError(null);
    setSignUpNotice(null);
    setLoadingProvider(provider);
    const { error: oauthError } = await signInWithOAuth({
      provider,
      next: safeNext,
    });
    if (oauthError) {
      setError(oauthError);
      setLoadingProvider(null);
    }
    // On success the browser redirects to the IdP — keep loading state.
  };

  const handleEmail = async (values: {
    email: string;
    password: string;
  }): Promise<LoginModalError | null> => {
    setError(null);
    setSignUpNotice(null);
    setLoadingProvider("email");

    const { error: emailError } = await signInWithEmail({
      ...values,
      mode: emailMode,
    });

    if (emailError) {
      setError(emailError);
      setLoadingProvider(null);
      return emailError;
    }

    if (emailMode === "sign_up") {
      setSignUpNotice(
        "Check your email to confirm your account, then sign in.",
      );
      setEmailMode("sign_in");
      setLoadingProvider(null);
      return null;
    }

    router.replace(safeNext);
    router.refresh();
    return null;
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-lg">
      <header className="flex flex-col gap-sm text-center">
        {titleAs === "h1" ? <H1>{title}</H1> : <H2>{title}</H2>}
        <BodyMedium className="text-muted-foreground">{description}</BodyMedium>
      </header>

      <div className="flex flex-col gap-sm">
        <OAuthButton
          provider="google"
          loading={loadingProvider === "google"}
          disabled={busy && loadingProvider !== "google"}
          onClick={() => void handleOAuth("google")}
        />
        <OAuthButton
          provider="microsoft"
          loading={loadingProvider === "microsoft"}
          disabled={busy && loadingProvider !== "microsoft"}
          onClick={() => void handleOAuth("microsoft")}
        />
      </div>

      <div
        className="flex items-center gap-md"
        role="separator"
        aria-label="Or continue with email"
      >
        <div className="h-px flex-1 bg-border" />
        <Caption>or</Caption>
        <div className="h-px flex-1 bg-border" />
      </div>

      {signUpNotice ? (
        <p role="status" className="text-center text-body-sm text-primary">
          {signUpNotice}
        </p>
      ) : null}

      <EmailAuthForm
        mode={emailMode}
        onModeChange={setEmailMode}
        onSubmit={handleEmail}
        disabled={busy && loadingProvider !== "email"}
        formError={
          error?.provider === "email" || !error?.provider ? error : null
        }
      />

      {error && error.provider && error.provider !== "email" ? (
        <p role="alert" className="text-center text-body-sm text-destructive">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
