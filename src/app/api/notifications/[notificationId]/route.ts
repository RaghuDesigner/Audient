import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadAccountSnapshot } from "@/services/account";
import { markNotificationRead } from "@/services/notification/list";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ notificationId: string }>;
};

/**
 * PATCH /api/notifications/[notificationId] — mark own notification read.
 * Body: { read: true } (only supported mutation).
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { notificationId } = await context.params;
    if (!notificationId || notificationId.length > 80) {
      return NextResponse.json(
        { error: "Invalid notification id", code: "INVALID_ID" },
        { status: 400 },
      );
    }

    let body: { read?: unknown } = {};
    try {
      body = (await request.json()) as { read?: unknown };
    } catch {
      body = {};
    }
    if (body.read !== true) {
      return NextResponse.json(
        { error: "Only { read: true } is supported", code: "INVALID_BODY" },
        { status: 400 },
      );
    }

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

    const ok = await markNotificationRead(
      supabase,
      account.appUserId,
      notificationId,
    );
    if (!ok) {
      return NextResponse.json(
        { error: "Notification not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { id: notificationId, read: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 },
      );
    }
    console.error("[api/notifications/id]", error);
    return NextResponse.json(
      { error: "Unable to update notification", code: "NOTIFICATION_UPDATE_FAILED" },
      { status: 500 },
    );
  }
}
