# COMPONENT — Buy Credits Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · QA  

**Component ID:** COMPONENT-038 (Buy Credits Card)  
**Component name:** Buy Credits Card (`BuyCreditsCard`)  
**Primary screens:** Manage Membership · Credits exhausted / low flows · SCREEN-M05 Buy Credits (when designed)  
**Figma:** Buy credits / top-up card — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma.  
> **Entitlement:** Top-ups are **Pro & Business only** — Free cannot buy credits (`PRICING.md`); Free users see Upgrade instead.  
> **Pack sizes:** This brief lists **50 / 100 / 250 / 500** (+ Custom future). `PRICING.md` currently documents packs **500 / 2,000 / 5,000** at **$9 / $29 / $59**. **Reconcile pack catalog in product** — until then, implement Figma packs for UI mock; do not invent prices that conflict with adopted Stripe products without an explicit pricing update.

**Related:** `docs/PRICING.md` · `docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md` · `docs/components/COMPONENT_CREDITS_WIDGET.md` · `docs/components/COMPONENT_USAGE_WIDGET.md` · `docs/components/COMPONENT_CURRENT_PLAN_CARD.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/SCREEN_MAPPING.md` (M05)

---

## 1. Purpose

Allows users to **purchase additional audit credits** beyond their subscription monthly allowance.

Purchased credits **roll over** across billing periods (`PRICING.md`).

**Reusable** on Manage Membership, Dashboard low-credits CTAs, and dedicated Buy Credits surfaces.

**Do not redesign.** Match Figma. This phase: **UI mock only** — no Stripe charge.

---

## 2. Membership Rules

| Tier | Spec |
|------|------|
| **Guest** | Hidden — Login / Upgrade first |
| **Free** | Not available — show Upgrade Plan instead of Buy Credits |
| **Pro** | Available |
| **Business** | Available |

---

## 3. Display

| Element | Spec |
|---------|------|
| **Credits Remaining** | Current balance (mock → server later) |
| **Suggested Credit Packs** | Selectable pack cards/chips — see §4 |
| **Price** | Price for the selected pack (from catalog / Figma) |
| **Benefits** | Short bullets (e.g. credits roll over; use for screenshot/URL audits) |
| **Buy Credits Button** | Primary purchase CTA for selected pack |

---

## 4. Credit Packs

| Pack | Spec |
|------|------|
| **50 Credits** | Selectable |
| **100 Credits** | Selectable |
| **250 Credits** | Selectable |
| **500 Credits** | Selectable |
| **Custom (Future)** | Hidden or disabled “Coming soon” until custom amounts ship |

| Rule | Spec |
|------|------|
| Selection | Single selected pack at a time |
| Default | Recommend a mid pack or Figma “Most popular” |
| Prices | Bind to approved catalog; update `PRICING.md` when 50/100/250 SKUs are adopted |
| Out of Stock | Future state — not used in mock unless testing |

---

## 5. States

| State | Spec |
|-------|------|
| **Loading** | Skeleton for balance, packs, CTA |
| **Available** | Packs selectable; Buy enabled when a pack is selected |
| **Out of Stock (Future)** | Pack or catalog unavailable — disable Buy; message |
| **Error** | Load or mock-purchase failure; Retry |

Optional transient: Purchasing (button `aria-busy`) → Success toast (mock) without granting real ledger credits unless mock store updates intentionally for UI demo.

---

## 6. Behaviour

| Action | Spec |
|--------|------|
| Select pack | Update Price + Benefits emphasis; **Credit Pack Selected** |
| Buy Credits | **Buy Credits Clicked** → mock checkout success/error (no Stripe) |
| Free user | Do not mount this card; route to Upgrade |
| Sync | Remaining credits match Usage / Credits widgets after mock grant (if demo updates balance) |

Production later: Stripe Checkout/Payment Intent → webhook grants credits only (`SECURITY.md`).

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `loading` \| `available` \| `out_of_stock` \| `error` | Yes | |
| `creditsRemaining` | number \| null | Recommended | |
| `packs` | `{ id, credits, price, label, popular? }[]` | Yes | Catalog |
| `selectedPackId` | string \| null | Yes | |
| `tier` | `pro` \| `business` | Yes | |
| `benefits` | string[] | Optional | |
| `onSelectPack` | (id) => void | Yes | |
| `onBuy` | (id) => void | Yes | |
| `onRetry` | action | Error | |
| `purchasing` | boolean | No | Busy CTA |
| `variant` | `default` \| `compact` | No | |

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Packs | Radiogroup or selectable cards with selected state announced |
| Price | Text associated with selected pack |
| Buy button | Named “Buy {N} credits” or “Buy credits”; disabled until selection if required |
| Keyboard | Select packs + Buy operable; visible focus |
| Loading / Error | Busy + alert |
| Remaining | Announced with pack context |

---

## 9. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Credits Viewed** | Card impressed | `tier`, `creditsRemaining` |
| **Credit Pack Selected** | Pack chosen | `packId`, `credits`, `price` |
| **Buy Credits Clicked** | Buy CTA | `packId`, `credits`, `price`, `tier` |

Align `buy_credits_clicked` / `topup_started` / `credits_purchased` on real webhook success later (`ANALYTICS.md`).

---

## 10. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Pack grid + summary/CTA per Figma |
| **Tablet** | Wrap packs |
| **Mobile** | Stack packs; full-width Buy |

---

## 11. Reuse

| Context | Spec |
|---------|------|
| Manage Membership | Usage / buy section |
| M05 Buy Credits | Full-page composition using this card |
| Low credits / Limit Reached | Compact embed |
| Current Plan Card | May only link here via Buy Credits action |

---

## 12. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Popular pack | Badge if Figma |
| Custom | Future only |
| No redesign | |

---

## 13. Developer Notes

| Note | Spec |
|------|------|
| Mock | Selection + fake purchase toast; optional mock balance bump for demo only |
| No Stripe | This phase |
| Free | Never enable purchase |
| Catalog conflict | Resolve 50–500 vs 500/2k/5k with product; update PRICING + Stripe products together |
| Rollover | Communicate in Benefits |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ Remaining, packs, price, benefits, Buy Credits  
□ Packs: 50, 100, 250, 500; Custom future  
□ Pro/Business only; Free/Guest excluded  
□ Loading / Available / Error (Out of Stock optional)  
□ WCAG 2.2 AA  
□ Analytics: Credits Viewed, Pack Selected, Buy Clicked  
□ Desktop / tablet / mobile  
□ Mock only; Figma match  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Real Stripe top-up this phase |
| Free-tier credit purchase |
| Custom credit amounts (Future) |
| Subscription plan upgrade (Plan Comparison / Current Plan Card) |

---

**End of COMPONENT / COMPONENT_BUY_CREDITS_CARD.md**
