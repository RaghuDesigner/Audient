# COMPONENT — Checkout Summary

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-04  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · QA  

**Component ID:** COMPONENT-035 (Checkout Summary)  
**Component name:** Checkout Summary (`CheckoutSummary`)  
**Primary screen:** Checkout (`docs/screens/SCREEN-013_CHECKOUT.md`)  
**Also used on:** Payment Success · Invoice Details · Billing History (read-only reuse)  
**Related:** Current Plan Card (`COMPONENT_CURRENT_PLAN_CARD.md`) — **current** membership; this component summarizes the **selected / purchased** subscription context  
**Figma:** Checkout summary block — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Badge / Plan Card patterns in `COMPONENT_MAPPING.md`.  
> **Pricing:** `docs/PRICING.md` — Free $0/300 · Pro $29/1,000 · Business $99/10,000. Yearly display must match Billing & Payments selection.  
> **Phase:** **Mocked subscription data** — no Stripe, no Supabase, no API in this phase.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-012_BILLING_AND_PAYMENTS.md` · `docs/screens/SCREEN-013_CHECKOUT.md` · `docs/components/COMPONENT_BILLING_SUMMARY.md` · `docs/components/COMPONENT_CURRENT_PLAN_CARD.md`

---

## 1. Purpose

Displays a **concise summary of the selected subscription** before (and after) payment.

**Reusable** in:

| Surface | Spec |
|---------|------|
| **Checkout** | Primary — confirm plan before Pay Now |
| **Payment Success** | Confirm what was purchased |
| **Invoice Details** | Plan context on a receipt/invoice view |
| **Billing History** | Compact row/card context for a subscription line |

One component — density via `variant` / `context`, not four unrelated summaries.

**Do not redesign.** Match Figma. Amounts and entitlements are mock now; **server-authoritative** later (`SECURITY.md`).

---

## 2. Display

| Field | Spec |
|-------|------|
| **Selected Plan** | Pro / Business (or Free only if showing a non-purchase context — rare) |
| **Billing Cycle** | Monthly / Yearly |
| **Price** | Price for the selected cycle + currency (align with `PRICING.md`) |
| **Included Credits** | Monthly grant: 1,000 / 10,000 |
| **Included Features** | Short bullet list (URL audits, PDF, etc.) — Figma length |
| **Renewal Date** | Next renewal / period end (mock); N/A or omit for one-time contexts if product decides |
| **Membership Badge** | Visual badge for plan (Pro / Business crown if Figma) |

| Rule | Spec |
|------|------|
| Prices | Must match Billing & Payments / Checkout Order Summary for the same selection — no conflicting amounts |
| Features | Catalog-driven mock list per tier — do not invent features outside PRD / pricing |
| Badge | Status vs plan: Membership Badge = plan identity; Cancelled/Expired use **state** styling (§3), not a second conflicting plan name |

---

## 3. States

| State | Spec |
|-------|------|
| **Default** | Active / pending checkout — normal summary styling |
| **Loading** | Skeleton for plan, cycle, price, credits, features, renewal; `aria-busy` |
| **Error** | Failed to load subscription context; Retry; do not invent a plan as truth |
| **Cancelled** | Subscription cancelled — badge/status copy; renewal may show “Ends {date}” / “Cancelled” per Figma |
| **Expired** | Past period end without renewal — expired styling; CTA slot optional (Resubscribe) owned by parent |

| Context note | Spec |
|--------------|------|
| Pre-pay Checkout | Usually **Default** or **Loading**; Cancelled/Expired uncommon unless showing current membership alongside upgrade target |
| Payment Success / Invoice / History | May pass **Cancelled** / **Expired** for historical rows |

Parent screen owns navigation CTAs (Pay Now, Resubscribe). This component is primarily **presentational**.

---

## 4. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `default` \| `loading` \| `error` \| `cancelled` \| `expired` | Yes | Visual/status state |
| `planName` | `pro` \| `business` \| `free` | Recommended | Selected / summarized plan |
| `billingCycle` | `monthly` \| `yearly` | Recommended | |
| `priceLabel` | string \| null | Recommended | Formatted price for cycle |
| `currency` | string | Recommended | e.g. USD |
| `creditsIncluded` | number \| null | Recommended | Grant for plan |
| `features` | string[] \| null | Optional | Included feature bullets |
| `renewalDateLabel` | string \| null | Recommended | Formatted date or status copy |
| `membershipBadge` | string \| null | Optional | Override badge label; else derive from plan |
| `variant` | `default` \| `compact` \| `invoice` | No | Checkout full vs History/Invoice dense |
| `context` | `checkout` \| `payment_success` \| `invoice` \| `billing_history` | No | Analytics + density hints |
| `onRetry` | action | Error | Reload summary data |
| `onResubscribe` | action | Optional | Expired/Cancelled — parent may supply |

No payment fields. No card data. No Stripe props in this phase.

---

## 5. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Retry / Resubscribe operable when present; summary itself is not a trap |
| Visible focus | On interactive children |
| Screen reader | Concise summary announcement, e.g. “Pro plan, billed yearly, $X, 1,000 credits, renews {date}” |
| Status | Cancelled / Expired conveyed in **text**, not color alone |
| Loading / Error | `aria-busy` / alert pattern |
| Features list | Semantic list when features shown |

---

## 6. Analytics

| Event | Trigger |
|-------|---------|
| **Checkout Summary Viewed** | Component enters viewport / mounts in a visible surface |

| Rule | Spec |
|------|------|
| Deduping | Prefer once per page view / context change (plan or cycle change may re-fire if product wants) |
| Consent | Marketing analytics only after cookie consent (`SCREEN_MAPPING` / ANALYTICS); operational logging separate |
| Payload (recommended) | `plan`, `billingCycle`, `context`, `state` |

---

## 7. Mock Data

| Rule | Spec |
|------|------|
| Source | Mocked subscription / selection objects from parent (Checkout state from Billing & Payments) |
| Catalog | Align with `PRICING.md` |
| No | Live Stripe subscription fetch · Supabase · API in this phase |

Example mock shape (conceptual — not code):

| Field | Example |
|-------|---------|
| Plan | Pro |
| Cycle | Yearly |
| Price | Yearly list or “Save 20%” derived mock |
| Credits | 1,000 |
| Renewal | Mock ISO date label |

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full summary: badge, features, renewal in Figma layout |
| **Tablet** | Reflow; features may wrap |
| **Mobile** | Stacked; **compact** variant acceptable for History list rows |

---

## 9. Relationship to Sibling Components

| Component | Difference |
|-----------|------------|
| **Current Plan Card** | User’s **active** membership + upgrade/downgrade CTAs |
| **Checkout Summary** | **Selected / purchased** plan snapshot for checkout & records |
| **Billing Summary** | Line-item money totals (subtotal, tax, total) — compose beside this, don’t merge |
| **Order Summary (screen section)** | Checkout page totals; may share field naming with Billing Summary |

Parents compose Checkout Summary + Order/Billing Summary — do not duplicate Total Amount inside Checkout Summary unless Figma puts price only (unit price) here.

---

## 10. Security

| Rule | Spec |
|------|------|
| Display only | Never treat this UI as entitlement truth |
| PII | Prefer plan/commercial fields only; avoid embedding full billing address here (that belongs on Billing Details) |
| Amounts | Mock now; production amounts server-authoritative |

---

## 11. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Single reusable component across Checkout, Payment Success, Invoice, Billing History |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Architecture | Presentational; parent supplies mock → later server props |
| Figma | Exact match; `variant` for density only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Shows plan, cycle, price, credits, features, renewal, membership badge  
□ Default / Loading / Error / Cancelled / Expired states  
□ Reusable on Checkout, Payment Success, Invoice, Billing History  
□ Prices align with `PRICING.md` and Billing & Payments selection  
□ Checkout Summary Viewed analytics  
□ WCAG 2.2 AA · keyboard · SR labels · visible focus  
□ Mock data only — no gateway/API  
□ Tokens only; no merge with Order Total component unless Figma requires  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Payment method capture |
| Coupon input / tax calculation |
| Upgrade / Pay Now CTAs (parent-owned unless Figma nests a single link) |
| Live Stripe subscription sync |

---

**End of COMPONENT_CHECKOUT_SUMMARY.md**
