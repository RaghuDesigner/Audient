"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { BILLING_DETAILS_CARD_COPY } from "@/config/billing-details-card";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export const billingDetailsCardChrome = chrome;

export function BillingDetailsCardLoading({
  className,
}: {
  className?: string;
}) {
  return (
    <section
      className={cn(chrome, className)}
      aria-busy="true"
      aria-label={BILLING_DETAILS_CARD_COPY.loadingLabel}
    >
      <Skeleton className="h-4 w-32" />
      <div className="mt-md grid gap-md sm:grid-cols-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full sm:col-span-2" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </section>
  );
}
