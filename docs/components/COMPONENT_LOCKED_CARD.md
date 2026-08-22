# COMPONENT-011 — Locked Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Growth · QA  

**Component ID:** COMPONENT-011  
**Component name:** Locked Card (`LockedCard`)  
**Figma:** Locked / blurred teaser cards on Guest (and Free) Results and gated surfaces  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/screens/SCREEN-007_GUEST_AUDIT_RESULTS.md` · `docs/components/COMPONENT_FINDING_CARD.md` · `docs/COMPONENT_MAPPING.md` (`UpgradeDialog`) · `docs/components/LOGIN_MODAL.md` · `docs/PRICING.md` · `docs/SECURITY.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/DESIGN_TOKENS.md`

---

## 1. Purpose

Encourage upgrades by displaying **locked premium content** without revealing that content.

Used wherever Guest/Free (or other gated) users should see that value exists behind Pro/Business — findings remainder, PDF, specialty reports, compare, etc.

**Do not redesign.** Match Figma blur, lock, message, and CTA.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Blurred content** | Non-legible placeholder silhouette (fake lines/cards) — **not** real premium data under CSS blur |
| **Lock Icon** | Visible lock cue (not color-only) |
| **Upgrade message** | Clear teaser copy (count or feature name) |
| **CTA Button** | Primary unlock action (e.g. Upgrade / Unlock — match Figma) |

---

## 3. Examples (variants)

Same component; vary `message` / `variant` / `reason`:

| Example | Typical message | `reason` (analytics / Upgrade Modal) |
|---------|-----------------|--------------------------------------|
| More findings | **37 More Findings** (or dynamic count) | `locked_findings` |
| Download PDF | **Download PDF** | `pdf` |
| Compare Reports | **Compare Reports** | `compare_reports` |
| Accessibility Report | **Accessibility Report** | `accessibility_report` |
| Performance Report | **Performance Report** | `performance_report` |
| SEO Report | **SEO Report** | `seo_report` |

| Rule | Spec |
|------|------|
| Counts | Prefer server `lockedCount` (e.g. 37); mock may hardcode to match Figma |
| Copy | Exact Figma strings when present |
| Extensibility | New locked features reuse this card — do not invent one-off lock UIs |

---

## 4. Behaviour

| Action | Spec |
|--------|------|
| Click card or CTA | Opens **Upgrade Modal** (`UpgradeDialog` / SCREEN-M08) |
| Keyboard activate | Same as click |
| Does **not** | Navigate to real PDF, reveal findings, or fetch premium payloads |
| Optional | Parent may open Login Modal first if upgrade requires auth — default for Guest premium tease is **Upgrade Modal**; History lock remains Login (SCREEN-007) and may use this card only if Figma shows the same pattern |

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Blur + lock + message + CTA |
| **Hover / Focus** | Per Figma; focus-visible ring required |
| **Pressed** | Opens Upgrade Modal |
| **Loading** | Optional skeleton if count/message loading — never flash real locked content |

No Success/unlocked state inside this component — when unlocked, parent **replaces** Locked Card with real content (e.g. Finding Card list, enabled PDF button).

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `variant` | `findings` \| `pdf` \| `compare` \| `accessibility_report` \| `performance_report` \| `seo_report` \| `custom` | Yes | Which locked feature |
| `message` | string | Yes | Upgrade message (e.g. “37 More Findings”) |
| `ctaLabel` | string | Recommended | CTA label (Figma default if omitted) |
| `lockedCount` | number \| null | Optional | For findings-style teasers |
| `reason` | string | Yes | Passed to Upgrade Modal / analytics |
| `tier` | `guest` \| `free` \| … | Recommended | Context |
| `auditId` | string \| null | Optional | Context |
| `onUpgrade` | action | Yes | Parent opens Upgrade Modal |
| `density` | `default` \| `compact` \| `banner` | No | Figma size only |
| `decorativeBlur` | opaque | Internal | Placeholder pattern only — **never** real children with secrets |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Control | Entire card or CTA is a real **button** (or link-styled button) — not click-only div |
| Name | Accessible name = message + intent, e.g. “37 more findings available. Upgrade to unlock.” |
| Blur | Must **not** expose real text to screen readers or DOM |
| Icon | Decorative (`aria-hidden`) if name includes “locked” / “upgrade” |
| Keyboard | Tab + Enter/Space activate |
| Focus visible | Required |
| Modal | After open, focus moves into Upgrade Modal per modal a11y rules |

---

## 8. Security

| Rule | Spec |
|------|------|
| No leakage | Do not pass real findings/PDF URLs/report bodies as blurred children |
| Server | Premium data withheld from Guest/Free APIs (`SECURITY.md`) |
| CTA | UI gate only — Upgrade/checkout and PDF endpoints enforce tier server-side |

---

## 9. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `locked_card_impressed` | Card visible (dedupe per variant + audit) | `variant`, `reason`, `tier`, `auditId`, `lockedCount` |
| `locked_card_clicked` | Card/CTA activated | `variant`, `reason`, `tier`, `auditId` |

Align with SCREEN-007 **Locked Card Clicked** / **PDF Clicked** / **Upgrade Clicked** via `reason` / `variant` properties.

---

## 10. Usage

| Context | Spec |
|---------|------|
| Guest Results | Stack under top 3 Finding Cards (“37 More Findings”); PDF lock; specialty report locks per Figma |
| Free Results | PDF / full findings / URL-adjacent upsells |
| Pro / Business | Generally not shown for entitled features |
| Reuse | All locked features — one component |

**Composition:** Opens shared Upgrade Modal; does not embed pricing tables inside the card (banner comparison may be a separate Results section).

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma locked cards |
| Blur | Decorative placeholder only |
| Lock + CTA | Always present; message required |
| Tokens | `DESIGN_TOKENS.md` |
| No redesign | Same pattern across examples |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Reusable | Across **all** locked features via `variant` + `message` + `reason` |
| Replace on unlock | Parent swaps Locked Card → real feature UI after entitlement |
| Phase 1 | Mock messages/counts |
| Phase 2 | Bind counts/reasons to API entitlements |
| Do not | Implement unique lock UIs per feature |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Blur + lock + message + CTA present  
□ Click/keyboard opens Upgrade Modal  
□ Examples: findings count, PDF, compare, a11y/perf/SEO reports  
□ No real premium text in DOM/AT  
□ Focus visible; WCAG 2.2 AA  
□ Impressions + clicks tracked with `reason`/`variant`  
□ Reused without per-feature layout forks  
□ Figma match  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Full Finding Card content |
| Actual PDF download |
| Login Modal (unless parent routes auth-first) |
| Plan comparison table (Upgrade Banner / Manage Plan) |

---

**End of COMPONENT-011 / COMPONENT_LOCKED_CARD.md**
