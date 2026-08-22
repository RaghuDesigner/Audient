/**
 * BACKEND-011 audit design principles — offline checks (no OpenAI).
 * Usage: node scripts/verify-audit-principles.mjs
 */

const AI_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
const SEVERITY_RANK = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 };

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

let passed = 0;
function ok(name) {
  passed += 1;
  console.log(`PASS: ${name}`);
}

function redactSensitiveText(text, maxLen = 2000) {
  if (text == null || text.trim() === "") return null;
  let out = text;
  out = out.replace(/sk-[a-zA-Z0-9._-]{10,}/g, "[redacted]");
  out = out.replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "[redacted]");
  out = out.replace(
    /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    "[redacted]",
  );
  return out.trim().slice(0, maxLen);
}

const BEHAVIORAL = [
  /\b(does not|doesn't|do not|don't)\s+(work|submit|load|respond|redirect)\b/i,
  /\b(when|on)\s+(clicked|tap(ped)?|submitted)\b/i,
  /\blink (resolves|redirects|returns)\b/i,
];

const RESPONSIVE = [/\bmobile (is|layout is) (broken|unusable)\b/i];

function hasPattern(text, patterns) {
  return patterns.some((p) => p.test(text));
}

function enforceEvidenceClassification(finding, context) {
  let evidence_type = finding.evidence_type;
  let confidence = finding.confidence;
  const text = `${finding.title} ${finding.description} ${finding.user_impact}`;

  if (hasPattern(text, BEHAVIORAL)) {
    evidence_type = "UNVERIFIED";
    if (confidence === "HIGH") confidence = "MEDIUM";
  }
  if (
    context.inputType === "SCREENSHOT" &&
    finding.category === "MOBILE_RESPONSIVENESS" &&
    evidence_type === "OBSERVED"
  ) {
    evidence_type = "INFERRED";
  }
  if (context.inputType === "SCREENSHOT" && hasPattern(text, RESPONSIVE)) {
    evidence_type = "UNVERIFIED";
  }
  return { ...finding, evidence_type, confidence };
}

function calibrateFindingSeverity(finding) {
  const current = finding.severity;
  let maxRank = SEVERITY_RANK[current];
  if (finding.evidence_type === "UNVERIFIED") {
    maxRank = Math.min(maxRank, SEVERITY_RANK.MEDIUM);
  }
  if (finding.confidence === "LOW") {
    maxRank = Math.min(maxRank, SEVERITY_RANK.MEDIUM);
  }
  return AI_SEVERITIES.find((s) => SEVERITY_RANK[s] === maxRank) ?? current;
}

function validateFindingIndices(findingsLength, recommendations) {
  for (const rec of recommendations) {
    const idx = rec.findingIndex;
    if (typeof idx !== "number") continue;
    if (!Number.isInteger(idx) || idx < 0 || idx >= findingsLength) {
      return { ok: false };
    }
  }
  return { ok: true };
}

function dedupeFindings(findings) {
  const byKey = new Map();
  for (const finding of findings) {
    const key = `${finding.category}:${finding.title.trim().toLowerCase()}`;
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

// OBSERVED behavioral claim → UNVERIFIED
const enforced = enforceEvidenceClassification(
  {
    title: "Submit broken",
    description: "The form does not submit when clicked.",
    user_impact: "Users cannot complete signup.",
    category: "CONVERSION_FLOW",
    evidence_type: "OBSERVED",
    confidence: "HIGH",
    severity: "HIGH",
  },
  { inputType: "SCREENSHOT" },
);
assert(enforced.evidence_type === "UNVERIFIED", "behavioral OBSERVED downgraded");
ok("behavioral claim downgrades OBSERVED to UNVERIFIED");

// Screenshot responsive category
const responsive = enforceEvidenceClassification(
  {
    title: "Mobile nav",
    description: "Navigation appears cramped.",
    user_impact: "Hard to tap items.",
    category: "MOBILE_RESPONSIVENESS",
    evidence_type: "OBSERVED",
    confidence: "HIGH",
    severity: "MEDIUM",
  },
  { inputType: "SCREENSHOT" },
);
assert(responsive.evidence_type === "INFERRED", "screenshot responsive OBSERVED → INFERRED");
ok("screenshot MOBILE_RESPONSIVENESS caps OBSERVED at INFERRED");

assert(
  calibrateFindingSeverity({
    severity: "CRITICAL",
    evidence_type: "UNVERIFIED",
    confidence: "HIGH",
  }) === "MEDIUM",
  "UNVERIFIED caps CRITICAL",
);
ok("UNVERIFIED caps inflated severity");

const redacted = redactSensitiveText("leaked sk-abc1234567890xyz token");
assert(redacted.includes("[redacted]"), "secret redacted");
ok("secrets redacted from text fields");

assert(
  validateFindingIndices(1, [{ findingIndex: 0 }]).ok,
  "valid findingIndex ok",
);
assert(
  !validateFindingIndices(1, [{ findingIndex: 3 }]).ok,
  "OOB findingIndex rejected",
);
ok("findingIndex bounds validation");

const duped = dedupeFindings([
  { title: "Low contrast", category: "ACCESSIBILITY", severity: "MEDIUM" },
  { title: "low contrast", category: "ACCESSIBILITY", severity: "HIGH" },
]);
assert(duped.length === 1 && duped[0].severity === "HIGH", "dedupe by category+title");
ok("duplicate findings merged by category+title");

console.log(`\nverify-audit-principles: ${passed} checks passed.`);
