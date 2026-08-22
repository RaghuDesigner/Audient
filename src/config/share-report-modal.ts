/**
 * COMPONENT-031 — Share Report Modal constants.
 * Options, permissions, copy — no UI / no real share backend.
 */

export const SHARE_REPORT_MODAL_STATES = [
  "default",
  "generating",
  "link_generated",
  "copied",
  "error",
] as const;

export type ShareReportModalState =
  (typeof SHARE_REPORT_MODAL_STATES)[number];

/** Guest never opens this modal. */
export const SHARE_REPORT_MODAL_TIERS = ["free", "pro", "business"] as const;

export type ShareReportModalTier =
  (typeof SHARE_REPORT_MODAL_TIERS)[number];

export const SHARE_REPORT_SHARE_OPTIONS = [
  "link",
  "email",
  "organization",
  "team",
] as const;

export type ShareReportShareOption =
  (typeof SHARE_REPORT_SHARE_OPTIONS)[number];

export const SHARE_REPORT_SHARE_OPTION_LABELS: Record<
  ShareReportShareOption,
  string
> = {
  link: "Copy link",
  email: "Email",
  organization: "Organization",
  team: "Team members",
};

export const SHARE_REPORT_PERMISSIONS = ["view", "comment", "edit"] as const;

export type ShareReportPermission =
  (typeof SHARE_REPORT_PERMISSIONS)[number];

export const SHARE_REPORT_PERMISSION_LABELS: Record<
  ShareReportPermission,
  string
> = {
  view: "View only",
  comment: "Comment",
  edit: "Edit",
};

export const SHARE_REPORT_MODAL_COPY = {
  title: "Share report",
  close: "Close",
  cancel: "Cancel",
  done: "Done",
  generateLink: "Generate link",
  generatingLink: "Generating link…",
  copyLink: "Copy link",
  copied: "Link copied",
  copiedStatus: "Link copied to clipboard.",
  sendEmail: "Send",
  shareOrg: "Share with organization",
  shareTeam: "Share with team",
  comingSoon: "Coming soon",
  permissionLegend: "Permission",
  shareOptionsLegend: "Share options",
  reportInfo: "Report details",
  linkLabel: "Share link",
  emailLabel: "Email address",
  emailPlaceholder: "name@company.com",
  emailInvalid: "Enter a valid email address.",
  orgHint: "Organization sharing is coming soon.",
  teamHint: "Team member sharing is coming soon.",
  commentHint: "Comments coming soon",
  editHint: "Edit collaboration coming soon",
  errorDefault: "We couldn’t complete this share action. Please try again.",
  retry: "Retry",
  scoreLabel: "Score",
} as const;

/** Mock delay before a fake share URL appears (ms). */
export const SHARE_REPORT_MODAL_GENERATE_DELAY_MS = 900;

/** Brief “Copied” confirmation hold (ms). */
export const SHARE_REPORT_MODAL_COPIED_HOLD_MS = 1600;

/**
 * Mock-only host — must not unlock production data.
 * Real share requires SECURITY.md token/expiry/revocation.
 */
export const SHARE_REPORT_MOCK_URL_PREFIX =
  "https://app.audient.example/share/mock-";
