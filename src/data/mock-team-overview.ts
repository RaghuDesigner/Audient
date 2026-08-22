/**
 * Mock Business team overview — COMPONENT-051.
 * Frontend only — no Supabase / no team APIs.
 */

import { PLANS } from "@/config/plans";
import type { MockAppCredits } from "@/data/mock-app-state";
import type { TeamOverviewCardData } from "@/utils/team-overview-card";

/** Default mock snapshot for Business (ENTERPRISE) accounts. */
export function getMockTeamOverview(
  credits?: MockAppCredits | null,
): TeamOverviewCardData {
  const creditsRemaining =
    credits?.remaining ?? PLANS.ENTERPRISE.monthlyCredits;

  return {
    teamName: "Audient Design Team",
    plan: PLANS.ENTERPRISE.displayName,
    totalMembers: 12,
    activeMembers: 9,
    pendingInvitations: 2,
    totalAudits: 148,
    creditsRemaining,
  };
}
