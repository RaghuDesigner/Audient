# SCREEN-016 — Payment Failure

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-09  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · Security · QA  

**Screen ID:** SCREEN-016 (product brief)  
**Canonical mapping:** Payment failure confirmation after processing · Figma **SCREEN-007** Payment Failed Modal · related decline paths after Payment Modal **SCREEN-006** in `SCREEN_MAPPING.md`  
**Screen name:** Payment Failure  
**Figma:** Payment failed full page and/or failure dialog — **exact match** (page vs modal per Figma; behaviour identical)  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** Product brief **SCREEN-016** = Payment Failure. Mapping uses **SCREEN-007** for the failure **modal** and reserved **SCREEN-016** for Upgrade Dialog backlog. Prefer this brief for the post-processing failure **page**; modal shell remains valid if Figma is dialog-only. Renumber when consolidating.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock failure states only** — **no Stripe**, **no Supabase**, **no backend**.  
> **Hard rule:** **No subscription activation**, **no credits grant**, **no entitlement change** on failure. Avoid **duplicate subscriptions** and **duplicate payment attempts** (new intent only on intentional retry).

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ERROR_HANDLING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-014_PAYMENT_PROCESSING.md` · `docs/screens/SCREEN-015_PAYMENT_SUCCESS.md` · `docs/screens/SCREEN-013_CHECKOUT.md` · `docs/screens/SCREEN-012_BILLING_AND_PAYMENTS.md` · `docs/components/COMPONENT_CHECKOUT_SUMMARY.md`

---

## 1. Purpose

Clearly informs the user that **payment could not be completed** and provides **safe next actions**.

Must:

- State that the **subscription was not activated**  
- Show a **user-friendly** reason (not raw gateway dumps)  
- Offer **Try Again**, **Change Payment Method**, and **Back to Billing** without double-charging or double-subscribing  

The UI must **match the approved Figma exactly**.

---

## 2. Entry Point

```text
SCREEN-014 Payment Processing
        ↓
Payment Failed (mock resolution)
        ↓
SCREEN-016 Payment Failure
```

| Prerequisite | Spec |
|--------------|------|
| Auth | Required — Guest → Login |
| Prior failure | Only after Processing **Failure** (or future provider decline / 3DS fail / network) |
| Deep link without failure context | Redirect to **Billing & Payments** or **Manage Membership** — do not invent a failure event |

Also (future): Payment Modal / Elements decline → same failure UX (modal or page).

---

## 3. Layout

```text
Failure Illustration
        ↓
Failure Message
        ↓
Reason
        ↓
Order Summary
        ↓
Recommended Action
        ↓
Actions
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell (or modal overlay per Figma) |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Membership chrome | Unchanged — still Free/Pro/Business **prior** to failed attempt |

---

## 4. Failure Message

| Element | Spec |
|---------|------|
| **Heading** | **Payment Could Not Be Completed** |
| **Supporting message** | **We couldn't complete your payment. Your subscription has not been activated.** |
| **Illustration** | Failure / error icon (e.g. red ✕) per Figma — not the sole error signal |

Mapping note: dialog may say “Payment for ‘Pro’ subscription failed” — **prefer brief strings above** unless Figma still uses product-name variant; always include **not activated** semantics.

---

## 5. Failure Reason

Display a **user-friendly** reason from a controlled enum (mock now; mapped from provider codes later).

| Reason code (internal) | User-facing example |
|------------------------|---------------------|
| `declined` | Payment declined |
| `method_unavailable` | Payment method unavailable |
| `session_expired` | Session expired |
| `network` | Network error |
| `timeout` | Payment timeout |
| `unknown` | Unknown error |

| Rule | Spec |
|------|------|
| Safe copy | No raw Stripe/processor error dumps, card fingerprints, or internal stack traces |
| 3DS / SCA | Map to decline / cancelled style messages — not “enter email OTP” product copy |
| Recommended Action | Short next-step hint tied to reason (e.g. declined → try another method; network → try again) |
| ERROR_HANDLING | Align tone with global error patterns |

---

## 6. Order Summary

Display (read-only — what they **attempted** to buy):

| Field | Spec |
|-------|------|
| **Plan** | Pro / Business |
| **Billing Cycle** | Monthly / Yearly |
| **Amount** | Attempted total + currency |
| **Credits Included** | Plan grant (would-have-been) |

Reuse Checkout Summary compact variant when Figma matches. Amounts match Checkout intent — **not charged**.

---

## 7. Recommended Action

| Spec | Detail |
|------|--------|
| Content | One short guidance line derived from reason (Figma may fix a single generic line) |
| Examples | “Try another card or payment method.” / “Check your connection and try again.” / “Sign in again, then return to checkout.” |
| Placement | Between Order Summary and Action buttons unless Figma places otherwise |

---

## 8. Actions

| CTA | Spec |
|-----|------|
| **Try Again** | Primary — re-enter payment flow **without** creating a duplicate subscription |
| **Change Payment Method** | Secondary — payment method section (placeholder / Billing & Payments / future Elements) |
| **Back to Billing** | Tertiary — **Manage Membership** or **Billing & Payments** |

### Try Again

