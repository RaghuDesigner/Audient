# SCREEN-014 — Payment Processing

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-09  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · Security · QA  

**Screen ID:** SCREEN-014 (product brief)  
**Canonical mapping:** In-app payment pending / processing bridge after Checkout · future Stripe confirmation + webhook lag · related **SCREEN-M07** (Checkout Return / activating) and Payment Modals **SCREEN-007** / **SCREEN-008** in `SCREEN_MAPPING.md`  
**Screen name:** Payment Processing  
**Figma:** Payment processing / “please wait” frames — **exact match**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` reserved **SCREEN-014** for **Buy Credits (Top-up)** backlog (SCREEN-M05). This document is **Payment Processing** after Checkout. Renumber when consolidating.  
> **Downstream IDs in this brief:** Success → **SCREEN-015_PAYMENT_SUCCESS**; Failure → **SCREEN-016_PAYMENT_FAILURE**. Mapping still labels success/failure as SCREEN-008 / SCREEN-007 modals — treat product brief IDs for page flow; map modals as alternate UI shells.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Phase:** **Frontend mock flow only** — **no Stripe**, **no Supabase**, **no backend API**, **no real charges**.  
> **PCI (R4):** This screen does not collect payment instruments. Future provider confirmation/3DS stays in Stripe-hosted UI or Elements — not raw card capture.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ERROR_HANDLING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/screens/SCREEN-013_CHECKOUT.md` · `docs/screens/SCREEN-012_BILLING_AND_PAYMENTS.md` · `docs/components/COMPONENT_CHECKOUT_SUMMARY.md` · `docs/components/COMPONENT_TERMS_CHECKBOX.md`

---

## 1. Purpose

The Payment Processing screen provides **feedback while Audient is processing a subscription payment**.

It must:

- Reassure the user that payment is in progress  
- **Prevent duplicate payment attempts**  
- Carry selection context (plan / amount) so the wait feels intentional  

This is currently a **frontend mock flow**. No real payment gateway is required at this stage.

The UI must **match the approved Figma exactly**.

Production later: processing may represent Checkout Session confirmation, PaymentIntent `processing`, 3DS, or **webhook lag** (“activating membership…”) — entitlements remain **webhook-authoritative** (`SECURITY.md`).

---

## 2. Entry Point

```text
SCREEN-013 Checkout
        ↓
Pay Now  (Terms accepted; form valid)
        ↓
SCREEN-014 Payment Processing
```

| Prerequisite | Spec |
|--------------|------|
| Auth | Required — Guest cannot stay here; send to Login |
| Checkout context | Selected plan, cycle, amount, credits from prior step required |
| Missing context | Redirect to **Checkout** or **Billing & Payments** — do not start a fake payment |
| Terms | Must have been accepted on Checkout; do not re-open Pay without Terms |

---

## 3. Layout

