"use client";

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import type { SystemStatusBannerStatus } from "@/config/system-status-banner";
import { SYSTEM_STATUS_BANNER_COPY } from "@/config/system-status-banner";
import { systemStatusAnalytics } from "@/lib/analytics/system-status-events";
import {
  resolveSystemStatusBannerContent,
  systemStatusBannerSurfaceClasses,
} from "@/utils/system-status-banner";
import { cn } from "@/utils/cn";

const STATUS_ICONS: Record<SystemStatusBannerStatus, LucideIcon> = {
  operational: CheckCircle2,
  degraded: AlertTriangle,
  unavailable: AlertCircle,
  maintenance: Wrench,
};

export type SystemStatusBannerProps = {
  status: SystemStatusBannerStatus;
  message?: string;
  actionLabel?: string | null;
  onAction?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Show operational strip (hidden by default in app shell). */
  forceVisible?: boolean;
  sticky?: boolean;
  className?: string;
};

/**
 * COMPONENT-075 — System Status Banner.
 * Icon + status label + message + optional action — not color-only.
 */
export function SystemStatusBanner({
  status,
  message: messageProp,
  actionLabel: actionLabelProp,
  onAction,
  dismissible: dismissibleProp,
  onDismiss,
  forceVisible = false,
  sticky = false,
  className,
}: SystemStatusBannerProps) {
  const impressed = React.useRef(false);
  const content = resolveSystemStatusBannerContent(status, {
    message: messageProp,
    actionLabel: actionLabelProp,
    dismissible: dismissibleProp,
  });
  const surfaces = systemStatusBannerSurfaceClasses(status);
  const Icon = STATUS_ICONS[status];

  React.useEffect(() => {
    if (status === "operational" && !forceVisible) return;
    if (impressed.current) return;
    impressed.current = true;
    systemStatusAnalytics.viewed({ status });
  }, [forceVisible, status]);

  if (status === "operational" && !forceVisible) {
    return null;
  }

  const showAction = Boolean(content.actionLabel && onAction);
  const showDismiss = Boolean(content.dismissible && onDismiss);

  return (
    <div
      className={cn(
        "w-full border-b px-md py-sm",
        surfaces.container,
        sticky && "sticky top-0 z-sticky",
        className,
      )}
      role="status"
      aria-live={content.live}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-sm sm:flex-row sm:items-center sm:justify-between sm:gap-md">
        <div className="flex min-w-0 flex-1 items-start gap-sm sm:items-center">
          <Icon
            className={cn("mt-0.5 size-5 shrink-0 sm:mt-0", surfaces.icon)}
            aria-hidden
          />
          <div className="min-w-0 flex-1 text-left">
            <Caption
              className={cn("font-semibold uppercase tracking-wide", surfaces.indicator)}
            >
              {content.label}
            </Caption>
            <BodySmall className="text-foreground">{content.message}</BodySmall>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-sm sm:flex-row sm:items-center">
          {showAction ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              className="min-h-11 sm:w-auto"
              onClick={() => {
                systemStatusAnalytics.actionClicked({
                  status,
                  actionLabel: content.actionLabel!,
                });
                onAction?.();
              }}
            >
              {content.actionLabel}
            </Button>
          ) : null}
          {showDismiss ? (
            <button
              type="button"
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-xs rounded-md px-sm",
                "text-body-sm font-semibold text-muted-foreground transition-colors duration-fast",
                "hover:bg-background/60 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                showAction ? "sm:w-auto" : "w-full sm:ml-auto sm:w-auto",
              )}
              aria-label={SYSTEM_STATUS_BANNER_COPY.dismissLabel}
              onClick={() => {
                systemStatusAnalytics.dismissed({ status });
                onDismiss?.();
              }}
            >
              <X className="size-4" aria-hidden />
              <span className="sm:sr-only">{SYSTEM_STATUS_BANNER_COPY.dismissLabel}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
