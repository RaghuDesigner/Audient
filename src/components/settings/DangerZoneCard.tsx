"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  DANGER_ZONE_CARD_COPY,
  DANGER_ZONE_CARD_MOCK_DELAY_MS,
  DANGER_ZONE_CARD_SUCCESS_FLASH_MS,
  type DangerZoneCardState,
} from "@/config/danger-zone-card";
import { dangerZoneCardAnalytics } from "@/lib/analytics/danger-zone-card-events";
import {
  isDangerZoneCardBusy,
  isDangerZoneCardConfirmOpen,
} from "@/utils/danger-zone-card";
import { cn } from "@/utils/cn";

export type DangerZoneCardProps = {
  /** Override card warning and dialog description. */
  warning?: string;
  /** External override; omit for internal state machine. */
  state?: DangerZoneCardState;
  /**
   * Mock-only confirm handler.
   * Must not call Supabase, backend delete APIs, or destroy account data.
   */
  onDeleteConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-049 — Danger Zone Card.
 * Mock Delete Account confirm via accessible Modal — no real deletion.
 */
export function DangerZoneCard({
  warning,
  state: stateProp,
  onDeleteConfirm,
  onCancel,
  onRetry,
  className,
}: DangerZoneCardProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const successTimer = React.useRef<number | null>(null);

  const [internalState, setInternalState] =
    React.useState<DangerZoneCardState>("default");

  const state = stateProp ?? internalState;
  const isControlled = stateProp != null;
  const setState = (next: DangerZoneCardState) => {
    if (!isControlled) setInternalState(next);
  };

  const processing = isDangerZoneCardBusy(state);
  const isError = state === "error";
  const confirmOpen = isDangerZoneCardConfirmOpen(state);
  const warningText = warning?.trim() || DANGER_ZONE_CARD_COPY.warning;
  const dialogDescription =
    warning?.trim() || DANGER_ZONE_CARD_COPY.confirmDescription;

  React.useEffect(() => {
    return () => {
      if (successTimer.current != null) {
        window.clearTimeout(successTimer.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (state !== "confirmation") return;
    const frame = window.requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [state]);

  const flashSuccess = () => {
    setState("success");
    toast.success(DANGER_ZONE_CARD_COPY.success);
    if (successTimer.current != null) {
      window.clearTimeout(successTimer.current);
    }
    successTimer.current = window.setTimeout(() => {
      setState("default");
    }, DANGER_ZONE_CARD_SUCCESS_FLASH_MS);
  };

  const openConfirm = () => {
    if (processing || isError) return;
    dangerZoneCardAnalytics.deleteAccountInitiated();
    setState("confirmation");
  };

  const closeConfirm = () => {
    if (processing) return;
    dangerZoneCardAnalytics.deleteAccountCancelled();
    setState("default");
    onCancel?.();
  };

  const confirmDelete = () => {
    if (processing) return;
    dangerZoneCardAnalytics.deleteAccountConfirmed();

    if (isControlled) {
      void onDeleteConfirm();
      return;
    }

    setState("processing");
    void (async () => {
      try {
        await Promise.resolve(onDeleteConfirm());
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, DANGER_ZONE_CARD_MOCK_DELAY_MS);
        });
        flashSuccess();
      } catch {
        setState("error");
        toast.error(DANGER_ZONE_CARD_COPY.error);
      }
    })();
  };

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-error/40 bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={processing || undefined}
      aria-labelledby="danger-zone-card-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h3
          id="danger-zone-card-title"
          className="text-h4 font-semibold text-foreground"
        >
          {DANGER_ZONE_CARD_COPY.title}
        </h3>
        {state === "success" ? (
          <Caption className="text-success" role="status">
            {DANGER_ZONE_CARD_COPY.success}
          </Caption>
        ) : processing ? (
          <Caption className="text-muted-foreground" role="status">
            {DANGER_ZONE_CARD_COPY.processing}
          </Caption>
        ) : null}
      </div>

      {isError ? (
        <div
          className="flex flex-col gap-md rounded-md border border-border p-md"
          role="alert"
        >
          <BodySmall className="text-foreground">
            {DANGER_ZONE_CARD_COPY.error}
          </BodySmall>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setState("default");
              onRetry?.();
            }}
          >
            {DANGER_ZONE_CARD_COPY.retry}
          </Button>
        </div>
      ) : (
        <>
          <BodySmall className="text-muted-foreground">{warningText}</BodySmall>

          <div className="flex flex-col gap-sm border-t border-border pt-lg sm:flex-row sm:justify-end">
            <Button
              ref={triggerRef}
              type="button"
              variant="destructive"
              fullWidth
              className="min-h-11 sm:w-auto"
              disabled={processing}
              onClick={openConfirm}
            >
              {DANGER_ZONE_CARD_COPY.deleteAccount}
            </Button>
          </div>
        </>
      )}

      <Modal
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) closeConfirm();
        }}
        variant="warning"
        size="sm"
        title={DANGER_ZONE_CARD_COPY.confirmTitle}
        description={dialogDescription}
        showCloseButton={!processing}
        preventDismiss={processing}
        footer={
          <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              disabled={processing}
              onClick={closeConfirm}
            >
              {DANGER_ZONE_CARD_COPY.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={processing}
              disabled={processing}
              onClick={confirmDelete}
            >
              {processing
                ? DANGER_ZONE_CARD_COPY.processing
                : DANGER_ZONE_CARD_COPY.confirmAction}
            </Button>
          </div>
        }
      />
    </section>
  );
}
