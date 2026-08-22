/**
 * COMPONENT-030 — Export PDF Button constants.
 * Labels, states, tiers — no UI / no PDF generation.
 */

export const EXPORT_PDF_BUTTON_STATES = [
  "default",
  "loading",
  "success",
  "error",
  "disabled",
  "locked",
] as const;

export type ExportPdfButtonState =
  (typeof EXPORT_PDF_BUTTON_STATES)[number];

export const EXPORT_PDF_BUTTON_TIERS = [
  "guest",
  "free",
  "pro",
  "business",
] as const;

export type ExportPdfButtonTier =
  (typeof EXPORT_PDF_BUTTON_TIERS)[number];

export const EXPORT_PDF_BUTTON_SURFACES = [
  "report",
  "compare",
  "shared",
  "history",
] as const;

export type ExportPdfButtonSurface =
  (typeof EXPORT_PDF_BUTTON_SURFACES)[number];

export const EXPORT_PDF_BUTTON_VARIANTS = ["button", "icon"] as const;

export type ExportPdfButtonVariant =
  (typeof EXPORT_PDF_BUTTON_VARIANTS)[number];

export const EXPORT_PDF_BUTTON_COPY = {
  label: "Export PDF",
  tooltip: "Download a professional PDF version of this report.",
  lockedTooltip: "Upgrade to Pro to export PDF",
  lockedAria: "Upgrade to export PDF",
  loadingLabel: "Exporting PDF",
  successLabel: "PDF ready",
  successStatus: "PDF export complete.",
  errorLabel: "Export failed",
  errorDefault: "We couldn’t export this PDF. Please try again.",
  retry: "Retry export",
  disabledPreparing: "Preparing PDF…",
  disabledAria: "Export PDF unavailable. Preparing PDF.",
} as const;

/** Mock progress duration before success placeholder (ms). */
export const EXPORT_PDF_BUTTON_MOCK_DELAY_MS = 1400;

/** Brief success affordance before returning to default (ms). */
export const EXPORT_PDF_BUTTON_SUCCESS_HOLD_MS = 1600;

export const EXPORT_PDF_BUTTON_UPGRADE_SOURCE = "export_pdf";
