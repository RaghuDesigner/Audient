# COMPONENT — Strength Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-028 (Strength Card)  
**Component name:** Strength Card (`StrengthCard`)  
**Primary screen:** Audit Report — Strengths section (`docs/screens/SCREEN-010_AUDIT_REPORT.md` · SCREEN-M02)  
**Figma:** Strength / positive finding cards — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Schema:** Report `strengths[]` (SCREEN_MAPPING R5) — title, description, category, optional evidence.

**Related:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/screens/SCREEN-010_AUDIT_REPORT.md` · `docs/components/COMPONENT_FINDING_CARD.md` · `docs/SECURITY.md`

---

## 1. Purpose

Displays **positive UX findings** discovered during the audit.

Strengths help users understand **what is already working well** and **balance** the report with actionable positives (not only issues).

**Reusable** in:

| Surface | Spec |
|---------|------|
| **Audit Report** | Primary Strengths list |
| **Compare Report** | Side-by-side strengths when compare ships |
| **Shared Report** | Read-only strengths |
| **PDF Export** | Same content in print template (static expanded/print layout) |

Share visual language with Finding Card where helpful, but **do not** reuse severity-critical styling for strengths — strengths are positive.

**Do not redesign.** Match Figma.

---

## 2. Display

Each card contains:

| Field | Spec |
|-------|------|
| **Strength Title** | Short positive finding title |
| **Description** | Plain-language explanation of what works well |
| **Category** | One of §3 |
| **AI Confidence** | Confidence label or % (e.g. High / 92%) — display per Figma; not user-editable |
| **Impact Level** | Positive impact band (e.g. High / Medium / Low) — text + optional badge; not Critical/Major/Minor severity |
| **Screenshot** | **Optional** evidence thumbnail / annotated region |

---

## 3. Categories

Whitelist for strength categorization:

| Category |
|----------|
| Accessibility |
| Navigation |
| Performance |
| Visual Design |
| SEO |
| Content |
| Mobile UX |
| Forms |
| Trust |
| Consistency |

| Rule | Spec |
|------|------|
| Enum | Only these labels in UI (map API enums → display names) |
| vs score categories | Broader than Category Score Card’s six dimensions — strengths may use Navigation, Content, etc. |
| Unknown | Fall back to nearest category or “General” only if Figma allows — prefer strict whitelist |

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | Success content; collapsed or expanded per parent default |
| **Loading** | Skeleton title, description, meta, optional thumb |
| **Collapsed** | Title + category (+ impact); description clamped; expand affordance |
| **Expanded** | Full description, confidence, impact, screenshot if any |
| **Error** | Single-card load failure rare — show inline retry or omit card; list-level errors owned by Report |

Collapsed/Expanded are disclosure substates of Default.

---

## 5. Tier visibility

| Tier | Spec |
|------|------|
| Guest / Free | Limited count; remainder Locked Cards (parent) |
| Pro / Business | Full strengths list |

Card itself does not implement lock blur — parent uses Locked Card for gated remainder.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `strengthId` | string | Yes | |
| `title` | string | Yes | |
| `description` | string | Yes | |
| `category` | §3 key | Yes | |
| `aiConfidence` | number 0–1 or label | Recommended | |
| `impactLevel` | `high` \| `medium` \| `low` | Recommended | |
| `screenshotUrl` | string \| null | No | |
| `screenshotAlt` | string | When image | |
| `state` | `loading` \| `default` \| `error` | Yes | |
| `expanded` | boolean | Yes | Collapsed/Expanded |
| `onToggleExpand` | action | Yes | |
| `variant` | `report` \| `compare` \| `shared` \| `pdf` | No | |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Disclosure | Expand/collapse control with `aria-expanded` |
| Keyboard | Enter/Space toggle; focus visible |
| Category / impact / confidence | Text — not color-only |
| Screenshot | Meaningful `alt` describing the positive evidence |
| Name | Include title + category in accessible name |
| PDF | Static content; no reliance on expand interaction |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Strength Expanded** | Card expands | `strengthId`, `category`, `impactLevel` |
| **Strength Collapsed** | Card collapses | `strengthId`, `category` |

Optional: `strength_impressed` once per strength per report view.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Card row/grid per Figma |
| **Tablet** | Same hierarchy |
| **Mobile** | Full-width stack; screenshot below text |

---

## 10. Reuse

| Rule | Spec |
|------|------|
| One component | Report / Compare / Shared / PDF via `variant` |
| Not Finding Card | Separate component — positive framing, impact (not severity Critical/Major/Minor) |
| List | Parent maps `strengths[]` → Strength Cards |

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | Success / positive accents per tokens — not error red |
| Confidence / impact | Badge or text per Figma |
| No redesign | |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Data | **Mock data only** this phase |
| Schema | Persist `strengths` in report JSON when APIs ship |
| Confidence | Display-only; do not invent precision beyond mock/API |
| PDF | Render expanded/static; ignore interactive expand |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Title, description, category, AI confidence, impact, optional screenshot  
□ All §3 categories accepted  
□ Loading / Default / Expanded / Collapsed / Error  
□ Keyboard disclosure + WCAG 2.2 AA  
□ Analytics: Strength Expanded / Collapsed  
□ Desktop / tablet / mobile  
□ Reusable across report / compare / shared / PDF  
□ Mock only; Figma match; positive (not issue) styling  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Issue / Finding Card content |
| Locked blur (Locked Card) |
| Overall / category scores |
| Editing strengths |

---

**End of COMPONENT / COMPONENT_STRENGTH_CARD.md**
