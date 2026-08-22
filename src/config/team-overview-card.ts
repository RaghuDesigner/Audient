/**
 * COMPONENT-051 — Team Overview Card constants.
 * Business team summary — mock data only; no backend.
 */

export const TEAM_OVERVIEW_CARD_STATES = [
  "default",
  "loading",
  "error",
] as const;

export type TeamOverviewCardState =
  (typeof TEAM_OVERVIEW_CARD_STATES)[number];

export const TEAM_OVERVIEW_CARD_COPY = {
  title: "Team overview",
  teamName: "Team name",
  plan: "Plan",
  totalMembers: "Total members",
  activeMembers: "Active members",
  pendingInvitations: "Pending invitations",
  totalAudits: "Total audits",
  creditsRemaining: "Credits remaining",
  unlimited: "Unlimited",
  loading: "Loading team overview…",
  loadError: "Unable to load team overview.",
  retry: "Retry",
  /** UI label for ENTERPRISE per PRICING.md */
  businessPlan: "Business",
} as const;

export const TEAM_OVERVIEW_CARD_ANALYTICS_SOURCE =
  "team_overview_card" as const;
