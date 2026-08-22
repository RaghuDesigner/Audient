"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { MembershipBadge } from "@/components/dashboard/MembershipBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  BILLING_PAYMENTS_COPY,
  type BillingPaymentsCycle,
  type BillingPaymentsPlan,
} from "@/config/billing-payments";
import { billingPaymentsAnalytics } from "@/lib/analytics/billing-payments-events";
import {
  billingPaymentsCyclePriceLabel,
  billingPaymentsCreditsIncluded,
  billingPaymentsPlanLabel,
  formatBillingPaymentsCredits,
} from "@/utils/billing-payments";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export type SelectedPlanCardProps = {
  plan: BillingPaymentsPlan;
  cycle?: BillingPaymentsCycle;
  /** From plans.ts features when omitted. */
  featureBullets?: readonly string[];
  creditsIncluded?: number;
  /** Override cycle price label. */
  priceLabel?: string | null;
  loading?: boolean;
  onChangePlan?: () => void;
  className?: string;
  id?: string;
};

function SelectedPlanCardLoading({ className }: { className?: string }) {
  return (
    <section
      className={cn(chrome, className)}
      aria-busy="true"
      aria-label="Loading selected plan"
    >
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-md h-8 w-24" />
      <Skeleton className="mt-md h-5 w-32" />
      <Skeleton className="mt-sm h-4 w-40" />
      <ul className="mt-md space-y-sm" aria-hidden>
        <Skeleton className="h-4 w-full max-w-xs" />
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="h-4 w-full max-w-md" />
      </ul>
      <Skeleton className="mt-md h-11 w-36" />
    </section>
  );
}

/**
 * SCREEN-012 — Selected Plan Card.
 * Target plan for checkout review — Change Plan returns to membership.
 */
export function SelectedPlanCard({
  plan,
  cycle = "monthly",
  featureBullets,
  creditsIncluded,
  priceLabel = null,
  loading = false,
  onChangePlan,
  className,
  id,
}: SelectedPlanCardProps) {
  const titleId = React.useId();

  if (loading) {
    return <SelectedPlanCardLoading className={className} />;
  }

  const label = billingPaymentsPlanLabel(plan);
  const price = priceLabel ?? billingPaymentsCyclePriceLabel(plan, cycle);
  const credits = creditsIncluded ?? billingPaymentsCreditsIncluded(plan);
  const bullets = featureBullets ?? [];

  const handleChangePlan = () => {
    billingPaymentsAnalytics.changePlanClicked({ plan });
    onChangePlan?.();
  };

  const summary = [
    `${label} plan`,
    price,
    `${formatBillingPaymentsCredits(credits)} credits included`,
  ].join(". ");

  return (
    <section
      id={id}
      className={cn(chrome, className)}
      aria-labelledby={titleId}
      aria-label={summary}
    >
      <Caption className="text-muted-foreground">
        {BILLING_PAYMENTS_COPY.selectedPlan}
      </Caption>

      <div className="mt-md flex flex-wrap items-center gap-sm">
        <MembershipBadge tier={plan} />
      </div>

      <h2
        id={titleId}
        className="mt-md text-h3 font-bold text-foreground sm:text-h2"
      >
        {label}
      </h2>

      <dl className="mt-md grid gap-md sm:grid-cols-2">
        <div>
          <Caption asChild>
            <dt className="text-muted-foreground">
              {BILLING_PAYMENTS_COPY.planPrice}
            </dt>
          </Caption>
          <dd className="mt-sm">
            <BodySmall className="font-semibold text-foreground">
              {price}
            </BodySmall>
          </dd>
        </div>
        <div>
          <Caption asChild>
            <dt className="text-muted-foreground">
              {BILLING_PAYMENTS_COPY.creditsIncluded}
            </dt>
          </Caption>
          <dd className="mt-sm">
            <BodySmall className="font-semibold text-foreground">
              {formatBillingPaymentsCredits(credits)} / month
            </BodySmall>
          </dd>
        </div>
      </dl>

      {bullets.length > 0 ? (
        <ul className="mt-md space-y-sm">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-sm text-body-sm text-foreground">
              <Check
                className="mt-0.5 size-4 shrink-0 text-success"
                aria-hidden
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {onChangePlan ? (
        <Button
          type="button"
          variant="outline"
          size="md"
          className="mt-md"
          onClick={handleChangePlan}
        >
          {BILLING_PAYMENTS_COPY.changePlan}
        </Button>
      ) : null}
    </section>
  );
}
