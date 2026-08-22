import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { accountHasCredits } from "@/services/account";
import {
  AccountMissingError,
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";

/**
 * GET /api/me/permissions — server-evaluated capability + account authorization.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account, authz } = await requireAuthorizationContext(
      supabase,
      user,
    );

    const screenshotCost = account.limits.screenshotCost;
    const urlCost = account.limits.urlCost ?? 0;

    return NextResponse.json(
      {
        planTier: account.planTier,
        accountRole: authz.accountRole,
        platformRole: authz.platformRole,
        workspaceMode: authz.workspaceMode,
        canRunUrlAudit: authz.capabilities.canRunUrlAudit,
        canExportPdf: authz.capabilities.canExportPdf,
        canTopUpCredits: authz.capabilities.canTopUpCredits,
        canViewInvoices: authz.capabilities.canViewInvoices,
        canManageBilling: authz.capabilities.canManageBilling,
        canAccessWorkspaceUi: authz.capabilities.canAccessWorkspaceUi,
        canManageTeam: authz.capabilities.canManageTeam,
        canInviteMembers: authz.capabilities.canInviteMembers,
        canManageRoles: authz.capabilities.canManageRoles,
        creditsRemaining: account.credits.remaining,
        canAffordScreenshot: accountHasCredits(account, screenshotCost),
        canAffordUrl:
          authz.capabilities.canRunUrlAudit &&
          (account.limits.urlCost == null ||
            accountHasCredits(account, urlCost)),
        costs: {
          screenshot: screenshotCost,
          url: account.limits.urlCost,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 },
      );
    }
    if (error instanceof AccountMissingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 404 },
      );
    }
    console.error("[api/me/permissions]", error);
    return NextResponse.json(
      { error: "Unable to load permissions", code: "PERMISSIONS_FAILED" },
      { status: 500 },
    );
  }
}
