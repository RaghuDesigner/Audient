# COMPONENT — Plan Comparison Table

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Growth · QA  

**Component ID:** COMPONENT-035 (Plan Comparison Table)  
**Component name:** Plan Comparison Table (`PlanComparisonTable`)  
**Primary screen:** Manage Membership (`docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md`)  
**Related:** Plan Comparison Modal (`COMPONENT_PLAN_COMPARISON.md`) — modal wrapper may embed this table or Plan Cards; **one feature matrix data source** (`PRICING.md` / plans config)  
**Figma:** Manage Plan comparison / feature matrix — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `PricingTable` / `PlanCard` in `COMPONENT_MAPPING.md`.  
> **Prices/credits:** Free **$0 / 300** · Pro **$29 / 1,000** · Business **$99 / 10,000** (`PRICING.md`).

**Related:** `docs/PRICING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `BUSINESS_RULES.md` (teams/API future)

---

## 1. Purpose

Allows users to **compare membership plans** side-by-side before upgrading.

**Reusable** on Manage Membership, marketing Pricing, Upgrade flows, and inside Plan Comparison Modal.

**Do not redesign.** Match Figma. Do not invent live Team/API products — mark Future / Coming soon where not shipped.

---

## 2. Columns

| Column | Spec |
|--------|------|
| **Feature** | Row label |
| **Free** | Free plan values / checkmarks |
| **Pro** | Pro plan values / checkmarks |
| **Business** | Business plan values / checkmarks |

Optional header row: plan name, price, credits, CTA — per Figma (cards above table or integrated).

Guest is not a column here (Guest has no Manage Membership plan); teaser comparison may live elsewhere.

---

## 3. Rows

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Credits** | 300 / mo | 1,000 / mo | 10,000 / mo |
| **Website Audits** | — (URL gated) | ✅ (credit cost per PRICING) | ✅ |
| **Screenshot Audits** | ✅ | ✅ | ✅ |
| **AI Recommendations** | Limited / brief | Full | Full |
| **PDF Export** | — | ✅ | ✅ |
| **Compare Reports** | — | — | ✅ (when feature ships; else Coming soon) |
| **Team Members** | — | — | **Future** / Coming soon (BR-ENT-003) |
| **Shared Reports** | — | Limited stub / — | Org/Team share **Future** until share+teams live |
| **Priority Support** | — | Per product copy | ✅ if Figma/product says so |
| **API Access (Future)** | — | — | **Future** / Coming soon (BR-ENT-004) |

| Rule | Spec |
|------|------|
| Values | ✓ / — / text per Figma |
| Honesty | Do not show Team/API/Share as live if not built |
| Config | Drive cells from shared plan config — not hardcoded conflicting prices |

---

## 4. Actions

| Action | Spec |
|--------|------|
| **Upgrade** | CTA under Pro and/or Business columns (or row) — Subscribe / Upgrade to Pro / Upgrade to Business |
| **Current Plan Badge** | On the user’s current plan column (“Current plan” / “Active Account”) — CTA disabled or hidden |

| Current plan | CTA behaviour |
|--------------|---------------|
| Free | Upgrade on Pro + Business |
| Pro | Current badge on Pro; Upgrade on Business; optional Downgrade not in this table |
| Business | Current badge on Business |

Contact Sales optional under Business for future enterprise rows.

Analytics: **Upgrade Clicked** with `targetPlan`.

---

## 5. States

| State | Spec |
|-------|------|
| **Loading** | Skeleton table / pulse columns |
| **Current Plan** | Current column highlighted + Current Plan Badge |
| **Recommended Plan** | Business (or Figma Recommended) visually emphasized — text “Recommended” for AT, not color-only |

Combine Current + Recommended when user is Free (Business recommended, no current paid).

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `currentPlan` | `free` \| `pro` \| `business` \| null | Recommended | Drives badge/highlight |
| `recommendedPlan` | `pro` \| `business` \| null | No | Default Business |
| `billingInterval` | `monthly` \| `yearly` | No | Price display |
| `state` | `loading` \| `ready` | No | |
| `rows` | feature matrix override | No | Default from config |
| `onUpgrade` | (plan) => void | Yes | |
| `showFutureRows` | boolean | No | Toggle API/Team visibility |
| `variant` | `page` \| `modal` \| `marketing` | No | Density |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Table | Semantic `<table>` with column headers (Free/Pro/Business) and row headers (Feature) |
| Mobile | If stacked cards, preserve equivalent structure/labels |
| Current / Recommended | Announced in text |
| CTAs | Named (“Upgrade to Pro”, “Current plan”) |
| Keyboard | Navigate cells/CTAs; focus visible |
| Future rows | “Coming soon” announced — not presented as included |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Plan Compared** | Table viewed / impressed (or billing interval toggle) | `currentPlan`, `recommendedPlan` |
| **Upgrade Clicked** | Upgrade CTA | `currentPlan`, `targetPlan` (`pro` \| `business`) |

Align `subscribe_clicked{pro|business}` / Manage Membership events.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full multi-column table |
| **Tablet** | Same or horizontal scroll with sticky Feature column |
| **Mobile** | Horizontal scroll **or** stacked plan cards with same row features — **per Figma**; same data |

---

## 10. Reuse

| Context | Spec |
|---------|------|
| Manage Membership | Primary comparison section |
| Plan Comparison Modal | Embed table or share row config |
| Marketing Pricing | Same matrix |
| Free / Pro / Business viewers | Same table; actions depend on `currentPlan` |

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Prices | $29 / $99 — fix stale Figma labels |
| Crown / Recommended | On Pro/Business headers if Figma |
| No redesign | |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Data | Mock matrix OK; production from `plans.ts` / PRICING |
| Stripe | CTAs mock → no checkout this phase on parent screen |
| Single source | Share row definitions with Plan Comparison Modal |
| Future rows | `Coming soon` + optional Contact Sales |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Columns: Feature, Free, Pro, Business  
□ All listed rows with honest Future markers  
□ Upgrade CTAs + Current Plan Badge  
□ Loading / Current Plan / Recommended Plan  
□ Prices/credits match PRICING.md  
□ Table a11y · WCAG 2.2 AA  
□ Plan Compared + Upgrade Clicked  
□ Desktop / tablet / mobile  
□ Reusable; Figma match  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Live Team/API products |
| Payment form inside the table |
| Guest column (use other surfaces) |
| Conflicting prices vs PRICING.md |

---

**End of COMPONENT / COMPONENT_PLAN_COMPARISON_TABLE.md**
