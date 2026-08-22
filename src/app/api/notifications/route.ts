import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadAccountSnapshot } from "@/services/account";
import { getOwnedPaymentInvoiceUrls } from "@/services/billing/payments";
import { listNotificationsForUser } from "@/services/notification/list";
import {
  dbTypeToUiType,
  resolveNotificationHref,
} from "@/services/notification/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications — own notifications only (RLS + app user id).
 * Query: unread=true | limit=1..100
 */
export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get("unread") === "true";
    const limitRaw = Number(url.searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(limitRaw) ? limitRaw : 50;

    const { notifications, unreadCount } = await listNotificationsForUser(
      supabase,
      account.appUserId,
      { unreadOnly, limit },
    );

    const paymentIds = notifications
      .map((n) => n.metadata?.paymentId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    const invoiceUrlsByPaymentId = await getOwnedPaymentInvoiceUrls(
      account.appUserId,
      paymentIds,
    );

    return NextResponse.json(
      {
        unreadCount,
        notifications: notifications.map((n) => {
          const uiType = dbTypeToUiType(n.type, n.metadata);
          const paymentId = n.metadata?.paymentId;
          const hostedInvoiceUrl =
            typeof paymentId === "string"
              ? (invoiceUrlsByPaymentId.get(paymentId) ?? null)
              : null;
          return {
            id: n.id,
            type: uiType,
            title: n.title,
            description: n.message,
            timestamp: n.createdAt,
            read: n.read,
            href: resolveNotificationHref(uiType, n.metadata, {
              hostedInvoiceUrl,
            }),
            actionLabel: n.metadata?.actionLabel ?? null,
            userId: account.appUserId,
          };
        }),
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
    console.error("[api/notifications]", error);
    return NextResponse.json(
      { error: "Unable to load notifications", code: "NOTIFICATIONS_FAILED" },
      { status: 500 },
    );
  }
}
