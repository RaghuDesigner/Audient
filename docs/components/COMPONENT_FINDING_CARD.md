# COMPONENT-010 — Finding Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-010  
**Component name:** Finding Card (`FindingCard` / aligns with Issue Card · Recommendation Card patterns in `COMPONENT_MAPPING.md`)  
**Figma:** Finding / issue cards on Guest · Free · Pro · Business Results  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/COMPONENT_MAPPING.md` (`SeverityBadge`, Recommendation/Issue Card) · `docs/screens/SCREEN-007_GUEST_AUDIT_RESULTS.md` · `docs/components/COMPONENT_CATEGORY_SCORE_CARD.md` · `docs/components/COMPONENT_OVERALL_SCORE_CARD.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/ANALYTICS.md` · `docs/prd.md` · `docs/DESIGN_TOKENS.md`

---

## 1. Purpose

Display a **UX issue discovered during the audit**.

One card = one finding. Used in Results lists, locked teaser stacks (blurred siblings are not this card’s unlocked content), History report reopen, and PDF templates for visual parity.

**Do not redesign.** Match Figma.

---

## 2. Fields

| Field | Spec |
|-------|------|
| **Severity** | Critical / Major / Minor (or Figma equivalents) via `SeverityBadge` — text + color, never color-only |
| **Issue Title** | Short finding title |
| **Issue Description** | Plain-language explanation of the problem |
| **Screenshot Thumbnail** | Optional annotated/crop preview; omit when unavailable |
| **Affected Page** | Page label or URL path/title under audit |
| **Category** | One of: Accessibility, Usability, Performance, SEO, Visual Design, Trust (COMPONENT-009 whitelist) |
| **AI Recommendation Preview** | Short fix hint (collapsed: 1–2 lines; expanded: fuller preview — still not the entire Pro recommendation body unless tier allows) |
| **Priority** | Relative priority for fixing (e.g. P1 / P2 / High / Medium / Low — **match Figma labels**) |

---

## 3. Tier Visibility

| Tier | Spec |
|------|------|
| **Guest** | Parent renders **only the first three** Finding Cards (unlocked). Remaining findings use Locked Findings UI (blurred placeholders — not full Finding Card payloads). |
| **Free** | Brief list — product may cap count; same card component |
| **Pro** | **Complete list** of findings |
| **Business** | Complete list (same as Pro) |

| Rule | Spec |
|------|------|
| Enforcement | Server returns only allowed findings for Guest/Free (`SECURITY.md`) — do not ship full list and hide with CSS |
| Card reuse | Same Finding Card for visible items across tiers; locked placeholders are a separate pattern (see SCREEN-007) |

---

## 4. States

### 4.1 Loading

| Aspect | Spec |
|--------|------|
| UI | Skeleton: badge, title lines, thumbnail slot, meta |
| A11y | Busy region; no fake severity/title |

### 4.2 Success

| Aspect | Spec |
|--------|------|
| UI | All available fields rendered; default expansion per §4.3–4.4 |
| Ready for | Keyboard expand/collapse and interactions |

### 4.3 Collapsed (default list density)

| Aspect | Spec |
|--------|------|
| Visible | Severity, title, short description (clamped), optional thumbnail, category, priority; recommendation preview truncated |
| Control | Expand affordance (chevron/button) |

### 4.4 Expanded

| Aspect | Spec |
|--------|------|
| Visible | Full description (within tier), larger/annotated thumbnail if any, full AI recommendation preview allowed for tier, affected page clearly shown |
| Control | Collapse affordance |
| A11y | `aria-expanded="true"` on the disclosure control |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `findingId` | string | Yes | Stable id |
| `severity` | `critical` \| `major` \| `minor` | Yes | Severity |
| `title` | string | Yes | Issue title |
| `description` | string | Yes | Issue description |
| `thumbnailUrl` | string \| null | No | Screenshot thumbnail |
| `thumbnailAlt` | string | When image | Accessible image description (and annotation summary if annotated) |
| `affectedPage` | string \| null | Recommended | Page label / URL |
| `category` | Category key (COMPONENT-009) | Yes | Category |
| `recommendationPreview` | string \| null | Recommended | AI recommendation preview |
| `priority` | string \| enum per Figma | Recommended | Priority |
| `state` | `loading` \| `success` | Yes | Load state |
| `expanded` | boolean | Yes | Expanded vs collapsed (controlled by parent or internal) |
| `tier` | `guest` \| `free` \| `pro` \| `business` | Recommended | Analytics / preview depth |
| `auditId` | string | Analytics | Context |
| `onToggleExpand` | action | When interactive | Expand/collapse |
| `onThumbnailClick` | action | Optional | Open screenshot viewer |

Presentational: parent owns list slicing (first three for guests) and data fetching.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Expand/collapse operable (Enter/Space); thumbnail/viewer controls focusable |
| Focus visible | Required |
| Severity | Text label + color (`SeverityBadge`) |
| Disclosure | Button/control with `aria-expanded`; optional `aria-controls` pointing at details panel |
| Image | Meaningful `alt` / text equivalent for annotations — not “image” alone |
| Order | Logical reading: severity → title → description → meta → recommendation |
| Lists | Parent uses list semantics (`list` / `listitem` or equivalent) for multiple cards |

---

## 7. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `finding_card_impressed` | Card visible (dedupe per finding) | `auditId`, `findingId`, `severity`, `category`, `tier` |
| `finding_card_expanded` | Expanded | `findingId`, `auditId` |
| `finding_card_collapsed` | Collapsed | `findingId`, `auditId` |
| `finding_thumbnail_clicked` | Thumbnail / viewer opened | `findingId`, `auditId` |

Guest locked-stack clicks remain on SCREEN-007 locked analytics — not this card.

---

## 8. Usage

| Context | Spec |
|---------|------|
| Guest Results | Max **3** Success cards; then locked teaser |
| Free Results | Capped or brief set via API |
| Pro / Business Results | Full list |
| Audit Completed | Generally not used (score-only interstitial) |
| PDF | Same fields for parity; expansion N/A (static expanded/print layout) |
| Screenshot viewer | Optional sibling; Finding Card only previews thumbnail |

**Composition:** Severity via shared `SeverityBadge`; do not duplicate severity styles.

---

## 9. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma finding/issue cards |
| Tokens | Severity colors from design tokens / COMPONENT_MAPPING |
| Thumbnail | Optional; layout must not break when absent |
| Recommendation | Preview only on card — full recommendation module may be COMPONENT elsewhere |
| No redesign | Same card chrome across tiers |

---

## 10. Developer Notes

| Note | Spec |
|------|------|
| Reusable | Throughout Results, History, PDF template |
| Guest limit | **Parent** enforces first three; card does not hide siblings by index alone if API leaked more |
| States | Loading · Success · Expanded · Collapsed (Expanded/Collapsed are Success substates) |
| Phase 1 | Mock findings array |
| Phase 2 | Bind to report findings API |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ All fields render when provided; thumbnail optional  
□ Severity text + color  
□ Collapsed ↔ Expanded keyboard + `aria-expanded`  
□ Guest parent shows only three cards; Pro shows full list  
□ Loading skeleton safe  
□ Image alt / annotation described  
□ Analytics: impress, expand/collapse, thumbnail  
□ WCAG 2.2 AA; Figma match  
□ Reused without per-tier layout forks  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Locked / blurred “37 more” placeholders (screen-level pattern) |
| Overall / category score cards (COMPONENT-008 / 009) |
| Full PDF download control |
| Computing severity in the UI |

---

**End of COMPONENT-010 / COMPONENT_FINDING_CARD.md**
