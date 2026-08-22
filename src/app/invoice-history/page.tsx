import { InvoiceHistoryClient } from "@/app/invoice-history/invoice-history-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import type { InvoiceHistoryState } from "@/config/invoice-history";
import {
  INVOICE_HISTORY_STATES,
} from "@/config/invoice-history";

type InvoiceHistoryPageProps = {
  searchParams: Promise<{
    state?: string;
    invoice?: string;
    empty?: string;
  }>;
};

/**
 * SCREEN-017 — Invoice History (`/invoice-history`).
 * Mock only. QA: `?state=loading|error|empty|success` `?invoice=inv_2026_001`.
 * Guests → sign-in via client shell.
 */
export default async function InvoiceHistoryPage({
  searchParams,
}: InvoiceHistoryPageProps) {
  const query = await searchParams;
  const state = parseState(query.state);
  const empty = query.empty === "1" || query.empty === "true";
  const initialInvoiceId = query.invoice?.trim() || null;

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <InvoiceHistoryClient
          state={state}
          empty={empty}
          initialInvoiceId={initialInvoiceId}
        />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function parseState(
  value: string | undefined,
): InvoiceHistoryState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if ((INVOICE_HISTORY_STATES as readonly string[]).includes(normalized)) {
    return normalized as InvoiceHistoryState;
  }
  return null;
}
