"use client";

import * as React from "react";

import { SsoLoginPanel } from "@/components/auth/sso-login-panel";
import type { LoginIntent } from "@/types/auth";
import { cn } from "@/utils/cn";

export type SignInClientProps = {
  nextPath: string;
  initialError?: string | null;
};

/**
 * Route-guard SSO surface (`/sign-in`) — same providers as MDL-001.
 * Used when middleware cannot open a modal over the origin page.
 */
export function SignInClient({
  nextPath,
  initialError = null,
}: SignInClientProps) {
  const intent = React.useMemo<LoginIntent>(
    () => ({
      type: nextPath === "/" ? "home" : "session_resume",
      payload: nextPath,
    }),
    [nextPath],
  );

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-lg border border-border bg-background p-md shadow-lg",
        "sm:p-lg",
      )}
    >
      <SsoLoginPanel
        nextPath={nextPath}
        intent={intent}
        initialError={initialError}
        autoFocusFirst
      />
    </div>
  );
}
