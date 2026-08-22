import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadAccountSnapshot } from "@/services/account";
import { listPaymentsForUser } from "@/services/billing/payments";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/invoices — payment/invoice projection for Invoice History.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new AuthRequiredError();

    const account = await loadAccountSnapshot(supabase, user);
    if (!account) {
      return NextResponse.json(
        { error: "Account not provisioned", code: "ACCOUNT_MISSING" },
        { status: 404 },
      );
    }

    const payments = await listPaymentsForUser(account.appUserId, 50);

    return NextResponse.json(
      { invoices: payments },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Unable to load invoices", code: "INVOICES_FAILED" },
      { status: 500 },
    );
  }
}
