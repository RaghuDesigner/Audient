# SCREEN-012 — Billing & Payments

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · Security · QA  

**Screen ID:** SCREEN-012 (product brief)  
**Canonical mapping:** Pre-checkout / order review before Payment (SCREEN-006) or hosted Checkout · related **SCREEN-M06** / Manage Plan subscribe path in `SCREEN_MAPPING.md`  
**Screen name:** Billing & Payments  
**Figma:** Billing / checkout review frames — **exact match**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` uses **SCREEN-012** for **History (populated)**. This document is **Billing & Payments** (checkout review). Renumber when consolidating.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Pricing:** Pro **$29/mo** · Business **$99/mo** (`PRICING.md`). Yearly “Save 20%” is illustrative — confirm yearly list prices before charging.  
> **Phase:** **Mock only** — **no Stripe**, **no Supabase**, **no API calls**, **no payment gateway**.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md` · `docs/components/COMPONENT_FAQ_ACCORDION.md` · `docs/components/COMPONENT_BILLING_SUMMARY.md` · `docs/components/COMPONENT_CURRENT_PLAN_CARD.md` · `docs/components/COMPONENT_PLAN_COMPARISON_TABLE.md`

---

## 1. Purpose

The Billing & Payments screen allows authenticated users to:

- Review the **selected subscription plan**  
- Choose a **billing cycle**  
- Apply **discounts / coupons**  
- Review **pricing**  
- Select a **payment method** (placeholder)  
- Enter **billing information**  
- **Proceed to checkout**  

This is the **final review step before payment**.

The UI must **match the approved Figma exactly**.

Real charges and entitlements remain **webhook-authoritative** when Stripe ships (`SECURITY.md`) — this screen must never grant Pro/Business from the client alone.

---

## 2. Entry Points

```text
Manage Membership → Upgrade Plan → Billing & Payments

Current Plan Card → Change Plan → Billing & Payments

Upgrade Banner → Billing & Payments
```

Also: Plan Comparison Table Upgrade CTA with a selected target plan.

| Prerequisite | Spec |
|--------------|------|
| Auth | Required |
| Selected plan | Target tier in client state (Pro or Business) — Free is not a “purchase” destination |

---

## 3. Layout

