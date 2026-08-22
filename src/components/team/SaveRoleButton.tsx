"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  SAVE_ROLE_BUTTON_COPY,
  SAVE_ROLE_BUTTON_SUCCESS_FLASH_MS,
  type SaveRoleButtonState,
} from "@/config/save-role-button";
import { saveRoleButtonAnalytics } from "@/lib/analytics/save-role-button-events";
import {
  isSaveRoleButtonBusy,
  isSaveRoleButtonDisabled,
} from "@/utils/save-role-button";
import { cn } from "@/utils/cn";

export type SaveRoleButtonProps = {
  /** Staged role changes differ from saved baseline. */
  dirty: boolean;
  /** Mock persist — parent updates saved map on success. */
  onSave: () => void | Promise<void>;
  /** Number of staged member role deltas — analytics only. */
  stagedChangeCount?: number;
  /** Extra disable (e.g. screen loading). */
  disabled?: boolean;
  /** External state override; omit for internal machine. */
  state?: SaveRoleButtonState;
  /** Notifies parent when loading toggles (e.g. disable Cancel). */
  onBusyChange?: (busy: boolean) => void;
  label?: string;
  successMessage?: string;
  errorMessage?: string;
  fullWidth?: boolean;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-061 — Save Role Button.
 * Persists staged role changes on SCREEN-022 — mock only; no backend.
 */
export function SaveRoleButton({
  dirty,
  onSave,
  stagedChangeCount = 0,
  disabled = false,
  state: stateProp,
  onBusyChange,
  label = SAVE_ROLE_BUTTON_COPY.label,
  successMessage = SAVE_ROLE_BUTTON_COPY.success,
  errorMessage = SAVE_ROLE_BUTTON_COPY.error,
  fullWidth = false,
  className,
  id,
}: SaveRoleButtonProps) {
  const successTimer = React.useRef<number | null>(null);
  const [internalState, setInternalState] =
    React.useState<SaveRoleButtonState>("default");

  const state = stateProp ?? internalState;
  const loading = isSaveRoleButtonBusy(state);
  const isError = state === "error";
  const isSuccess = state === "success";
  const isDisabled = isSaveRoleButtonDisabled({
    dirty,
    disabled,
    state,
  });

  React.useEffect(() => {
    onBusyChange?.(loading);
  }, [loading, onBusyChange]);

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
      saveRoleButtonAnalytics.clicked({ stagedChangeCount });
      await onSave();
      return;
    }

    if (disabled || loading) return;
    if (!dirty && state !== "error") return;

    saveRoleButtonAnalytics.clicked({ stagedChangeCount });
    setInternalState("loading");

    try {
      await Promise.resolve(onSave());
      saveRoleButtonAnalytics.completed({ stagedChangeCount });
      toast.success(successMessage);
      setInternalState("success");
      if (successTimer.current != null) {
        window.clearTimeout(successTimer.current);
      }
      successTimer.current = window.setTimeout(() => {
        setInternalState("default");
      }, SAVE_ROLE_BUTTON_SUCCESS_FLASH_MS);
    } catch {
      saveRoleButtonAnalytics.failed({
        errorCode: "mock_save_failed",
        stagedChangeCount,
      });
      toast.error(errorMessage);
      setInternalState("error");
    }
  }, [
    dirty,
    disabled,
    errorMessage,
    loading,
    onSave,
    stagedChangeCount,
    state,
    stateProp,
    successMessage,
  ]);

  const buttonLabel = loading
    ? SAVE_ROLE_BUTTON_COPY.labelLoading
    : isError
      ? SAVE_ROLE_BUTTON_COPY.retry
      : label;

  const ariaLabel = loading
    ? SAVE_ROLE_BUTTON_COPY.labelBusy
    : !dirty && !isError
      ? SAVE_ROLE_BUTTON_COPY.labelDisabled
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
