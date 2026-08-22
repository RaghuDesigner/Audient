import { NextResponse } from "next/server";

import { loadAccountSnapshot } from "@/services/account";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/me — authenticated account snapshot (user, membership, plan, credits).
 * Never accepts client-supplied tier/credits.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const account = await loadAccountSnapshot(supabase, user);
    if (!account) {
      return NextResponse.json(
        { error: "Account not provisioned" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { account },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("[api/me]", error);
    return NextResponse.json(
      { error: "Unable to load account" },
      { status: 500 },
    );
  }
}
