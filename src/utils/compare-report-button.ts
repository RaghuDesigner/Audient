/**
 * COMPONENT-032 — Compare Report Button helpers.
 * Visibility, state resolution, a11y labels — no React / no API.
 */

import {
  COMPARE_REPORT_BUTTON_COPY,
  type CompareReportButtonState,
  type CompareReportButtonTier,
  type CompareReportButtonVariant,
} from "@/config/compare-report-button";

/** Guest: parent must not mount. Free+: render (locked or enabled). */
export function shouldRenderCompareReportButton(
  tier: CompareReportButtonTier,
): boolean {
  return tier !== "guest";
}

export function canCompareReports(tier: CompareReportButtonTier): boolean {
  return tier === "business";
}

export function isCompareReportLocked(tier: CompareReportButtonTier): boolean {
  return tier === "free" || tier === "pro";
}

/**
 * Resolve UI state from tier + readiness + optional controlled state.
 * Locked takes precedence over idle compare for Free/Pro.
 */
export function resolveCompareReportButtonState(input: {
  tier: CompareReportButtonTier;
  compareReady?: boolean;
  state?: CompareReportButtonState;
}): CompareReportButtonState {
  if (!shouldRenderCompareReportButton(input.tier)) {
    return "disabled";
  }

  if (isCompareReportLocked(input.tier)) {
    return "locked";
  }

  const compareReady = input.compareReady ?? true;
  if (!compareReady) {
    return "disabled";
  }

  const state = input.state ?? "default";
  if (state === "loading" || state === "default" || state === "disabled") {
    return state;
  }

  return "default";
}

export type CompareReportClickIntent = "compare" | "upgrade" | "none";

export function resolveCompareReportClickIntent(
  state: CompareReportButtonState,
): CompareReportClickIntent {
  if (state === "locked") return "upgrade";
  if (state === "default") return "compare";
  return "none";
}

export function compareReportButtonLabel(input: {
  state: CompareReportButtonState;
  label?: string;
}): string {
  if (input.state === "loading") {
    return COMPARE_REPORT_BUTTON_COPY.loadingLabel;
  }
  return input.label ?? COMPARE_REPORT_BUTTON_COPY.label;
}

export function compareReportButtonAccessibleName(input: {
  state: CompareReportButtonState;
  label?: string;
  variant?: CompareReportButtonVariant;
}): string {
  if (input.state === "locked") {
    return COMPARE_REPORT_BUTTON_COPY.lockedAria;
  }
  if (input.state === "disabled") {
    return COMPARE_REPORT_BUTTON_COPY.disabledAria;
  }
  if (input.state === "loading") {
    return COMPARE_REPORT_BUTTON_COPY.loadingLabel;
  }
  return compareReportButtonLabel({
    state: input.state,
    label: input.label,
  });
}

export function compareReportButtonTooltip(input: {
  state: CompareReportButtonState;
  tooltip?: string;
}): string {
  if (input.state === "locked") {
    return COMPARE_REPORT_BUTTON_COPY.lockedTooltip;
  }
  if (input.state === "disabled") {
    return COMPARE_REPORT_BUTTON_COPY.disabledTooltip;
  }
  return input.tooltip ?? COMPARE_REPORT_BUTTON_COPY.tooltip;
}

export function isCompareReportButtonInteractive(
  state: CompareReportButtonState,
): boolean {
  return state === "default" || state === "locked";
}
