/**
 * COMPONENT-060 — Permission Badge helpers.
 * Maps grant cells to badge state — no duplicate grant logic.
 */

import {
  PERMISSION_BADGE_COPY,
  PERMISSION_BADGE_LABELS,
  PERMISSION_BADGE_VARIANTS,
  type PermissionBadgeState,
} from "@/config/permission-badge";
import type { BadgeProps } from "@/components/ui/badge";
import type { RolePermissionGrantCell } from "@/utils/role-permission-matrix";

export type PermissionBadgeResolved = {
  state: PermissionBadgeState;
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
};

export function permissionBadgeFromGrantCell(
  cell: RolePermissionGrantCell,
): PermissionBadgeResolved {
  if (cell.orgDependent) {
    return {
      state: "inherited",
      label: cell.granted
        ? PERMISSION_BADGE_COPY.allowedOrgSetting
        : PERMISSION_BADGE_COPY.notAllowedOrgSetting,
      variant: PERMISSION_BADGE_VARIANTS.inherited,
    };
  }

  const state: PermissionBadgeState = cell.granted ? "allowed" : "not_allowed";
  return {
    state,
    label: PERMISSION_BADGE_LABELS[state],
    variant: PERMISSION_BADGE_VARIANTS[state],
  };
}

export function resolvePermissionBadge(input: {
  state?: PermissionBadgeState;
  cell?: RolePermissionGrantCell;
  label?: string;
}): PermissionBadgeResolved {
  if (input.cell) {
    const fromCell = permissionBadgeFromGrantCell(input.cell);
    return {
      ...fromCell,
      label: input.label ?? fromCell.label,
    };
  }

  if (!input.state) {
    return {
      state: "not_allowed",
      label: input.label ?? PERMISSION_BADGE_LABELS.not_allowed,
      variant: PERMISSION_BADGE_VARIANTS.not_allowed,
    };
  }

  return {
    state: input.state,
    label: input.label ?? PERMISSION_BADGE_LABELS[input.state],
    variant: PERMISSION_BADGE_VARIANTS[input.state],
  };
}
