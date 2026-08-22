import "server-only";

import type { AccountSnapshot } from "@/types/account";
import type { AuthPlanTier } from "@/types/auth";

/** Personal-account role — sole owner until multi-seat DDL exists. */
export type AccountRole = "owner";

/** Platform role from public.users.role (not workspace RBAC). */
export type PlatformRole = "USER" | "ADMIN";

export type WorkspaceMode = "personal";

export type AuthorizationCapabilities = {
  canRunUrlAudit: boolean;
  canExportPdf: boolean;
  canTopUpCredits: boolean;
  canViewInvoices: boolean;
  canManageBilling: boolean;
  /** Business plan gate for mock /workspace UI — not multi-seat membership. */
  canAccessWorkspaceUi: boolean;
  /** Always false until workspace_members DDL is applied. */
  canManageTeam: boolean;
  canInviteMembers: boolean;
  canManageRoles: boolean;
};

export type AuthorizationContext = {
  appUserId: string;
  accountRole: AccountRole;
  platformRole: PlatformRole;
  workspaceMode: WorkspaceMode;
  planTier: AuthPlanTier;
  capabilities: AuthorizationCapabilities;
};

export function buildAuthorizationCapabilities(
  account: AccountSnapshot,
): AuthorizationCapabilities {
  const isBusiness = account.planTier === "ENTERPRISE";
  const membershipOk =
    account.membershipStatus !== "cancelled" &&
    account.membershipStatus !== "expired";

  return {
    canRunUrlAudit:
      membershipOk && account.limits.urlAuditsEnabled,
    canExportPdf: account.limits.pdfEnabled,
    canTopUpCredits: account.limits.topUpsEnabled,
    canViewInvoices: true,
    canManageBilling: true,
    canAccessWorkspaceUi: isBusiness,
    canManageTeam: false,
    canInviteMembers: false,
    canManageRoles: false,
  };
}

export function buildAuthorizationContext(
  account: AccountSnapshot,
  platformRole: PlatformRole = "USER",
): AuthorizationContext {
  return {
    appUserId: account.appUserId,
    accountRole: "owner",
    platformRole,
    workspaceMode: "personal",
    planTier: account.planTier,
    capabilities: buildAuthorizationCapabilities(account),
  };
}
