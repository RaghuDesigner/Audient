"use client";

import * as React from "react";

import { CurrentPlanCardActions } from "@/components/billing/CurrentPlanCardActions";
import {
  CurrentPlanCardError,
  CurrentPlanCardField,
  CurrentPlanCardLoading,
  currentPlanCardChrome,
} from "@/components/billing/CurrentPlanCardStates";
import { MembershipBadge } from "@/components/dashboard/MembershipBadge";
import { Badge } from "@/components/ui/badge";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  CURRENT_PLAN_CARD_COPY,
  type CurrentPlanCardBillingCycle,
  type CurrentPlanCardPlan,
  type CurrentPlanCardStatus,
  type CurrentPlanCardUiState,
  type CurrentPlanCardVariant,
} from "@/config/current-plan-card";
import { currentPlanCardAnalytics } from "@/lib/analytics/current-plan-card-events";
import {
  currentPlanCardCycleLabel,
  currentPlanCardMonthlyCredits,
  currentPlanCardPlanLabel,
  currentPlanCardPriceLabel,
  currentPlanCardStatusLabel,
  currentPlanStatusBadgeVariant,
  currentPlanStatusDetail,
  formatCurrentPlanStorage,
  statusFromCurrentPlanUiState,
} from "@/utils/current-plan-card";
import { formatAuditDate } from "@/utils/recent-audit";
import { cn } from "@/utils/cn";

export type CurrentPlanCardProps = {
  state: CurrentPlanCardUiState;
  plan: CurrentPlanCardPlan;
  status?: CurrentPlanCardStatus;
  billingCycle?: CurrentPlanCardBillingCycle;
  renewalDate?: string | Date | null;
  periodEndDate?: string | Date | null;
  creditsRemaining?: number | null;
  reportsUsed?: number | null;
  storageUsed?: string | number | null;
  currentPrice?: string | null;
  statusDetail?: string | null;
  variant?: CurrentPlanCardVariant;
  showBuyCredits?: boolean;
  onUpgrade?: () => void;
  onDowngrade?: () => void;
  onManageBilling?: () => void;
  onBuyCredits?: () => void;
  onReactivate?: () => void;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-033 — Current Plan Card.
 * Full subscription summary for Manage Membership / Billing — mock only.
 */
export function CurrentPlanCard({
  state,
  plan,
  status: statusProp,
  billingCycle = "monthly",
  renewalDate = null,
  periodEndDate = null,
  creditsRemaining = null,
  reportsUsed = null,
  storageUsed = null,
  currentPrice = null,
  statusDetail = null,
  variant = "default",
  showBuyCredits,
  onUpgrade,
  onDowngrade,
  onManageBilling,
  onBuyCredits,
  onReactivate,
  onRetry,
  className,
}: CurrentPlanCardProps) {
  const status = statusProp ?? statusFromCurrentPlanUiState(state);
  const viewed = React.useRef(false);
  const titleId = React.useId();

  React.useEffect(() => {
    if (state === "loading" || state === "error" || viewed.current) return;
    viewed.current = true;
    currentPlanCardAnalytics.viewed({
      plan,
      status,
      billingCycle,
      variant,
    });
  }, [billingCycle, plan, state, status, variant]);

  if (state === "loading") {
    return <CurrentPlanCardLoading className={className} />;
  }

  if (state === "error") {
    return (
      <CurrentPlanCardError
        plan={plan}
        statusDetail={statusDetail}
        titleId={titleId}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  const price = currentPrice ?? currentPlanCardPriceLabel(plan, billingCycle);
  const credits = creditsRemaining ?? currentPlanCardMonthlyCredits(plan);
  const monthlyGrant = currentPlanCardMonthlyCredits(plan);
  const storageLabel = formatCurrentPlanStorage(storageUsed);
  const detail = currentPlanStatusDetail(status, statusDetail);
  const dateLabel = periodEndDate
    ? `${CURRENT_PLAN_CARD_COPY.periodEnd} ${formatAuditDate(periodEndDate)}`
    : renewalDate
      ? `${CURRENT_PLAN_CARD_COPY.renewalDate} ${formatAuditDate(renewalDate)}`
      : plan === "free"
        ? CURRENT_PLAN_CARD_COPY.freeRenewalHint
        : null;
  const compact = variant === "compact";

  const summary = [
    `${currentPlanCardPlanLabel(plan)} plan`,
    currentPlanCardStatusLabel(status),
    price,
    `${credits.toLocaleString()} credits remaining`,
    dateLabel,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <section
      className={cn(
        currentPlanCardChrome,
        (status === "expired" || state === "expired") && "border-warning/50",
        className,
      )}
      aria-labelledby={titleId}
      aria-label={summary}
    >
      <Caption className="text-muted-foreground">
        {CURRENT_PLAN_CARD_COPY.title}
      </Caption>

      <div className="mt-md flex flex-wrap items-center gap-sm">
        <MembershipBadge tier={plan} />
        <Badge
          variant={currentPlanStatusBadgeVariant(status)}
          size="sm"
          shape="rounded"
        >
          {currentPlanCardStatusLabel(status)}
        </Badge>
      </div>

      <h2
        id={titleId}
        className={cn(
          "mt-md font-bold text-foreground",
          compact ? "text-h3" : "text-h3 sm:text-h2",
        )}
      >
        {currentPlanCardPlanLabel(plan)}
      </h2>

      <dl
        className={cn(
          "mt-md grid gap-md",
          compact ? "grid-cols-1" : "sm:grid-cols-2",
        )}
      >
        <CurrentPlanCardField
          label={CURRENT_PLAN_CARD_COPY.price}
          value={price}
        />
        <CurrentPlanCardField
          label={CURRENT_PLAN_CARD_COPY.billingCycle}
          value={currentPlanCardCycleLabel(billingCycle)}
        />
        <CurrentPlanCardField
          label={CURRENT_PLAN_CARD_COPY.creditsRemaining}
          value={`${credits.toLocaleString()} / ${monthlyGrant.toLocaleString()}`}
        />
        {reportsUsed != null ? (
          <CurrentPlanCardField
            label={CURRENT_PLAN_CARD_COPY.reportsUsed}
            value={reportsUsed.toLocaleString()}
          />
        ) : null}
        {storageLabel ? (
          <CurrentPlanCardField
            label={CURRENT_PLAN_CARD_COPY.storageUsed}
            value={storageLabel}
          />
        ) : null}
      </dl>

      {dateLabel ? (
        <Caption className="mt-md text-muted-foreground">{dateLabel}</Caption>
      ) : null}

      {detail ? (
        <BodySmall
          className="mt-md text-muted-foreground"
          role={
            status === "expired" || status === "cancelled"
              ? "status"
              : undefined
          }
        >
          {detail}
        </BodySmall>
      ) : null}

      <CurrentPlanCardActions
        className="mt-md"
        plan={plan}
        status={status}
        variant={variant}
        showBuyCredits={showBuyCredits}
        onUpgrade={onUpgrade}
        onDowngrade={onDowngrade}
        onManageBilling={onManageBilling}
        onBuyCredits={onBuyCredits}
        onReactivate={onReactivate}
      />
    </section>
  );
}
