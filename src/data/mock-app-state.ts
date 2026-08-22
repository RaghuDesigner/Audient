/**
 * Centralized mock application state — FRONTEND FIX 004.
 * Single facade for user, plan, credits, audits, notifications, permissions.
 * Replace `getMockAppState` with a real provider when Supabase ships.
 */

import { AUDIT_REPORT_GATES } from "@/config/audit-report";
import type { ManageMembershipPlan } from "@/config/manage-membership";
import type { NotificationsScreenState } from "@/config/notifications-screen";
import { GUEST_AUDIT, PLANS, type PlanTier } from "@/config/plans";
import type { AuditHistoryScreenState } from "@/config/audit-history";
import type { MockDashboardBundle, MockDashboardTier } from "@/data/mock-dashboard";
import { getMockAuditHistory } from "@/data/mock-audit-history";
import type { MockAuditHistoryCard } from "@/data/mock-audit-history-card";
import {
  getMockManageMembership,
  type MockManageMembership,
} from "@/data/mock-manage-membership";
import { getMockNotificationsScreen } from "@/data/mock-notifications-screen";
import type { MockNotificationItem } from "@/data/mock-notification-item";
import type { MockRecentAudit } from "@/data/mock-recent-audits";
import { MOCK_AI_TIPS } from "@/data/mock-ai-tips";
import { QUICK_ACTION_DEFAULTS } from "@/config/quick-action";
import {
  MOCK_DEMO_CREDITS_USED,
  readMockMembership,
  resolveMockCreditsRemaining as resolveMembershipCreditsRemaining,
  type MockMembershipSnapshot,
} from "@/lib/auth/mock-membership";
import { MOCK_USER_DISPLAY_NAME } from "@/lib/auth/mock-session";
import { applyMockNotificationReadOverlay } from "@/lib/notifications/mock-read-state";
import type { AccountSnapshot } from "@/types/account";
import type { AuthPlanTier, AuthUser } from "@/types/auth";
import { isBusinessWorkspaceAllowed } from "@/utils/business-workspace-screen";
import { resolveManageMembershipPlan } from "@/utils/manage-membership";

/** Canonical mock display name — re-exported from mock session identity. */
export { MOCK_USER_DISPLAY_NAME, MOCK_USER_EMAIL } from "@/lib/auth/mock-session";

/** Product-facing plan tier (maps ENTERPRISE → business). */
export type MockAppPlanTier = "guest" | "free" | "pro" | "business";

export type MockAppUser = {
  id: string;
  displayName: string;
  email: string | null;
  avatar: string | null;
  planTier: MockAppPlanTier;
};

export type MockAppMembership = {
  planTier: MockAppPlanTier;
  planName: string;
  status: "active" | "cancelled" | "expired" | "past_due";
  renewalDate: string | null;
  features: readonly string[];
  limits: {
    monthlyCredits: number;
    urlAuditsEnabled: boolean;
    pdfEnabled: boolean;
    topUpsEnabled: boolean;
  };
};

export type MockAppCredits = {
  remaining: number;
  monthlyAllocation: number;
  used: number;
  topUpAvailable: boolean;
};

export type MockAppAudit = {
  id: string;
  title: string;
  url: string | null;
  date: string;
  status: MockAuditHistoryCard["status"];
  score: number | null;
  auditType: MockAuditHistoryCard["auditType"];
  reportAvailable: boolean;
};

export type MockAppPermissions = {
  tier: MockAppPlanTier;
  canRunUrlAudit: boolean;
  canExportPdf: boolean;
  canShareReport: boolean;
  canCompareReports: boolean;
  canAccessWorkspace: boolean;
  canManageTeam: boolean;
  canTopUpCredits: boolean;
};

export type MockAppState = {
  user: MockAppUser;
  membership: MockAppMembership;
  credits: MockAppCredits;
  audits: MockAppAudit[];
  notifications: MockNotificationItem[];
  permissions: MockAppPermissions;
};

