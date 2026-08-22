/**
 * Roles & Permissions screen analytics — SCREEN-022.
 * Dev stub — no PII.
 */

import { ROLES_PERMISSIONS_ANALYTICS_SOURCE } from "@/config/roles-permissions-screen";
import type { TeamMemberRole } from "@/config/team-member-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: ROLES_PERMISSIONS_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const rolesPermissionsAnalytics = {
  viewed: (props: { tier: string; actorRole: string }) => {
    track("roles_viewed", base(props));
  },

  roleSelected: (props: { fromRole: TeamMemberRole; toRole: TeamMemberRole }) => {
    track("role_selected", base(props));
  },

  permissionChanged: (props: {
    changeType: "member_role";
    fromRole: TeamMemberRole;
    toRole: TeamMemberRole;
  }) => {
    track("permission_changed", base(props));
  },

  saveStarted: (props: { stagedChangeCount: number }) => {
    track("role_save_started", base(props));
  },

  saveCompleted: (props: { stagedChangeCount: number }) => {
    track("role_save_completed", base(props));
  },

  saveFailed: (props: { errorCode?: string }) => {
    track("role_save_failed", base(props));
  },

  forbiddenViewed: (props: { planTier: string }) => {
    track("roles_forbidden_viewed", base({ planTier: props.planTier }));
  },

  unauthorizedViewed: (props: { actorRole: string }) => {
    track("roles_unauthorized_viewed", base(props));
  },
};
