"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * Shared confirmation gate shown before logging out.
 * Reuses Audient's Modal (Radix Dialog) — Esc and outside click cancel safely.
 */
export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      variant="confirmation"
      size="sm"
      title="Log out?"
      description="Are you sure you want to log out of Audient?"
      showCloseButton={false}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Log out
          </Button>
        </>
      }
    />
  );
}
