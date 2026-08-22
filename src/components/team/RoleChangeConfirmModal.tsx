"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  ROLES_PERMISSIONS_COPY,
} from "@/config/roles-permissions-screen";
import type { TeamMemberRole } from "@/config/team-member-card";
import { roleChangeConfirmDescription } from "@/utils/roles-permissions-screen";

export type RoleChangeConfirmModalProps = {
  open: boolean;
  memberName: string | null;
  fromRole: TeamMemberRole | null;
  toRole: TeamMemberRole | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * SCREEN-022 — Non-destructive role change confirmation.
 * Mock only — stages change; persist happens on Save.
 */
export function RoleChangeConfirmModal({
  open,
  memberName,
  fromRole,
  toRole,
  onConfirm,
  onCancel,
}: RoleChangeConfirmModalProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const title =
    memberName != null
      ? `${ROLES_PERMISSIONS_COPY.roleChangeConfirmTitle} ${memberName}?`
      : ROLES_PERMISSIONS_COPY.roleChangeConfirmTitle;

  const description =
    memberName != null && fromRole != null && toRole != null
      ? roleChangeConfirmDescription({
          memberName,
          fromRole,
          toRole,
        })
      : "";

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      variant="confirmation"
      size="sm"
      title={title}
      description={description}
      footer={
        <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {ROLES_PERMISSIONS_COPY.cancel}
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm}>
            {ROLES_PERMISSIONS_COPY.roleChangeConfirmAction}
          </Button>
        </div>
      }
    />
  );
}
