/**
 * Pure Stripe object-id helpers (legacy Invoice fields + newer `parent`).
 * No I/O — used by webhook mapping and local billing verification.
 */

export function stripeObjectId(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id: unknown }).id;
    if (typeof id === "string" && id.length > 0) return id;
  }
  return null;
}

type InvoiceLike = {
  subscription?: unknown;
  payment_intent?: unknown;
  parent?: {
    subscription_details?: { subscription?: unknown } | null;
  } | null;
  payments?: {
    data?: Array<{
      payment?: { payment_intent?: unknown } | null;
      payment_intent?: unknown;
    }>;
  } | null;
};

export function invoiceSubscriptionId(invoice: InvoiceLike): string | null {
  return (
    stripeObjectId(invoice.subscription) ??
    stripeObjectId(invoice.parent?.subscription_details?.subscription) ??
    null
  );
}

export function invoicePaymentIntentId(invoice: InvoiceLike): string | null {
  const direct = stripeObjectId(invoice.payment_intent);
  if (direct) return direct;
  for (const row of invoice.payments?.data ?? []) {
    const nested =
      stripeObjectId(row.payment?.payment_intent) ??
      stripeObjectId(row.payment_intent);
    if (nested) return nested;
  }
  return null;
}

export function checkoutInvoiceId(session: { invoice?: unknown }): string | null {
  return stripeObjectId(session.invoice);
}

export function checkoutSubscriptionId(session: {
  subscription?: unknown;
}): string | null {
  return stripeObjectId(session.subscription);
}

export function checkoutPaymentIntentId(session: {
  payment_intent?: unknown;
}): string | null {
  return stripeObjectId(session.payment_intent);
}

export function isCreditTopUpCheckout(session: {
  mode?: string | null;
  metadata?: { kind?: string | null } | Record<string, string> | null;
}): boolean {
  const kind = session.metadata?.kind ?? "";
  return kind === "credit_topup" || session.mode === "payment";
}

export function isSubscriptionCheckout(session: {
  mode?: string | null;
}): boolean {
  return session.mode === "subscription";
}
