import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadAccountSnapshot } from "@/services/account";
import { markAllNotificationsRead } from "@/services/notification/list";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/read-all — mark all own notifications as read.
 */
export async function POST() {
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

    const updated = await markAllNotificationsRead(
      supabase,
      account.appUserId,
    );

    return NextResponse.json(
      { updated },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 },
      );
    }
    console.error("[api/notifications/read-all]", error);
    return NextResponse.json(
      { error: "Unable to mark notifications read", code: "READ_ALL_FAILED" },
      { status: 500 },
    );
  }
}
