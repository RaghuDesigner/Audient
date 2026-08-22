"use client";

import * as React from "react";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { InvoiceHistoryScreen } from "@/components/billing/InvoiceHistoryScreen";
import {
  INVOICE_HISTORY_COPY,
  INVOICE_HISTORY_ROUTE,
  type InvoiceHistoryState,
} from "@/config/invoice-history";
import {
  getMockInvoiceHistory,
  type MockInvoiceHistory,
} from "@/data/mock-invoice-history";
import { useAppState } from "@/hooks/use-app-state";
import { useRealBillingApi } from "@/hooks/use-real-billing-api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { fetchBillingInvoices } from "@/lib/billing/client";
import type { InvoiceHistoryRecord } from "@/utils/invoice-history";

export type InvoiceHistoryClientProps = {
  state?: InvoiceHistoryState | null;
  empty?: boolean;
  initialInvoiceId?: string | null;
};

function mapPaymentStatus(
  status: string,
): InvoiceHistoryRecord["status"] {
  switch (status.toUpperCase()) {
    case "SUCCEEDED":
      return "paid";
    case "PENDING":
      return "pending";
    case "FAILED":
      return "failed";
    case "REFUNDED":
      return "refunded";
    default:
      return "pending";
  }
}

function mapPaymentPlan(
  type: string,
  description: string | null,
): InvoiceHistoryRecord["plan"] {
  const d = (description ?? "").toLowerCase();
  if (type === "CREDIT_TOPUP" || d.includes("pack") || d.includes("credit")) {
    return "credits";
  }
  if (d.includes("enterprise") || d.includes("business")) return "business";
  return "pro";
}

/**
 * SCREEN-017 client shell — mock invoices for mock auth; Stripe payments for real users.
 */
export function InvoiceHistoryClient({
  state = null,
  empty = false,
  initialInvoiceId = null,
}: InvoiceHistoryClientProps) {
  const { user, isReady } = useRequireAuth({
    redirectTo: INVOICE_HISTORY_ROUTE,
  });
  const { appState, effectiveUser } = useAppState();
  const useRealBilling = useRealBillingApi();
  const resolved = effectiveUser ?? user;
  const [data, setData] = React.useState<MockInvoiceHistory | null>(null);

  React.useEffect(() => {
    if (!isReady || !resolved) {
      setData(null);
      return;
    }

    if (!useRealBilling || empty || state === "empty") {
      setData(
        getMockInvoiceHistory({
          userId: resolved.id,
          email: resolved.email,
          fullName: resolved.fullName ?? appState.user.displayName,
          planTier: resolved.planTier,
          state: state ?? undefined,
          empty: empty || state === "empty",
          initialInvoiceId,
        }),
      );
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const invoices = await fetchBillingInvoices();
        if (cancelled) return;
        const records: InvoiceHistoryRecord[] = invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber:
            inv.invoiceNumber ?? `PAY-${inv.id.slice(0, 8).toUpperCase()}`,
          dateIso: inv.paidAt ?? inv.createdAt,
          plan: mapPaymentPlan(inv.type, inv.description),
          cycle: inv.type === "CREDIT_TOPUP" ? "one_time" : "monthly",
          status: mapPaymentStatus(inv.status),
          currency: "USD",
          subtotalCents: inv.amount,
          discountCents: 0,
          taxCents: 0,
          totalCents: inv.amount,
          customerName: resolved.fullName ?? appState.user.displayName ?? "",
          customerEmail: resolved.email ?? "",
          userId: resolved.id,
          invoiceUrl: inv.invoiceUrl,
        }));

        const mockBase = getMockInvoiceHistory({
          userId: resolved.id,
          email: resolved.email,
          fullName: resolved.fullName ?? appState.user.displayName,
          planTier: resolved.planTier,
          state: records.length === 0 ? "empty" : "success",
          empty: records.length === 0,
          initialInvoiceId,
        });

        setData({
          ...mockBase,
          invoices: records,
          state: records.length === 0 ? "empty" : "success",
        });
      } catch {
        if (!cancelled) {
          setData(
            getMockInvoiceHistory({
              userId: resolved.id,
              email: resolved.email,
              fullName: resolved.fullName ?? appState.user.displayName,
              planTier: resolved.planTier,
              state: "error",
            }),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    appState.user.displayName,
    empty,
    initialInvoiceId,
    isReady,
    resolved,
    state,
    useRealBilling,
  ]);

  if (!isReady || !resolved || data == null) {
    return (
      <AuthSessionFallback message={INVOICE_HISTORY_COPY.guestRedirect} />
    );
  }

  return (
    <InvoiceHistoryScreen
      data={data}
      onRetry={() => {
        setData(null);
        setData(
          getMockInvoiceHistory({
            userId: resolved.id,
            email: resolved.email,
            fullName: resolved.fullName ?? appState.user.displayName,
            planTier: resolved.planTier,
            state: state ?? undefined,
            empty: empty || state === "empty",
            initialInvoiceId,
          }),
        );
      }}
    />
  );
}
