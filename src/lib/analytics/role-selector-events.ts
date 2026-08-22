/**
 * Role Selector analytics — COMPONENT-059.
 * Dev stub — opaque member id and role keys only; no PII.
 */

import { ROLE_SELECTOR_ANALYTICS_SOURCE } from "@/config/role-selector";
import type { TeamMemberRole } from "@/config/team-member-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: ROLE_SELECTOR_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const roleSelectorAnalytics = {
  opened: (props: { memberId: string; role: TeamMemberRole }) => {
    track("role_selector_opened", base(props));
  },

  selected: (props: {
    memberId: string;
    fromRole: TeamMemberRole;
    toRole: TeamMemberRole;
  }) => {
    track("role_selected", base(props));
  },

  cancelled: (props: {
    memberId: string;
    fromRole: TeamMemberRole;
    toRole: TeamMemberRole;
  }) => {
    track("role_select_cancelled", base(props));
  },
};
