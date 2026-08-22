import { HistoryClient } from "@/app/history/history-client";
import {
  AUDIT_HISTORY_STATES,
  type AuditHistoryScreenState,
} from "@/config/audit-history";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";

type HistoryPageProps = {
  searchParams: Promise<{
    state?: string;
    empty?: string;
  }>;
};

/**
 * SCREEN-009 — Audit History (`/history`).
 * Mock only. QA: `?state=loading|error|empty|success` `?empty=1`.
 * Guests → sign-in via client shell + middleware.
 */
export default async function HistoryPage({
  searchParams,
}: HistoryPageProps) {
  const query = await searchParams;
  const state = parseState(query.state);
  const empty = query.empty === "1" || query.empty === "true";

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <HistoryClient state={state} empty={empty} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function parseState(
  value: string | undefined,
): AuditHistoryScreenState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if ((AUDIT_HISTORY_STATES as readonly string[]).includes(normalized)) {
    return normalized as AuditHistoryScreenState;
  }
  return null;
}