```text
Application Header
        ↓
Processing Indicator
        ↓
Processing Message
        ↓
Selected Plan Summary
        ↓
Security Information
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell; reduce or hide competing CTAs (no second Pay Now) |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS in implementation |
| Figma | Section order may reflow; **Figma wins** |
| Footer / FAQ | Omit unless Figma shows them — prefer a focused wait surface |

### Breadcrumb (optional)

If Figma shows navigation chrome, prefer non-clickable “Checkout → Processing” or hide steps that would restart payment. **Do not** provide a second Pay path.

---

## 4. Processing Indicator

Display:

| Element | Spec |
|---------|------|
| **Loading animation** | Spinner / motion per Figma |
| **Progress indicator** | Determinate or indeterminate per Figma — mock may animate stages only |
| **Processing status** | Text status (and optional stage label) |

**Primary message:**

> Processing your payment...

**Supporting message:**

> Please don't close this window or refresh the page.

| Rule | Spec |
|------|------|
| Text + motion | Status **must** be available as text; animation alone is not sufficient (a11y) |
| Live region | Announce primary message on enter; optional updates for status stages |
| Don’t close | Soft guidance only — cannot force-block refresh; mock should still be safe if user leaves |

---

## 5. Plan Information (Selected Plan Summary)

Display:

| Field | Spec |
|-------|------|
| **Plan Name** | Pro / Business (target) |
| **Billing Cycle** | Monthly / Yearly |
| **Amount** | Total charged (mock) + currency — align with Checkout Order Summary |
| **Credits Included** | Grant from `PRICING.md` (1,000 / 10,000) |

Reuse **Checkout Summary** (`COMPONENT_CHECKOUT_SUMMARY.md`) in compact/read-only form when Figma matches. Amounts must not contradict Checkout.

---

## 6. Security Message

Display:

> Your payment is being processed securely.

| Element | Spec |
|---------|------|
| Security / lock icon | Presentational; decorative icon hidden from SR if text already conveys “securely” |
| Copy | Figma-exact; no false PCI certification claims |

---

## 7. User Interaction (Anti–Double Pay)

During processing:

| Rule | Spec |
|------|------|
| Duplicate submission | Disable browser / form re-submit patterns (no second Pay form on this screen) |
| Pay Now | Remains **disabled** on Checkout if user navigates back; this screen has **no Pay Now** |
| Duplicate requests | Mock flow: single in-flight “payment” token; ignore / no-op additional triggers |
| Submit again | Not allowed until result navigates away or parent explicitly allows retry (on Failure) |
| Back / cancel | Prefer **no Cancel that retries charge**. Browser back → ideally re-enter processing or Checkout in a **locked** state until mock settles (product: prevent second charge intent in mock timer) |
| Navigation | Optional: intercept navigation with “Payment in progress” if product wants; mock phase at minimum must not fire a second mock payment on re-entry without new intent id |

**One mock payment intent id per Pay Now click.** Success/Failure transition consumes it.

---

## 8. Mock Behaviour

Simulate payment processing on the frontend only.

```text
Pay Now
  → Processing (delay + optional stages)
       ├─ Success → SCREEN-015_PAYMENT_SUCCESS
       └─ Failure → SCREEN-016_PAYMENT_FAILURE
