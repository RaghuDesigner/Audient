import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

/** @deprecated Prefer `Skeleton` from `@/components/ui/skeleton`. */
export function CardSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-4", className)} {...props} />;
}

/** Default loading layout for Card `variant="loading"`. */
export function CardLoadingBody() {
  return (
    <div className="flex flex-col gap-md" role="status" aria-label="Loading">
      <Skeleton className="h-5 w-1/3" variant="text" />
      <Skeleton className="h-4 w-2/3" variant="text" />
      <Skeleton className="h-24 w-full" variant="rect" />
      <div className="flex gap-sm">
        <Skeleton className="h-11 w-24" variant="rect" />
        <Skeleton className="h-11 w-24" variant="rect" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

type CardEmptyBodyProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

/** Empty-state content (heading + message + optional action). */
export function CardEmptyBody({
  title = "Nothing to show",
  description,
  action,
}: CardEmptyBodyProps) {
  return (
    <div className="flex flex-col items-start gap-sm py-md text-left">
      <p className="text-body-sm font-semibold text-foreground sm:text-body">
        {title}
      </p>
      {description ? (
        <p className="text-info text-muted-foreground sm:text-body-sm">
          {description}
        </p>
      ) : null}
      {action ? <div className="pt-sm">{action}</div> : null}
    </div>
  );
}

type CardErrorBodyProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

/** Error-state content — text + error token (not color-only). */
export function CardErrorBody({
  title = "Something went wrong",
  description,
  action,
}: CardErrorBodyProps) {
  return (
    <div
      className="flex flex-col items-start gap-sm py-md text-left"
      role="alert"
    >
      <p className="text-body-sm font-semibold text-error sm:text-body">
        {title}
      </p>
      {description ? (
        <p className="text-info text-muted-foreground sm:text-body-sm">
          {description}
        </p>
      ) : null}
      {action ? <div className="pt-sm">{action}</div> : null}
    </div>
  );
}
