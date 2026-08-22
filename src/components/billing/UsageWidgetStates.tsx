"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { USAGE_WIDGET_COPY } from "@/config/usage-widget";
import { usageWidgetAnalytics } from "@/lib/analytics/usage-widget-events";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export function UsageWidgetLoading({ className }: { className?: string }) {
  return (
    <section
      className={cn(chrome, className)}
      aria-busy="true"
      aria-label="Loading usage"
    >
      <Skeleton className="h-5 w-36" />
      <Skeleton className="mt-md h-4 w-48" />
      <Skeleton className="mt-md h-3 w-full rounded-full" />
      <div className="mt-md grid gap-md sm:grid-cols-2">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    </section>
  );
}

export type UsageWidgetErrorProps = {
  tier?: string;
  onRetry?: () => void;
  className?: string;
};

export function UsageWidgetError({
  tier,
  onRetry,
  className,
}: UsageWidgetErrorProps) {
  return (
    <section
      className={cn(chrome, className)}
      aria-labelledby="usage-widget-error-title"
    >
      <Caption className="text-muted-foreground">
        {USAGE_WIDGET_COPY.title}
      </Caption>
      <Alert variant="error" assertive className="mt-md">
        <BodySmall id="usage-widget-error-title" className="font-semibold">
          {USAGE_WIDGET_COPY.errorHeadline}
        </BodySmall>
        <BodySmall className="mt-sm">
          {USAGE_WIDGET_COPY.errorDescription}
        </BodySmall>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-md"
            onClick={() => {
              usageWidgetAnalytics.retryClicked({ tier });
              onRetry();
            }}
          >
            {USAGE_WIDGET_COPY.retry}
          </Button>
        ) : null}
      </Alert>
    </section>
  );
}

export function UsageWidgetMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | null;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-md">
      <Caption className="text-muted-foreground">{label}</Caption>
      <p className="mt-sm text-h3 font-bold tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <BodySmall className="mt-sm text-muted-foreground">{hint}</BodySmall>
      ) : null}
    </div>
  );
}

export { chrome as usageWidgetChrome };
