"use client";

import { Crown } from "lucide-react";

import { cn } from "@/utils/cn";

export type MembershipBadgeTier = "guest" | "free" | "pro" | "business";

export type MembershipBadgeStatus = "active" | "past_due";

export type MembershipBadgeProps = {
  tier: MembershipBadgeTier;
  status?: MembershipBadgeStatus | null;
  onClick?: () => void;
  className?: string;
};

const TIER_LABELS: Record<MembershipBadgeTier, string> = {
  guest: "Guest",
  free: "Free",
  pro: "Pro",
  business: "Business",
};

/**
 * Membership chip — text + token color (never color-only). COMPONENT-014.
 */
export function MembershipBadge({
  tier,
  status = "active",
  onClick,
  className,
}: MembershipBadgeProps) {
  const label = TIER_LABELS[tier];
  const showCrown = tier === "pro" || tier === "business";
  const isPastDue = status === "past_due";

  const chipClass = cn(
    "inline-flex min-h-9 items-center gap-sm rounded-md px-md",
    "text-info font-semibold sm:text-body-sm",
    tier === "guest" && "bg-muted text-muted-foreground",
    tier === "free" && "bg-muted text-muted-foreground",
    tier === "pro" && "bg-primary/10 text-primary",
    tier === "business" && "bg-secondary/15 text-secondary",
    onClick &&
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-sm", className)}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={chipClass}
          aria-label={`${label} plan. Open manage plan.`}
        >
          {showCrown ? (
            <Crown className="size-4 shrink-0" aria-hidden />
          ) : null}
          {label}
        </button>
      ) : (
        <span className={chipClass} aria-label={`${label} plan`}>
          {showCrown ? (
            <Crown className="size-4 shrink-0" aria-hidden />
          ) : null}
          {label}
        </span>
      )}
      {isPastDue ? (
        <span
          className={cn(
            "inline-flex min-h-9 items-center rounded-md px-md",
            "bg-warning/25 text-info font-semibold text-foreground sm:text-body-sm",
          )}
        >
          Payment past due
        </span>
      ) : null}
    </div>
  );
}