export type GetMockAppStateOptions = {
  /** QA / dev override — normal flow uses `user.planTier`. */
  tierOverride?: MockAppPlanTier | AuthPlanTier | ManageMembershipPlan | null;
  auditState?: AuditHistoryScreenState;
  auditEmpty?: boolean;
  notificationState?: NotificationsScreenState;
  notificationEmpty?: boolean;
  /** Real Supabase account (BACKEND-004). Overrides mock membership/credits. */
  account?: AccountSnapshot | null;
};

const DEFAULT_RENEWAL_BY_PLAN: Record<ManageMembershipPlan, string | null> = {
  free: "2026-09-01T00:00:00.000Z",
  pro: "2026-08-28T00:00:00.000Z",
  business: "2026-09-03T00:00:00.000Z",
};

export function authPlanTierToAppTier(
  planTier?: AuthPlanTier | null,
): MockAppPlanTier {
  if (planTier === "ENTERPRISE") return "business";
  if (planTier === "PRO") return "pro";
  if (planTier === "FREE") return "free";
  return "guest";
}

export function appTierToAuthPlanTier(tier: MockAppPlanTier): AuthPlanTier | null {
  if (tier === "business") return "ENTERPRISE";
  if (tier === "pro") return "PRO";
  if (tier === "free") return "FREE";
  return null;
}

export function appTierToPlanTier(tier: MockAppPlanTier): PlanTier | null {
  return appTierToAuthPlanTier(tier);
}

export function resolveAppPlanTier(
  userPlanTier?: AuthPlanTier | null,
  tierOverride?: GetMockAppStateOptions["tierOverride"],
): MockAppPlanTier {
  if (tierOverride != null) {
    const key = String(tierOverride).toLowerCase();
    if (key === "guest") return "guest";
    if (key === "enterprise" || key === "business") return "business";
    if (key === "pro") return "pro";
    if (key === "free") return "free";
  }
  if (!userPlanTier) return "guest";
  return authPlanTierToAppTier(userPlanTier);
}

function planTierFromAppTier(tier: MockAppPlanTier): PlanTier {
  return appTierToPlanTier(tier) ?? "FREE";
}

function resolveAuthUserForTier(
  user: AuthUser | null,
  tier: MockAppPlanTier,
): AuthUser | null {
  if (!user) return null;
  const authTier = appTierToAuthPlanTier(tier);
  if (!authTier || authTier === user.planTier) return user;
  return { ...user, planTier: authTier };
}

function resolveMembershipSnapshot(
  user: AuthUser | null,
): MockMembershipSnapshot | null {
  if (typeof window === "undefined") return null;
  const snap = readMockMembership();
  if (!snap || !user) return snap;
  if (snap.planTier === user.planTier) return snap;
  return null;
}

/** Credits remaining — prefers real account balance when provided. */
export function resolveMockCreditsRemaining(
  user: AuthUser | null | undefined,
  account?: AccountSnapshot | null,
): number | null {
  if (account) {
    return account.credits.remaining;
  }
  return resolveMembershipCreditsRemaining(user);
}

export function resolveMockCredits(
  user: AuthUser | null,
  tierOverride?: GetMockAppStateOptions["tierOverride"],
  account?: AccountSnapshot | null,
): MockAppCredits | null {
  if (account && tierOverride == null) {
    return {
      remaining: account.credits.remaining,
      monthlyAllocation: account.credits.monthlyAllocation,
      used: account.credits.used,
      topUpAvailable: account.credits.topUpAvailable,
    };
  }

  const tier = resolveAppPlanTier(user?.planTier, tierOverride);

  if (tier === "guest") {
    return {
      remaining: GUEST_AUDIT.screenshotCreditCost,
      monthlyAllocation: GUEST_AUDIT.screenshotCreditCost,
      used: 0,
      topUpAvailable: false,
    };
  }

  const planTier = planTierFromAppTier(tier);
  const plan = PLANS[planTier];
  const snap = resolveMembershipSnapshot(user);

  if (snap) {
    return {
      remaining: snap.creditsRemaining,
      monthlyAllocation: snap.monthlyGrant,
      used: Math.max(0, snap.monthlyGrant - snap.creditsRemaining),
      topUpAvailable: plan.topUpsEnabled,
    };
  }

  const demoUsed = MOCK_DEMO_CREDITS_USED[planTier];
  const remaining = Math.max(0, plan.monthlyCredits - demoUsed);

  return {
    remaining,
    monthlyAllocation: plan.monthlyCredits,
    used: demoUsed,
    topUpAvailable: plan.topUpsEnabled,
  };
}

