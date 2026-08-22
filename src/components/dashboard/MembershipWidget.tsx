"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { MembershipBadge } from "@/components/dashboard/MembershipBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { membershipWidgetAnalytics } from "@/lib/analytics/membership-widget-events";
import {
  defaultMembershipBenefits,
  formatMembershipRenewal,
  membershipManageLabel,
  membershipUpgradeLabel,
  MEMBERSHIP_STATE_LABELS,
  shouldShowMembershipManage,
  shouldShowMembershipUpgrade,
  type MembershipWidgetPlan,
  type MembershipWidgetState,
} from "@/utils/membership-widget";
import { cn } from "@/utils/cn";

export type MembershipWidgetProps = {
  state: MembershipWidgetState;
  plan: MembershipWidgetPlan;
  renewalDate?: string | Date | null;
  benefits?: string[];
  showUpgradeCta?: boolean;
  showManageCta?: boolean;
  statusDetail?: string | null;
  onUpgrade?: () => void;
  onManagePlan?: () => void;
  className?: string;
};

/**
 * COMPONENT-018 — Membership Widget.
 * Plan badge · benefits · renewal · Upgrade / Manage Plan CTAs.
 */
export function MembershipWidget({
  state,
  plan,
  renewalDate = null,
  benefits: benefitsProp,
  showUpgradeCta,
  showManageCta,
  statusDetail = null,
  onUpgrade,
  onManagePlan,
  className,
}: MembershipWidgetProps) {
  const impressed = React.useRef(false);

  React.useEffect(() => {
    if (state === "loading" || impressed.current) return;
    impressed.current = true;
    membershipWidgetAnalytics.impressed({ plan, state });
  }, [plan, state]);

  if (state === "loading") {
    return (
      <section
        className={cn(cardChrome, className)}
        aria-busy="true"
        aria-label="Loading membership"
      >
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-md h-8 w-24" />
        <Skeleton className="mt-md h-4 w-40" />
        <div className="mt-md flex flex-col gap-sm">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="mt-md h-11 w-36" />
      </section>
    );
  }

  const benefits = benefitsProp ?? defaultMembershipBenefits(plan);
  const renewalLabel = formatMembershipRenewal(renewalDate);
  const showUpgrade = shouldShowMembershipUpgrade({
    plan,
    state,
    showUpgradeCta,
  });
  const showManage = shouldShowMembershipManage({
    plan,
    state,
    showManageCta,
  });
  const upgradeLabel = membershipUpgradeLabel({ plan, state });
  const manageLabel = membershipManageLabel(state);
  const isExpired = state === "expired";
  const statusLabel = MEMBERSHIP_STATE_LABELS[state];
  const badgeStatus = isExpired ? "past_due" : "active";

  const summary = [
    `${MEMBERSHIP_STATE_LABELS[state]} ${plan} plan`,
    renewalLabel && !isGuestOrFree(plan) ? `renews ${renewalLabel}` : null,
    statusDetail,
  ]
    .filter(Boolean)
    .join(". ");

  const handleUpgrade = () => {
    if (isExpired) {
      membershipWidgetAnalytics.renewClicked({ plan });
    } else {
      membershipWidgetAnalytics.upgradeClicked({ plan, state });
    }
    onUpgrade?.();
  };

  const handleManage = () => {
    if (isExpired) {
      membershipWidgetAnalytics.renewClicked({ plan });
    } else {
      membershipWidgetAnalytics.manageClicked({ plan, state });
    }
    onManagePlan?.();
  };

  return (
    <section
      className={cn(
        cardChrome,
        isExpired && "border-warning/50",
        className,
      )}
      aria-label={summary}
    >
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <Caption className="font-semibold uppercase tracking-wide text-muted-foreground">
          Membership
        </Caption>
        <span
          className={cn(
            "inline-flex min-h-7 items-center rounded-md px-sm",
            "text-info font-semibold",
            isExpired
              ? "bg-warning/25 text-foreground"
              : state === "trial"
                ? "bg-secondary/15 text-secondary"
                : "bg-success/15 text-success",
          )}
          role={isExpired ? "alert" : "status"}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-md">
        <MembershipBadge tier={plan} status={badgeStatus} />
      </div>

      <BodySmall className="mt-md text-muted-foreground">
        {isGuestOrFree(plan) || !renewalLabel
          ? "No renewal date on this plan"
          : isExpired
            ? `Ended ${renewalLabel}`
            : `Renews ${renewalLabel}`}
      </BodySmall>

      {statusDetail ? (
        <p
          className="mt-sm text-info text-foreground sm:text-body-sm"
          role={isExpired ? "alert" : undefined}
        >
          {statusDetail}
        </p>
      ) : null}

      <ul
        className="mt-md flex flex-col gap-sm"
        aria-label={`${plan} plan benefits`}
      >
        {benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-sm text-info text-foreground sm:text-body-sm"
          >
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                isExpired ? "text-muted-foreground" : "text-success",
              )}
              aria-hidden
            />
            <span className={cn(isExpired && "text-muted-foreground")}>
              {benefit}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-md flex flex-col gap-sm sm:flex-row sm:flex-wrap">
        {showUpgrade ? (
          <Button
            type="button"
            variant={
              plan === "free" || plan === "guest" || isExpired
                ? "primary"
                : "outline"
            }
            className={
              plan === "free" || plan === "guest" || isExpired
                ? "text-primary-foreground"
                : undefined
            }
            onClick={handleUpgrade}
          >
            {upgradeLabel}
          </Button>
        ) : null}
        {showManage ? (
          <Button
            type="button"
            variant={
              plan === "pro" || plan === "business"
                ? isExpired
                  ? "outline"
                  : "primary"
                : "ghost"
            }
            className={
              (plan === "pro" || plan === "business") && !isExpired
                ? "text-primary-foreground"
                : undefined
            }
            onClick={handleManage}
          >
            {manageLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function isGuestOrFree(plan: MembershipWidgetPlan): boolean {
  return plan === "guest" || plan === "free";
}

const cardChrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";
