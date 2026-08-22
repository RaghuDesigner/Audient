# COMPONENT-009 — Category Score Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-009  
**Component name:** Category Score Card (`CategoryScoreCard` / maps to `ScoreCard` **category** variant in `COMPONENT_MAPPING.md`)  
**Sibling:** COMPONENT-008 — Overall Score Card  
**Figma:** Category score tiles on Guest / Free / Pro / Business Results  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/components/COMPONENT_OVERALL_SCORE_CARD.md` · `docs/COMPONENT_MAPPING.md` · `docs/screens/SCREEN-007_GUEST_AUDIT_RESULTS.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/prd.md` · `docs/AI_PROMPTS.md` (dimension coverage incl. Trust)

---

## 1. Purpose

Display an **individual audit category** score as a compact, reusable card.

Used in a row/grid of category cards on Results screens. **One component instance per category** — not a separate design per tier.

**Do not redesign.** Match Figma for icon, type, progress bar, and spacing.

---

## 2. Categories

Supported category keys (whitelist):

| Key | Display name |
|-----|----------------|
| `accessibility` | Accessibility |
| `usability` | Usability |
| `performance` | Performance |
| `seo` | SEO |
| `visual_design` | Visual Design |
| `trust` | Trust |

| Rule | Spec |
|------|------|
| Enum | Only these six — do not invent ad-hoc category labels in UI |
| Guest Results | Parent may render a **subset** (e.g. five tiles without Trust) per Figma — component still supports all six |
| Pro / Business | Typically all categories present when scored |
| Scoring | Category scores computed in **code** (architecture), not accepted from the model as authoritative |

---

## 3. Display (each card)

| Element | Spec |
|---------|------|
| **Icon** | Category-specific icon per Figma (`aria-hidden` if name is adjacent text) |
| **Category Name** | Display name from §2 |
| **Score** | Integer **0–100** (or null in loading) |
| **Status** | Short qualitative label derived from score (or provided) — e.g. Excellent / Good / Fair / Poor — **match Figma copy** |
| **Progress Bar** | Horizontal bar filled to `score / 100` |
| **Trend Indicator** | **Optional** — up / down / flat vs prior audit when `trend` provided; omit when unavailable |

---

## 4. Status Mapping

Centralize with scoring. Recommended defaults if Figma does not prescribe exact words:

| Score | Status (example) |
|-------|------------------|
| 90–100 | Excellent |
| 75–89 | Good |
| 60–74 | Fair |
| 40–59 | Needs work |
| 0–39 | Poor |

| Rule | Spec |
|------|------|
| Authority | Prefer server-provided `status` if present; else derive from score |
| A11y | Status is text — not color-only on the progress bar |

---

## 5. States

### 5.1 Loading

| Aspect | Spec |
|--------|------|
| UI | Skeleton for icon, name, score, status, progress bar |
| A11y | Parent group or card `aria-busy`; do not announce fake scores |

### 5.2 Success

| Aspect | Spec |
|--------|------|
| UI | All fields populated; progress bar at score % |
| Motion | Optional fill animation; under `prefers-reduced-motion`, snap to width |
| Trend | Show only when optional trend data exists |

### 5.3 Locked

| Aspect | Spec |
|--------|------|
| When | Guest/Free limitation hides a category’s real score per product/Figma |
| UI | Lock icon; blurred or placeholder bar; **do not reveal** real score/status text in DOM or accessibility tree |
| Interaction | Activate → Upgrade Modal (parent handler) |
| Security | Locked category scores must not be sent in guest preview API if gated (`SECURITY.md`) |
| Guest note | If Guest Figma shows real scores for displayed categories, use **Success**; Locked remains available for gated categories |

---

## 6. Reuse by Tier

| Tier | Usage |
|------|--------|
| **Guest** | Subset of categories; Success for teaser scores; Locked for any gated category |
| **Free** | Typically all or product-defined subset; brief results |
| **Pro** | Full category set; trend when history exists |
| **Business** | Same as Pro |

One component — vary props (`state`, `score`, `trend`, `category`), not four layouts.

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `category` | One of §2 keys | Yes | Which category |
| `score` | 0–100 \| null | Success | Category score |
| `status` | string \| null | Optional | Qualitative label; else derive |
| `trend` | `up` \| `down` \| `flat` \| null | Optional | Trend indicator |
| `trendDelta` | number \| null | Optional | Optional ± points for SR/tooltip |
| `state` | `loading` \| `success` \| `locked` | Yes | Card state |
| `tier` | `guest` \| `free` \| `pro` \| `business` | Recommended | Analytics |
| `auditId` | string | Analytics | Context |
| `onUnlock` | action | Locked | Parent opens Upgrade |
| `size` | `default` \| `compact` | No | Figma density only |

Presentational: parent supplies data; no fetch inside the card.

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Name | Accessible name includes category, score, status — e.g. “Accessibility score 84 out of 100, Good” |
| Progress | Progress bar exposes value (`progressbar` or text equivalent); not color-only |
| Icon | Decorative when name is visible |
| Trend | Text/accessible alternative (e.g. “up 3 points since last audit”) — not chevron-only |
| Locked | “Accessibility score locked. Upgrade to unlock.” (category-specific) — no hidden real score |
| Keyboard | Unlock control operable when Locked |
| Reduced motion | Bar does not convey sole information via animation |

---

## 9. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `category_score_impressed` | Card visible / Success (dedupe per audit+category) | `auditId`, `category`, `score`, `tier` |
| `category_score_locked_clicked` | Locked card activated | `auditId`, `category`, `tier` |
| `category_score_trend_viewed` | Optional — tooltip/focus on trend | `auditId`, `category`, `trend` |

May nest under `report_viewed` as component props; still record locked clicks.

---

## 10. Usage

| Context | Spec |
|---------|------|
| Results grids | Map `categoryScores[]` → one Category Score Card each |
| Guest preview | Render only categories in preview payload / Figma |
| PDF | Same scores/status for parity; print layout may simplify trend |
| Overall Score Card | Sibling — do not embed category list inside COMPONENT-008 |

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma category tiles |
| Tokens | `DESIGN_TOKENS.md` |
| Progress fill | Score-band or category token colors per Figma; always paired with numeric score |
| Icons | One icon per category; no extra decorative icons |
| Trust | Include Trust tile when data + Figma show it (PRD trust signals dimension) |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Reusable | Guest, Free, Pro, Business — same component |
| Whitelist | Six categories only |
| Score authority | Server/code-computed 0–100 per category |
| Optional trend | Omit UI when no prior audit baseline |
| Phase 1 | Mock category array |
| Phase 2 | Bind to report `categoryScores` |
| No code in this doc | Implementation later |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ All six categories render correctly when provided  
□ Icon, name, score, status, progress bar present on Success  
□ Trend optional and a11y-safe  
□ Loading skeletons without fake scores  
□ Locked: no score leak; unlock → parent handler + analytics  
□ Reused across Guest/Free/Pro/Business without layout forks  
□ Guest subset (e.g. without Trust) does not break component  
□ WCAG 2.2 AA; Figma match  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Overall score ring (COMPONENT-008) |
| Findings list for a category |
| Computing scores in the UI component |
| Extra categories beyond §2 |

---

**End of COMPONENT-009 / COMPONENT_CATEGORY_SCORE_CARD.md**
