import type { AiFinding } from "@/lib/ai/schema";
import type { AiAuditResultNormalized } from "@/lib/ai/schema";
import { calibrateFindingSeverity } from "@/lib/ai/principles";

const SEVERITY_PENALTY: Record<AiFinding["severity"], number> = {
  CRITICAL: 18,
  HIGH: 12,
  MEDIUM: 7,
  LOW: 3,
  INFO: 1,
};

function effectiveSeverity(finding: AiFinding): AiFinding["severity"] {
  return calibrateFindingSeverity(finding);
}

/**
 * Deterministic overall score from AI findings (0–100).
 * Uses calibrated severity — BACKEND-011.
 */
export function computeOverallScoreFromFindings(
  findings: readonly AiFinding[],
): number {
  if (findings.length === 0) return 0;
  let score = 100;
  for (const finding of findings) {
    score -= SEVERITY_PENALTY[effectiveSeverity(finding)] ?? 5;
  }
  return clampScore(score);
}

/**
 * Resolve overall score for persistence.
 * Prefer deterministic findings-based score; fall back to model overall_score.
 */
export function resolveOverallScore(result: AiAuditResultNormalized): number {
  const fromFindings = computeOverallScoreFromFindings(result.findings);
  if (result.findings.length > 0) return fromFindings;
  return clampScore(result.overallScore);
}

export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}
