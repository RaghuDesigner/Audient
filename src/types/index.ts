/**
 * Shared domain types for Audient.
 * These mirror the database enums (see docs/TECHNICAL_ARCHITECTURE.md §5.2).
 * Generated Supabase/Prisma types can be re-exported from here as they land.
 */

export type Role = "USER" | "ADMIN";

export type Tier = "FREE" | "PRO" | "AGENCY";

export type MembershipStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";

export type AuditInputType = "SCREENSHOT" | "URL";

export type AuditStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type Severity = "CRITICAL" | "MAJOR" | "MINOR";

export type IssueCategory =
  | "NAVIGATION"
  | "CTA"
  | "VISUAL_HIERARCHY"
  | "MOBILE_RESPONSIVENESS"
  | "COPY_MESSAGING"
  | "TRUST_SIGNALS"
  | "PAGE_SPEED"
  | "ACCESSIBILITY"
  | "CONVERSION_FLOW";
