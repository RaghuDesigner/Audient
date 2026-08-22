/**
 * COMPONENT-051 — Team Overview Card helpers.
 * Display formatting — no React / no API.
 */

import { TEAM_OVERVIEW_CARD_COPY } from "@/config/team-overview-card";

export type TeamOverviewCreditsRemaining = number | "unlimited";

export type TeamOverviewCardData = {
  teamName: string;
  plan: string;
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  totalAudits: number;
  creditsRemaining: TeamOverviewCreditsRemaining;
};

export function formatTeamOverviewCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.floor(value)));
}

export function formatTeamOverviewCredits(
  value: TeamOverviewCreditsRemaining,
): string {
  if (value === "unlimited") {
    return TEAM_OVERVIEW_CARD_COPY.unlimited;
  }
  return formatTeamOverviewCount(value);
}
