# COMPONENT — Recommendation Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-029 (Recommendation Card)  
**Component name:** Recommendation Card (`RecommendationCard`)  
**Maps to:** Recommendation Card / Issue Card in `COMPONENT_MAPPING.md` (recommendation-focused variant)  
**Primary screen:** Audit Report — Recommendations (`docs/screens/SCREEN-010_AUDIT_REPORT.md` · SCREEN-M02)  
**Figma:** Recommendation cards — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.

**Related:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/PRICING.md` · `docs/SECURITY.md` · `docs/components/COMPONENT_FINDING_CARD.md` · `docs/components/COMPONENT_STRENGTH_CARD.md` · `docs/components/COMPONENT_LOCKED_CARD.md` · `docs/screens/SCREEN-007_GUEST_AUDIT_RESULTS.md`

---

## 1. Purpose

Displays **AI-generated recommendations** for improving UX issues found during the audit.

Recommendations must be **clear, prioritized, and actionable** — among the most important components in Audient (the “aha” of the report).

**Reusable** in:

| Surface | Spec |
|---------|------|
| **Audit Report** | Primary list |
| **Compare Reports** | Per-side recommendations when compare ships |
| **PDF Export** | Same content in tagged PDF template |
| **Team Workspace** | Future — collaboration placeholders only until teams ship (BR-ENT) |

**Do not redesign.** Match Figma.

---

## 2. Display

Each recommendation contains:

| Field | Spec |
|-------|------|
| **Recommendation Title** | Action-oriented headline |
| **Detailed Description** | What to change and why (business impact in plain language) |
| **Affected UX Category** | Category label (align report taxonomy / Finding categories) |
| **Severity** | See §3 |
| **Priority** | See §4 |
| **Estimated Impact** | Qualitative or scored impact of fixing (per Figma) |
| **Estimated Implementation Effort** | See §5 |
| **AI Confidence** | Confidence label or % — display-only |
| **Before / After Preview** | **Placeholder** slots for future visuals — do not invent real generated mocks beyond Figma placeholders |
| **Learn More link** | **Placeholder** — may be disabled/`#`/help stub until content exists |

Pair with Finding Card when a recommendation is linked to a finding id (optional prop).

---

## 3. Severity

| Value |
|-------|
| **Critical** |
| **High** |
| **Medium** |
| **Low** |

| Rule | Spec |
|------|------|
| Display | Text + color via badge — not color-only |
| Mapping | If API uses Critical/Major/Minor, map Major→High, Minor→Low (or Medium) in one place — UI shows this four-level set |

---

## 4. Priority

| Value |
|-------|
| **P1** |
| **P2** |
| **P3** |
| **P4** |

P1 = do first. Show as text badge per Figma.

---

## 5. Effort

| Value |
|-------|
| **Low** |
| **Medium** |
| **High** |

Estimated implementation effort for the user’s team/dev — not AI runtime.

---

## 6. Membership Rules

| Tier | Spec |
|------|------|
| **Guest** | Recommendations **hidden** on full Report — Guest uses limited preview (SCREEN-007: one teaser + unlock); do not render this card list for guests on M02 full layout |
| **Free** | **Limited** recommendations visible; remainder **Locked** state / Locked Cards |
| **Pro** | **Complete** recommendations |
| **Business** | Complete recommendations + **collaboration placeholders** (comments/assign) — non-functional until Team Workspace ships; do not build live teams |

**Security:** Free/Guest must not receive full recommendation payloads in the client for blur-only hiding when APIs exist.

---

## 7. States

| State | Spec |
|-------|------|
| **Default** | Content visible; collapsed or expanded per parent |
| **Collapsed** | Title + severity + priority (+ effort chip); description clamped |
| **Expanded** | Full description, impact, effort, confidence, before/after placeholders, Learn More |
| **Loading** | Skeleton |
| **Locked (Free Users)** | Blur/lock treatment or CTA “Upgrade to unlock”; **no real locked body in DOM/AT** |
| **Error** | Inline error / omit card; list error owned by Report |

Locked may be a card-level state or parent **Locked Card** wrapping the slot — prefer one pattern per Figma.

---

## 8. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `recommendationId` | string | Yes | |
| `title` | string | Yes | |
| `description` | string | Yes | |
| `category` | string | Yes | Affected UX category |
| `severity` | `critical` \| `high` \| `medium` \| `low` | Yes | |
| `priority` | `p1` \| `p2` \| `p3` \| `p4` | Yes | |
| `estimatedImpact` | string \| enum | Recommended | |
| `effort` | `low` \| `medium` \| `high` | Recommended | |
| `aiConfidence` | number \| label | Recommended | |
| `findingId` | string \| null | No | Linked finding |
| `learnMoreHref` | string \| null | Placeholder | |
| `showBeforeAfterPlaceholder` | boolean | No | Default true if Figma |
| `state` | `loading` \| `default` \| `locked` \| `error` | Yes | |
| `expanded` | boolean | When not locked | |
| `tier` | `guest` \| `free` \| `pro` \| `business` | Yes | |
| `onToggleExpand` | action | When expandable | |
| `onUpgrade` | action | Locked | |
| `onLearnMore` | action | Placeholder | |
| `collaborationPlaceholder` | boolean | Business | Show stub collab UI |

---

## 9. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Expand/collapse, Learn More, Upgrade operable |
| Disclosure | `aria-expanded` when expandable |
| Severity / priority / effort | Text labels |
| Locked | Accessible name “Recommendation locked. Upgrade to unlock.” — no hidden full text |
| Placeholders | Before/After and Learn More announced as unavailable/coming soon if not live |
| Focus visible | Required |
| PDF | Static expanded content; no expand-only information |

---

## 10. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Recommendation Viewed** | Card impressed (dedupe per id) | `recommendationId`, `severity`, `priority`, `tier` |
| **Recommendation Expanded** | Expanded | `recommendationId` |
| **Recommendation Collapsed** | Collapsed | `recommendationId` |
| **Upgrade Clicked** | Locked upgrade CTA | `source: recommendation_card`, `recommendationId` |

Align with SCREEN-010 / `recommendation_expanded` in `ANALYTICS.md`.

---

## 11. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full card; before/after side-by-side if Figma |
| **Tablet** | Same hierarchy |
| **Mobile** | Stack fields; before/after stacked; full-width CTAs |

---

## 12. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | Severity colors + priority chips |
| Placeholders | Explicit empty/wireframe treatment — not fake screenshots |
| No redesign | |

---

## 13. Developer Notes

| Note | Spec |
|------|------|
| Data | **Mocked data only** — **no backend** this phase |
| Guest | Do not mount recommendation list on full report |
| Free | Slice visible set; locked slots without payload leak |
| Business | Collaboration UI = placeholders only |
| Before/After & Learn More | Non-functional stubs OK |
| Reuse | One component across report / compare / PDF / future team |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ All display fields + placeholders  
□ Severity Critical–Low · Priority P1–P4 · Effort Low–High  
□ Default / Expanded / Collapsed / Loading / Locked / Error  
□ Guest hidden · Free limited+locked · Pro full · Business + collab placeholders  
□ Keyboard + WCAG 2.2 AA  
□ Analytics: Viewed, Expanded, Collapsed, Upgrade Clicked  
□ Desktop / tablet / mobile  
□ Mock only; no API; Figma match  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Live before/after image generation |
| Live Learn More CMS (placeholder only) |
| Working team comments/assignments |
| Finding Card / Strength Card replacement |

---

**End of COMPONENT / COMPONENT_RECOMMENDATION_CARD.md**
