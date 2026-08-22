/**
 * COMPONENT-030 — Export PDF Button helpers.
 * Visibility, state resolution, a11y labels — no React / no PDF generation.
 */

import {
  EXPORT_PDF_BUTTON_COPY,
  type ExportPdfButtonState,
  type ExportPdfButtonTier,
  type ExportPdfButtonVariant,
} from "@/config/export-pdf-button";

/**
 * Guest: parent must not mount. Free+: render (locked or enabled).
 */
export function shouldRenderExportPdfButton(
  tier: ExportPdfButtonTier,
): boolean {
  return tier !== "guest";
}

export function canExportPdf(tier: ExportPdfButtonTier): boolean {
  return tier === "pro" || tier === "business";
}

export function isExportPdfLocked(tier: ExportPdfButtonTier): boolean {
  return tier === "free";
}

/**
 * Resolve UI state from tier + readiness + optional controlled state.
 * Locked/disabled take precedence over idle export states.
 */
export function resolveExportPdfButtonState(input: {
  tier: ExportPdfButtonTier;
  pdfReady?: boolean;
  state?: ExportPdfButtonState;
}): ExportPdfButtonState {
  if (!shouldRenderExportPdfButton(input.tier)) {
    return "disabled";
  }

  if (isExportPdfLocked(input.tier)) {
    return "locked";
  }

  const pdfReady = input.pdfReady ?? true;
  if (!pdfReady) {
    return "disabled";
  }

  const state = input.state ?? "default";
  if (
    state === "loading" ||
    state === "success" ||
    state === "error" ||
    state === "default"
  ) {
    return state;
  }

  return "default";
}

export type ExportPdfClickIntent = "export" | "upgrade" | "none";

export function resolveExportPdfClickIntent(
  state: ExportPdfButtonState,
): ExportPdfClickIntent {
  if (state === "locked") return "upgrade";
  if (state === "default" || state === "error") return "export";
  return "none";
}

export function exportPdfButtonLabel(input: {
  state: ExportPdfButtonState;
  label?: string;
}): string {
  const base = input.label ?? EXPORT_PDF_BUTTON_COPY.label;
  switch (input.state) {
    case "loading":
      return EXPORT_PDF_BUTTON_COPY.loadingLabel;
    case "success":
      return EXPORT_PDF_BUTTON_COPY.successLabel;
    case "error":
      return EXPORT_PDF_BUTTON_COPY.errorLabel;
    case "disabled":
      return EXPORT_PDF_BUTTON_COPY.disabledPreparing;
    case "locked":
      return base;
    default:
      return base;
  }
}

export function exportPdfButtonAccessibleName(input: {
  state: ExportPdfButtonState;
  label?: string;
  variant?: ExportPdfButtonVariant;
}): string {
  const label = exportPdfButtonLabel({
    state: input.state,
    label: input.label,
  });

  if (input.state === "locked") {
    return EXPORT_PDF_BUTTON_COPY.lockedAria;
  }
  if (input.state === "disabled") {
    return EXPORT_PDF_BUTTON_COPY.disabledAria;
  }
  if (input.state === "loading") {
    return EXPORT_PDF_BUTTON_COPY.loadingLabel;
  }
  if (input.variant === "icon") {
    return label;
  }
  return label;
}

export function exportPdfButtonTooltip(input: {
  state: ExportPdfButtonState;
  tooltip?: string;
}): string {
  if (input.state === "locked") {
    return EXPORT_PDF_BUTTON_COPY.lockedTooltip;
  }
  if (input.state === "disabled") {
    return EXPORT_PDF_BUTTON_COPY.disabledPreparing;
  }
  return input.tooltip ?? EXPORT_PDF_BUTTON_COPY.tooltip;
}

export function isExportPdfButtonInteractive(
  state: ExportPdfButtonState,
): boolean {
  return (
    state === "default" ||
    state === "locked" ||
    state === "error"
  );
}
