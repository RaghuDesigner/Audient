/**
 * Team Member Card analytics — COMPONENT-052.
 * Dev stub — opaque member id only; no email in payloads.
 */

import { TEAM_MEMBER_CARD_ANALYTICS_SOURCE } from "@/config/team-member-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: TEAM_MEMBER_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const teamMemberCardAnalytics = {
  viewed: (props: { memberId: string }) => {
    track("team_member_viewed", base({ memberId: props.memberId }));
  },

  editClicked: (props: { memberId: string }) => {
    track("team_member_edit_clicked", base({ memberId: props.memberId }));
  },

  removeClicked: (props: { memberId: string }) => {
    track("team_member_remove_clicked", base({ memberId: props.memberId }));
  },
};
