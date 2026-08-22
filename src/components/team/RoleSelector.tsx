"use client";

import * as React from "react";

import { RoleChangeConfirmModal } from "@/components/team/RoleChangeConfirmModal";
import { inputShellVariants } from "@/components/ui/input-variants";
import { Caption } from "@/components/ui/typography";
import {
  ROLE_SELECTOR_COPY,
  type RoleSelectorState,
} from "@/config/role-selector";
import type {
  AssignableTeamMemberRole,
  TeamMemberRole,
} from "@/config/team-member-card";
import { roleSelectorAnalytics } from "@/lib/analytics/role-selector-events";
import { rolesPermissionsAnalytics } from "@/lib/analytics/roles-permissions-events";
import {
  isAssignableRoleValue,
  isRoleSelectorControlDisabled,
  isRoleSelectorOwnerLocked,
  roleSelectorDisplayValue,
  roleSelectorLabel,
  roleSelectorOptions,
} from "@/utils/role-selector";
import { cn } from "@/utils/cn";

const selectClass = cn(
  inputShellVariants({ variant: "default", size: "md" }),
  "w-full cursor-pointer appearance-none bg-background sm:max-w-xs",
);

export type RoleSelectorProps = {
  memberId: string;
  memberName: string;
  /** Current staged role from parent. */
  value: TeamMemberRole;
  disabled?: boolean;
  state?: RoleSelectorState;
  errorMessage?: string;
  onStageChange: (fromRole: TeamMemberRole, toRole: AssignableTeamMemberRole) => void;
  onFocus?: (role: TeamMemberRole) => void;
  id?: string;
  className?: string;
};

type PendingChange = {
  fromRole: TeamMemberRole;
  toRole: AssignableTeamMemberRole;
};

/**
 * COMPONENT-059 — Role Selector.
 * Select + confirm + staged change callback — mock only; no backend.
 */
export function RoleSelector({
  memberId,
  memberName,
  value,
  disabled = false,
  state = "default",
  errorMessage,
  onStageChange,
  onFocus,
  id: idProp,
  className,
}: RoleSelectorProps) {
  const selectRef = React.useRef<HTMLSelectElement>(null);
  const selectId = idProp ?? `role-selector-${memberId}`;
  const labelId = `${selectId}-label`;
  const errorId = `${selectId}-error`;
  const loading = state === "loading";
  const isError = state === "error";
  const ownerLocked = isRoleSelectorOwnerLocked(value);
  const controlDisabled = isRoleSelectorControlDisabled({
    role: value,
    disabled,
    state,
  });
  const [pendingChange, setPendingChange] =
    React.useState<PendingChange | null>(null);

  const options = roleSelectorOptions();
  const resolvedError = errorMessage ?? ROLE_SELECTOR_COPY.defaultError;

  const closeConfirm = React.useCallback(
    (restoreFocus: boolean) => {
      setPendingChange(null);
      if (restoreFocus) {
        queueMicrotask(() => selectRef.current?.focus());
      }
    },
    [],
  );

  const handleConfirm = () => {
    if (!pendingChange) return;
    onStageChange(pendingChange.fromRole, pendingChange.toRole);
    roleSelectorAnalytics.selected({
      memberId,
      fromRole: pendingChange.fromRole,
      toRole: pendingChange.toRole,
    });
    rolesPermissionsAnalytics.roleSelected({
      fromRole: pendingChange.fromRole,
      toRole: pendingChange.toRole,
    });
    rolesPermissionsAnalytics.permissionChanged({
      changeType: "member_role",
      fromRole: pendingChange.fromRole,
      toRole: pendingChange.toRole,
    });
    closeConfirm(true);
  };

  const handleCancel = () => {
    if (!pendingChange) {
      closeConfirm(true);
      return;
    }
    roleSelectorAnalytics.cancelled({
      memberId,
      fromRole: pendingChange.fromRole,
      toRole: pendingChange.toRole,
    });
    closeConfirm(true);
  };

  return (
    <div className={cn("flex w-full flex-col gap-sm", className)}>
      <Caption id={labelId} className="font-semibold text-foreground">
        {roleSelectorLabel(memberName)}
      </Caption>

      {ownerLocked ? (
        <>
          <div
            className="flex min-h-11 items-center rounded-md border border-border bg-muted px-md"
            aria-disabled="true"
          >
            <Caption className="font-medium text-foreground">
              {roleSelectorDisplayValue(value)}
            </Caption>
          </div>
          <Caption className="text-muted-foreground">
            {ROLE_SELECTOR_COPY.ownerDisabled}
          </Caption>
        </>
      ) : (
        <>
          {loading ? (
            <Caption className="sr-only" role="status">
              {ROLE_SELECTOR_COPY.loading}
            </Caption>
          ) : null}
          <select
            ref={selectRef}
            id={selectId}
            className={selectClass}
            value={value}
            disabled={controlDisabled}
            aria-labelledby={labelId}
            aria-busy={loading || undefined}
            aria-invalid={isError || undefined}
            aria-describedby={isError ? errorId : undefined}
            onFocus={() => {
              roleSelectorAnalytics.opened({ memberId, role: value });
              onFocus?.(value);
            }}
            onChange={(event) => {
              const next = event.target.value;
              if (!isAssignableRoleValue(next)) return;
              if (next === value) return;
              setPendingChange({ fromRole: value, toRole: next });
            }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isError ? (
            <Caption id={errorId} className="text-error" role="alert">
              {resolvedError}
            </Caption>
          ) : null}
        </>
      )}

      <RoleChangeConfirmModal
        open={pendingChange != null}
        memberName={memberName}
        fromRole={pendingChange?.fromRole ?? null}
        toRole={pendingChange?.toRole ?? null}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
