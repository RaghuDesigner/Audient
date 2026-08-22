# SCREEN-013 — Checkout

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-04  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · Security · QA  

**Screen ID:** SCREEN-013 (product brief)  
**Canonical mapping:** Final confirmation before Payment Modal (**SCREEN-006**) or hosted Stripe Checkout · related **SCREEN-M07** (Checkout Return) for post-pay redirects in `SCREEN_MAPPING.md`  
**Screen name:** Checkout  
**Figma:** Checkout / final confirmation frames — **exact match**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` uses **SCREEN-013** for **History (Empty)**. This document is **Checkout** (final confirmation before pay). Renumber when consolidating.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Pricing:** Pro **$29/mo** · Business **$99/mo** (`PRICING.md`). Totals must match the prior Billing & Payments selection.  
> **Phase:** **Mock only** — **no payment gateway**, **no backend**, **no API**. Prepares the app for future Stripe (Elements / hosted Checkout).  
> **PCI (R4):** Do **not** capture raw PAN/CVV on this screen. Payment Method is a **placeholder** for future Stripe Elements; Figma Payment Modal (SCREEN-006) is a visual reference, not a license for custom card forms.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/screens/SCREEN-012_BILLING_AND_PAYMENTS.md` · `docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md` · `docs/components/COMPONENT_BILLING_SUMMARY.md` · `docs/components/COMPONENT_FAQ_ACCORDION.md` (if FAQ appears in Figma)

---

## 1. Purpose

The Checkout screen is the **final confirmation** before payment.

Users review:

- Selected plan  
- Billing details  
- Payment method (placeholder)  
- Order totals  

…then accept Terms and choose **Pay Now**.

This screen **prepares the application for future Stripe integration**. It must never grant Pro/Business entitlements from the client alone — production entitlements remain **webhook-authoritative** (`SECURITY.md`).

The UI must **match the approved Figma exactly**.

---

## 2. Entry Points

```text
Billing & Payments
        ↓
Proceed To Checkout
        ↓
Checkout (this screen)
```

| Prerequisite | Spec |
|--------------|------|
| Auth | Required — Guest → Login; resume intent → Checkout (or Billing & Payments if checkout state missing) |
| Checkout context | Selected plan, billing cycle, coupon (if any), billing details from SCREEN-012 client/mock state |
| Empty context | No selected plan / missing prior step → redirect to **Billing & Payments** or **Manage Membership** |

---

## 3. Layout

