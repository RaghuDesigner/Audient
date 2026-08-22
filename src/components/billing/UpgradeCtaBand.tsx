"use client";

import * as React from "react";

import { FaqAccordion } from "@/components/common/FaqAccordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  MANAGE_MEMBERSHIP_COPY,
  type ManageMembershipPlan,
  type ManageMembershipStatus,
} from "@/config/manage-membership";
import { MOCK_FAQ_MEMBERSHIP_ITEMS } from "@/data/mock-faq-accordion";
import {
  manageMembershipUpgradeLabel,
  nextManageMembershipUpgrade,
  shouldShowManageMembershipUpgrade,
} from "@/utils/manage-membership";
import { cn } from "@/utils/cn";

export type UpgradeCtaBandProps = {
  plan: ManageMembershipPlan;
  status: ManageMembershipStatus;
  loading?: boolean;
  showFaq?: boolean;
  onUpgrade?: () => void;
  onContactSales?: () => void;
  onDowngrade?: () => void;
  onReactivate?: () => void;
  onFaqExpand?: (faqId: string) => void;
  className?: string;
};

/**
 * SCREEN-011 — Upgrade CTA band + optional FAQ.
 * Checkout mocked — parent wires analytics / upgrade modal.
 */
export function UpgradeCtaBand({
  plan,
  status,
  loading = false,
  showFaq = true,
  onUpgrade,
  onContactSales,
  onDowngrade,
  onReactivate,
  onFaqExpand,
  className,
}: UpgradeCtaBandProps) {
  if (loading) {
    return (
      <div className={cn("flex w-full flex-col gap-md", className)}>
        <Skeleton className="h-32 w-full rounded-md" aria-busy="true" />
        {showFaq ? (
          <Skeleton className="h-40 w-full rounded-md" aria-busy="true" />
        ) : null}
      </div>
    );
  }

  const showUpgrade = shouldShowManageMembershipUpgrade(plan, status);
  const isLapsed = status === "cancelled" || status === "expired";
  const nextPlan = nextManageMembershipUpgrade(plan);
  const primaryLabel = isLapsed
    ? status === "expired"
      ? MANAGE_MEMBERSHIP_COPY.resubscribe
      : MANAGE_MEMBERSHIP_COPY.reactivate
    : manageMembershipUpgradeLabel(plan);
  const showDowngrade =
    !isLapsed && status === "active" && (plan === "pro" || plan === "business");
  const supporting =
    plan === "business" && !isLapsed
      ? "Need a custom seat pack or invoice billing? Talk to sales — portal ships with Stripe."
      : isLapsed
        ? status === "expired"
          ? MANAGE_MEMBERSHIP_COPY.expiredDetail
          : MANAGE_MEMBERSHIP_COPY.cancelledDetail
        : MANAGE_MEMBERSHIP_COPY.checkoutSoon;

  return (
    <div className={cn("flex w-full flex-col gap-lg", className)}>
      <section
        className={chrome}
        aria-labelledby="manage-membership-upgrade-cta"
      >
        <Caption className="text-muted-foreground">
          {MANAGE_MEMBERSHIP_COPY.upgradeCtaBand}
        </Caption>
        <h2
          id="manage-membership-upgrade-cta"
          className="mt-sm text-h3 font-bold text-foreground sm:text-h2"
        >
          {plan === "business" && !isLapsed
            ? MANAGE_MEMBERSHIP_COPY.contactSales
            : primaryLabel}
        </h2>
        <BodySmall className="mt-sm max-w-prose text-muted-foreground">
          {supporting}
        </BodySmall>

        <div className="mt-md flex flex-wrap gap-sm">
          {showUpgrade || plan === "business" ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              className="text-primary-foreground"
              onClick={() => {
                if (isLapsed) {
                  onReactivate?.();
                  return;
                }
                if (plan === "business" || nextPlan == null) {
                  onContactSales?.();
                  return;
                }
                onUpgrade?.();
              }}
            >
              {primaryLabel}
            </Button>
          ) : null}
          {showDowngrade ? (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onDowngrade}
            >
              {MANAGE_MEMBERSHIP_COPY.downgrade}
            </Button>
          ) : null}
        </div>
      </section>

      {showFaq ? (
        <MembershipFaqAccordion onExpand={onFaqExpand} />
      ) : null}
    </div>
  );
}

export type MembershipFaqAccordionProps = {
  onExpand?: (faqId: string) => void;
  className?: string;
};

/**
 * SCREEN-011 adapter — COMPONENT-037 FaqAccordion + membership mock items.
 */
export function MembershipFaqAccordion({
  onExpand,
  className,
}: MembershipFaqAccordionProps) {
  const prevIds = React.useRef<string[]>([]);

  return (
    <FaqAccordion
      id="manage-membership-faq"
      module="membership"
      heading={MANAGE_MEMBERSHIP_COPY.faq}
      items={MOCK_FAQ_MEMBERSHIP_ITEMS}
      className={className}
      onExpandedChange={(ids) => {
        const opened = ids.find((id) => !prevIds.current.includes(id));
        prevIds.current = ids;
        if (opened) onExpand?.(opened);
      }}
    />
  );
}

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";
