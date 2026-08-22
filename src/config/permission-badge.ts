/**
 * COMPONENT-060 — Permission Badge constants.
 * Compact permission status display — no backend.
 */

import type { BadgeProps } from "@/components/ui/badge";

export const PERMISSION_BADGE_STATES = [
  "allowed",
  "not_allowed",
  "inherited",
  "restricted",
] as const;

export type PermissionBadgeState = (typeof PERMISSION_BADGE_STATES)[number];

export const PERMISSION_BADGE_LABELS: Record<PermissionBadgeState, string> = {
  allowed: "Allowed",
  not_allowed: "Not allowed",
  inherited: "Inherited",
  restricted: "Restricted",
};

export const PERMISSION_BADGE_VARIANTS: Record<
  PermissionBadgeState,
  NonNullable<BadgeProps["variant"]>
> = {
  allowed: "success",
  not_allowed: "neutral",
  inherited: "info",
  restricted: "warning",
};

export const PERMISSION_BADGE_COPY = {
  allowedOrgSetting: "Allowed (organization setting)",
  notAllowedOrgSetting: "Not allowed (organization setting)",
} as const;

export const PERMISSION_BADGE_ICONS: Record<
  Exclude<PermissionBadgeState, "restricted">,
  string
> = {
  allowed: "✓",
  not_allowed: "—",
  inherited: "↳",
};

/** Prefer Lucide in component; keys for reference. */
export const PERMISSION_BADGE_ANALYTICS_SOURCE = "permission_badge" as const;
