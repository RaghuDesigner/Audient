import "server-only";

import type { AiFinding, AiAuditResultNormalized, AiRecommendation } from "@/lib/ai/schema";
import {
  AI_CONFIDENCE_LEVELS,
  AI_EVIDENCE_TYPES,
  AI_SEVERITIES,
} from "@/lib/ai/schema";
import { confidenceLevelToUi } from "@/utils/ai-confidence";
import { enforceEvidenceClassification } from "@/utils/audit-evidence-enforcement";
import { redactSensitiveText } from "@/utils/audit-text-safety";

export { AI_EVIDENCE_TYPES, AI_CONFIDENCE_LEVELS };
export type AiEvidenceType = (typeof AI_EVIDENCE_TYPES)[number];
export type AiConfidenceLevel = (typeof AI_CONFIDENCE_LEVELS)[number];

export type NormalizeAuditOptions = {
  inputType?: "SCREENSHOT" | "URL";
};

const SEVERITY_RANK: Record<(typeof AI_SEVERITIES)[number], number> = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  INFO: 1,
};

/**
 * Calibrate severity so unverified/low-confidence findings are not overstated.
 */
export function calibrateFindingSeverity(finding: AiFinding): AiFinding["severity"] {
  const current = finding.severity;
  let maxRank = SEVERITY_RANK[current];

  if (finding.evidence_type === "UNVERIFIED") {
    maxRank = Math.min(maxRank, SEVERITY_RANK.MEDIUM);
  }
  if (finding.evidence_type === "INFERRED" && finding.confidence === "LOW") {
    maxRank = Math.min(maxRank, SEVERITY_RANK.MEDIUM);
  }
  if (finding.confidence === "LOW") {
    maxRank = Math.min(maxRank, SEVERITY_RANK.MEDIUM);
  }

  const capped = AI_SEVERITIES.find((s) => SEVERITY_RANK[s] === maxRank);
  return capped ?? current;
}

function normalizeTitleKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function dedupeKey(finding: AiFinding): string {
  return `${finding.category}:${normalizeTitleKey(finding.title)}`;
}

/**
 * Merge duplicate findings that describe the same underlying issue.
 * Keeps the higher-severity entry.
 */
export function dedupeFindings(findings: AiFinding[]): AiFinding[] {
  const byKey = new Map<string, AiFinding>();
  for (const finding of findings) {
    const key = dedupeKey(finding);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, finding);
      continue;
    }
    if (SEVERITY_RANK[finding.severity] > SEVERITY_RANK[existing.severity]) {
      byKey.set(key, finding);
    }
  }
  return [...byKey.values()];
}

function sanitizeFinding(
  finding: AiFinding,
  options: NormalizeAuditOptions,
): AiFinding {
  const inputType = options.inputType ?? "SCREENSHOT";
  const enforced = enforceEvidenceClassification(finding, { inputType });
  const redacted: AiFinding = {
    ...enforced,
    title: redactSensitiveText(enforced.title, 200) ?? enforced.title.trim().slice(0, 200),
    description:
      redactSensitiveText(enforced.description, 2000) ??
      enforced.description.trim().slice(0, 2000),
    user_impact:
      redactSensitiveText(enforced.user_impact, 1000) ??
      enforced.user_impact.trim().slice(0, 1000),
    evidence: redactSensitiveText(enforced.evidence, 1000),
    severity: calibrateFindingSeverity(enforced),
  };
  return redacted;
}

function sanitizeRecommendation(rec: AiRecommendation): AiRecommendation {
  return {
    ...rec,
    title: redactSensitiveText(rec.title, 200) ?? rec.title.trim().slice(0, 200),
    description:
      redactSensitiveText(rec.description, 2000) ??
      rec.description.trim().slice(0, 2000),
    expectedImprovement:
      redactSensitiveText(rec.expectedImprovement, 1000) ??
      rec.expectedImprovement.trim().slice(0, 1000),
  };
}

/** @deprecated Use redactSensitiveText from audit-text-safety */
export function redactSensitiveEvidence(text: string | null | undefined): string | null {
  return redactSensitiveText(text, 1000);
}

/**
 * Apply BACKEND-011 normalization after schema validation.
 */
export function normalizeAiAuditResult(
  data: AiAuditResultNormalized,
  options: NormalizeAuditOptions = {},
): AiAuditResultNormalized {
  const findings = dedupeFindings(
    data.findings.map((f) => sanitizeFinding(f, options)),
  );
  const recommendations = data.recommendations.map(sanitizeRecommendation);
  return {
    ...data,
    summary: redactSensitiveText(data.summary, 4000) ?? data.summary.trim().slice(0, 4000),
    findings,
    recommendations,
  };
}

export function confidenceToUi(
  level: AiConfidenceLevel,
): "high" | "medium" | "low" {
  return confidenceLevelToUi(level) ?? "medium";
}
