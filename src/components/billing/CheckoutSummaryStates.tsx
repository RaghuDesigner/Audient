"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { CHECKOUT_SUMMARY_COPY } from "@/config/checkout-summary";
import { checkoutSummaryAnalytics } from "@/lib/analytics/checkout-summary-events";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

const chromeCompact =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm";

export function checkoutSummaryChrome(compact?: boolean): string {
  return compact ? chromeCompact : chrome;
}

export function CheckoutSummaryLoading({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={cn(checkoutSummaryChrome(compact), className)}
      aria-busy="true"
      aria-label={CHECKOUT_SUMMARY_COPY.loadingLabel}
    >
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-md h-8 w-24" />
      <div
        className={cn(
          "mt-md grid gap-md",
          compact ? "grid-cols-1" : "sm:grid-cols-2",
        )}
      >
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        {!compact ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : null}
      </div>
      {!compact ? (
        <ul className="mt-md space-y-sm" aria-hidden>
          <Skeleton className="h-4 w-full max-w-xs" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </ul>
      ) : null}
    </section>
  );
}

export type CheckoutSummaryErrorProps = {
  plan?: string;
  context?: string;
  titleId: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
};

export function CheckoutSummaryError({
  plan,
  context,
  titleId,
  onRetry,
  className,
  compact = false,
}: CheckoutSummaryErrorProps) {
  return (
    <section
      className={cn(checkoutSummaryChrome(compact), className)}
      aria-labelledby={titleId}
    >
      <Caption className="text-muted-foreground">
        {CHECKOUT_SUMMARY_COPY.title}
      </Caption>
      <Alert variant="error" assertive className="mt-md">
        <BodySmall id={titleId} className="font-semibold">
          {CHECKOUT_SUMMARY_COPY.errorHeadline}
        </BodySmall>
        <BodySmall className="mt-sm">
          {CHECKOUT_SUMMARY_COPY.errorDescription}
        </BodySmall>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-md"
            onClick={() => {
              checkoutSummaryAnalytics.retryClicked({ plan, context });
              onRetry();
            }}
          >
            {CHECKOUT_SUMMARY_COPY.retry}
          </Button>
        ) : null}
      </Alert>
    </section>
  );
}

export function CheckoutSummaryField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <Caption asChild>
        <dt className="text-muted-foreground">{label}</dt>
      </Caption>
      <dd className="mt-sm">
        <BodySmall className="font-semibold text-foreground">{value}</BodySmall>
      </dd>
    </div>
  );
}

export { chrome as checkoutSummaryChromeDefault };
