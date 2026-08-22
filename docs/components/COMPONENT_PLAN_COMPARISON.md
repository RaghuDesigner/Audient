# COMPONENT-013 — Plan Comparison Modal

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Growth · QA  

**Component ID:** COMPONENT-013  
**Component name:** Plan Comparison Modal (`PlanComparisonModal`)  
**Related UI:** Manage Plan (SCREEN-005) · Upgrade Dialog (M08) · Upgrade Banner Compare Plans CTA (COMPONENT-012)  
**Figma:** Plan comparison / Manage Plan comparison frames — **exact match**; prices from **`PRICING.md`**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/PRICING.md` · `docs/COMPONENT_MAPPING.md` (`PricingTable`, `PlanCard`, `UpgradeDialog`) · `docs/components/COMPONENT_UPGRADE_BANNER.md` · `docs/screens/SCREEN-007_GUEST_AUDIT_RESULTS.md` · `BUSINESS_RULES.md` (BR-ENT-* future) · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/DESIGN_TOKENS.md`

---

## 1. Purpose

Allow users to **compare Guest, Free, Pro, and Business** memberships in a reusable modal before upgrading or continuing on a lower tier.

Opened from Compare Plans CTAs (Upgrade Banner, Locked flows, Manage Plan entry points, etc.).

**Do not redesign.** Match Figma. Do not invent checkout UI inside this modal beyond the specified buttons.

---

## 2. Plans (columns)

| Plan | Price (authoritative) | Credits / notes |
|------|------------------------|-----------------|
| **Guest** | $0 | **1** anonymous screenshot audit; no account |
| **Free** | $0 | **300** credits / month; screenshot; brief report |
| **Pro** | **$29 / month** | **1,000** credits; URL + full report + PDF |
| **Business** | **$99 / month** | **10,000** credits; volume / multi-site; schema `ENTERPRISE` |

Highlight current plan when known (Guest / Free / Pro / Business). Recommended badge on Business if Figma shows it (SCREEN_MAPPING).

---

## 3. Compare (rows)

Feature matrix — values must match **`PRICING.md`** / BUSINESS_RULES. Use ✓ / — / text per Figma.

| Feature | Guest | Free | Pro | Business |
|---------|:-----:|:----:|:---:|:--------:|
| **Credits** | 1 screenshot teaser | 300 / mo | 1,000 / mo | 10,000 / mo |
| **Audit Limits** | 1 screenshot then login; no URL | Screenshot only; URL gated | Screenshot + **URL** | Screenshot + URL (higher volume) |
| **PDF Export** | — | — | ✓ | ✓ |
| **History** | — (locked → login) | Limited / available when logged in | Full | Full |
| **AI Recommendations** | Preview (limited) | Brief / limited | Full | Full |
| **Team Members** | — | — | — | **Future** (roadmap; BR-ENT-003) — show “Coming soon” or Contact Sales, not a fake working teams product |
| **API Access** | — | — | — | **Future** (BR-ENT-004) — same treatment |
| **White Label** | — | — | — | **Future** (BR-ENT-004) — same treatment |

| Rule | Spec |
|------|------|
| MVP honesty | Do not imply live Team / API / White Label if not shipped — label as Coming soon + **Contact Sales** |
| Figma sync | If Figma omits Guest column, still support Guest in data; visual columns follow Figma |
| Source | Prefer shared plan config (`plans.ts` / PRICING) — single source of truth |

---

## 4. Buttons

| Button | Spec |
|--------|------|
| **Upgrade to Pro** | Primary for Guest/Free (and Pro highlight). Opens Upgrade / checkout for Pro. Guest may require Login Modal first, then resume. |
| **Contact Sales** | Business / enterprise future features path (mailto or sales URL). Use when user wants Business volume or roadmap Team/API/White Label. |
| **Continue Free** | Dismiss modal; remain on Free (or Guest → encourage login later without forcing upgrade). For Guest, label may read Continue / Maybe later per Figma — same dismiss intent. |

| Rule | Spec |
|------|------|
| Current Pro | Upgrade to Pro may become **Current plan** (disabled) or hidden; show Contact Sales / manage billing as Figma allows |
| Current Business | Emphasize Contact Sales / manage; do not push Upgrade to Pro |
| Close | X / Esc / overlay dismiss — same as other modals; fire dismissed analytics |

