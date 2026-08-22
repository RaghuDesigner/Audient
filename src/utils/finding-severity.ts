/**
 * Finding severity — COMPONENT-010.
 * Product labels: Critical · High · Medium · Low.
 */

export const FINDING_SEVERITIES = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

/** Legacy / API aliases mapped into product severities. */
export type FindingSeverityInput =
  | FindingSeverity
  | "major"
  | "minor"
  | "CRITICAL"
  | "MAJOR"
  | "MINOR"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFO";

export const FINDING_SEVERITY_LABELS: Record<FindingSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Token classes — always pair with visible label text. */
export const FINDING_SEVERITY_BADGE: Record<FindingSeverity, string> = {
  critical: "bg-error/15 text-error",
  high: "bg-warning/25 text-foreground",
  medium: "bg-secondary/15 text-secondary",
  low: "bg-muted text-muted-foreground",
};

export function normalizeFindingSeverity(
  value: FindingSeverityInput,
): FindingSeverity {
  const key = value.toLowerCase();
  if (key === "critical") return "critical";
  if (key === "high" || key === "major") return "high";
  if (key === "medium" || key === "minor") return "medium";
  if (key === "low" || key === "info") return "low";
  return "medium";
}
