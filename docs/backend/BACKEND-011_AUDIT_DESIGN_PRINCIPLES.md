# AUDIENT — BACKEND-011
# AUDIT DESIGN PRINCIPLES & EVIDENCE QUALITY

**Status:** Implemented  
**Depends on:** BACKEND-006 (AI audit engine), BACKEND-004–010  
**Out of scope:** AI provider swap, new audit platform, BACKEND-012

---

## What landed

### Principles module
- `src/lib/ai/principles.ts` — evidence normalization after schema validation:
  - `redactSensitiveEvidence` — strips API keys, Bearer tokens, JWTs from evidence
  - `calibrateFindingSeverity` — caps UNVERIFIED / low-confidence findings at MEDIUM
  - `dedupeFindings` — merges duplicate titles (keeps higher severity)
  - `normalizeAiAuditResult` — trim limits, redact, calibrate, dedupe

### Schema & prompts
- `src/lib/ai/schema.ts` — required finding fields:
  - `evidence_type`: `OBSERVED` | `INFERRED` | `UNVERIFIED`
  - `confidence`: `HIGH` | `MEDIUM` | `LOW`
  - `user_impact`: why the issue matters
- `src/lib/ai/prompts.ts` — system prompt enforces evidence-before-inference, screenshot/URL boundaries, severity calibration, prompt-injection resistance, and actionable recommendations

### Pipeline integration
- `src/lib/ai/client.ts` — `normalizeAiAuditResult()` after Zod parse
- `src/lib/ai/score.ts` — scoring uses calibrated severity
- `src/services/report/persist-ai-result.ts` — `user_impact` → `business_impact`; `report_json.principles = "BACKEND-011"`
- `src/services/report/foundation.ts` — reads new fields from stored JSON (backward compatible)
- `src/types/audit.ts` — optional `evidenceType`, `confidence`, `userImpact`
- `src/utils/ai-confidence.ts` + `src/utils/ai-report-map.ts` — maps confidence to UI

### Hardening (post review)
- `src/utils/audit-evidence-enforcement.ts` — downgrade OBSERVED claims with behavioral/responsive/link language
- `src/utils/audit-text-safety.ts` — redact secrets across all persisted text fields
- `normalizeAiAuditResult({ inputType })` — input-aware enforcement
- `validateFindingIndices()` — reject OOB `findingIndex` at parse time
- Report UI — `evidence_type`, confidence, `user_impact` on finding cards
- `ai-report-map` — links recommendations via `findingIndex`

- `scripts/verify-ai-engine.mjs` — updated for BACKEND-011 finding shape
- `scripts/verify-audit-principles.mjs` — offline severity/dedupe/redaction/confidence tests
- `npm run verify:audit-principles`

---

## Core rules (enforced)

1. **Evidence before inference** — OBSERVED vs INFERRED vs UNVERIFIED on every finding
2. **Screenshot-only limits** — no claims about live behavior, other viewports, or backend/API without verification
3. **URL safety** — visual/UX vs technical verification separated; no blind external link following
4. **Severity calibration** — UNVERIFIED and low-confidence findings cannot stay CRITICAL/HIGH
5. **Confidence** — reflects evidence quality; surfaced in report UI where available
6. **Actionability** — every non-informational finding requires `user_impact` + recommendation
7. **Dedupe** — same-title findings merged
8. **Privacy/security** — secrets redacted; sensitive evidence summarized
9. **Prompt injection** — untrusted content in images/URLs treated as data, not instructions
10. **Output validation** — Zod schema + normalization; never trust raw AI JSON

---

## Finding shape (AI → persistence)

```json
{
  "title": "Low CTA contrast",
  "description": "Primary button appears below WCAG AA contrast.",
  "severity": "HIGH",
  "category": "ACCESSIBILITY",
  "evidence": "Hero CTA button, top-right",
  "evidence_type": "OBSERVED",
  "confidence": "HIGH",
  "user_impact": "Users may miss the primary action."
}
```

---

## Verification commands

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:ai
npm run verify:audit-principles
npm run verify:hardening
```

---

## Notes

- No DB migration — new fields live in `reports.report_json.findings[]`
- Older reports without `evidence_type` / `confidence` / `user_impact` still render (fields optional in API types)
- Existing BACKEND-006 engine, credits, notifications, and hardening behavior unchanged

**BACKEND-011 COMPLETE**