---

## 5. Modal Behaviour

| Behaviour | Spec |
|-----------|------|
| Presentation | Centered modal + dimmed overlay |
| Focus | Trap focus inside; initial focus on title or primary CTA |
| Scroll | Body scroll locked; table may scroll horizontally on small screens |
| Reuse | Single global modal instance; open via `source` + optional `highlightTier` |
| Nested | If opened above Results, closing returns focus to Compare Plans trigger |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `open` | boolean | Yes | Visibility |
| `currentPlan` | `guest` \| `free` \| `pro` \| `business` \| null | Recommended | Highlight column |
| `source` | string | Analytics | e.g. `upgrade_banner`, `manage_plan`, `locked_pdf` |
| `highlightTier` | `pro` \| `business` \| null | No | Emphasize column |
| `onUpgradePro` | action | Yes | Upgrade to Pro |
| `onContactSales` | action | Yes | Contact Sales |
| `onContinueFree` | action | Yes | Continue Free / dismiss continue |
| `onClose` | action | Yes | Dismiss |

Plan cell data from shared config — not hardcoded conflicting prices in the modal.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Dialog | `role="dialog"`, `aria-modal="true"`, labelled by title |
| **Keyboard** | Tab cycles controls; Esc closes; Enter activates focused button |
| Table | Comparison as accessible **table** (headers for plans + features) or equivalent structured list on mobile |
| Focus trap | Yes while open |
| Focus restore | Return to opener on close |
| Buttons | Clear accessible names; disabled “current plan” explained in text |
| Responsive table | On mobile, ensure comparison remains understandable (stacked cards or scrollable table with sticky first column — **per Figma**, not invented IA) |

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full multi-column comparison per Figma |
| **Tablet** | Maintain columns or Figma tablet layout; spacing preserved |
| **Mobile** | Match Figma mobile; horizontal scroll or stacked plan cards — same plans, features, and buttons |

---

## 9. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `plan_comparison_opened` | Modal open | `source`, `currentPlan` |
| `plan_comparison_upgrade_pro_clicked` | Upgrade to Pro | `source`, `currentPlan` |
| `plan_comparison_contact_sales_clicked` | Contact Sales | `source` |
| `plan_comparison_continue_free_clicked` | Continue Free | `source`, `currentPlan` |
| `plan_comparison_dismissed` | Close / Esc / overlay | `source` |

---

## 10. Usage

| Opener | Spec |
|--------|------|
| Upgrade Banner — Compare Plans | Guest / Free Results |
| Manage Plan | Deeper compare if distinct from card grid |
| Locked / PDF upsell | Optional “Compare plans” link |
| Marketing pricing | May reuse same modal or inline table — prefer one comparison data source |

**Reusable modal** — do not fork Guest vs Free comparison UIs.

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Reusable | One Plan Comparison Modal app-wide |
| Data | `PRICING.md` / `plans.ts` for credits, PDF, URL, history |
| Future rows | Team Members, API Access, White Label = Coming soon + Contact Sales until BR-ENT-003/004 ship |
| Auth | Guest Upgrade to Pro → Login then checkout resume |
| Entitlements | Never grant from UI alone |
| Phase 1 | Static matrix + button handlers stubbed to Upgrade Modal / mailto |
| Phase 2 | Wire Stripe checkout + sales CRM link |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Four plans: Guest, Free, Pro, Business  
□ Rows: Credits, Audit Limits, PDF, History, AI Recommendations, Team, API, White Label  
□ MVP features accurate; future rows not falsely “live”  
□ Prices $29 / $99  
□ Buttons: Upgrade to Pro, Contact Sales, Continue Free  
□ Keyboard + focus trap + Esc + table a11y  
□ Desktop / tablet / mobile per Figma  
□ Analytics open / CTAs / dismiss  
□ Reusable from multiple sources  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Full payment form (Payment Modal) |
| Working teams/API/white-label product |
| Redesign of Manage Plan card grid (may coexist) |
| Inventing plan tiers beyond the four |

---

**End of COMPONENT-013 / COMPONENT_PLAN_COMPARISON.md**
