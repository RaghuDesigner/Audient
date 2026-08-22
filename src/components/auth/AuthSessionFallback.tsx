"use client";

import { cn } from "@/utils/cn";

export type AuthSessionFallbackProps = {
  /** Copy shown while session initializes or guest redirect runs. */
  message: string;
  className?: string;
};

/**
 * Existing session-init / guest-redirect placeholder used by protected shells.
 * Not a redesign — matches prior inline loading UI.
 */
export function AuthSessionFallback({
  message,
  className,
}: AuthSessionFallbackProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background px-md",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-body-sm text-muted-foreground">{message}</p>
    </div>
  );
}
