/**
 * Phase-1 Authenticated Dashboard mock bundle — SCREEN-008.
 * Free-tier workspace. No Supabase / Stripe / API calls.
 */

import type { WelcomeCardProps } from "@/components/dashboard/WelcomeCard";
import type { CreditsWidgetProps } from "@/components/dashboard/CreditsWidget";
import type { MembershipWidgetProps } from "@/components/dashboard/MembershipWidget";
import type { QuickActionCardProps } from "@/components/dashboard/QuickActionCard";
import type { MOCK_AI_TIPS } from "@/data/mock-ai-tips";
import {
  buildMockDashboardBundle,
  getMockAppState,
} from "@/data/mock-app-state";
import {
  MOCK_RECENT_AUDITS_EMPTY,
  type MockRecentAudit,
} from "@/data/mock-recent-audits";

export type MockDashboardTier = "free" | "pro" | "business";

export type MockDashboardBundle = {
  tier: MockDashboardTier;
  welcome: WelcomeCardProps;
  credits: CreditsWidgetProps;
  membership: MembershipWidgetProps;
  quickActions: Array<
    Pick<
      QuickActionCardProps,
      "action" | "title" | "description" | "state"
    >
  >;
  recentAudits: MockRecentAudit[];
  /** Flip to true to exercise EmptyState (No Audits). */
  recentAuditsEmpty: boolean;
  tips: typeof MOCK_AI_TIPS;
  headerCredits: number;
};

/**
 * Default Free Authenticated Dashboard mock — derived from centralized app state.
 */
export const MOCK_DASHBOARD_FREE: MockDashboardBundle = buildMockDashboardBundle(
  getMockAppState({
    id: "mock-dashboard-user",
    email: "alex.rivera@audient.mock",
    emailVerified: true,
    fullName: null,
    avatarUrl: null,
    planTier: "FREE",
  }),
);

/** Empty recent-audits variant for EmptyState QA. */
export const MOCK_DASHBOARD_FREE_EMPTY_AUDITS: MockDashboardBundle = {
  ...MOCK_DASHBOARD_FREE,
  recentAudits: MOCK_RECENT_AUDITS_EMPTY,
  recentAuditsEmpty: true,
};

/** Active mock used by the Dashboard screen (Phase 1). */
export const MOCK_DASHBOARD = MOCK_DASHBOARD_FREE;