```text
Application Header
        ↓
Breadcrumb
        ↓
Checkout Summary
        ↓
Selected Plan
        ↓
Billing Details
        ↓
Payment Method
        ↓
Order Summary
        ↓
Terms & Conditions Checkbox
        ↓
Privacy Notice
        ↓
Pay Now Button
        ↓
Cancel Button
        ↓
Footer
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS in implementation |
| Figma | Section order may reflow; **Figma wins** |
| Read-only bias | Prefer display of values collected on Billing & Payments; edit via **Back to Billing** unless Figma shows inline edit |

### Breadcrumb (recommended)

```text
Dashboard > Manage Membership > Billing & Payments > Checkout
```

---

## 4. Checkout Summary

Display:

| Field | Spec |
|-------|------|
| Plan | Pro / Business (target) |
| Billing Cycle | Monthly / Yearly |
| Credits Included | 1,000 / 10,000 (from `PRICING.md`) |
| Renewal Date | Mock next renewal for selected cycle |

---

## 5. Selected Plan

Display plan name, price for cycle, key included features (short). Align copy/prices with Billing & Payments and `PRICING.md` — no conflicting amounts.

Optional: **Change Plan** → Manage Membership / Plan Comparison (if Figma shows it); otherwise change only via Back to Billing.

---

## 6. Billing Details

Display (from prior step / mock profile):

| Field | Spec |
|-------|------|
| Name | Business or account name |
| Email | Authenticated user email |
| Billing Address | |
| Country | |
| Tax Information | **Placeholder** (GST/VAT / Tax ID) |

Not editable on this screen unless Figma requires it — default path: **Back to Billing** to correct.

---

## 7. Payment Method

**Placeholder only.**

| Spec | Detail |
|------|--------|
| Now | Placeholder UI (“Payment method will be collected securely at pay” / Figma stub) |
| Future | **Stripe Elements** or hosted **Stripe Checkout** |
| Do not | Collect raw card number, CVV, or expiry in Audient-owned inputs |
| Analytics | May fire with Checkout Viewed or a future Payment Method Viewed if Figma interaction exists |

---

## 8. Order Summary

Display:

| Line | Spec |
|------|------|
| Subtotal | Plan price for cycle |
| Discount | Plan/promo discount if any |
| Coupon | Applied coupon amount (or — / $0) |
| Tax | Tax estimate placeholder |
| **Total** | Amount due + currency |

Must match SCREEN-012 Order Summary for the same selection. Recalculation only if user returned and changed cycle/coupon.

---

## 9. Terms & Privacy

| Element | Spec |
|---------|------|
| **Checkbox** | Required: **“I agree to the Terms of Service and Privacy Policy.”** |
| Links | Terms of Service and Privacy Policy open legal pages (new tab or in-app) — do not block checkbox without accessible link targets |
| **Privacy Notice** | Short notice near Terms (Figma copy) — SSL / data use / payment processor mention as appropriate; no false PCI certification claims |
| Validation | **Pay Now** disabled or blocked until checked → state **Terms Not Accepted** |

Analytics: **Terms Accepted** when checkbox becomes checked (or on Pay Now if product prefers single fire — prefer on accept for clarity).

---

## 10. Actions

| CTA | Spec |
|-----|------|
| **Pay Now** | Primary — requires Terms accepted; mock “payment started”; **no gateway charge**. Future: create Checkout Session / PaymentIntent server-side |
| **Back to Billing** / **Cancel** | Secondary — return to **Billing & Payments** (brief: Cancel Button; product label may be **Back to Billing**) |

| Pay Now mock outcome | Spec |
|----------------------|------|
| Success path | Navigate to mock Payment Success (SCREEN-008 pattern) or temporary success stub — **do not** flip real entitlements without explicit mock session flag |
| Error path | Inline/page Error or Payment Failed stub (SCREEN-007 pattern) — Retry / Back to Billing |
| Double submit | Prevent while Loading; button `aria-busy` |

Analytics: **Checkout Started** on Pay Now · **Back To Billing** on secondary.

---

## 11. Membership Behaviour

| Tier | Spec |
|------|------|
| **Guest** | Cannot access — redirect to Login |
| **Free** | May checkout upgrade to Pro or Business |
| **Pro** | May checkout upgrade to Business or cycle/renewal change (mock) |
| **Business** | Manage / renew / billing change — not “upgrade to Business” |

---

## 12. States

| State | Spec |
|-------|------|
| **Loading** | Skeletons for summary, plan, billing, totals; or busy after Pay Now |
| **Success** | Ready confirmation UI (hydrated mock) |
| **Error** | Load failure or mock pay failure + Retry / Back to Billing |
| **Terms Not Accepted** | Pay Now blocked; accessible error/hint on checkbox when user attempts Pay without accept |

Missing checkout context → treat as Empty → redirect to Billing & Payments (not a permanent empty page).

---

## 13. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Full path through summary, Terms checkbox, Pay Now, Cancel |
| Visible focus | Required |
| Screen reader | Labels for checkbox; announce Terms error; announce Total |
| Tab order | Breadcrumb → summaries → billing → payment placeholder → order → Terms → Privacy → Pay Now → Cancel → footer |
| Links | Terms / Privacy discernible link names |

---

## 14. Analytics

| Event | Trigger |
|-------|---------|
| **Checkout Viewed** | Screen open |
| **Terms Accepted** | Checkbox checked |
| **Checkout Started** | Pay Now activated (terms valid) |
| **Back To Billing** | Secondary / Cancel |

Future (Stripe phase): payment_submitted, payment_success, payment_failed — align with SCREEN-006 / ANALYTICS when wired.

---

## 15. Mock Data

| Rule | Spec |
|------|------|
| Source | Carry forward from Billing & Payments mock state |
| Pricing | `PRICING.md` |
| No | Payment gateway · backend · API · Stripe keys required |
| Pay Now | Fake success/error only |

---

## 16. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Summary + order layout per Figma (often two-column) |
| Tablet | Reflow |
| Mobile | Single-column stack; sticky Pay Now if Figma |

---

## 17. Components to Reuse

| Need | Reuse |
|------|--------|
| Order lines | Align with SCREEN-012 Order Summary / `COMPONENT_BILLING_SUMMARY` naming |
| Plan display | Plan Card / Current Plan patterns |
| Legal links | Shared footer/legal link components if present |
| Alerts | Shared inline error for Terms Not Accepted |

Create new components only if Figma requires (e.g. Checkout Summary block). Keep modular; no one-off page CSS.

---

## 18. Security

| Rule | Spec |
|------|------|
| Auth | Guest → Login |
| No raw cards | Placeholder → future Stripe Elements / Checkout only (R4) |
| Amounts | Display mock; production amounts server-authoritative |
| Entitlements | Never trust client “Pay Now” success when Stripe exists — wait for webhook |
| Terms | Record acceptance timestamp/version when backend exists |
| PII | Billing address / tax IDs treated as sensitive when persisted later |

---

## 19. Relationship to Payment Screens

```text
Billing & Payments (SCREEN-012 brief)
        ↓ Proceed To Checkout
