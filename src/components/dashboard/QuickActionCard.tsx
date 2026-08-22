"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  History,
  ImageUp,
  Link2,
  Loader2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  QUICK_ACTION_DEFAULTS,
  type QuickActionCardState,
  type QuickActionKey,
  type QuickActionTier,
} from "@/config/quick-action";
import { quickActionAnalytics } from "@/lib/analytics/quick-action-events";
import { cn } from "@/utils/cn";

export type QuickActionCardProps = {
  action: QuickActionKey;
  title?: string;
  description?: string;
  /** Override default icon for the action. */
  icon?: React.ReactNode;
  state?: QuickActionCardState;
  disabledReason?: string;
  href?: string | null;
  tier?: QuickActionTier;
  size?: "default" | "compact";
  onAction?: (action: QuickActionKey) => void;
  className?: string;
};

const ACTION_ICONS: Record<Exclude<QuickActionKey, "custom">, LucideIcon> = {
  start_audit: Sparkles,
  upload_screenshot: ImageUp,
  paste_url: Link2,
  history: History,
  reports: FileText,
};

/**
 * COMPONENT-015 — Quick Action Card.
 * Icon · title · description · arrow. Hover / focus / pressed / disabled / loading.
 */
export function QuickActionCard({
  action,
  title: titleProp,
  description: descriptionProp,
  icon,
  state = "default",
  disabledReason,
  href = null,
  tier = "free",
  size = "default",
  onAction,
  className,
}: QuickActionCardProps) {
  const reasonId = React.useId();
  const defaults =
    action === "custom" ? null : QUICK_ACTION_DEFAULTS[action];
  const title = titleProp ?? defaults?.title ?? "Quick action";
  const description =
    descriptionProp ?? defaults?.description ?? "Continue to this workflow.";
  const isDisabled = state === "disabled";
  const isLoading = state === "loading";
  const inactive = isDisabled || isLoading;

  const DefaultIcon =
    action === "custom" ? Sparkles : ACTION_ICONS[action];

  const activate = () => {
    if (inactive) return;
    quickActionAnalytics.clicked({ action, tier });
    onAction?.(action);
  };

  const content = (
    <>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary",
          size === "compact" ? "size-10" : "size-11",
        )}
      >
        {isLoading ? (
          <Loader2
            className="size-5 animate-spin motion-reduce:animate-none"
            aria-hidden
          />
        ) : icon ? (
          <span className="inline-flex [&_svg]:size-5" aria-hidden>
            {icon}
          </span>
        ) : (
          <DefaultIcon className="size-5" aria-hidden />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-sm text-left">
        <span
          className={cn(
            "font-semibold text-foreground",
            size === "compact"
              ? "text-info sm:text-body-sm"
              : "text-body-sm sm:text-body",
          )}
        >
          {title}
        </span>
        <BodySmall className="text-muted-foreground">{description}</BodySmall>
        {isDisabled && disabledReason ? (
          <Caption id={reasonId} className="text-muted-foreground">
            {disabledReason}
          </Caption>
        ) : null}
      </span>

      <ArrowRight
        className={cn(
          "size-5 shrink-0 text-muted-foreground transition-transform duration-fast",
          "group-hover:translate-x-0.5 group-hover:text-primary",
          "group-focus-visible:text-primary",
          inactive && "opacity-50",
        )}
        aria-hidden
      />
    </>
  );

  const chrome = cn(
    "group flex w-full items-center gap-md rounded-md border border-border bg-surface",
    "text-left shadow-sm transition-[border-color,box-shadow,transform,background-color] duration-fast ease-in-out-smooth",
    size === "compact" ? "min-h-16 p-md" : "min-h-24 p-md sm:p-lg",
    !inactive &&
      "hover:border-secondary hover:bg-background hover:shadow-md active:scale-[0.99]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    inactive && "cursor-not-allowed opacity-60",
    className,
  );

  if (state === "loading" && !titleProp && !defaults) {
    return (
      <div
        className={cn(chrome, "pointer-events-none")}
        aria-busy="true"
        aria-label="Loading quick action"
      >
        <Skeleton className="size-11 shrink-0 rounded-md" />
        <div className="flex flex-1 flex-col gap-sm">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (href && !inactive) {
    return (
      <Link
        href={href}
        className={chrome}
        aria-label={`${title}. ${description}`}
        onClick={() => {
          quickActionAnalytics.clicked({ action, tier });
          onAction?.(action);
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={chrome}
      disabled={isDisabled}
      aria-disabled={inactive || undefined}
      aria-busy={isLoading || undefined}
      aria-describedby={
        isDisabled && disabledReason ? reasonId : undefined
      }
      aria-label={`${title}. ${description}`}
      onClick={activate}
    >
      {content}
    </button>
  );
}
