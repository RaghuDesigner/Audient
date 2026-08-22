/**
 * Phase-1 mock Export PDF Button props — COMPONENT-030.
 * Tier / readiness samples for QA; no real PDF generation.
 */

import type {
  ExportPdfButtonState,
  ExportPdfButtonSurface,
  ExportPdfButtonTier,
  ExportPdfButtonVariant,
} from "@/config/export-pdf-button";

/** Data props for ExportPdfButton (callbacks omitted). */
export type MockExportPdfButton = {
  auditId: string;
  tier: ExportPdfButtonTier;
  state: ExportPdfButtonState;
  pdfReady: boolean;
  surface: ExportPdfButtonSurface;
  variant: ExportPdfButtonVariant;
  errorMessage?: string | null;
};

export const MOCK_EXPORT_PDF_PRO_READY: MockExportPdfButton = {
  auditId: "audit-report-acme-1",
  tier: "pro",
  state: "default",
  pdfReady: true,
  surface: "report",
  variant: "button",
};

export const MOCK_EXPORT_PDF_BUSINESS: MockExportPdfButton = {
  auditId: "audit-report-acme-1",
  tier: "business",
  state: "default",
  pdfReady: true,
  surface: "report",
  variant: "button",
};

export const MOCK_EXPORT_PDF_FREE_LOCKED: MockExportPdfButton = {
  auditId: "audit-report-acme-1",
  tier: "free",
  state: "locked",
  pdfReady: true,
  surface: "report",
  variant: "button",
};

/** Guest — parent should not mount; fixture for docs/QA only. */
export const MOCK_EXPORT_PDF_GUEST_HIDDEN: MockExportPdfButton = {
  auditId: "audit-report-acme-1",
  tier: "guest",
  state: "disabled",
  pdfReady: false,
  surface: "report",
  variant: "button",
};

export const MOCK_EXPORT_PDF_PREPARING: MockExportPdfButton = {
  auditId: "audit-report-acme-1",
  tier: "pro",
  state: "disabled",
  pdfReady: false,
  surface: "report",
  variant: "button",
};

export const MOCK_EXPORT_PDF_LOADING: MockExportPdfButton = {
  auditId: "audit-report-acme-1",
  tier: "pro",
  state: "loading",
  pdfReady: true,
  surface: "report",
  variant: "button",
};

export const MOCK_EXPORT_PDF_SUCCESS: MockExportPdfButton = {
  auditId: "audit-report-acme-1",
  tier: "pro",
  state: "success",
  pdfReady: true,
  surface: "report",
  variant: "button",
};

export const MOCK_EXPORT_PDF_ERROR: MockExportPdfButton = {
  auditId: "audit-report-acme-1",
  tier: "pro",
  state: "error",
  pdfReady: true,
  surface: "report",
  variant: "button",
  errorMessage: "Mock export failed. Retry to try again.",
};

export const MOCK_EXPORT_PDF_HISTORY_ICON: MockExportPdfButton = {
  auditId: "hist-completed-1",
  tier: "pro",
  state: "default",
  pdfReady: true,
  surface: "history",
  variant: "icon",
};

export const MOCK_EXPORT_PDF_BY_TIER: Record<
  ExportPdfButtonTier,
  MockExportPdfButton
> = {
  guest: MOCK_EXPORT_PDF_GUEST_HIDDEN,
  free: MOCK_EXPORT_PDF_FREE_LOCKED,
  pro: MOCK_EXPORT_PDF_PRO_READY,
  business: MOCK_EXPORT_PDF_BUSINESS,
};

export function getMockExportPdfButton(
  tier: ExportPdfButtonTier = "pro",
  overrides?: Partial<MockExportPdfButton>,
): MockExportPdfButton {
  return { ...MOCK_EXPORT_PDF_BY_TIER[tier], ...overrides };
}
