/**
 * Team Activity Card analytics — COMPONENT-055.
 * Dev stub — counts only; no activity text / PII.
 */

import { TEAM_ACTIVITY_CARD_ANALYTICS_SOURCE } from "@/config/team-activity-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: TEAM_ACTIVITY_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const teamActivityCardAnalytics = {
  viewed: (props: { itemCount: number }) => {
    track("team_activity_viewed", base({ itemCount: props.itemCount }));
  },

  emptyViewed: () => {
    track("team_activity_empty_viewed", base());
  },
};
