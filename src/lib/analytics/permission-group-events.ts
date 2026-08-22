/**
 * Permission Group analytics — COMPONENT-058.
 * Dev stub — group id and optional role only; no PII.
 */

import { PERMISSION_GROUP_ANALYTICS_SOURCE } from "@/config/permission-group";
import type { RolePermissionGroupId } from "@/config/role-permission-matrix";
import type { TeamMemberRole } from "@/config/team-member-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: PERMISSION_GROUP_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const permissionGroupAnalytics = {
  expanded: (props: { groupId: RolePermissionGroupId; role?: TeamMemberRole }) => {
    track("permission_group_expanded", base(props));
  },

  collapsed: (props: { groupId: RolePermissionGroupId; role?: TeamMemberRole }) => {
    track("permission_group_collapsed", base(props));
  },
};
