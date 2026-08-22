/**
 * Phase-1 mock Compare Report Button props — COMPONENT-032.
 * Tier / readiness samples + peer stubs for selector placeholder; no API.
 */

import type {
  CompareReportButtonState,
  CompareReportButtonSurface,
  CompareReportButtonTier,
  CompareReportButtonVariant,
} from "@/config/compare-report-button";

/** Data props for CompareReportButton (callbacks omitted). */
export type MockCompareReportButton = {
  auditId: string;
  tier: CompareReportButtonTier;
  state: CompareReportButtonState;
  compareReady: boolean;
  surface: CompareReportButtonSurface;
  variant: CompareReportButtonVariant;
};

/** Peer audit stub for the Compare Report Selector placeholder. */
export type MockComparePeerAudit = {
  auditId: string;
  websiteName: string;
  auditedAt: string;
  score: number;
};

export const MOCK_COMPARE_REPORT_BUSINESS: MockCompareReportButton = {
  auditId: "audit-report-acme-1",
  tier: "business",
  state: "default",
  compareReady: true,
  surface: "report",
  variant: "button",
};

export const MOCK_COMPARE_REPORT_FREE_LOCKED: MockCompareReportButton = {
  auditId: "audit-report-acme-1",
  tier: "free",
  state: "locked",
  compareReady: true,
  surface: "report",
  variant: "button",
};

export const MOCK_COMPARE_REPORT_PRO_LOCKED: MockCompareReportButton = {
  auditId: "audit-report-acme-1",
  tier: "pro",
  state: "locked",
  compareReady: true,
  surface: "summary",
  variant: "button",
};

/** Guest — parent should not mount; fixture for docs/QA only. */
export const MOCK_COMPARE_REPORT_GUEST_HIDDEN: MockCompareReportButton = {
  auditId: "audit-report-acme-1",
  tier: "guest",
  state: "disabled",
  compareReady: false,
  surface: "report",
  variant: "button",
};

export const MOCK_COMPARE_REPORT_DISABLED: MockCompareReportButton = {
  auditId: "audit-summary-processing-1",
  tier: "business",
  state: "disabled",
  compareReady: false,
  surface: "report",
  variant: "button",
};

export const MOCK_COMPARE_REPORT_LOADING: MockCompareReportButton = {
  auditId: "audit-report-acme-1",
  tier: "business",
  state: "loading",
  compareReady: true,
  surface: "report",
  variant: "button",
};

export const MOCK_COMPARE_REPORT_HISTORY_MENU: MockCompareReportButton = {
  auditId: "hist-completed-1",
  tier: "business",
  state: "default",
  compareReady: true,
  surface: "history",
  variant: "menuItem",
};

/** Mock peers excluding the source Acme report. */
export const MOCK_COMPARE_PEER_AUDITS: MockComparePeerAudit[] = [
  {
    auditId: "audit-compare-peer-1",
    websiteName: "acme.studio",
    auditedAt: "2026-06-12T10:00:00.000Z",
    score: 64,
  },
  {
    auditId: "audit-compare-peer-2",
    websiteName: "northwind.app",
    auditedAt: "2026-07-02T16:30:00.000Z",
    score: 78,
  },
  {
    auditId: "audit-compare-peer-3",
    websiteName: "acme.studio",
    auditedAt: "2026-05-20T09:15:00.000Z",
    score: 58,
  },
];

export const MOCK_COMPARE_REPORT_BY_TIER: Record<
  CompareReportButtonTier,
  MockCompareReportButton
> = {
  guest: MOCK_COMPARE_REPORT_GUEST_HIDDEN,
  free: MOCK_COMPARE_REPORT_FREE_LOCKED,
  pro: MOCK_COMPARE_REPORT_PRO_LOCKED,
  business: MOCK_COMPARE_REPORT_BUSINESS,
};

export function getMockCompareReportButton(
  tier: CompareReportButtonTier = "business",
  overrides?: Partial<MockCompareReportButton>,
): MockCompareReportButton {
  return { ...MOCK_COMPARE_REPORT_BY_TIER[tier], ...overrides };
}

export function getMockComparePeers(
  excludeAuditId?: string,
): MockComparePeerAudit[] {
  if (!excludeAuditId) return MOCK_COMPARE_PEER_AUDITS;
  return MOCK_COMPARE_PEER_AUDITS.filter((p) => p.auditId !== excludeAuditId);
}
