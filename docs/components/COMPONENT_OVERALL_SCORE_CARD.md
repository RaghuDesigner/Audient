# COMPONENT-008 — Overall Score Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-008  
**Component name:** Overall Score Card (`OverallScoreCard` / maps to `ScoreCard` overall variant in `COMPONENT_MAPPING.md`)  
**Figma:** Overall score / Score Card · Score Gauge on Results and Completion frames  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/COMPONENT_MAPPING.md` (Score Card / Gauge) · `docs/screens/SCREEN-007_GUEST_AUDIT_RESULTS.md` · `docs/screens/SCREEN-004_AUDIT_COMPLETED.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/prd.md` · `STATE_MANAGEMENT.md` (`RPT-STATE-*`)

---

## 1. Purpose

Display the **overall UX Audit score** after an audit completes.

The component must be **reusable** across:

| Surface | Tier |
|---------|------|
| Guest Results | Limited preview (`SCREEN-007`) |
| Free Results | Brief report |
| Pro Results | Full report |
| Business Results | Full report |

Also reusable on **Audit Completed** interstitial (score preview) and History detail headers when Figma shows the same pattern.

**Do not redesign** per surface — vary **data and state** (loading / locked / density), not layout invention. Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Overall Score** | Integer **0–100** (authoritative score from server / scoring service — computed in code, not by the LLM per architecture) |
| **Letter Grade** | One of: **A+**, **A**, **B**, **C**, **D**, **F** |
| **Score Ring** | Circular gauge reflecting the score (decorative when paired with numeric text) |
| **Short AI Summary** | **2–3 lines** plain-language executive summary |
| **Last Updated** | Timestamp of report readiness / last score computation (localized display) |
| **Audit Type** | **Image** (screenshot) or **URL** (live site) |

Visual hierarchy, spacing, and type: **exact Figma**.

---

## 3. Letter Grade Mapping

Centralize mapping next to score computation (single source of truth). Recommended bands (confirm with product if Figma implies otherwise):

| Score (inclusive) | Grade |
|-------------------|-------|
| 97–100 | A+ |
| 90–96 | A |
| 80–89 | B |
| 70–79 | C |
| 60–69 | D |
| 0–59 | F |

| Rule | Spec |
|------|------|
| Derivation | Grade is derived from score — do not let the model invent a conflicting grade |
| Display | Always show both numeric score and letter grade on Success |
| Color bands | Tokenized per Figma / score-band colors; never color-only meaning |

---

## 4. Reuse by Tier

| Tier | Score + Grade + Ring | AI Summary | Last Updated | Audit Type | Notes |
|------|----------------------|------------|--------------|------------|-------|
| **Guest** | Shown (conversion teaser) | 2–3 lines preview; may use **Locked** for extended summary if Figma gates it | Shown | Shown (typically Image) | Same card chrome; no Pro-only fields invente |
| **Free** | Shown | Brief summary | Shown | Shown | Full card; findings gated elsewhere |
| **Pro** | Shown | Full short summary | Shown | Image or URL | Same component |
| **Business** | Shown | Same as Pro | Shown | Image or URL | Same component |

Do **not** fork four separate score-card designs. Use props/variants for density and locked overlays only.

---

## 5. States

### 5.1 Loading

| Aspect | Spec |
|--------|------|
| When | Report/score fetching |
| UI | Skeleton for ring, score, grade, summary lines, meta row |
| A11y | `aria-busy="true"`; polite “Loading audit score” (or equivalent) |
| Analytics | Optional impression deferred until Success (or fire `score_card_loading` once) |

### 5.2 Success

| Aspect | Spec |
|--------|------|
| When | Score + summary available |
| UI | All display fields populated; ring at final value |
| Motion | Optional ring animate-on; under `prefers-reduced-motion`, snap to final value (`ACCESSIBILITY.md`) |
| SR | Numeric score + grade available immediately (do not wait for animation) |

### 5.3 Error

| Aspect | Spec |
|--------|------|
| When | Score/report failed to load (not audit pipeline FAILED — that is Audit Failed screen) |
| UI | Inline error in card; retry control if recoverable |
| Content | Do not show a fake score |
| A11y | `role="alert"` for error message |

### 5.4 Locked (Guest limitation)

| Aspect | Spec |
|--------|------|
| When | Guest (or Free) limitation requires withholding part of the card per Figma — e.g. summary blurred/locked while score still visible, **or** entire interactive unlock affordance on the card |
| UI | Lock icon + clear “Upgrade to unlock” (or Figma copy); **do not** reveal locked summary text in DOM/accessibility tree |
| Security | Locked copy must not be present in API payload if gated (`SECURITY.md`) |
| Interaction | Activate unlock → Upgrade Modal / Login as parent screen defines |
| Analytics | Locked interaction event |

If Guest Figma shows **full** score + short summary unlocked, Success is used; Locked is still supported for other guest limitation treatments without a new component.

---

## 6. Props (contract — conceptual)

Document for implementers; **no code**.

| Prop | Type / values | Required | Description |
|------|---------------|----------|-------------|
| `score` | 0–100 integer \| null | For Success | Overall UX score |
| `grade` | A+ \| A \| B \| C \| D \| F \| null | Optional | If omitted, derive from `score` via §3 |
| `summary` | string \| null | For Success | AI short summary (2–3 lines) |
| `lastUpdated` | ISO datetime \| null | Recommended | Last updated |
| `auditType` | `image` \| `url` | Recommended | Maps to Image / URL label |
| `state` | `loading` \| `success` \| `error` \| `locked` | Yes | Visual/behavioural state |
| `tier` | `guest` \| `free` \| `pro` \| `business` | Recommended | Analytics + minor copy |
| `size` | `default` \| `compact` | No | Completion interstitial vs full Results (Figma sizes only) |
| `errorMessage` | string | Error | User-facing error |
| `onRetry` | action | Error | Retry load |
| `onUnlock` | action | Locked | Parent opens Upgrade / Login |
| `lockedLabel` | string | Locked | Accessible name for locked region |
| `auditId` | string | Analytics | Impression/interaction context |

Parents supply data; the card does not fetch audits itself (logic stays in services/hooks per project rules).

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Score | Numeric value in **text** — ring is not the only channel |
| Accessible name | e.g. “Overall UX score 72 out of 100, grade B” |
| Summary | Available as text; truncated visually to 2–3 lines with full text in accessible description if clipped |
| Grade | Text letter, not color alone |
| Loading | Busy state announced |
| Error | Alert + focusable retry |
| Locked | Accessible name describes locked/upgrade; **no** hidden full summary for SR |
| Reduced motion | No essential score info only in ring animation |
| Keyboard | Unlock / Retry controls operable; card itself not a fake button unless interactive |

---

## 8. Analytics

Track **impressions** and **interactions**.

| Event | Trigger | Suggested properties |
|-------|---------|----------------------|
| `score_card_impressed` | Card enters viewport / Success render (once per audit view) | `auditId`, `tier`, `score`, `grade`, `auditType` |
| `score_card_unlock_clicked` | Locked unlock activated | `auditId`, `tier` |
| `score_card_retry_clicked` | Error retry | `auditId` |
| `score_card_error` | Error state shown | `auditId`, `reason` |

Align naming with `ANALYTICS.md` (may nest under `report_viewed` as component props if product prefers fewer top-level events — still record impression + interactions).

Do not send raw screenshot binaries or PII in events.

---

## 9. Usage

| Screen / context | Usage |
|------------------|-------|
| Guest Audit Results | Primary hero score block; typically Success; Locked if Figma gates summary |
| Free Results | Success with brief summary |
| Pro / Business Results | Success; URL or Image type |
| Audit Completed | Compact Success preview (score ± grade; summary optional per Figma) |
| History / Report reopen | Success when opening past audit |
| PDF template | Same score + grade + summary fields for visual parity (`COMPONENT_MAPPING` reuse note) — layout may adapt for print without changing numbers |

**Composition:** Parent Results layout owns Upgrade Banner / findings; this component only owns overall score presentation.

---

## 10. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma Score Card / Results frames |
| Tokens | `DESIGN_TOKENS.md` — no hardcoded brand hex in implementation notes beyond tokens |
| Ring colors | Score-band tokens paired with numeric score |
| Summary length | Clamp UI to 2–3 lines; do not expand into full report body here |
| Audit Type labels | **Image** / **URL** (or Figma synonyms Screenshot / Website — match Figma) |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Single component | One Overall Score Card for Guest / Free / Pro / Business |
| Score authority | Server-computed 0–100; grade from §3 mapping |
| No LLM grade | Do not display model-invented grades that disagree with score |
| Data | Phase 1 mock props; Phase 2 bind to report API preview/full payload |
| Category scores | **Out of scope** — separate category score components |
| Logic | No business/credit logic inside the presentational card beyond emitting unlock/retry |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Displays score 0–100, grade, ring, 2–3 line summary, last updated, audit type  
□ Reused on Guest / Free / Pro / Business without layout forks  
□ Loading skeleton + busy semantics  
□ Success: SR hears score immediately; reduced motion OK  
□ Error: no fake score; alert + retry  
□ Locked: no revealed locked summary in DOM/AT; unlock fires analytics  
□ Grade matches score bands  
□ Impressions + unlock/retry interactions tracked  
□ WCAG 2.2 AA; Figma match  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Category score list |
| Findings / recommendations lists |
| PDF download button (sibling component) |
| Computing score inside the UI component |

---

**End of COMPONENT-008 / COMPONENT_OVERALL_SCORE_CARD.md**