function membershipStatusFromAccount(
  status: AccountSnapshot["membershipStatus"],
): MockAppMembership["status"] {
  if (status === "cancelled") return "cancelled";
  if (status === "past_due") return "past_due";
  if (status === "expired") return "expired";
  return "active";
}

function resolveMembershipFromAccount(
  account: AccountSnapshot,
): MockAppMembership {
  const tier = authPlanTierToAppTier(account.planTier);
  return {
    planTier: tier,
    planName: account.planDisplayName,
    status: membershipStatusFromAccount(account.membershipStatus),
    renewalDate: account.currentPeriodEnd,
    features: account.features,
    limits: {
      monthlyCredits: account.limits.monthlyCredits,
      urlAuditsEnabled: account.limits.urlAuditsEnabled,
      pdfEnabled: account.limits.pdfEnabled,
      topUpsEnabled: account.limits.topUpsEnabled,
    },
  };
}

function resolvePermissionsFromAccount(
  account: AccountSnapshot,
): MockAppPermissions {
  const tier = authPlanTierToAppTier(account.planTier);
  const reportTier =
    tier === "guest" ? "guest" : tier === "business" ? "business" : tier;

  return {
    tier,
    canRunUrlAudit: account.limits.urlAuditsEnabled,
    canExportPdf: AUDIT_REPORT_GATES.exportPdf[reportTier],
    canShareReport: AUDIT_REPORT_GATES.shareReport[reportTier],
    canCompareReports: AUDIT_REPORT_GATES.compareReports[reportTier],
    canAccessWorkspace: account.planTier === "ENTERPRISE",
    canManageTeam: account.planTier === "ENTERPRISE",
    canTopUpCredits: account.limits.topUpsEnabled,
  };
}

function resolveMockMembership(
  tier: MockAppPlanTier,
  user: AuthUser | null,
  snap: MockMembershipSnapshot | null,
): MockAppMembership {
  if (tier === "guest") {
    return {
      planTier: "guest",
      planName: "Guest",
      status: "active",
      renewalDate: null,
      features: ["One anonymous screenshot audit"],
      limits: {
        monthlyCredits: GUEST_AUDIT.screenshotCreditCost,
        urlAuditsEnabled: false,
        pdfEnabled: false,
        topUpsEnabled: false,
      },
    };
  }

  const planTier = planTierFromAppTier(tier);
  const plan = PLANS[planTier];
  const managePlan = resolveManageMembershipPlan(planTier);

  return {
    planTier: tier,
    planName: plan.displayName,
    status: "active",
    renewalDate: snap?.renewalDateIso ?? DEFAULT_RENEWAL_BY_PLAN[managePlan],
    features: plan.features,
    limits: {
      monthlyCredits: plan.monthlyCredits,
      urlAuditsEnabled: plan.urlAuditsEnabled,
      pdfEnabled: plan.pdfEnabled,
      topUpsEnabled: plan.topUpsEnabled,
    },
  };
}

function resolveMockPermissions(tier: MockAppPlanTier): MockAppPermissions {
  const reportTier =
    tier === "guest" ? "guest" : tier === "business" ? "business" : tier;

  return {
    tier,
    canRunUrlAudit: tier !== "guest" && PLANS[planTierFromAppTier(tier)].urlAuditsEnabled,
    canExportPdf: AUDIT_REPORT_GATES.exportPdf[reportTier],
    canShareReport: AUDIT_REPORT_GATES.shareReport[reportTier],
    canCompareReports: AUDIT_REPORT_GATES.compareReports[reportTier],
    canAccessWorkspace: tier === "business",
    canManageTeam: tier === "business",
    canTopUpCredits:
      tier !== "guest" && PLANS[planTierFromAppTier(tier)].topUpsEnabled,
  };
}

