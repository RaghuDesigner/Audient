import { BillingClient } from "@/app/billing/billing-client";
import {
  MANAGE_MEMBERSHIP_PLANS,
  MANAGE_MEMBERSHIP_STATES,
  type ManageMembershipPlan,
  type ManageMembershipState,
} from "@/config/manage-membership";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";

type BillingPageProps = {
  searchParams: Promise<{ tier?: string; state?: string }>;
};

/**
 * SCREEN-011 / SCREEN-005 — Manage Membership (`/billing`).
 * Phase-1 mock only. Optional `?tier=` / `?state=` for QA.
 * Normal flow resolves plan from authenticated mock user (client).
 */
export default async function BillingPage({ searchParams }: BillingPageProps) {
  const query = await searchParams;
  const tierOverride = parsePlan(query.tier);
  const stateOverride = parseState(query.state);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider qaTierOverride={tierOverride}>
        <BillingClient
        tierOverride={tierOverride}
        stateOverride={stateOverride}
        />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function parsePlan(value?: string): ManageMembershipPlan | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "enterprise") return "business";
  return (MANAGE_MEMBERSHIP_PLANS as readonly string[]).includes(normalized)
    ? (normalized as ManageMembershipPlan)
    : null;
}

function parseState(value?: string): ManageMembershipState | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return (MANAGE_MEMBERSHIP_STATES as readonly string[]).includes(normalized)
    ? (normalized as ManageMembershipState)
    : null;
}