| Rule | Spec |
|------|------|
| Destination | Prefer **Checkout (013)** or **Payment Processing (014)** with a **new mock payment intent** only after explicit click |
| Subscription | Must **not** create a second subscription object, second mock activation, or stack duplicate “active” plans |
| Idempotency (future) | New PaymentIntent / Checkout Session per retry; never retry silent side effects on page load |
| State | Enter **Retrying** briefly if returning through Processing |

### Change Payment Method

| Rule | Spec |
|------|------|
| Destination | Payment method area on **Billing & Payments** or Checkout payment placeholder / future Stripe Elements |
| Effect | No charge until user completes Pay Now again |

### Back to Billing

| Rule | Spec |
|------|------|
| Destination | **Manage Membership** and/or **Billing & Payments** per product preference (document one default: Billing & Payments) |
| Effect | Exit pay flow; intent remains failed and closed |

---

## 9. Membership & Entitlements

| Rule | Spec |
|------|------|
| On failure | **Do not** update mock membership to paid |
| Credits | **Do not** add plan credits |
| Prior plan | Unchanged |
| Double pay | Consumed mock intent stays **failed**; retry allocates a **new** intent only on Try Again |

---

## 10. States

| State | Spec |
|-------|------|
| **Failure** | Default — message, reason, summary, actions |
| **Retrying** | After Try Again — disable buttons; optional “Starting payment again…” then route to Processing/Checkout |
| **Loading** | Hydrating failure reason/summary from mock store |
| **Error** | Failure UI itself cannot load context — generic error + Back to Billing / Retry load (**not** a second charge) |

No Success path on this screen.

---

## 11. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Screen reader | Announce failure on open (`assertive` or focus to heading + text reason) |
| Keyboard | All three CTAs operable; logical order |
| Visible focus | Required |
| Error not color-only | Text + icon |
| Modal shell | Dialog semantics if overlay; focus to heading; Escape → Back to Billing or dismiss policy per Figma |
| Buttons | Distinct labels (Try Again / Change Payment Method / Back to Billing) |

---

## 12. Analytics

| Event | Trigger |
|-------|---------|
| **Payment Failure Viewed** | Screen/modal open |
| **Retry Payment Clicked** | Try Again activated |
| **Change Payment Method Clicked** | Change Payment Method |
| **Back To Billing Clicked** | Back to Billing |
| **Payment Retry Started** | New mock (or future real) payment intent actually begins after Try Again |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `reason` (enum), `plan`, `billingCycle` — **no** raw gateway payload, PAN, or full error objects to marketing analytics |

---

## 13. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Centered failure composition or modal per Figma |
| **Tablet** | Same hierarchy |
| **Mobile** | Stacked; full-width primary/secondary CTAs |

---

## 14. Components to Reuse

| Need | Reuse |
|------|--------|
| Order summary | `COMPONENT_CHECKOUT_SUMMARY` (compact; failed context) |
| Error icon / alert | Shared failure confirmation pattern |
| Buttons | Primary / secondary / tertiary token styles |

No payment form fields on this screen unless Change Payment Method navigates elsewhere.

---

## 15. Security

| Rule | Spec |
|------|------|
| No activation on failure | Hard requirement |
| No sensitive gateway data | Friendly reasons only |
| No silent retry | Failures do not auto-retry charge on mount or refresh |
| Idempotency | Future server enforces one completion path per intent |
| Session expired | May force re-auth before retry if session truly invalid |

---

## 16. Mock Behaviour

| Control | Spec |
|---------|------|
| Reason | Mock state / flag selects declined, network, timeout, etc. |
| Processing → Failure | As defined in SCREEN-014 |
| Try Again | New mock intent id; old failed id not re-finalized as success without Processing again |

---

## 17. Navigation Summary

```text
Payment Processing (014) — Failure
        ↓
Payment Failure (016)
        ├─ Try Again → Checkout / Processing (new intent; no duplicate sub)
        ├─ Change Payment Method → payment method UI
        └─ Back to Billing → Manage Membership / Billing & Payments
```

---

## 18. Developer Notes

| Rule | Spec |
|------|------|
| Data | Mocked failure reason + order snapshot from processing intent |
| No | Stripe · Supabase · backend |
| Entitlements | Leave mock membership untouched |
| Anti-duplicate | Fail intent closed; retry = new intent on explicit CTA only |
| Tokens | Design tokens only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 19. QA Checklist

□ Entry from Processing failure only  
□ Heading + supporting “not activated” message  
□ Friendly reason; no sensitive gateway dump  
□ Order summary: plan, cycle, amount, credits  
□ Recommended action present  
□ Try Again / Change Payment Method / Back to Billing  
□ Try Again does not create duplicate subscription or silent second charge  
□ Membership/credits **unchanged**  
□ States: Failure, Retrying, Loading, Error  
□ Analytics five events  
□ WCAG 2.2 AA · SR announcement · keyboard · focus  
□ Desktop / Tablet / Mobile  
□ Mock only — no Stripe/Supabase/API  

---

## 20. Non-goals (this phase)

| Out of scope |
|--------------|
| Real decline-code mapping from Stripe (document mapping later) |
| Partial payments / dispute flows |
| Automatic subscription creation on any failure path |
| Refund UI (no charge succeeded) |

---

**End of SCREEN-016 / SCREEN-016_PAYMENT_FAILURE.md**
