"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { BUY_CREDITS_CARD_COPY } from "@/config/buy-credits-card";
import { buyCreditsCardAnalytics } from "@/lib/analytics/buy-credits-card-events";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export function BuyCreditsCardLoading({ className }: { className?: string }) {
  return (
    <section
      className={cn(chrome, className)}
      aria-busy="true"
      aria-label="Loading buy credits"
    >
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-md h-4 w-40" />
      <div className="mt-md grid grid-cols-2 gap-sm sm:grid-cols-4">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
      <Skeleton className="mt-md h-11 w-40" />
    </section>
  );
}

export type BuyCreditsCardErrorProps = {
  tier: string;
  onRetry?: () => void;
  className?: string;
};

export function BuyCreditsCardError({
  tier,
  onRetry,
  className,
}: BuyCreditsCardErrorProps) {
  return (
    <section
      className={cn(chrome, className)}
      aria-labelledby="buy-credits-error-title"
    >
      <Caption className="text-muted-foreground">
        {BUY_CREDITS_CARD_COPY.title}
      </Caption>
      <Alert variant="error" assertive className="mt-md">
        <BodySmall id="buy-credits-error-title" className="font-semibold">
          {BUY_CREDITS_CARD_COPY.errorHeadline}
        </BodySmall>
        <BodySmall className="mt-sm">
          {BUY_CREDITS_CARD_COPY.errorDescription}
        </BodySmall>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-md"
            onClick={() => {
              buyCreditsCardAnalytics.retryClicked({ tier });
              onRetry();
            }}
          >
            {BUY_CREDITS_CARD_COPY.retry}
          </Button>
        ) : null}
      </Alert>
    </section>
  );
}

export { chrome as buyCreditsCardChrome };
