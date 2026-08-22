/**
 * SCREEN-020 — Mock Business Workspace bundle.
 * Aggregates existing team mocks — no backend / no realtime.
 */

import type { BusinessWorkspaceScreenState } from "@/config/business-workspace-screen";
import type { MockAppCredits } from "@/data/mock-app-state";
import { getMockBusinessUsage } from "@/data/mock-business-usage";
import { getMockTeamActivity } from "@/data/mock-team-activity";
import { getMockTeamMembers } from "@/data/mock-team-members";
import { getMockTeamOverview } from "@/data/mock-team-overview";
import type { BusinessUsageMetrics } from "@/utils/business-usage-widget";
import type { TeamActivityItem } from "@/utils/team-activity-card";
import type { TeamMemberCardModel } from "@/utils/team-member-card";
import type { TeamOverviewCardData } from "@/utils/team-overview-card";

export type MockBusinessWorkspaceBundle = {
  state: BusinessWorkspaceScreenState;
  overview: TeamOverviewCardData;
  usage: BusinessUsageMetrics;
  members: TeamMemberCardModel[];
  activity: TeamActivityItem[];
};

export function getMockBusinessWorkspace(input?: {
  state?: BusinessWorkspaceScreenState;
  empty?: boolean;
  credits?: MockAppCredits | null;
}): MockBusinessWorkspaceBundle {
  const empty = input?.empty === true || input?.state === "empty";
  const overview = getMockTeamOverview(input?.credits);
  const usage = getMockBusinessUsage(input?.credits);
  const members = empty ? [] : getMockTeamMembers();
  const activity = empty ? [] : getMockTeamActivity();

  if (empty) {
    return {
      state: input?.state ?? "empty",
      overview: {
        ...overview,
        totalMembers: 0,
        activeMembers: 0,
        pendingInvitations: 0,
        totalAudits: 0,
      },
      usage: {
        ...usage,
        totalAudits: 0,
        monthlyAudits: 0,
        creditsUsed: 0,
        creditsRemaining: usage.creditsGrant,
        activeMembers: 0,
        chartSeries: usage.chartSeries.map((p) => ({ ...p, value: 0 })),
      },
      members,
      activity,
    };
  }

  return {
    state: input?.state ?? "success",
    overview,
    usage,
    members,
    activity,
  };
}
