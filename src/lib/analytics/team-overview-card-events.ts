/**
 * Team Overview Card analytics — COMPONENT-051.
 * Dev stub — no member PII in payloads.
 */

import { TEAM_OVERVIEW_CARD_ANALYTICS_SOURCE } from "@/config/team-overview-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: TEAM_OVERVIEW_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const teamOverviewCardAnalytics = {
  viewed: () => {
    track("team_overview_viewed", base());
  },
};