```

| Control | Spec |
|---------|------|
| Result source | Mocked state / feature flag / query / config (e.g. always success, always fail, random, timeout) for local/dev |
| Delay | Product-tunable (e.g. 2–5s) — long enough to see UI; not endless unless testing Timeout |
| Stripe | **Do not connect** |
| Entitlements | Do not grant Pro/Business from client on mock success unless an explicit **demo session flag** is documented for UI-only demos |

### Timeout path

| Spec | Detail |
|------|--------|
| Condition | Processing exceeds mock timeout threshold without resolution |
| UI | State **Timeout** — clear message; **Do not** claim charge succeeded |
| Actions | Retry processing (same intent only if mock-safe) **or** Back to Checkout / Check payment status (future) |
| Navigate | Prefer stay on this screen or dedicated timeout UI; do not auto-route to Success |

---

## 9. States

| State | Spec |
|-------|------|
| **Processing** | Default entered state — indicator + messages + plan summary |
| **Success** | Brief confirm on this screen **or** immediate route to SCREEN-015 (Figma preference: usually navigate) |
| **Failure** | Route to SCREEN-016 (or Failure modal shell) |
| **Timeout** | Timeout message + recovery CTAs; not treated as Success |

Loading skeleton is optional if enter-from-Checkout is instantaneous into Processing.

---

## 10. Membership / Auth Behaviour

| Tier | Spec |
|------|------|
| **Guest** | Redirect Login |
| **Free / Pro / Business** | Allowed if they initiated Pay Now from Checkout for a valid selection |

Deep-link to this screen without an in-flight mock intent → Checkout or Billing & Payments.

---

## 11. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Focus managed to main processing region; no keyboard trap |
| Screen reader | Announce **“Processing your payment…”** on entry; update on Timeout/Success/Failure transition |
| Progress | If determinate progressbar, expose `aria-valuenow` etc.; if indeterminate, use busy status text |
| Not animation-only | Text messages required |
| Reduced motion | Respect prefers-reduced-motion — pause non-essential animation; keep text status |

---

## 12. Analytics

| Event | Trigger |
|-------|---------|
| **Payment Processing Viewed** | Screen open / processing UI visible |
| **Payment Processing Started** | Mock payment intent begins (typically same moment as enter from Pay Now) |
| **Payment Processing Completed** | Mock resolves success (before or as navigate to Success) |
| **Payment Processing Failed** | Mock resolves failure |
| **Payment Processing Timeout** | Timeout threshold hit |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `plan`, `billingCycle`, `amount` (or amount bucket), `intentId` (mock), **no** card data |

Consent: marketing destinations after cookie consent; operational payment logs separate when backend exists.

---

## 13. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Centered processing composition per Figma |
| **Tablet** | Same hierarchy |
| **Mobile** | Single column; full-width summary; readable messages without horizontal scroll |

---

## 14. Components to Reuse

| Need | Reuse |
|------|--------|
| Plan block | `COMPONENT_CHECKOUT_SUMMARY` (compact / processing context) |
| Security | Shared lock/security notice pattern from Billing & Payments / Checkout |
| Spinner / progress | Shared loading primitives |

No payment form components on this screen.

---

## 15. Security

| Rule | Spec |
|------|------|
| No instruments | No card / wallet capture here |
| Idempotency (future) | Server PaymentIntent / Checkout Session + Idempotency-Key; client mock intent mirrors the idea |
| Entitlements | Never flip paid tier on client timer alone in production |
| Refresh | User refresh mid-mock must not create a second charge intent without user re-confirm on Checkout |
| Phishing | Do not ask for OTP/password on this screen in mock (3DS is provider-owned later) |

---

## 16. Future Stripe Integration (out of scope now)

| Future behaviour | Spec |
|------------------|------|
| Hosted Checkout | Processing may be short interstitial before redirect **or** post-return “Confirming…” |
| Elements / PaymentIntent | `processing` / `requires_action` → 3DS → confirm |
| Webhooks | Success screen only after entitlement confirmed or “activating…” until webhook |
| SCREEN-M07 | Checkout Return Success/Cancel maps adjacent product work |

---

## 17. Navigation Summary

```text
Checkout (013) — Pay Now
        ↓
Payment Processing (014)
        ├─ Success → Payment Success (015)  [map: SCREEN-008 modal OK]
        ├─ Failure → Payment Failure (016)  [map: SCREEN-007 modal OK]
        └─ Timeout → stay / recover (retry / back) — not Success
```

---

## 18. Developer Notes

| Rule | Spec |
|------|------|
| Mock only | Simulated delay + forced result; no Stripe; no Supabase; no API |
| Architecture | Single mock payment controller; screen is mostly presentational |
| State | Carry plan summary from Checkout mock store |
| Tokens | Design tokens only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 19. QA Checklist

□ Entry only from Checkout Pay Now with valid context  
□ Processing indicator + primary/supporting messages  
□ Plan name, cycle, amount, credits  
□ Security message + lock icon  
□ No second Pay / no duplicate mock charge  
□ Mock → Success (015) / Failure (016) / Timeout  
□ No Stripe / Supabase / API  
□ States: Processing, Success, Failure, Timeout  
□ Analytics five events  
□ WCAG 2.2 AA — SR status, not animation-only  
□ Desktop / Tablet / Mobile  

---

## 20. Non-goals (this phase)

| Out of scope |
|--------------|
| Real Stripe / PayPal / wallets |
| Raw card or custom email OTP |
| Granting real Pro/Business entitlements |
| Buy Credits top-up flow (other SCREEN-014 in mapping) |
| Invoice PDF generation |

---

**End of SCREEN-014 / SCREEN-014_PAYMENT_PROCESSING.md**
