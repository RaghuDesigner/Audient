"use client";

import * as React from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Caption } from "@/components/ui/typography";
import {
  DELETE_CONFIRMATION_DEFAULTS,
  deleteConfirmationContextLabel,
  type DeleteConfirmationState,
} from "@/config/delete-confirmation-modal";
import { deleteConfirmationAnalytics } from "@/lib/analytics/delete-confirmation-events";

export type DeleteConfirmationModalProps = {
  open: boolean;
  auditId: string;
  auditLabel?: string | null;
  state?: DeleteConfirmationState;
  errorMessage?: string | null;
  title?: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * COMPONENT-026 — Delete Confirmation Modal.
 * Destructive confirm via Modal/Dialog (focus trap, Esc, focus restore).
 * Parent owns mock/API delete; this surface only confirms.
 */
export function DeleteConfirmationModal({
  open,
  auditId,
  auditLabel = null,
  state = "default",
  errorMessage = null,
  title = DELETE_CONFIRMATION_DEFAULTS.title,
  description = DELETE_CONFIRMATION_DEFAULTS.description,
  cancelLabel = DELETE_CONFIRMATION_DEFAULTS.cancelLabel,
  confirmLabel = DELETE_CONFIRMATION_DEFAULTS.confirmLabel,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const startedForId = React.useRef<string | null>(null);
  const deleting = state === "deleting";
  const context = deleteConfirmationContextLabel(auditLabel);
  const resolvedError =
    errorMessage ??
    (state === "error" ? DELETE_CONFIRMATION_DEFAULTS.errorMessage : null);

  React.useEffect(() => {
    if (!open) {
      startedForId.current = null;
      return;
    }
    if (startedForId.current !== auditId) {
      startedForId.current = auditId;
      deleteConfirmationAnalytics.started({ auditId });
    }
    const frame = window.requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, auditId]);

  const dismiss = React.useCallback(() => {
    if (deleting) return;
    deleteConfirmationAnalytics.cancelled({ auditId });
    onCancel();
  }, [auditId, deleting, onCancel]);

  const handleOpenChange = (next: boolean) => {
    if (!next) dismiss();
  };

  const handleConfirm = () => {
    if (deleting) return;
    deleteConfirmationAnalytics.confirmed({ auditId });
    onConfirm();
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      variant="warning"
      size="sm"
      title={title}
      description={description}
      showCloseButton={!deleting}
      preventDismiss={deleting}
      footer={
        <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={dismiss}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            isLoading={deleting}
            disabled={deleting}
            onClick={handleConfirm}
          >
            {deleting
              ? DELETE_CONFIRMATION_DEFAULTS.deletingLabel
              : confirmLabel}
          </Button>
        </div>
      }
    >
      {context ? (
        <Caption className="text-muted-foreground">{context}</Caption>
      ) : null}

      {state === "error" && resolvedError ? (
        <Alert variant="error" role="alert" className="mt-md">
          {resolvedError}
        </Alert>
      ) : null}
    </Modal>
  );
}