Checkout (this screen)
        ↓ Pay Now (future)
   ┌────┴────┐
   │         │
Hosted Stripe Checkout     OR     Payment Modal (SCREEN-006) via Elements
   │         │
   ├─ success → Payment Success (SCREEN-008) / Checkout Return (SCREEN-M07)
   └─ failure → Payment Failed (SCREEN-007)
```

This phase stops at mock Pay Now — no real provider call.

---

## 20. Developer Notes

| Rule | Spec |
|------|------|
| Style | Design tokens — no hardcoded colors, no inline CSS |
| Architecture | Thin page; checkout state from prior step |
| Later | `POST /billing/checkout` → Stripe Session; webhook entitlements; Checkout Return (success/cancel) |
| Prefer | Hosted Checkout or Payment Element over custom card UI |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 21. Navigation Summary

```text
Billing & Payments → Proceed To Checkout
        ↓
Checkout (this screen)
        ├─ Pay Now → mock success / future Stripe / SCREEN-006–008
        └─ Cancel / Back to Billing → Billing & Payments
```

---

## 22. QA Checklist

□ Figma-exact confirmation layout  
□ Entry only from Proceed To Checkout with valid context  
□ Checkout Summary: plan, cycle, credits, renewal  
□ Selected plan + billing details + tax placeholder  
□ Payment method placeholder — no card capture  
□ Order summary: Subtotal, Discount, Coupon, Tax, Total  
□ Terms checkbox required; Privacy notice  
□ Pay Now / Back to Billing (Cancel)  
□ Loading / Success / Error / Terms Not Accepted  
□ Guest → Login; Free/Pro/Business behaviours  
□ Mock only — no gateway/backend/API  
□ Analytics: Viewed, Terms Accepted, Checkout Started, Back To Billing  
□ WCAG 2.2 AA · tokens only  

---

## 23. Non-goals (this phase)

| Out of scope |
|--------------|
| Real Stripe / PayPal / Apple Pay / Google Pay |
| Raw card forms or bespoke email OTP as payment auth |
| Real tax APIs or coupon services |
| Granting paid entitlements from the client |
| History Empty screen (other SCREEN-013 in mapping) |

---

**End of SCREEN-013 / SCREEN-013_CHECKOUT.md**