function toMockAppAudit(card: MockAuditHistoryCard): MockAppAudit {
  return {
    id: card.auditId,
    title: card.websiteName,
    url: card.websiteUrl,
    date: card.auditDate,
    status: card.status,
    score: card.score,
    auditType: card.auditType,
    reportAvailable: card.status === "completed",
  };
}

export function auditToRecentAudit(card: MockAuditHistoryCard): MockRecentAudit {
  if (card.status === "loading") {
    return {
      auditId: card.auditId,
      websiteName: card.websiteName,
      thumbnailUrl: card.thumbnailUrl,
      thumbnailAlt: card.thumbnailAlt,
      score: card.score,
      auditDate: card.auditDate,
      status: "loading",
      planUsed: card.planUsed,
    };
  }

  return {
    auditId: card.auditId,
    websiteName: card.websiteName,
    thumbnailUrl: card.thumbnailUrl,
    thumbnailAlt: card.thumbnailAlt,
    score: card.score,
    auditDate: card.auditDate,
    status: card.status,
    planUsed: card.planUsed,
  };
}

/**
 * Application state facade.
 * Pass `null` for guest; authenticated users from auth hook.
 * Prefer `options.account` for real Supabase sessions (BACKEND-004).
 */
export function getMockAppState(
  user: AuthUser | null,
  options?: GetMockAppStateOptions,
): MockAppState {
  const account =
    options?.tierOverride != null ? null : (options?.account ?? null);

  const tier = account
    ? authPlanTierToAppTier(account.planTier)
    : resolveAppPlanTier(user?.planTier, options?.tierOverride);

  const effectiveUser = account
    ? ({
        id: account.authProviderId,
        email: account.email,
        emailVerified: true,
        fullName: account.displayName,
        avatarUrl: account.avatarUrl,
        planTier: account.planTier,
      } satisfies AuthUser)
    : resolveAuthUserForTier(user, tier);

  const snap = account ? null : resolveMembershipSnapshot(effectiveUser);
  const credits = resolveMockCredits(
    effectiveUser,
    options?.tierOverride,
    account,
  )!;
  const membership = account
    ? resolveMembershipFromAccount(account)
    : resolveMockMembership(tier, effectiveUser, snap);
  const permissions = account
    ? resolvePermissionsFromAccount(account)
    : resolveMockPermissions(tier);

  const authTier = appTierToAuthPlanTier(tier);
  const auditBundle = getMockAuditHistory({
    userId: effectiveUser?.id,
    planTier: authTier,
    state: options?.auditState,
    empty: options?.auditEmpty,
  });

  const notificationBundle = getMockNotificationsScreen({
    userId: effectiveUser?.id ?? "mock-guest-user",
    state: options?.notificationState,
    empty: options?.notificationEmpty,
  });

  const displayName =
    account?.displayName?.trim() ||
    effectiveUser?.fullName?.trim() ||
    MOCK_USER_DISPLAY_NAME;

  return {
    user: {
      id: account?.appUserId ?? effectiveUser?.id ?? "mock-guest-user",
      displayName,
      email: account?.email ?? effectiveUser?.email ?? null,
      avatar: account?.avatarUrl ?? effectiveUser?.avatarUrl ?? null,
      planTier: tier,
    },
    membership,
    credits,
    audits: auditBundle.audits.map(toMockAppAudit),
    notifications: applyMockNotificationReadOverlay(
      notificationBundle.notifications,
    ),
    permissions,
  };
}

