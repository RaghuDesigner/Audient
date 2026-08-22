# COMPONENT — Billing Summary

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · QA  

**Component ID:** COMPONENT-036 (Billing Summary)  
**Component name:** Billing Summary (`BillingSummary`)  
**Primary screen:** Manage Membership (`docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md`)  
**Related:** Current Plan Card (`COMPONENT_CURRENT_PLAN_CARD.md`) — plan/renewal/price may overlap; Billing Summary focuses on **payment + invoice** chrome  
**Figma:** Billing summary block on Manage Plan / billing — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma.  
> **Phase:** Payment method and invoices are **placeholders** — no Stripe / no real invoice API.

**Related:** `docs/PRICING.md` · `docs/SECURITY.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SCREEN_MAPPING.md` (Manage Plan, Billing)

---

## 1. Purpose

Shows **subscription billing information** at a glance: what the user pays, when, and how (placeholder), plus entry to invoice history (placeholder).

**Reusable** on Manage Membership, dedicated Billing page, and Account Settings billing tab when designed.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Current Plan** | Free / Pro / Business |
| **Renewal Date** | Next billing / renewal date (N/A for Free) |
| **Current Price** | $0 / $29 / $99 (or yearly display when cycle is yearly) per `PRICING.md` |
| **Billing Cycle** | Monthly / Yearly |
| **Payment Method** | **Placeholder** — e.g. masked card mock or “No payment method on file” / “Add payment method” |
| **Invoice History Button** | **Placeholder** — opens mock empty invoices or “Coming soon” toast; no real PDF invoices this phase |

Optional: Manage Billing / Update payment CTA if Figma shows it (same placeholder portal behaviour as Manage Membership).

---

## 3. States

| State | Spec |
|-------|------|
| **Loading** | Skeleton for plan, price, renewal, payment row, button |
| **Success** | Fields populated (mock or live later) |
| **Error** | Failed to load billing summary; Retry |
| **Expired** | Plan/subscription expired or past_due — show status messaging; price/renewal reflect lapsed state; CTA to resubscribe/upgrade via parent |

Free Active: Success with $0 and no payment method required.

---

## 4. Behaviour

| Action | Spec |
|--------|------|
| Invoice History | Placeholder navigation or modal — **no backend** |
| Payment Method | Not editable for real charges this phase; click may open “Billing portal coming soon” |
| Sync | Plan/price/renewal must match Current Plan Card / membership store |

Never display real full PAN; placeholders only (`SECURITY.md` / PCI — no raw card capture).

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `loading` \| `success` \| `error` \| `expired` | Yes | |
| `plan` | `free` \| `pro` \| `business` | Yes | |
| `renewalDate` | datetime \| null | Optional | |
| `currentPrice` | string \| number | Recommended | |
| `billingCycle` | `monthly` \| `yearly` | Recommended | |
| `paymentMethodLabel` | string \| null | Placeholder | e.g. “Visa •••• 4242” |
| `onInvoiceHistory` | action | Yes | Placeholder handler |
| `onManagePayment` | action | Optional | |
| `onRetry` | action | Error | |
| `variant` | `default` \| `compact` | No | |

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Labels | Plan, price, cycle, renewal, payment method as labelled text |
| Invoice button | Named “Invoice history” (or Figma label) |
| Keyboard | Button operable; visible focus |
| Expired / Error | Status text + alert when error |
| Loading | `aria-busy` |

---

## 7. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Billing Viewed** | Summary impressed / section visible | `plan`, `state` |
| **Invoice History Clicked** | Invoice History Button | `plan` |

Align with Manage Membership **Billing Clicked** when the same control is used — prefer one event name + `source: billing_summary`.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Field grid + button per Figma |
| **Tablet** | Wrap fields |
| **Mobile** | Stack; full-width Invoice History |

---

## 9. Reuse

| Context | Spec |
|---------|------|
| Manage Membership | Primary Billing Summary section |
| Billing / Settings | Same component |
| Free / Pro / Business | Same layout; payment method empty state for Free |

---

## 10. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Placeholders | Visually clear as non-final if product wants; still match Figma |
| No redesign | |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Phase | Mock plan/price/renewal; fake payment label OK |
| No Stripe | No Customer Portal or invoice list API |
| Later | Stripe Customer Portal, `GET /payments`, masked payment method from Stripe |
| Entitlements | Still webhook-authoritative when live |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Current Plan, Renewal, Price, Cycle, Payment Method placeholder, Invoice History  
□ Loading / Success / Error / Expired  
□ Free shows $0 / no card requirement  
□ Prices match PRICING.md  
□ WCAG 2.2 AA  
□ Billing Viewed + Invoice History Clicked  
□ Desktop / tablet / mobile  
□ Reusable; Figma match; no real Stripe  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Real card capture / Elements form |
| Real invoice PDFs |
| Credit usage meters (Usage Widget) |
| Plan feature matrix (Plan Comparison Table) |

---

**End of COMPONENT / COMPONENT_BILLING_SUMMARY.md**
