/**
 * BACKEND-011 — deterministic evidence classification enforcement.
 * Prevents OBSERVED findings from smuggling unverified behavioral/responsive claims.
 */

export const AI_EVIDENCE_TYPE_VALUES = [
  "OBSERVED",
  "INFERRED",
  "UNVERIFIED",
] as const;

export type AuditEvidenceType = (typeof AI_EVIDENCE_TYPE_VALUES)[number];

export type AuditConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export type EvidenceEnforcementFinding = {
  title: string;
  description: string;
  user_impact: string;
  category: string;
  evidence_type: AuditEvidenceType;
  confidence: AuditConfidenceLevel;
};

export type EvidenceEnforcementContext = {
  inputType: "SCREENSHOT" | "URL";
};

const EVIDENCE_RANK: Record<AuditEvidenceType, number> = {
  OBSERVED: 3,
  INFERRED: 2,
  UNVERIFIED: 1,
};

/** Definitive behavioral / live-interaction language. */
const BEHAVIORAL_CLAIM_PATTERNS = [
  /\b(does not|doesn't|do not|don't)\s+(work|submit|load|respond|redirect)\b/i,
  /\b(when|on)\s+(clicked|tap(ped)?|submitted|hover(ed)?)\b/i,
  /\b(works correctly|successfully submits|returns a \d{3})\b/i,
  /\b(api|backend|server|database)\s+(returns|responds|fails|errors)\b/i,
  /\b(authenticated|login succeeds|session expires)\b/i,
  /\bform submits\b/i,
  /\blink (resolves|redirects|returns)\b/i,
  /\bpage loads in\b/i,
];

/** Responsive claims that need multiple viewports or live resize. */
const RESPONSIVE_DEFINITIVE_PATTERNS = [
  /\bmobile (is|layout is) (broken|unusable|fails)\b/i,
  /\bdesktop (is|layout is) (broken|unusable)\b/i,
  /\bat (smaller|larger) viewports\b/i,
  /\bon (mobile|tablet|phone)\s+(the|this)\s+(page|layout|site)\b/i,
  /\bresponsive (layout )?(is broken|fails|does not work)\b/i,
];

/** Technical link/security verification beyond visible labeling. */
const LINK_TECHNICAL_PATTERNS = [
  /\b(destination is safe|link is safe|trusted host)\b/i,
  /\bhttps (is|was) verified\b/i,
  /\bopen redirect\b/i,
  /\bauthorization (token|header)\b/i,
  /\bredirect(s)? to (https?:\/\/|\w+\.)\b/i,
];

function findingText(finding: EvidenceEnforcementFinding): string {
  return `${finding.title} ${finding.description} ${finding.user_impact}`;
}

function downgradeEvidenceType(
  current: AuditEvidenceType,
  minimum: AuditEvidenceType,
): AuditEvidenceType {
  return EVIDENCE_RANK[current] > EVIDENCE_RANK[minimum] ? minimum : current;
}

function downgradeConfidence(
  current: AuditConfidenceLevel,
): AuditConfidenceLevel {
  if (current === "HIGH") return "MEDIUM";
  if (current === "MEDIUM") return "LOW";
  return "LOW";
}

function hasPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

/**
 * Downgrade evidence_type when claim language exceeds what the input supports.
 * Does not upgrade UNVERIFIED/INFERRED to OBSERVED.
 */
export function enforceEvidenceClassification<T extends EvidenceEnforcementFinding>(
  finding: T,
  context: EvidenceEnforcementContext,
): T {
  let evidence_type = finding.evidence_type;
  let confidence = finding.confidence;
  const text = findingText(finding);

  const behavioral = hasPattern(text, BEHAVIORAL_CLAIM_PATTERNS);
  const responsiveDefinitive = hasPattern(text, RESPONSIVE_DEFINITIVE_PATTERNS);
  const linkTechnical = hasPattern(text, LINK_TECHNICAL_PATTERNS);
  const screenshotResponsiveCategory =
    context.inputType === "SCREENSHOT" &&
    finding.category === "MOBILE_RESPONSIVENESS";

  if (behavioral) {
    evidence_type = "UNVERIFIED";
    confidence = downgradeConfidence(confidence);
  }

  if (context.inputType === "SCREENSHOT") {
    if (screenshotResponsiveCategory && evidence_type === "OBSERVED") {
      evidence_type = downgradeEvidenceType(evidence_type, "INFERRED");
    }
    if (responsiveDefinitive) {
      evidence_type = downgradeEvidenceType(evidence_type, "UNVERIFIED");
      confidence = downgradeConfidence(confidence);
    }
  }

  if (linkTechnical) {
    evidence_type = downgradeEvidenceType(evidence_type, "UNVERIFIED");
    if (context.inputType === "SCREENSHOT") {
      confidence = downgradeConfidence(confidence);
    }
  }

  if (
    evidence_type === "INFERRED" &&
    behavioral &&
    EVIDENCE_RANK[evidence_type] > EVIDENCE_RANK.UNVERIFIED
  ) {
    evidence_type = "UNVERIFIED";
  }

  if (evidence_type === "UNVERIFIED" && confidence === "HIGH" && behavioral) {
    confidence = "MEDIUM";
  }

  if (evidence_type !== finding.evidence_type || confidence !== finding.confidence) {
    return { ...finding, evidence_type, confidence };
  }
  return finding;
}

/** Validate recommendation → finding links; reject out-of-range indices. */
export function validateFindingIndices(
  findingsLength: number,
  recommendations: ReadonlyArray<{ findingIndex?: number | null }>,
): { ok: true } | { ok: false; error: string } {
  for (let i = 0; i < recommendations.length; i++) {
    const idx = recommendations[i]?.findingIndex;
    if (typeof idx !== "number") continue;
    if (!Number.isInteger(idx) || idx < 0 || idx >= findingsLength) {
      return {
        ok: false,
        error: `findingIndex ${idx} out of bounds (findings length ${findingsLength})`,
      };
    }
  }
  return { ok: true };
}