/** Existing audit-history catalog, scoped to the facade user/tier. */
export function getMockAppAuditHistory(
  user: AuthUser | null,
  options?: Pick<GetMockAppStateOptions, "tierOverride" | "auditState" | "auditEmpty">,
) {
  const tier = resolveAppPlanTier(user?.planTier, options?.tierOverride);
  return getMockAuditHistory({
    userId: user?.id,
    planTier: appTierToAuthPlanTier(tier),
    state: options?.auditState,
    empty: options?.auditEmpty,
  });
}

/** Build SCREEN-008 dashboard bundle from centralized state. */
export function buildMockDashboardBundle(
  appState: MockAppState,
  options?: { recentAuditsEmpty?: boolean },
): MockDashboardBundle {
  const tier = appState.user.planTier;
  const uiTier: MockDashboardTier =
    tier === "guest" ? "free" : tier;
  const authTier = appTierToAuthPlanTier(uiTier) ?? "FREE";
  const auditCards = getMockAuditHistory({
    planTier: authTier,
  }).audits;
  const recentAudits = options?.recentAuditsEmpty
    ? []
    : auditCards.slice(0, 5).map(auditToRecentAudit);

  const renewalDate =
    uiTier === "free" ? null : appState.membership.renewalDate;

  return {
    tier: uiTier,
    welcome: {
      state: "success",
      displayName: appState.user.displayName,
      avatarUrl: appState.user.avatar,
      tier: uiTier,
      membershipStatus: "active",
      creditsRemaining: appState.credits.remaining,
      monthlyLimit: appState.credits.monthlyAllocation,
      usageAmount: appState.credits.used,
    },
    credits: {
      state: "success",
      remaining: appState.credits.remaining,
      monthlyCredits: appState.credits.monthlyAllocation,
      used: appState.credits.used,
      renewalDate,
      tier: uiTier,
    },
    membership: {
      state: "active",
      plan: uiTier,
      renewalDate,
    },
    quickActions: [
      {
        action: "start_audit",
        ...QUICK_ACTION_DEFAULTS.start_audit,
        title: "Start New Audit",
        state: "default",
      },
      {
        action: "upload_screenshot",
        ...QUICK_ACTION_DEFAULTS.upload_screenshot,
        state: "default",
      },
      {
        action: "paste_url",
        ...QUICK_ACTION_DEFAULTS.paste_url,
        description:
          uiTier === "free"
            ? "Unlock live URL audits on Pro or Business."
            : QUICK_ACTION_DEFAULTS.paste_url.description,
        state: "default",
      },
      {
        action: "history",
        ...QUICK_ACTION_DEFAULTS.history,
        state: "default",
      },
    ],
    recentAudits,
    recentAuditsEmpty: recentAudits.length === 0,
    tips: MOCK_AI_TIPS,
    headerCredits: appState.credits.remaining,
  };
}

/** Build SCREEN-011 manage membership payload from centralized state. */
export function buildMockManageMembership(
  appState: MockAppState,
  overrides?: Partial<MockManageMembership>,
): MockManageMembership {
  const plan =
    appState.user.planTier === "guest"
      ? "free"
      : resolveManageMembershipPlan(appState.user.planTier);
  const base = getMockManageMembership(plan);

  return {
    ...base,
    plan,
    renewalDate: appState.membership.renewalDate ?? base.renewalDate,
    usage: {
      ...base.usage,
      creditsRemaining: appState.credits.remaining,
      creditsUsed: appState.credits.used,
      monthlyGrant: appState.credits.monthlyAllocation,
    },
    ...overrides,
  };
}

/** Whether workspace / roles screens should allow access for this app state. */
export function mockAppStateAllowsWorkspace(appState: MockAppState): boolean {
  const authTier = appTierToAuthPlanTier(appState.user.planTier);
  return isBusinessWorkspaceAllowed(authTier);
}

/** Map auth user plan to catalog tier key (ENTERPRISE preserved). */
export function resolveCatalogPlanTier(
  user: AuthUser | null | undefined,
): PlanTier {
  if (!user) return "FREE";
  return user.planTier;
}
