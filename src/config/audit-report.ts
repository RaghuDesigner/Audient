/**
 * SCREEN-010 / M02 — Audit Report constants.
 * Tier visibility, gates, and copy — no UI / no API.
 */

export const AUDIT_REPORT_TIERS = [
  "guest",
  "free",
  "pro",
  "business",
] as const;

export type AuditReportTier = (typeof AUDIT_REPORT_TIERS)[number];

export const AUDIT_REPORT_STATES = [
  "loading",
  "completed",
  "empty",
  "error",
] as const;

export type AuditReportState = (typeof AUDIT_REPORT_STATES)[number];

/** Section headings — SCREEN-010 §3–4. */
export const AUDIT_REPORT_SECTION_TITLES = {
  summary: "Audit summary",
  overall: "Overall score",
  categories: "Category scores",
  findings: "Key findings",
  strengths: "Strengths",
  recommendations: "Recommendations",
} as const;

/**
 * How many items each tier may see unlocked in the mock UI.
 * Remainder uses Locked Card teasers — do not ship full Pro JSON to Guest/Free.
 */
export const AUDIT_REPORT_TIER_LIMITS: Record<
  AuditReportTier,
  {
    findings: number | "all";
    recommendations: number | "all";
    strengths: number | "all";
  }
> = {
  guest: { findings: 3, recommendations: 1, strengths: 2 },
  free: { findings: 5, recommendations: 2, strengths: 3 },
  pro: { findings: "all", recommendations: "all", strengths: "all" },
  business: { findings: "all", recommendations: "all", strengths: "all" },
};

/** Action entitlements (UI gate only in Phase 1). */
export const AUDIT_REPORT_GATES = {
  exportPdf: {
    guest: false,
    free: false,
    pro: true,
    business: true,
  },
  shareReport: {
    guest: false,
    /** COMPONENT-031 — Free: link share (mock) only. */
    free: true,
    pro: true,
    business: true,
  },
  compareReports: {
    guest: false,
    free: false,
    pro: false,
    business: true,
  },
  showUpgradeBanner: {
    guest: true,
    free: true,
    pro: false,
    business: false,
  },
} as const satisfies Record<
  string,
  Record<AuditReportTier, boolean>
>;

export const AUDIT_REPORT_ACTION_LABELS = {
  backToHistory: "Back to History",
  backToDashboard: "Back to Dashboard",
  exportPdf: "Export PDF",
  shareReport: "Share report",
  compareReports: "Compare reports",
  upgradeToUnlockPdf: "Upgrade to unlock PDF",
  comingSoonShare: "Sharing coming soon",
} as const;

export const AUDIT_REPORT_LOCKED_COPY = {
  findings: (count: number) =>
    count === 1
      ? "1 more finding available"
      : `${count} more findings available`,
  recommendations: (count: number) =>
    count === 1
      ? "1 more recommendation available"
      : `${count} more recommendations available`,
  strengths: (count: number) =>
    count === 1
      ? "1 more strength available"
      : `${count} more strengths available`,
} as const;

export const AUDIT_REPORT_EMPTY = {
  headline: "Report not found",
  description:
    "We couldn’t find a completed report for this audit. Return to History or start a new audit.",
  primaryLabel: "View History",
  secondaryLabel: "Start New Audit",
} as const;

export const AUDIT_REPORT_ERROR = {
  headline: "Couldn’t load report",
  description: "Something went wrong loading this audit report. Please try again.",
  primaryLabel: "Retry",
} as const;

/** Upgrade modal sources from report chrome. */
export const AUDIT_REPORT_UPGRADE_SOURCES = {
  banner: "audit_report_banner",
  lockedFindings: "audit_report_locked_findings",
  lockedRecommendations: "audit_report_locked_recommendations",
  lockedStrengths: "audit_report_locked_strengths",
  pdf: "audit_report_pdf",
  share: "audit_report_share",
  compare: "audit_report_compare",
} as const;
