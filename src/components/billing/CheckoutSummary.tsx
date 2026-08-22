"use client";

import * as React from "react";
import { Check } from "lucide-react";

import {
  CheckoutSummaryError,
  CheckoutSummaryField,
  CheckoutSummaryLoading,
  checkoutSummaryChrome,
} from "@/components/billing/CheckoutSummaryStates";
import { MembershipBadge } from "@/components/dashboard/MembershipBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  CHECKOUT_SUMMARY_COPY,
  CHECKOUT_SUMMARY_CURRENCY,
  type CheckoutSummaryContext,
  type CheckoutSummaryCycle,
  type CheckoutSummaryPlan,
  type CheckoutSummaryState,
  type CheckoutSummaryVariant,
} from "@/config/checkout-summary";
import { checkoutSummaryAnalytics } from "@/lib/analytics/checkout-summary-events";
import {
  buildCheckoutSummaryAnnouncement,
  checkoutSummaryCreditsIncluded,
  checkoutSummaryCycleLabel,
  checkoutSummaryFeatureBullets,
  checkoutSummaryPlanLabel,
  checkoutSummaryPriceLabel,
  checkoutSummaryStatusDetail,
  formatCheckoutSummaryCredits,
  formatCheckoutSummaryRenewal,
  shouldShowCheckoutSummaryFeatures,
  shouldShowCheckoutSummaryResubscribe,
} from "@/utils/checkout-summary";
import { cn } from "@/utils/cn";

export type CheckoutSummaryProps = {
  state: CheckoutSummaryState;
  planName?: CheckoutSummaryPlan;
  billingCycle?: CheckoutSummaryCycle;
  priceLabel?: string | null;
  currency?: string;
  creditsIncluded?: number | null;
  features?: string[] | null;
  renewalDateLabel?: string | null;
  renewalDate?: string | Date | null;
  membershipBadge?: string | null;
  variant?: CheckoutSummaryVariant;
  context?: CheckoutSummaryContext;
  onRetry?: () => void;
  onResubscribe?: () => void;
  className?: string;
  id?: string;
};

/**
 * Checkout Summary — selected / purchased plan snapshot.
 * Reusable on Checkout, Payment Success, Invoice, Billing History.
 * @see docs/components/COMPONENT_CHECKOUT_SUMMARY.md
 */
export function CheckoutSummary({
  state,
  planName = "pro",
  billingCycle = "monthly",
  priceLabel = null,
  currency = CHECKOUT_SUMMARY_CURRENCY,
  creditsIncluded = null,
  features = null,
  renewalDateLabel = null,
  renewalDate = null,
  membershipBadge = null,
  variant = "default",
  context = "checkout",
  onRetry,
  onResubscribe,
  className,
  id,
}: CheckoutSummaryProps) {
  const titleId = React.useId();
  const viewed = React.useRef(false);
  const compact = variant === "compact" || variant === "invoice";

  React.useEffect(() => {
    if (state === "loading" || state === "error" || viewed.current) return;
    viewed.current = true;
    checkoutSummaryAnalytics.viewed({
      plan: planName,
      billingCycle,
      state,
      context,
      variant,
    });
  }, [billingCycle, context, planName, state, variant]);

  if (state === "loading") {
    return <CheckoutSummaryLoading className={className} compact={compact} />;
  }

  if (state === "error") {
    return (
      <CheckoutSummaryError
        plan={planName}
        context={context}
        titleId={titleId}
        onRetry={onRetry}
        className={className}
        compact={compact}
      />
    );
  }

  const label = membershipBadge ?? checkoutSummaryPlanLabel(planName);
  const price = priceLabel ?? checkoutSummaryPriceLabel(planName, billingCycle);
  const credits = creditsIncluded ?? checkoutSummaryCreditsIncluded(planName);
  const featureList = features ?? checkoutSummaryFeatureBullets(planName);
  const showFeatures = shouldShowCheckoutSummaryFeatures(variant, featureList);
  const renewal = formatCheckoutSummaryRenewal({
    state,
    plan: planName,
    renewalDateLabel,
    renewalDate,
  });
  const statusDetail = checkoutSummaryStatusDetail(state);
  const showResubscribe = shouldShowCheckoutSummaryResubscribe(state, onResubscribe);

  return (
    <section
      id={id}
      className={cn(
        checkoutSummaryChrome(compact),
        (state === "cancelled" || state === "expired") && "border-warning/50",
        className,
      )}
      aria-labelledby={titleId}
      aria-label={buildCheckoutSummaryAnnouncement({
        plan: planName,
        cycle: billingCycle,
        priceLabel: price,
        credits,
        renewalLabel: renewal,
        state,
      })}
    >
      <Caption id={titleId} className="text-muted-foreground">
        {CHECKOUT_SUMMARY_COPY.title}
      </Caption>

      <div className="mt-md flex flex-wrap items-center gap-sm">
        <MembershipBadge tier={planName} />
        {state === "cancelled" || state === "expired" ? (
          <Badge variant="warning" size="sm" shape="rounded">
            {state === "cancelled"
              ? CHECKOUT_SUMMARY_COPY.cancelled
              : CHECKOUT_SUMMARY_COPY.expired}
          </Badge>
        ) : null}
      </div>

      <h2
        className={cn(
          "mt-md font-bold text-foreground",
          compact ? "text-h3" : "text-h3 sm:text-h2",
        )}
      >
        {label}
      </h2>

      <dl className={cn("mt-md grid gap-md", "sm:grid-cols-2")}>
        <CheckoutSummaryField
          label={CHECKOUT_SUMMARY_COPY.selectedPlan}
          value={checkoutSummaryPlanLabel(planName)}
        />
        <CheckoutSummaryField
          label={CHECKOUT_SUMMARY_COPY.billingCycle}
          value={checkoutSummaryCycleLabel(billingCycle)}
        />
        <CheckoutSummaryField label={CHECKOUT_SUMMARY_COPY.price} value={price} />
        {!compact ? (
          <CheckoutSummaryField
            label={CHECKOUT_SUMMARY_COPY.currency}
            value={currency}
          />
        ) : null}
        <CheckoutSummaryField
          label={CHECKOUT_SUMMARY_COPY.creditsIncluded}
          value={`${formatCheckoutSummaryCredits(credits)} / month`}
        />
        <CheckoutSummaryField
          label={
            state === "cancelled"
              ? CHECKOUT_SUMMARY_COPY.endsDate
              : CHECKOUT_SUMMARY_COPY.renewalDate
          }
          value={renewal}
        />
      </dl>

      {showFeatures ? (
        <div className="mt-md">
          <Caption className="text-muted-foreground">
            {CHECKOUT_SUMMARY_COPY.includedFeatures}
          </Caption>
          <ul className="mt-sm space-y-sm">
            {featureList.map((feature) => (
              <li
                key={feature}
                className="flex gap-sm text-body-sm text-foreground"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-success"
                  aria-hidden
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {statusDetail ? (
        <BodySmall className="mt-md text-muted-foreground" role="status">
          {statusDetail}
        </BodySmall>
      ) : null}

      {showResubscribe ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="mt-md"
          onClick={() => {
            checkoutSummaryAnalytics.resubscribeClicked({
              plan: planName,
              context,
            });
            onResubscribe?.();
          }}
        >
          {CHECKOUT_SUMMARY_COPY.resubscribe}
        </Button>
      ) : null}
    </section>
  );
}
