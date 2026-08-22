/**
 * COMPONENT-031 — Share Report Modal helpers.
 * Tier options, mock URLs, validation — no React / no API.
 */

import {
  SHARE_REPORT_MOCK_URL_PREFIX,
  SHARE_REPORT_MODAL_COPY,
  SHARE_REPORT_PERMISSION_LABELS,
  SHARE_REPORT_PERMISSIONS,
  SHARE_REPORT_SHARE_OPTION_LABELS,
  SHARE_REPORT_SHARE_OPTIONS,
  type ShareReportModalState,
  type ShareReportModalTier,
  type ShareReportPermission,
  type ShareReportShareOption,
} from "@/config/share-report-modal";

export type ShareReportOptionAvailability = {
  option: ShareReportShareOption;
  visible: boolean;
  enabled: boolean;
  label: string;
  hint: string | null;
};

export type ShareReportPermissionAvailability = {
  permission: ShareReportPermission;
  visible: boolean;
  enabled: boolean;
  label: string;
  hint: string | null;
};

/** Options available by membership (Guest never opens modal). */
export function resolveShareReportOptions(
  tier: ShareReportModalTier,
): ShareReportOptionAvailability[] {
  return SHARE_REPORT_SHARE_OPTIONS.map((option) => {
    const label = SHARE_REPORT_SHARE_OPTION_LABELS[option];
    if (option === "link") {
      return { option, visible: true, enabled: true, label, hint: null };
    }
    if (option === "email") {
      const enabled = tier === "pro" || tier === "business";
      return {
        option,
        visible: enabled,
        enabled,
        label,
        hint: enabled ? null : SHARE_REPORT_MODAL_COPY.comingSoon,
      };
    }
    if (option === "organization") {
      const visible = tier === "business";
      return {
        option,
        visible,
        enabled: false,
        label,
        hint: visible ? SHARE_REPORT_MODAL_COPY.orgHint : null,
      };
    }
    const visible = tier === "business";
    return {
      option,
      visible,
      enabled: false,
      label,
      hint: visible ? SHARE_REPORT_MODAL_COPY.teamHint : null,
    };
  });
}

/** Permission radios — Free: view only; Pro: view (+ comment stub); Business: all. */
export function resolveShareReportPermissions(
  tier: ShareReportModalTier,
): ShareReportPermissionAvailability[] {
  return SHARE_REPORT_PERMISSIONS.map((permission) => {
    const label = SHARE_REPORT_PERMISSION_LABELS[permission];
    if (permission === "view") {
      return { permission, visible: true, enabled: true, label, hint: null };
    }
    if (permission === "comment") {
      if (tier === "free") {
        return {
          permission,
          visible: false,
          enabled: false,
          label,
          hint: null,
        };
      }
      return {
        permission,
        visible: true,
        enabled: false,
        label,
        hint: SHARE_REPORT_MODAL_COPY.commentHint,
      };
    }
    if (tier !== "business") {
      return {
        permission,
        visible: false,
        enabled: false,
        label,
        hint: null,
      };
    }
    return {
      permission,
      visible: true,
      enabled: false,
      label,
      hint: SHARE_REPORT_MODAL_COPY.editHint,
    };
  });
}

export function buildMockShareReportUrl(auditId: string): string {
  const safe = encodeURIComponent(auditId.trim() || "unknown");
  return `${SHARE_REPORT_MOCK_URL_PREFIX}${safe}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidShareEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** Block Esc/backdrop dismiss while generating. */
export function canDismissShareReportModal(
  state: ShareReportModalState,
): boolean {
  return state !== "generating";
}

export function defaultShareReportPermission(
  tier: ShareReportModalTier,
): ShareReportPermission {
  void tier;
  return "view";
}

export function shareReportPermissionLabel(
  permission: ShareReportPermission,
): string {
  return SHARE_REPORT_PERMISSION_LABELS[permission];
}

export function formatShareReportScore(
  score: number | null | undefined,
): string | null {
  if (score == null || !Number.isFinite(score)) return null;
  return String(Math.round(score));
}
