import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import type {
  AccountCredits,
  AccountMembershipStatus,
  AccountPlanLimits,
  AccountSnapshot,
} from "@/types/account";
import type { AuthPlanTier } from "@/types/auth";

type PlanRow = {
  id: string;
  key: string;
  display_name: string;
  monthly_credits: number;
  is_unlimited: boolean;
  screenshot_cost: number;
  url_cost: number;
  features: Record<string, unknown> | null;
};

type MembershipRow = {
  tier: string;
  status: string;
  billing_interval: string;
  plan_id: string | null;
  current_period_end: string | null;
};

type CreditsRow = {
  plan_credits: number;
  purchased_credits: number;
  balance: number;
  monthly_grant: number;
  lifetime_used: number;
  is_unlimited: boolean;
};

type UserRow = {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  auth_provider_id: string;
};

function asPlanTier(value: string): AuthPlanTier {
  if (value === "PRO" || value === "ENTERPRISE" || value === "FREE") {
    return value;
  }
  return "FREE";
}

function mapMembershipStatus(status: string): AccountMembershipStatus {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "TRIALING":
      return "trialing";
    case "PAST_DUE":
      return "past_due";
    case "CANCELED":
      return "cancelled";
    default:
      return "active";
  }
}

function featureFlag(
  features: Record<string, unknown> | null,
  key: string,
  fallback: boolean,
): boolean {
  if (!features || !(key in features)) return fallback;
  return Boolean(features[key]);
}

function featureList(
  features: Record<string, unknown> | null,
  tier: AuthPlanTier,
): string[] {
  if (Array.isArray(features?.list)) {
    return features!.list.filter((x): x is string => typeof x === "string");
  }
  const lines: string[] = [];
  if (featureFlag(features, "urlAudits", tier !== "FREE")) {
    lines.push("URL audits");
  }
  if (featureFlag(features, "pdfReports", tier !== "FREE")) {
    lines.push("PDF reports");
  }
  if (featureFlag(features, "creditTopups", tier !== "FREE")) {
    lines.push("Credit top-ups");
  }
  if (lines.length === 0) {
    lines.push("Screenshot audits");
  }
  return lines;
}

function mapLimits(plan: PlanRow, tier: AuthPlanTier): AccountPlanLimits {
  const features = plan.features;
  const urlAuditsEnabled = featureFlag(
    features,
    "urlAudits",
    tier === "PRO" || tier === "ENTERPRISE",
  );
  return {
    monthlyCredits: plan.monthly_credits,
    screenshotCost: plan.screenshot_cost,
    urlCost: urlAuditsEnabled ? plan.url_cost : null,
    urlAuditsEnabled,
    pdfEnabled: featureFlag(features, "pdfReports", tier !== "FREE"),
    topUpsEnabled: featureFlag(features, "creditTopups", tier !== "FREE"),
    isUnlimited: plan.is_unlimited,
  };
}

function mapCredits(
  row: CreditsRow,
  limits: AccountPlanLimits,
): AccountCredits {
  const remaining = Math.max(0, row.balance);
  const monthlyAllocation = row.monthly_grant || limits.monthlyCredits;
  return {
    remaining,
    planCredits: row.plan_credits,
    purchasedCredits: row.purchased_credits,
    monthlyAllocation,
    used: Math.max(0, row.lifetime_used),
    topUpAvailable: limits.topUpsEnabled,
  };
}

/**
 * Load the authenticated app account from DB (RLS-scoped).
 * Does not create rows — Auth trigger owns provisioning.
 */
export async function loadAccountSnapshot(
  supabase: SupabaseClient,
  authUser: User,
): Promise<AccountSnapshot | null> {
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id, email, name, avatar_url, auth_provider_id")
    .eq("auth_provider_id", authUser.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (userError || !userRow) {
    return null;
  }

  const user = userRow as UserRow;

  const { data: membershipRow, error: membershipError } = await supabase
    .from("memberships")
    .select("tier, status, billing_interval, plan_id, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membershipRow) {
    return null;
  }

  const membership = membershipRow as MembershipRow;
  const planTier = asPlanTier(membership.tier);

  let plan: PlanRow | null = null;
  if (membership.plan_id) {
    const { data } = await supabase
      .from("plans")
      .select(
        "id, key, display_name, monthly_credits, is_unlimited, screenshot_cost, url_cost, features",
      )
      .eq("id", membership.plan_id)
      .maybeSingle();
    plan = data as PlanRow | null;
  }

  if (!plan) {
    const { data } = await supabase
      .from("plans")
      .select(
        "id, key, display_name, monthly_credits, is_unlimited, screenshot_cost, url_cost, features",
      )
      .eq("key", planTier)
      .eq("billing_interval", membership.billing_interval || "MONTHLY")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    plan = data as PlanRow | null;
  }

  if (!plan) {
    return null;
  }

  const { data: creditsRow, error: creditsError } = await supabase
    .from("credits")
    .select(
      "plan_credits, purchased_credits, balance, monthly_grant, lifetime_used, is_unlimited",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (creditsError || !creditsRow) {
    return null;
  }

  const limits = mapLimits(plan, planTier);
  const credits = mapCredits(creditsRow as CreditsRow, limits);

  const meta = authUser.user_metadata ?? {};
  const metaName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null;
  const metaAvatar =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;

  return {
    appUserId: user.id,
    authProviderId: user.auth_provider_id,
    email: user.email ?? authUser.email ?? null,
    displayName: user.name ?? metaName,
    avatarUrl: user.avatar_url ?? metaAvatar,
    planTier,
    planDisplayName: plan.display_name,
    membershipStatus: mapMembershipStatus(membership.status),
    billingInterval:
      membership.billing_interval === "YEARLY" ? "YEARLY" : "MONTHLY",
    currentPeriodEnd: membership.current_period_end,
    planId: plan.id,
    limits,
    credits,
    features: featureList(plan.features, planTier),
  };
}

/** Server-side URL audit authorization from account snapshot. */
export function accountAllowsUrlAudit(account: AccountSnapshot): boolean {
  if (
    account.membershipStatus === "cancelled" ||
    account.membershipStatus === "expired"
  ) {
    return false;
  }
  return account.limits.urlAuditsEnabled;
}

/** Server-side credit sufficiency check (does not mutate). */
export function accountHasCredits(
  account: AccountSnapshot,
  cost: number,
): boolean {
  if (account.limits.isUnlimited) return true;
  return account.credits.remaining >= cost;
}
