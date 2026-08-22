import { AuditReportScreen } from "@/components/report";
import {
  AUDIT_REPORT_STATES,
  AUDIT_REPORT_TIERS,
  type AuditReportState,
  type AuditReportTier,
} from "@/config/audit-report";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";

type AuditReportPageProps = {
  params: Promise<{ auditId: string }>;
  searchParams: Promise<{ tier?: string; state?: string }>;
};

/**
 * SCREEN-010 / M02 — Audit Report route (`/audit/[auditId]/report`).
 * Phase-1 mock only. Optional `?tier=` / `?state=` for QA.
 */
export default async function AuditReportPage({
  params,
  searchParams,
}: AuditReportPageProps) {
  const { auditId } = await params;
  const query = await searchParams;
  const tier = parseTier(query.tier);
  const state = parseState(query.state);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <AuditReportScreen auditId={auditId} tier={tier} state={state} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function parseTier(value?: string): AuditReportTier | undefined {
  if (!value) return undefined;
  return (AUDIT_REPORT_TIERS as readonly string[]).includes(value)
    ? (value as AuditReportTier)
    : undefined;
}

function parseState(value?: string): AuditReportState | undefined {
  if (!value) return undefined;
  return (AUDIT_REPORT_STATES as readonly string[]).includes(value)
    ? (value as AuditReportState)
    : undefined;
}
