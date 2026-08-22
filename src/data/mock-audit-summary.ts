/**
 * Phase-1 mock Audit Summary props — COMPONENT-027.
 * State + tier samples for QA; no API.
 */

import type {
  AuditSummaryMembership,
  AuditSummaryState,
  AuditSummaryStatus,
  AuditSummaryTier,
  AuditSummaryType,
  AuditSummaryVariant,
} from "@/config/audit-summary";

const MOCK_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'%3E%3Crect fill='%23e8eef5' width='160' height='120'/%3E%3Ctext x='80' y='64' text-anchor='middle' fill='%23666' font-family='system-ui' font-size='12'%3EPreview%3C/text%3E%3C/svg%3E";

/** Data props for AuditSummary (callbacks omitted). */
export type MockAuditSummary = {
  state: AuditSummaryState;
  auditId: string | null;
  websiteName: string;
  websiteUrl: string | null;
  thumbnailUrl: string | null;
  thumbnailAlt?: string | null;
  auditedAt: string;
  durationSeconds: number | null;
  auditType: AuditSummaryType;
  membershipUsed: AuditSummaryMembership | null;
  aiEngineVersion: string | null;
  status: AuditSummaryStatus;
  /** Current user tier — gates Share / PDF / Compare. */
  tier: AuditSummaryTier;
  pdfAvailable: boolean;
  variant?: AuditSummaryVariant;
};

/** Completed Pro report — aligns with SCREEN-010 Acme mock id. */
export const MOCK_AUDIT_SUMMARY_COMPLETED: MockAuditSummary = {
  state: "completed",
  auditId: "audit-report-acme-1",
  websiteName: "acme.studio",
  websiteUrl: "https://acme.studio/pricing",
  thumbnailUrl: MOCK_THUMB,
  thumbnailAlt: "Screenshot preview of acme.studio",
  auditedAt: "2026-07-28T14:20:00.000Z",
  durationSeconds: 84,
  auditType: "url",
  membershipUsed: "pro",
  aiEngineVersion: "audient-ux-v1.4.2",
  status: "completed",
  tier: "pro",
  pdfAvailable: true,
  variant: "report",
};

export const MOCK_AUDIT_SUMMARY_PROCESSING: MockAuditSummary = {
  state: "processing",
  auditId: "audit-summary-processing-1",
  websiteName: "northwind.app",
  websiteUrl: "https://northwind.app",
  thumbnailUrl: null,
  auditedAt: "2026-08-02T09:05:00.000Z",
  durationSeconds: 42,
  auditType: "url",
  membershipUsed: "free",
  aiEngineVersion: "audient-ux-v1.4.2",
  status: "processing",
  tier: "free",
  pdfAvailable: false,
  variant: "report",
};

export const MOCK_AUDIT_SUMMARY_FAILED: MockAuditSummary = {
  state: "failed",
  auditId: "audit-summary-failed-1",
  websiteName: "broken.example",
  websiteUrl: "https://broken.example/home",
  thumbnailUrl: null,
  auditedAt: "2026-07-30T18:40:00.000Z",
  durationSeconds: 12,
  auditType: "screenshot",
  membershipUsed: "free",
  aiEngineVersion: null,
  status: "failed",
  tier: "free",
  pdfAvailable: false,
  variant: "report",
};

export const MOCK_AUDIT_SUMMARY_LOADING: MockAuditSummary = {
  state: "loading",
  auditId: null,
  websiteName: "",
  websiteUrl: null,
  thumbnailUrl: null,
  auditedAt: "",
  durationSeconds: null,
  auditType: "url",
  membershipUsed: null,
  aiEngineVersion: null,
  status: "completed",
  tier: "pro",
  pdfAvailable: false,
  variant: "report",
};

/** Metadata load failure — no fake id/url. */
export const MOCK_AUDIT_SUMMARY_ERROR: MockAuditSummary = {
  state: "error",
  auditId: null,
  websiteName: "",
  websiteUrl: null,
  thumbnailUrl: null,
  auditedAt: "",
  durationSeconds: null,
  auditType: "url",
  membershipUsed: null,
  aiEngineVersion: null,
  status: "failed",
  tier: "pro",
  pdfAvailable: false,
  variant: "report",
};

export const MOCK_AUDIT_SUMMARY_BUSINESS: MockAuditSummary = {
  ...MOCK_AUDIT_SUMMARY_COMPLETED,
  auditId: "audit-summary-business-1",
  membershipUsed: "business",
  tier: "business",
  pdfAvailable: true,
};

export const MOCK_AUDIT_SUMMARY_GUEST: MockAuditSummary = {
  ...MOCK_AUDIT_SUMMARY_COMPLETED,
  auditId: "audit-summary-guest-1",
  membershipUsed: "free",
  tier: "guest",
  pdfAvailable: false,
};

export const MOCK_AUDIT_SUMMARY_BY_STATE: Record<
  AuditSummaryState,
  MockAuditSummary
> = {
  loading: MOCK_AUDIT_SUMMARY_LOADING,
  completed: MOCK_AUDIT_SUMMARY_COMPLETED,
  processing: MOCK_AUDIT_SUMMARY_PROCESSING,
  failed: MOCK_AUDIT_SUMMARY_FAILED,
  error: MOCK_AUDIT_SUMMARY_ERROR,
};

export function getMockAuditSummary(
  state: AuditSummaryState = "completed",
  overrides?: Partial<MockAuditSummary>,
): MockAuditSummary {
  return { ...MOCK_AUDIT_SUMMARY_BY_STATE[state], ...overrides };
}
