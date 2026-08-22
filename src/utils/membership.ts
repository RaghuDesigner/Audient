import { canRunUrlAudit, type PlanTier } from "@/config/plans";

/** Guest has no plan row; treated like Free for URL audits. */
export type MembershipContext = "GUEST" | PlanTier;

/**
 * URL input is enabled only for Pro / Business (ENTERPRISE).
 * Guest and Free must see the upgrade plans popup instead.
 */
export function canAccessUrlInput(membership: MembershipContext): boolean {
  if (membership === "GUEST" || membership === "FREE") {
    return false;
  }
  return canRunUrlAudit(membership);
}

export function isPaidMembership(membership: MembershipContext): boolean {
  return membership === "PRO" || membership === "ENTERPRISE";
}