```text
Application Header
        ↓
Breadcrumb
        ↓
Selected Plan Card
        ↓
Billing Cycle Selector
        ↓
Order Summary
        ↓
Coupon Code
        ↓
Payment Method
        ↓
Billing Information
        ↓
Security Information
        ↓
Proceed to Checkout Button
        ↓
FAQ
        ↓
Footer
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS in implementation |
| Figma | Section order may reflow; **Figma wins** |

### Breadcrumb (recommended)

```text
Dashboard > Manage Membership > Billing & Payments
```

---

## 4. Selected Plan

Display:

| Field | Spec |
|-------|------|
| Plan Name | Pro / Business (target) |
| Monthly Price | From `PRICING.md` |
| Yearly Price | When yearly selected / shown — mock or confirmed catalog |
| Included Credits | 1,000 / 10,000 |
| Included Features | Short bullets (URL, PDF, etc.) |
| **Change Plan** Button | Return to Manage Membership / Plan Comparison to pick another tier |

Reuse Current Plan / Plan Card patterns — do not duplicate conflicting prices.

---

## 5. Billing Cycle

| Option | Spec |
|--------|------|
| **Monthly** | Default unless Figma says otherwise |
| **Yearly** | Show **yearly savings badge** — example **Save 20%** |

| Behaviour | Spec |
|-----------|------|
| Toggle | Updates Order Summary totals |
| Analytics | **Billing Cycle Changed** |

Yearly absolute prices must be product-approved before real checkout.

---

## 6. Order Summary

Display:

| Line | Spec |
|------|------|
| Plan Price | Base for selected cycle |
| Discount | Plan/promo discount if any |
| Coupon Discount | Applied coupon amount |
| Taxes | Tax estimate placeholder (GST/VAT) |
| Credits Included | Credit grant for plan |
| **Total Amount** | Amount due |
| **Currency** | e.g. USD |

Recalculate when cycle or coupon changes. Mock tax OK (e.g. $0 or % placeholder).

---

## 7. Coupon Code

Display:

| Element | Spec |
|---------|------|
| Coupon Input | Text field |
| Apply Button | Validate against **mock coupon list** |
| Remove Coupon | Clears applied coupon |
| Coupon Success Message | e.g. “Coupon applied” |
| Coupon Error Message | e.g. “Invalid coupon” |

| Behaviour | Spec |
|-----------|------|
| Apply success | State **Coupon Applied**; update Order Summary |
| Apply fail | State **Coupon Invalid**; inline error |
| Analytics | **Coupon Applied** / **Coupon Failed** |

Validation: non-empty; mock codes case-insensitive; follow VALIDATION_RULES patterns for field errors (inline, not toast-only).

---

## 8. Payment Method

**Placeholder only.**

| Future methods (do not integrate yet) |
|---------------------------------------|
| Credit Card |
| Debit Card |
| Apple Pay |
| Google Pay |
| PayPal |

| Rule | Spec |
|------|------|
| UI | Show placeholder selector or “Payment methods available at checkout” |
| Gateway | **No payment gateway integration** |
| Analytics | **Payment Method Viewed** when section visible/interacted |
| PCI | Do **not** collect raw card data on this screen (R4 — Stripe Elements/Checkout later) |

---

## 9. Billing Information

Display fields (mock forms):

| Field | Spec |
|-------|------|
| Business Name | Optional/required per Figma |
| Billing Address | |
| Country | Select |
| Tax ID | Optional |
| GST / VAT | Placeholder field or note |

Client-side validation for required fields before Proceed (VALIDATION_RULES-style inline errors). No API persist this phase.

---

## 10. Security Notice

Display:

| Element | Spec |
|---------|------|
| Secure payment icon | |
| SSL Encryption | Copy |
| PCI Compliance Placeholder | Do not claim audited PCI status falsely — use cautious placeholder wording if needed |

---

## 11. Proceed & Secondary CTAs

| CTA | Spec |
|-----|------|
| **Proceed to Checkout** | Primary — validate form/coupon; mock navigate to success placeholder or Payment Success stub; **no Stripe charge** |
| **Return to Membership** | Secondary — back to Manage Membership |

Analytics: **Proceed To Checkout** · **Return To Membership**.

While “processing” mock: button `aria-busy`; prevent double submit.

---

## 12. FAQ

**Reuse** `COMPONENT_FAQ_ACCORDION.md` with billing/membership questions (upgrade, cancel, credits, coupons if relevant).

---

## 13. Membership Behaviour

| Tier | Spec |
|------|------|
| **Guest** | **Cannot access** — redirect to **Login**; resume intent → this screen after auth |
| **Free** | Upgrade allowed (to Pro or Business) |
| **Pro** | Upgrade to Business (or change cycle / coupon on Pro renew mock) |
| **Business** | Manage subscription — change cycle, billing info, coupons; not “upgrade to Business” |

---

## 14. States

| State | Spec |
|-------|------|
| **Loading** | Skeletons for plan, summary, forms |
| **Success** | Ready to review (mock hydrated) |
| **Empty** | No selected plan — redirect to Manage Membership or Empty CTA “Choose a plan” |
| **Error** | Page/load error + Retry |
| **Coupon Applied** | Success coupon UI + summary discount |
| **Coupon Invalid** | Error message on coupon field |

Payment decline belongs to Payment Failed modal later — not this review screen’s primary Error.

---

## 15. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Full form + cycle + coupon + CTAs |
| Visible focus | Required |
| Screen reader | Labels for all inputs; live region for coupon success/error |
| Tab order | Breadcrumb → plan → cycle → summary → coupon → payment placeholder → billing fields → security → Proceed → Return → FAQ → footer |
| Total | Announced when updated |

---

## 16. Analytics

| Event | Trigger |
|-------|---------|
| **Billing Viewed** | Screen open |
| **Billing Cycle Changed** | Monthly/Yearly toggle |
| **Coupon Applied** | Valid mock coupon |
| **Coupon Failed** | Invalid coupon |
| **Proceed To Checkout** | Primary CTA |
| **Return To Membership** | Secondary CTA |
| **Payment Method Viewed** | Payment section viewed/focused |

---

## 17. Mock Data

| Rule | Spec |
|------|------|
| Pricing | Mock from `PRICING.md` |
| Coupons | Mock list (e.g. `SAVE20`, `WELCOME`) |
| No | Backend · Stripe · Supabase · API calls |
| Proceed | Fake success path only — do not flip real entitlements without explicit mock session flag for UI demos |

---

## 18. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Two-column summary + form if Figma |
| Tablet | Reflow |
| Mobile | Single column stack |

---

## 19. Components to Reuse

| Need | Reuse |
|------|--------|
| FAQ | `COMPONENT_FAQ_ACCORDION` |
| Plan display | Plan Card / Current Plan patterns |
| Comparison change | Link to Manage Membership / Plan Comparison Table |
| Billing labels | Align with `COMPONENT_BILLING_SUMMARY` field naming |

Create new components only if Figma requires something not covered (e.g. Coupon Field) — keep modular; no one-off page CSS.

---

## 20. Security

| Rule | Spec |
|------|------|
| Auth | Guest → Login |
| No raw cards | Placeholder only |
| Amounts | Display mock; production amounts server-authoritative |
| Entitlements | Never trust “Proceed” success alone when Stripe exists |
| Tax IDs | Treat as sensitive PII when stored later |

---

## 21. Developer Notes

| Rule | Spec |
|------|------|
| Style | Design tokens — no hardcoded colors, no inline CSS |
| Architecture | Thin page composing sections |
| Later | Stripe Checkout/Elements + tax + real coupons + Customer Portal |
| R4 | Prefer hosted Checkout over bespoke card forms |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 22. Navigation Summary

```text
Manage Membership / Upgrade / Change Plan
        ↓
Billing & Payments (this screen)
        ├─ Change Plan → Manage Membership
        ├─ Proceed to Checkout → mock success / future Payment
        └─ Return to Membership → Manage Membership
```

---

## 23. QA Checklist

□ Figma-exact review layout  
□ Entry from Manage Membership, Current Plan, Upgrade Banner  
□ Selected plan + Change Plan  
□ Monthly/Yearly + Save badge  
□ Order summary lines + currency  
□ Coupon apply/remove/success/error  
□ Payment method placeholder only — no gateway  
□ Billing information fields  
□ Security notice  
□ Proceed + Return CTAs  
□ FAQ accordion reused  
□ Guest → Login; Free/Pro/Business behaviours  
□ Loading / Empty / Error / Coupon states  
□ Mock only — no Stripe/Supabase/API  
□ Analytics events  
□ WCAG 2.2 AA · tokens only  

---

## 24. Non-goals (this phase)

| Out of scope |
|--------------|
| Real Stripe / PayPal / Apple Pay / Google Pay |
| Real tax calculation APIs |
| Real coupon service |
| Granting paid entitlements from the client |
| History screen (other SCREEN-012 in mapping) |

---

**End of SCREEN-012 / SCREEN-012_BILLING_AND_PAYMENTS.md**
