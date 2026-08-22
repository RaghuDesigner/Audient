"use client";

import * as React from "react";
import { Lock } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { lockedCardAnalytics } from "@/lib/analytics/locked-card-events";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";
import {
  defaultLockedCtaLabel,
  defaultLockedMessage,
  defaultLockedReason,
  lockedCardAccessibleName,
  type LockedCardDensity,
  type LockedCardTier,
  type LockedCardVariant,
} from "@/utils/locked-card";
import { cn } from "@/utils/cn";

export type LockedCardState = "default" | "loading";

export type LockedCardProps = {
  variant: LockedCardVariant;
  /** Upgrade teaser copy; defaults from variant + lockedCount. */
  message?: string;
  ctaLabel?: string;
  lockedCount?: number | null;
  /** Passed to Upgrade Modal / analytics; defaults from variant. */
  reason?: string;
  tier?: LockedCardTier;
  auditId?: string | null;
  density?: LockedCardDensity;
  state?: LockedCardState;
  /**
   * Parent override. When omitted, opens shared Plan Comparison Modal
   * via `UpgradePlansModalProvider`.
   */
  onUpgrade?: () => void;
  className?: string;
};

/**
 * COMPONENT-011 — Locked Card.
 * Decorative blur + lock + upgrade CTA. Never renders real premium content.
 */
export function LockedCard({
  variant,
  message: messageProp,
  ctaLabel: ctaLabelProp,
  lockedCount = null,
  reason: reasonProp,
  tier = "guest",
  auditId = null,
  density = "default",
  state = "default",
  onUpgrade,
  className,
}: LockedCardProps) {
  const upgradeModal = useUpgradePlansModalOptional();
  const impressed = React.useRef(false);

  const reason = reasonProp ?? defaultLockedReason(variant);
  const message =
    messageProp ?? defaultLockedMessage(variant, lockedCount);
  const ctaLabel = ctaLabelProp ?? defaultLockedCtaLabel(variant);
  const accessibleName = lockedCardAccessibleName(message, ctaLabel);

  React.useEffect(() => {
    if (state !== "default" || impressed.current) return;
    impressed.current = true;
    lockedCardAnalytics.impressed({
      variant,
      reason,
      tier,
      auditId: auditId ?? undefined,
      lockedCount: lockedCount ?? undefined,
    });
  }, [state, variant, reason, tier, auditId, lockedCount]);

  const handleUpgrade = () => {
    lockedCardAnalytics.clicked({
      variant,
      reason,
      tier,
      auditId: auditId ?? undefined,
    });
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    upgradeModal?.openUpgrade({
      reason,
      source: reason,
      currentPlan: tier,
    });
  };

  if (state === "loading") {
    return (
      <div
        className={cn(densityChrome(density), className)}
        aria-busy="true"
        aria-label="Loading locked content"
      >
        <Skeleton className="mx-auto size-10 rounded-full" />
        <Skeleton className="mx-auto mt-md h-5 w-2/3" />
        <Skeleton className="mx-auto mt-md h-11 w-40" />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        densityChrome(density),
        "group relative w-full text-left",
        "transition-[border-color,box-shadow,transform] duration-fast ease-in-out-smooth",
        "hover:border-secondary hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-[0.99]",
        className,
      )}
      aria-label={accessibleName}
      onClick={handleUpgrade}
    >
      <DecorativeBlur density={density} />

      <div className="relative z-raised flex flex-col items-center justify-center gap-md text-center">
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-muted",
            density === "compact" ? "size-9" : "size-11",
          )}
        >
          <Lock
            className={cn(
              "text-muted-foreground",
              density === "compact" ? "size-4" : "size-5",
            )}
            aria-hidden
          />
        </span>

        <div className="flex flex-col gap-sm">
          <p
            className={cn(
              "font-semibold text-foreground",
              density === "compact"
                ? "text-info sm:text-body-sm"
                : "text-body-sm sm:text-body",
            )}
          >
            {message}
          </p>
          <Caption className="text-muted-foreground">
            Premium preview — upgrade to unlock
          </Caption>
        </div>

        <span
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-md px-md",
            "bg-primary font-semibold text-primary-foreground",
            "transition-colors duration-fast",
            "group-hover:bg-primary/90 group-active:bg-primary/80",
            density === "compact" ? "text-info" : "text-body-sm",
          )}
        >
          {ctaLabel}
        </span>

        {lockedCount != null && variant === "findings" ? (
          <BodySmall className="sr-only">
            {lockedCount} additional findings locked
          </BodySmall>
        ) : null}
      </div>
    </button>
  );
}

/** Fake silhouette only — never real findings / PDF / report text. */
function DecorativeBlur({ density }: { density: LockedCardDensity }) {
  const lines =
    density === "compact" ? 3 : density === "banner" ? 2 : 4;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
      aria-hidden
    >
      <div
        className={cn(
          "flex h-full flex-col justify-center gap-sm p-md opacity-70 blur-sm",
          density === "banner" && "flex-row items-center gap-md",
        )}
      >
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-md bg-muted",
              density === "banner"
                ? "h-8 flex-1"
                : index % 2 === 0
                  ? "h-4 w-full"
                  : "h-4 w-5/6",
            )}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-background/70" />
    </div>
  );
}

function densityChrome(density: LockedCardDensity): string {
  const base =
    "overflow-hidden rounded-md border border-border bg-surface shadow-sm";
  switch (density) {
    case "compact":
      return cn(base, "min-h-28 px-md py-md");
    case "banner":
      return cn(base, "min-h-24 px-md py-md sm:px-lg");
    default:
      return cn(base, "min-h-44 px-md py-lg");
  }
}
