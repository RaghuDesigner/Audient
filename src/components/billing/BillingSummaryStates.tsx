"use client";

import * as React from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { BILLING_SUMMARY_COPY } from "@/config/billing-summary";
import { billingSummaryAnalytics } from "@/lib/analytics/billing-summary-events";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export function BillingSummaryLoading({ className }: { className?: string }) {
  return (
    <section
      className={cn(chrome, className)}
      aria-busy="true"
      aria-label="Loading billing summary"
    >
      <Skeleton className="h-5 w-36" />
      <Skeleton className="mt-md h-4 w-48" />
      <Skeleton className="mt-sm h-4 w-40" />
      <Skeleton className="mt-sm h-4 w-44" />
      <Skeleton className="mt-sm h-4 w-36" />
      <Skeleton className="mt-md h-11 w-40" />
    </section>
  );
}

export type BillingSummaryErrorProps = {
  plan: string;
  statusDetail?: string | null;
  titleId: string;
  onRetry?: () => void;
  className?: string;
};

export function BillingSummaryError({
  plan,
  statusDetail = null,
  titleId,
  onRetry,
  className,
}: BillingSummaryErrorProps) {
  return (
    <section className={cn(chrome, className)} aria-labelledby={titleId}>
      <Caption className="text-muted-foreground">
        {BILLING_SUMMARY_COPY.title}
      </Caption>
      <Alert variant="error" assertive className="mt-md">
        <BodySmall id={titleId} className="font-semibold">
          {BILLING_SUMMARY_COPY.errorHeadline}
        </BodySmall>
        <BodySmall className="mt-sm">
          {statusDetail ?? BILLING_SUMMARY_COPY.errorDescription}
        </BodySmall>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-md"
            onClick={() => {
              billingSummaryAnalytics.retryClicked({ plan });
              onRetry();
            }}
          >
            {BILLING_SUMMARY_COPY.retry}
          </Button>
        ) : null}
      </Alert>
    </section>
  );
}

export function BillingSummaryField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <Caption asChild>
        <dt className="text-muted-foreground">{label}</dt>
      </Caption>
      <dd className="mt-sm">
        {typeof value === "string" ? (
          <BodySmall className="font-semibold text-foreground">{value}</BodySmall>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export { chrome as billingSummaryChrome };
