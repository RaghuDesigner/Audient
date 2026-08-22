"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  SSO_PROVIDER_ICONS,
  SSO_PROVIDER_LABELS,
  type SsoProvider,
} from "@/config/auth";
import { cn } from "@/utils/cn";

export type OAuthButtonProps = {
  provider: SsoProvider;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  /** Ref forwarded to the native button for initial focus (Google). */
  buttonRef?: React.Ref<HTMLButtonElement>;
};

/**
 * OAuth provider control — BTN-003 / BTN-004 / BTN-005.
 * Labels match Figma Screen3: “Login with Google|Apple|Microsoft”.
 */
export function OAuthButton({
  provider,
  loading = false,
  disabled = false,
  onClick,
  className,
  buttonRef,
}: OAuthButtonProps) {
  const label = SSO_PROVIDER_LABELS[provider];
  const visibleLabel = loading ? "Redirecting…" : label;

  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="outline"
      size="lg"
      fullWidth
      className={cn(
        "justify-center gap-sm border-border bg-background text-foreground",
        "hover:bg-muted/60",
        className,
      )}
      isLoading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={label}
      aria-busy={loading || undefined}
      iconLeft={
        !loading ? (
          // eslint-disable-next-line @next/next/no-img-element -- static brand SVG
          <img
            src={SSO_PROVIDER_ICONS[provider]}
            alt=""
            width={20}
            height={20}
            className="size-5"
            aria-hidden
          />
        ) : undefined
      }
    >
      {visibleLabel}
    </Button>
  );
}
