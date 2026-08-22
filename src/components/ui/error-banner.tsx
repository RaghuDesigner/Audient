"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/utils/cn";

export type ErrorBannerProps = {
  /** Primary error message (required). */
  message: string;
  /** Optional secondary line (e.g. “Please try again.”). */
  description?: string;
  /** Recovery actions (Retry / Replace / Remove). */
  actions?: React.ReactNode;
  className?: string;
  /** Extra context under the message (filename, URL). */
  children?: React.ReactNode;
};

/**
 * Reusable inline error banner — icon + text + optional actions.
 * Assertive live region for WCAG 2.2 AA failure announcements.
 */
export const ErrorBanner = React.forwardRef<HTMLDivElement, ErrorBannerProps>(
  ({ message, description, actions, className, children }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        tabIndex={-1}
        className={cn(
          "flex w-full max-w-2xl flex-col gap-md rounded-md border border-error/40",
          "bg-error/5 px-md py-md text-foreground",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <div className="flex gap-sm">
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-error"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-semibold text-error">{message}</p>
            {description ? (
              <p className="mt-sm text-info text-muted-foreground sm:text-body-sm">
                {description}
              </p>
            ) : null}
            {children ? <div className="mt-sm min-w-0">{children}</div> : null}
          </div>
        </div>
        {actions ? (
          <div className="flex flex-wrap gap-sm">{actions}</div>
        ) : null}
      </div>
    );
  },
);
ErrorBanner.displayName = "ErrorBanner";
