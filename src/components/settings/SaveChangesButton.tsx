"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  SAVE_CHANGES_BUTTON_COPY,
  SAVE_CHANGES_BUTTON_MOCK_DELAY_MS,
  SAVE_CHANGES_BUTTON_SUCCESS_FLASH_MS,
  type SaveChangesButtonState,
} from "@/config/save-changes-button";
import { saveChangesButtonAnalytics } from "@/lib/analytics/save-changes-button-events";
import {
  isSaveChangesButtonBusy,
  isSaveChangesButtonDisabled,
} from "@/utils/save-changes-button";
import { cn } from "@/utils/cn";

export type SaveChangesButtonProps = {
  /** Unsaved changes exist. */
  dirty: boolean;
  /** Mock save — parent persists to mock settings store only. */
  onSave: () => void | Promise<void>;
  /** Extra disable (e.g. invalid form). */
  disabled?: boolean;
  /** External state override; omit for internal machine. */
  state?: SaveChangesButtonState;
  label?: string;
  /** Override default success toast / live region copy. */
  successMessage?: string;
  /** Override default error toast copy. */
  errorMessage?: string;
  fullWidth?: boolean;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-050 — Save Changes Button.
 * Primary Settings save control — mock only; no backend / no Supabase.
 */
export function SaveChangesButton({
  dirty,
  onSave,
  disabled = false,
  state: stateProp,
  label = SAVE_CHANGES_BUTTON_COPY.label,
  successMessage = SAVE_CHANGES_BUTTON_COPY.success,
  errorMessage = SAVE_CHANGES_BUTTON_COPY.error,
  fullWidth = false,
  className,
  id,
}: SaveChangesButtonProps) {
  const successTimer = React.useRef<number | null>(null);
  const [internalState, setInternalState] =
    React.useState<SaveChangesButtonState>("default");

  const state = stateProp ?? internalState;
  const loading = isSaveChangesButtonBusy(state);
  const isError = state === "error";
  const isSuccess = state === "success";
  const isDisabled = isSaveChangesButtonDisabled({
    dirty,
    disabled,
    state,
  });

  React.useEffect(() => {
    return () => {
      if (successTimer.current != null) {
        window.clearTimeout(successTimer.current);
      }
    };
  }, []);

  const run = React.useCallback(async () => {
    const controlled = stateProp != null;
    if (controlled) {
      if (disabled || loading || (!dirty && state !== "error")) return;
      saveChangesButtonAnalytics.clicked();
      await onSave();
      return;
    }

    if (disabled || loading) return;
    if (!dirty && state !== "error") return;

    saveChangesButtonAnalytics.clicked();
    setInternalState("loading");

    try {
      await Promise.resolve(onSave());
      if (SAVE_CHANGES_BUTTON_MOCK_DELAY_MS > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, SAVE_CHANGES_BUTTON_MOCK_DELAY_MS);
        });
      }
      saveChangesButtonAnalytics.completed();
      toast.success(successMessage);
      setInternalState("success");
      if (successTimer.current != null) {
        window.clearTimeout(successTimer.current);
      }
      successTimer.current = window.setTimeout(() => {
        setInternalState("default");
      }, SAVE_CHANGES_BUTTON_SUCCESS_FLASH_MS);
    } catch {
      saveChangesButtonAnalytics.failed();
      toast.error(errorMessage);
      setInternalState("error");
    }
  }, [dirty, disabled, errorMessage, loading, onSave, state, stateProp, successMessage]);

  const buttonLabel = loading
    ? SAVE_CHANGES_BUTTON_COPY.labelLoading
    : isError
      ? SAVE_CHANGES_BUTTON_COPY.retry
      : label;

  const ariaLabel = loading
    ? SAVE_CHANGES_BUTTON_COPY.labelBusy
    : !dirty && !isError
      ? SAVE_CHANGES_BUTTON_COPY.labelDisabled
      : buttonLabel;

  return (
    <div
      className={cn(
        "flex flex-col gap-sm",
        fullWidth ? "w-full" : "w-full sm:w-auto",
        className,
      )}
    >
      <Button
        id={id}
        type="button"
        variant="primary"
        size="md"
        fullWidth={fullWidth}
        className={cn(
          "min-h-11 text-primary-foreground",
          !fullWidth && "w-full sm:w-auto",
        )}
        isLoading={loading}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        onClick={() => void run()}
      >
        {buttonLabel}
      </Button>

      {isSuccess ? (
        <Caption className="text-success" role="status">
          {successMessage}
        </Caption>
      ) : null}

      {isError ? (
        <BodySmall role="alert" className="text-error">
          {errorMessage}
        </BodySmall>
      ) : null}
    </div>
  );
}
