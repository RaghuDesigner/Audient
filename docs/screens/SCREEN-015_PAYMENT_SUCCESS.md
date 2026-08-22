# SCREEN-015 — Payment Success

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-09  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · Security · QA  

**Screen ID:** SCREEN-015 (product brief)  
**Canonical mapping:** Payment Success confirmation after processing · Figma **SCREEN-008** Payment Success Modal · related **SCREEN-M07** Checkout Return success / webhook lag in `SCREEN_MAPPING.md`  
**Screen name:** Payment Success  
**Figma:** Payment success full page and/or success dialog — **exact match** (page vs modal per Figma; behaviour identical)  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** Product brief **SCREEN-015** = Payment Success. Mapping uses **SCREEN-008** for the success **modal** and reserved **SCREEN-015** for Checkout Return backlog. Prefer this brief for the post-processing success **page**; modal shell remains valid if Figma is dialog-only. Renumber when consolidating.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Pricing / grants:** Pro **$29** / **1,000** credits · Business **$99** / **10,000** (`PRICING.md`).  
> **Phase:** **Mock only** — **no Stripe**, **no Supabase**, **no backend**. Mock membership update only.  
> **Production rule:** Real entitlements are **webhook-authoritative** (`SECURITY.md`). Do not treat UI “success” alone as production truth without provider/webhook confirmation.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/screens/SCREEN-014_PAYMENT_PROCESSING.md` · `docs/screens/SCREEN-013_CHECKOUT.md` · `docs/components/COMPONENT_CHECKOUT_SUMMARY.md` · `docs/components/COMPONENT_BILLING_SUMMARY.md` · `docs/components/COMPONENT_CURRENT_PLAN_CARD.md`

---

## 1. Purpose

Confirms that the user’s **subscription payment completed successfully**.

Communicate clearly:

| Message | Spec |
|---------|------|
| Payment successful | Heading + visual success affordance |
| Subscription activated | Supporting copy + status |
| Plan purchased | Plan name in summary |
| Amount paid | Payment summary total |
| Credits received | Credits added + balance |
| Renewal information | Next billing / renewal date |

The UI must **match the approved Figma exactly**.

---

## 2. Entry Point

```text
SCREEN-014 Payment Processing
        ↓
Successful Payment (mock resolution)
        ↓
SCREEN-015 Payment Success
```

| Prerequisite | Spec |
|--------------|------|
| Auth | Required — Guest → Login |
| Prior success | Only after Processing **Success** (or future verified webhook / Checkout Return success) |
| Deep link without success context | Redirect to **Dashboard** or **Manage Membership** — do not fake a completed payment |

Alternate future entry: hosted Stripe return → Checkout Return (SCREEN-M07) → this success UI when payment + entitlement confirmed.

---

## 3. Layout

```text
Success Illustration
        ↓
Success Message
        ↓
Subscription Summary
        ↓
Payment Summary
        ↓
Credits Information
        ↓
Next Billing Date
        ↓
Actions
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell (or modal overlay per Figma) |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Figma | Modal vs full page: **Figma wins**; same content model either way |
| Application Header | Update credits/plan badge when mock membership updates (crown, balance) |

---

## 4. Success Message

| Element | Spec |
|---------|------|
| **Heading** | **Payment Successful** |
| **Supporting message** | **Your Audient subscription is now active.** |
| **Illustration / icon** | Success graphic or green check per Figma — not the only success signal |

Mapping note: dialog copy may read like “Payment for ‘Pro’ subscription is Successful” — **prefer brief strings above** unless Figma still shows product-name variant; fix historical typo “Succesfull” → “Successful”.

---

## 5. Subscription Summary

Display:

| Field | Spec |
|-------|------|
| **Plan Name** | Pro / Business purchased |
| **Billing Cycle** | Monthly / Yearly |
| **Subscription Status** | **Active** (mock) |
| **Credits Included** | Plan monthly grant (1,000 / 10,000) |
| **Renewal Date** | Next renewal for cycle |

Reuse **Checkout Summary** (`COMPONENT_CHECKOUT_SUMMARY.md`) in success context when layout matches.

---

## 6. Payment Summary

Display:

| Field | Spec |
|-------|------|
| **Amount Paid** | Charge amount before or aligned with lines below — Figma order |
| **Discount** | Plan/promo discount or $0 / — |
| **Tax** | Mock tax line |
| **Total** | Final amount paid + currency |
| **Payment Reference (Mock)** | Mock reference id (e.g. `AUD-PAY-****`) — not a real Stripe charge id yet |

Totals must match the Checkout / Processing selection for the same mock intent.

---

## 7. Credits Information

Display:

| Field | Spec |
|-------|------|
| **Credits Added** | Credits granted by this purchase (plan grant; mock policy: set balance to plan grant or add delta — document chosen mock rule consistently) |
| **Total Available Credits** | Post-purchase mock balance |

| Mock rule (recommended) | Spec |
|-------------------------|------|
| New paid plan | Set available credits to plan included amount **or** add included amount to remaining Free balance — product chooses one; keep consistent with Manage Membership mock |
| Upgrade Pro → Business | Update balance toward Business grant (10,000) per mock policy |

No real ledger.

---

## 8. Next Billing Date

| Spec | Detail |
|------|--------|
| Display | Next billing / renewal date for selected cycle |
| Free leftover | Not applicable after paid activation |
| Yearly | Next date = mock + 1 year; Monthly = mock + 1 month |

