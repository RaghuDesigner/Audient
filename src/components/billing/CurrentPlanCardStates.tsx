"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { CURRENT_PLAN_CARD_COPY } from "@/config/current-plan-card";
import { currentPlanCardAnalytics } from "@/lib/analytics/current-plan-card-events";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export function CurrentPlanCardLoading({ className }: { className?: string }) {
  return (
    <section
      className={cn(chrome, className)}
      aria-busy="true"
      aria-label="Loading current plan"
    >
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-md h-8 w-32" />
      <Skeleton className="mt-md h-4 w-48" />
      <Skeleton className="mt-sm h-4 w-40" />
      <Skeleton className="mt-sm h-4 w-36" />
      <div className="mt-md flex gap-sm">
        <Skeleton className="h-11 w-36" />
        <Skeleton className="h-11 w-36" />
      </div>
    </section>
  );
}

export type CurrentPlanCardErrorProps = {
  plan: string;
  statusDetail?: string | null;
  titleId: string;
  onRetry?: () => void;
  className?: string;
};

export function CurrentPlanCardError({
  plan,
  statusDetail = null,
  titleId,
  onRetry,
  className,
}: CurrentPlanCardErrorProps) {
  return (
    <section className={cn(chrome, className)} aria-labelledby={titleId}>
      <Caption className="text-muted-foreground">
        {CURRENT_PLAN_CARD_COPY.title}
      </Caption>
      <Alert variant="error" assertive className="mt-md">
        <BodySmall id={titleId} className="font-semibold">
          {CURRENT_PLAN_CARD_COPY.errorHeadline}
        </BodySmall>
        <BodySmall className="mt-sm">
          {statusDetail ?? CURRENT_PLAN_CARD_COPY.errorDescription}
        </BodySmall>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-md"
            onClick={() => {
              currentPlanCardAnalytics.retryClicked({ plan });
              onRetry();
            }}
          >
            {CURRENT_PLAN_CARD_COPY.retry}
          </Button>
        ) : null}
      </Alert>
    </section>
  );
}

export function CurrentPlanCardField({
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

export { chrome as currentPlanCardChrome };
