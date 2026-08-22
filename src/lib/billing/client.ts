export type CreateBillingCheckoutInput =
  | {
      kind: "subscription";
      plan: "pro" | "business";
      cycle?: "monthly" | "yearly";
    }
  | {
      kind: "credit_topup";
      packId: string;
    };

export type CreateBillingCheckoutResult = {
  sessionId: string;
  url: string;
};

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; code?: string };
    return body.error ?? body.code ?? response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

export async function createBillingCheckout(
  input: CreateBillingCheckoutInput,
): Promise<CreateBillingCheckoutResult> {
  const response = await fetch("/api/billing/checkout", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return (await response.json()) as CreateBillingCheckoutResult;
}

export type BillingInvoiceDto = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  invoiceNumber: string | null;
  invoiceUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  description: string | null;
  creditsGranted: number | null;
  stripeSubscriptionId?: string | null;
};

export async function fetchBillingInvoices(): Promise<BillingInvoiceDto[]> {
  const response = await fetch("/api/billing/invoices", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const body = (await response.json()) as { invoices: BillingInvoiceDto[] };
  return body.invoices ?? [];
}
