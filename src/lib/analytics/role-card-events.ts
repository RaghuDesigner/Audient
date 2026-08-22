/**
 * Role Card analytics — COMPONENT-057.
 * Dev stub — role key only; no PII.
 */

import { ROLE_CARD_ANALYTICS_SOURCE } from "@/config/role-card";
import type { TeamMemberRole } from "@/config/team-member-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: ROLE_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const roleCardAnalytics = {
  viewed: (props: { role: TeamMemberRole }) => {
    track("role_card_viewed", base({ role: props.role }));
  },

  viewPermissionsClicked: (props: { role: TeamMemberRole }) => {
    track("role_permissions_view_clicked", base({ role: props.role }));
  },

  editClicked: (props: { role: TeamMemberRole }) => {
    track("role_edit_clicked", base({ role: props.role }));
  },

  selected: (props: { role: TeamMemberRole }) => {
    track("role_card_selected", base({ role: props.role }));
  },
};
