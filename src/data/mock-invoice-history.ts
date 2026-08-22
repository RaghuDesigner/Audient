/**
 * Phase-1 mock Invoice History — SCREEN-017.
 * Static invoices only; no Stripe / no API / no PDF bytes.
 */

import type { InvoiceHistoryState } from "@/config/invoice-history";
import {
  getMockBillingSummary,
  type MockBillingSummary,
} from "@/data/mock-billing-summary";
import type { AuthPlanTier } from "@/types/auth";
import type { InvoiceHistoryRecord } from "@/utils/invoice-history";
import { MOCK_USER_DISPLAY_NAME, MOCK_USER_EMAIL } from "@/lib/auth/mock-session";

/** Catalog owner is rebound to the session user at read time. */
export const MOCK_INVOICE_CATALOG_OWNER = "mock-invoice-owner";

const CUSTOMER_NAME = MOCK_USER_DISPLAY_NAME;
const CUSTOMER_EMAIL = MOCK_USER_EMAIL;

/**
 * Varied mock invoices for UI QA (newest-first after sort).
 * INV-2026-001 … includes Paid / Pending / Failed / Refunded.
 */
export const MOCK_INVOICE_CATALOG: InvoiceHistoryRecord[] = [
  {
    id: "inv_2026_012",
    invoiceNumber: "INV-2026-012",
    dateIso: "2026-08-05T14:20:00.000Z",
    plan: "pro",
    cycle: "monthly",
    status: "paid",
    currency: "USD",
    subtotalCents: 2900,
    discountCents: 0,
    taxCents: 0,
    totalCents: 2900,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_011",
    invoiceNumber: "INV-2026-011",
    dateIso: "2026-07-28T10:00:00.000Z",
    plan: "pro",
    cycle: "monthly",
    status: "pending",
    currency: "USD",
    subtotalCents: 2900,
    discountCents: 0,
    taxCents: 0,
    totalCents: 2900,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_010",
    invoiceNumber: "INV-2026-010",
    dateIso: "2026-07-15T16:45:00.000Z",
    plan: "credits",
    cycle: "one_time",
    status: "paid",
    currency: "USD",
    subtotalCents: 900,
    discountCents: 0,
    taxCents: 0,
    totalCents: 900,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_009",
    invoiceNumber: "INV-2026-009",
    dateIso: "2026-07-05T09:12:00.000Z",
    plan: "business",
    cycle: "yearly",
    status: "failed",
    currency: "USD",
    subtotalCents: 99_000,
    discountCents: 19_800,
    taxCents: 0,
    totalCents: 79_200,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_008",
    invoiceNumber: "INV-2026-008",
    dateIso: "2026-06-20T11:30:00.000Z",
    plan: "pro",
    cycle: "monthly",
    status: "refunded",
    currency: "USD",
    subtotalCents: 2900,
    discountCents: 0,
    taxCents: 0,
    totalCents: 2900,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_007",
    invoiceNumber: "INV-2026-007",
    dateIso: "2026-06-05T08:00:00.000Z",
    plan: "pro",
    cycle: "monthly",
    status: "paid",
    currency: "USD",
    subtotalCents: 2900,
    discountCents: 290,
    taxCents: 0,
    totalCents: 2610,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_006",
    invoiceNumber: "INV-2026-006",
    dateIso: "2026-05-05T08:00:00.000Z",
    plan: "pro",
    cycle: "monthly",
    status: "paid",
    currency: "USD",
    subtotalCents: 2900,
    discountCents: 0,
    taxCents: 0,
    totalCents: 2900,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_005",
    invoiceNumber: "INV-2026-005",
    dateIso: "2026-04-05T08:00:00.000Z",
    plan: "pro",
    cycle: "monthly",
    status: "paid",
    currency: "USD",
    subtotalCents: 2900,
    discountCents: 0,
    taxCents: 0,
    totalCents: 2900,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_004",
    invoiceNumber: "INV-2026-004",
    dateIso: "2026-03-12T13:22:00.000Z",
    plan: "credits",
    cycle: "one_time",
    status: "paid",
    currency: "USD",
    subtotalCents: 2900,
    discountCents: 0,
    taxCents: 0,
    totalCents: 2900,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_003",
    invoiceNumber: "INV-2026-003",
    dateIso: "2026-02-18T17:00:00.000Z",
    plan: "business",
    cycle: "monthly",
    status: "paid",
    currency: "USD",
    subtotalCents: 9900,
    discountCents: 0,
    taxCents: 0,
    totalCents: 9900,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_002",
    invoiceNumber: "INV-2026-002",
    dateIso: "2026-02-01T10:00:00.000Z",
    plan: "pro",
    cycle: "yearly",
    status: "paid",
    currency: "USD",
    subtotalCents: 34_800,
    discountCents: 6960,
    taxCents: 0,
    totalCents: 27_840,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
  {
    id: "inv_2026_001",
    invoiceNumber: "INV-2026-001",
    dateIso: "2026-01-10T09:00:00.000Z",
    plan: "pro",
    cycle: "monthly",
    status: "paid",
    currency: "USD",
    subtotalCents: 2900,
    discountCents: 0,
    taxCents: 0,
    totalCents: 2900,
    customerName: CUSTOMER_NAME,
    customerEmail: CUSTOMER_EMAIL,
    userId: MOCK_INVOICE_CATALOG_OWNER,
  },
];

export type MockInvoiceHistory = {
  state: InvoiceHistoryState;
  invoices: InvoiceHistoryRecord[];
  billing: MockBillingSummary;
  /** Open details for deep-link / Payment Success handoff. */
  initialInvoiceId?: string | null;
};

export function rebindMockInvoicesToUser(
  invoices: readonly InvoiceHistoryRecord[],
  userId: string,
  email?: string | null,
  fullName?: string | null,
): InvoiceHistoryRecord[] {
  return invoices.map((inv) => ({
    ...inv,
    userId,
    customerEmail: email?.trim() || inv.customerEmail,
    customerName: fullName?.trim() || inv.customerName,
  }));
}

function billingPlanFromTier(
  tier: AuthPlanTier | null | undefined,
): MockBillingSummary["plan"] {
  if (tier === "ENTERPRISE") return "business";
  if (tier === "PRO") return "pro";
  return "free";
}

export function getMockInvoiceHistory(input?: {
  userId?: string | null;
  email?: string | null;
  fullName?: string | null;
  planTier?: AuthPlanTier | null;
  state?: InvoiceHistoryState;
  catalog?: readonly InvoiceHistoryRecord[];
  empty?: boolean;
  initialInvoiceId?: string | null;
}): MockInvoiceHistory {
  const state = input?.state ?? "success";
  const catalog = input?.catalog ?? MOCK_INVOICE_CATALOG;
  const userId = input?.userId ?? MOCK_INVOICE_CATALOG_OWNER;
  const plan = billingPlanFromTier(input?.planTier);

  if (state === "loading") {
    return {
      state: "loading",
      invoices: [],
      billing: getMockBillingSummary(plan, { state: "loading" }),
      initialInvoiceId: input?.initialInvoiceId,
    };
  }

  if (state === "error") {
    return {
      state: "error",
      invoices: [],
      billing: getMockBillingSummary(plan, {
        state: "error",
        statusDetail: "We couldn’t load billing. Please try again.",
      }),
      initialInvoiceId: input?.initialInvoiceId,
    };
  }

  if (input?.empty || state === "empty") {
    return {
      state: "empty",
      invoices: [],
      billing: getMockBillingSummary(plan, { hasInvoices: false }),
      initialInvoiceId: null,
    };
  }

  const invoices = rebindMockInvoicesToUser(
    catalog,
    userId,
    input?.email,
    input?.fullName,
  );

  return {
    state: "success",
    invoices,
    billing: getMockBillingSummary(plan, {
      hasInvoices: invoices.length > 0,
    }),
    initialInvoiceId: input?.initialInvoiceId,
  };
}

export const MOCK_INVOICE_HISTORY_PRO: MockInvoiceHistory = getMockInvoiceHistory({
  planTier: "PRO",
  userId: "mock-google-user",
});

export const MOCK_INVOICE_HISTORY_EMPTY: MockInvoiceHistory = getMockInvoiceHistory({
  planTier: "FREE",
  empty: true,
});

export const MOCK_INVOICE_HISTORY_LOADING: MockInvoiceHistory =
  getMockInvoiceHistory({ state: "loading", planTier: "PRO" });

export const MOCK_INVOICE_HISTORY_ERROR: MockInvoiceHistory = getMockInvoiceHistory({
  state: "error",
  planTier: "PRO",
});
