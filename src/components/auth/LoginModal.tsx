"use client";

import * as React from "react";

import { LoginModalFooter } from "@/components/auth/LoginModalFooter";
import { LoginModalHeader } from "@/components/auth/LoginModalHeader";
import { MockAuthPlanPicker } from "@/components/auth/MockAuthPlanPicker";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogBody,
  DialogContent,
} from "@/components/ui/dialog";
import { SSO_PROVIDERS, type SsoProvider } from "@/config/auth";
import { useLoginModal } from "@/hooks/use-login-modal";
import { useOnlineStatus } from "@/hooks/use-online-status";
import type {
  AuthPlanTier,
  LoginIntent,
  LoginModalSource,
} from "@/types/auth";
import { cn } from "@/utils/cn";

export type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Analytics `login_modal_opened.source`. */
  source?: LoginModalSource;
  /** Resume intent after successful auth (LOGIN_MODAL §17). */
  intent?: LoginIntent;
  /** Optional path stored on intent when not provided via `intent.payload`. */
  nextPath?: string;
  /** Called after placeholder OAuth success — parent refreshes auth/credits/menu. */
  onSuccess?: (provider: SsoProvider) => void;
  className?: string;
};

/**
 * COMPONENT-002 / MDL-001 — SSO Login Modal (`docs/components/LOGIN_MODAL.md`).
 *
 * Reusable portaled dialog. Figma Screen3: Google → Apple → Microsoft only.
 * Overlay, Esc, outside click, focus trap, and scroll lock via Radix Dialog.
 */
export function LoginModal({
  open,
  onOpenChange,
  source = "unknown",
  intent,
  nextPath,
  onSuccess,
  className,
}: LoginModalProps) {
  const online = useOnlineStatus();
  const googleRef = React.useRef<HTMLButtonElement>(null);
  const [mockPlanTier, setMockPlanTier] =
    React.useState<AuthPlanTier>("FREE");

  const resolvedIntent = React.useMemo<LoginIntent | undefined>(() => {
    if (intent) return intent;
    if (!nextPath) return undefined;
    return {
      type: nextPath === "/" ? "home" : "deep_link",
      payload: nextPath,
    };
  }, [intent, nextPath]);

  const {
    activeProvider,
    error,
    isBusy,
    preventDismiss,
    handleOpenChange,
    signInWithProvider,
  } = useLoginModal({
    open,
    onOpenChange,
    source,
    intent: resolvedIntent,
    onSuccess,
    mockPlanTier,
  });

  React.useEffect(() => {
    if (!open) {
      setMockPlanTier("FREE");
    }
  }, [open]);

  React.useEffect(() => {
    if (!open || isBusy) return;
    const id = window.requestAnimationFrame(() => {
      googleRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, isBusy]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size="sm"
        variant="default"
        showCloseButton={!preventDismiss}
        preventDismiss={preventDismiss}
        className={cn(
          "max-w-[calc(100%-2rem)] border-border bg-background shadow-lg",
          "pb-safe sm:max-w-md",
          className,
        )}
      >
        <LoginModalHeader />

        <DialogBody className="flex flex-col gap-md">
          {!online ? (
            <Alert variant="offline" assertive={false}>
              You’re offline. Reconnect to sign in with Google, Apple, or
              Microsoft.
            </Alert>
          ) : null}

          {error ? <Alert variant="error">{error.message}</Alert> : null}

          <MockAuthPlanPicker
            value={mockPlanTier}
            onChange={setMockPlanTier}
            disabled={isBusy}
          />

          <div
            className="flex flex-col gap-md"
            role="group"
            aria-label="Sign-in options"
          >
            {SSO_PROVIDERS.map((provider) => (
              <OAuthButton
                key={provider}
                provider={provider}
                buttonRef={provider === "google" ? googleRef : undefined}
                loading={activeProvider === provider}
                disabled={
                  !online || (isBusy && activeProvider !== provider)
                }
                onClick={() => void signInWithProvider(provider)}
              />
            ))}
          </div>
        </DialogBody>

        <LoginModalFooter />
      </DialogContent>
    </Dialog>
  );
}
