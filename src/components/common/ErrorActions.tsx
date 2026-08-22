"use client";

import { Button } from "@/components/ui/button";
import { ERROR_ACTIONS_COPY } from "@/config/error-actions";
import type { ErrorSystemAction } from "@/config/error-system-states";
import { isRetryAction } from "@/config/error-actions";
import { cn } from "@/utils/cn";

export type ErrorActionsProps = {
  primaryAction?: ErrorSystemAction | null;
  secondaryAction?: ErrorSystemAction | null;
  primaryLabel?: string | null;
  secondaryLabel?: string | null;
  onPrimary?: (action: ErrorSystemAction) => void;
  onSecondary?: (action: ErrorSystemAction) => void;
  /** Primary retry busy state. */
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * COMPONENT-074 — Error Actions.
 * Primary + secondary action row for error states — Button primitives only.
 */
export function ErrorActions({
  primaryAction = null,
  secondaryAction = null,
  primaryLabel = null,
  secondaryLabel = null,
  onPrimary,
  onSecondary,
  loading = false,
  loadingLabel = ERROR_ACTIONS_COPY.loadingLabel,
  disabled = false,
  className,
}: ErrorActionsProps) {
  const showPrimary = Boolean(primaryAction && primaryLabel && onPrimary);
  const showSecondary = Boolean(
    secondaryAction && secondaryLabel && onSecondary,
  );

  if (!showPrimary && !showSecondary) {
    return null;
  }

  const actionsDisabled = disabled || loading;
  const primaryShowsLoading = Boolean(
    loading && primaryAction && isRetryAction(primaryAction),
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-sm sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center",
        className,
      )}
    >
      {showPrimary ? (
        <Button
          type="button"
          variant="primary"
          fullWidth
          className="min-h-11 text-primary-foreground sm:w-auto"
          disabled={actionsDisabled}
          isLoading={primaryShowsLoading}
          onClick={() => onPrimary!(primaryAction!)}
        >
          {primaryShowsLoading ? loadingLabel : primaryLabel}
        </Button>
      ) : null}
      {showSecondary ? (
        <Button
          type="button"
          variant="outline"
          fullWidth
          className="min-h-11 sm:w-auto"
          disabled={actionsDisabled}
          onClick={() => onSecondary!(secondaryAction!)}
        >
          {secondaryLabel}
        </Button>
      ) : null}
    </div>
  );
}