May live inside Subscription Summary if Figma collapses “Renewal Date” and “Next Billing Date” into one field — do not duplicate conflicting dates.

---

## 9. Actions

| CTA | Spec |
|-----|------|
| **Go to Dashboard** | Primary → Authenticated Dashboard / Pro Home |
| **View Invoice** | Secondary → placeholder **Invoice History** or **Invoice Details** (empty/mock destination OK) |
| **Start New Audit** | Optional → audit start (Home/Dashboard upload) |

| Invoice | Spec |
|---------|------|
| Navigation | Placeholder only this phase |
| PDF | **No PDF generation yet** |
| Copy | May label “View Invoice” even if detail page is stub |

---

## 10. Membership (Mock Update)

On successful entry to this screen, update **mocked membership state**:

| From → To | Spec |
|-----------|------|
| Free → Pro | When selected plan was Pro |
| Free → Business | When selected plan was Business |
| Pro → Business | When selected plan was Business upgrade |

| Rule | Spec |
|------|------|
| UI | Header badge, Manage Membership Current Plan Card, credits widgets reflect new tier after update |
| Analytics | **Subscription Activated** with `plan` |
| Production | Replace with webhook-verified membership; if webhook lags, show “activating…” / poll — not false “fully active” without confirmation |
| Demo flag | Mock flip is intentional for frontend demos; never ship client-only entitlement grant as production security model |

Downgrades / mid-cycle proration are out of scope for this success path.

---

## 11. States

| State | Spec |
|-------|------|
| **Success** | Primary state — full confirmation content + actions |
| **Loading** | Brief hydrate if waiting on mock membership/header update or (future) membership poll after webhook |
| **Error** | Rare: success payload missing / membership update failed mock — message + Retry load summary **or** Go to Dashboard; do **not** claim payment failed if payment already succeeded (reconcile carefully) |

Webhook-pending (future): subset of Loading — “Activating your plan…” until `ACTIVE`.

---

## 12. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Screen reader | Announce success on open (live region / focus to heading “Payment Successful”) |
| Keyboard | All CTAs operable; logical tab order illustration → copy → summaries → actions |
| Visible focus | Required |
| Modal shell | If dialog: dialog semantics, focus trap, Escape dismiss policy per Figma (prefer focus primary CTA) |
| Status | Success not color-only (text + icon) |

---

## 13. Analytics

| Event | Trigger |
|-------|---------|
| **Payment Success Viewed** | Screen/modal open |
| **Dashboard Clicked** | Go to Dashboard |
| **Invoice Viewed** | View Invoice |
| **New Audit Clicked** | Start New Audit |
| **Subscription Activated** | Mock membership updated to paid target plan |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `plan`, `billingCycle`, `amount` bucket, `mockPaymentRef` — **no** card / PII |

Consent: marketing after cookie consent; payment operational logs separate when backend exists.

---

## 14. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Centered success composition per Figma |
| **Tablet** | Same hierarchy |
| **Mobile** | Stacked summaries; full-width primary CTA |

---

## 15. Components to Reuse

| Need | Reuse |
|------|--------|
| Plan / subscription | `COMPONENT_CHECKOUT_SUMMARY` (payment_success context) |
| Money lines | Billing Summary field naming alignment |
| Credits | Credits widget patterns for totals if Figma aligns |
| Success icon | Shared confirmation illustration |

---

## 16. Security

| Rule | Spec |
|------|------|
| Trust | Production: trust Stripe + webhook, not this screen alone |
| Mock | Client mock membership OK for UI demos only |
| References | Mock payment reference is not a bank/charge proof |
| Invoice | Stub must not expose other users’ data |
| Refresh | Revisit with success intent shows cached success once; do not re-fire payment |

---

## 17. Navigation Summary

```text
Payment Processing (014) — Success
        ↓
Payment Success (015)
        ├─ Go to Dashboard → Dashboard / Pro Home
        ├─ View Invoice → Invoice History/Details (placeholder)
        └─ Start New Audit → Audit start (optional)
```

---

## 18. Developer Notes

| Rule | Spec |
|------|------|
| Data | Mocked payment + plan + credits from processing intent |
| No | Stripe · Supabase · backend · PDF invoices |
| Membership | Update mock store on success; drive chrome from store |
| Tokens | Design tokens only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 19. QA Checklist

□ Entry from Processing success only  
□ Heading + supporting message exact (or Figma variant)  
□ Subscription summary: plan, cycle, status, credits, renewal  
□ Payment summary: amount, discount, tax, total, mock reference  
□ Credits added + total available  
□ Primary / Secondary / Optional CTAs  
□ Invoice placeholder — no PDF  
□ Mock membership Free/Pro/Business transitions  
□ States: Success, Loading, Error  
□ Analytics five events including Subscription Activated  
□ WCAG 2.2 AA · SR announcement · keyboard · focus  
□ Desktop / Tablet / Mobile  
□ Mock only — no Stripe/Supabase/API  

---

## 20. Non-goals (this phase)

| Out of scope |
|--------------|
| Real Stripe confirmation or webhooks |
| PDF invoice generation |
| Email receipt delivery |
| Proration / partial refunds UI |
| Granting production entitlements without verification |

---

**End of SCREEN-015 / SCREEN-015_PAYMENT_SUCCESS.md**
