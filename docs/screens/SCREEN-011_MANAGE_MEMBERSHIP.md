# SCREEN-011 — Manage Membership

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Growth · QA  

**Screen ID:** SCREEN-011 (product brief)  
**Canonical mapping:** **SCREEN-005** (Manage Plan) in `SCREEN_MAPPING.md` · related MDL-002  
**Screen name:** Manage Membership  
**Figma:** Manage Plan / membership frames (`Screen4`, `Screen4.1`, `Screen4.2`) — **exact match**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` uses **SCREEN-011** for Payment Details (Account Settings). This document is **Manage Membership / Manage Plan**. Prefer SCREEN-005 in engineering.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Pricing authority:** `docs/PRICING.md` — Free **$0 / 300** · Pro **$29/mo / 1,000** · Business **$99/mo / 10,000**. Update stale Figma $99/$199 labels; keep layout.  
> **Phase:** **Mock data only** — **no Stripe**, **no backend**.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/components/COMPONENT_PLAN_COMPARISON.md` · `docs/components/COMPONENT_UPGRADE_BANNER.md` · `docs/components/COMPONENT_MEMBERSHIP_WIDGET.md` · `docs/components/COMPONENT_CREDITS_WIDGET.md`

---

## 1. Purpose

The Manage Membership screen allows authenticated users to:

- Understand their **current subscription**  
- **Compare** available plans  
- Manage **billing preferences** (UI placeholder this phase)  
- **Purchase credits** (UI placeholder / mock this phase)  
- **Upgrade or downgrade** membership  

This is the **primary monetization experience** of Audient.

The layout must **follow the approved Figma exactly**.

Guests reaching Upgrade flows should **Login** first, then land here (or see Plan Comparison Modal).

---

## 2. Entry Points

```text
Dashboard → Manage Membership

Upgrade Banner → Manage Membership

Profile Menu → Manage Membership (Manage Plan)
```

Also: Credits widget Upgrade, Locked PDF/URL gates → Upgrade Modal → continue to this screen / checkout (checkout mocked).

---

## 3. Layout

```text
Application Header
        ↓
Membership Overview
        ↓
Current Plan Card
        ↓
Usage & Credits
        ↓
Plan Comparison
        ↓
Billing Summary
        ↓
Upgrade CTA
        ↓
FAQ
        ↓
Footer
```

| Rule | Spec |
|------|------|
| Shell | Global app shell; authenticated header (logo, credits, avatar; crown if Pro/Business) |
| Figma | If Figma uses card grid without a separate FAQ block, **Figma wins** — do not invent FAQ content not in design |
| Tokens | Design tokens only |

---

## 4. Membership Plans

| Plan | Positioning |
|------|-------------|
| **Guest** | No plan — not a Manage Membership occupant; convert via Login |
| **Free** | Limited features — screenshot, brief report, 300 credits |
| **Pro** | Professional features — URL audits, full report, PDF, 1,000 credits @ **$29/mo** |
| **Business** | Organization / volume features — 10,000 credits @ **$99/mo**; teams/org share = roadmap placeholders |

Schema: Business → `ENTERPRISE`. UI label remains **Business**.

Monthly vs yearly: show **yearly price** if Figma includes billing toggle; amounts must not contradict `PRICING.md` (define yearly only when product confirms — otherwise monthly-only + placeholder yearly).

---

## 5. Membership Overview

| Content | Spec |
|---------|------|
| Headline | e.g. Manage membership / Your plan — per Figma |
| Short copy | Value of upgrading or managing billing |
| Optional | Reuse Membership Widget patterns |

---

## 6. Current Plan Card

Display:

| Field | Spec |
|-------|------|
| **Plan Name** | Free / Pro / Business |
| **Billing Cycle** | Monthly / Yearly (mock) |
| **Renewal Date** | Next renewal / period end (omit nuance for Free) |
| **Status** | Active / Cancelled / Expired / Past due (map to states §12) |
| **Credits Remaining** | Server-authoritative later; mock now |
| **Upgrade Button** | Shown when a higher plan exists (Free→Pro, Pro→Business) |
| **Manage Billing Button** | Opens billing portal placeholder / Billing Summary focus |

Reuse `COMPONENT_MEMBERSHIP_WIDGET` / Plan Card patterns from `COMPONENT_MAPPING` — no duplicate plan chrome.

---

## 7. Usage & Credits

Display:

| Field | Spec |
|-------|------|
| **Credits Remaining** | |
| **Credits Used** | Current period |
| **Reports Generated** | Count this period (mock) |
| **Storage Used** | Placeholder metric if Figma shows it; else omit |
| **Progress Bars** | Credits (and storage if shown) |

Reuse `COMPONENT_CREDITS_WIDGET` patterns.  
Optional: **Buy Credits** / top-up CTA for Pro/Business only (`PRICING.md` — Free cannot top up).

Analytics: **Credits Purchased** when mock top-up completes (or CTA clicked with intent — prefer confirm on mock success).

---

## 8. Plan Comparison

Display:

| Element | Spec |
|---------|------|
| **Feature Matrix** | Credits, URL, PDF, History, recommendations, etc. |
| **Monthly Price** | Free $0 · Pro $29 · Business $99 |
| **Yearly Price** | If Figma toggle — use approved yearly figures or hide until confirmed |
| **Included Credits** | 300 / 1,000 / 10,000 |
| **Additional Credits** | Top-up packs note for Pro/Business |
| **CTA Button** | Subscribe / Upgrade / Current plan (disabled) / Contact Sales |

Reuse `COMPONENT_PLAN_COMPARISON` / `PricingTable` / `PlanCard`. Team/API/White Label rows = Coming soon if shown.

Analytics: **Upgrade Clicked** / **Downgrade Clicked** on respective CTAs.

---

## 9. Billing Summary

Display:

| Field | Spec |
|-------|------|
| **Current Payment Method** | **Placeholder** (e.g. “Visa •••• 4242” mock or “Add payment method”) |
| **Next Billing Date** | Mock / from membership |
| **Current Subscription Cost** | $0 / $29 / $99 |
| **Invoice History Button** | **Placeholder** — no real invoices this phase |

**Manage Billing** / portal: mock open or toast “Billing portal coming soon” — **no Stripe**.

Analytics: **Billing Clicked**.

---

## 10. Upgrade CTA

| Spec |
|------|
| Prominent CTA band — Upgrade to Pro / Upgrade to Business / Contact Sales per current plan |
| May duplicate Plan Comparison primary CTA — follow Figma (one or both) |
| Opens mock checkout success path or Plan Comparison highlight — **no Stripe Checkout** |

---

## 11. FAQ

| Spec |
|------|
| Common membership questions (expandable) |
| Only if present in Figma — do not invent long FAQ copy |
| Analytics: **FAQ Expanded** |

---

## 12. States

| State | Spec |
|-------|------|
| **Loading** | Skeletons for overview, plan card, usage, comparison |
| **Success** | Hydrated mock membership |
| **Empty** | Rare — treat as Free default mock if no plan payload |
| **Error** | Friendly load error + Retry |
| **Cancelled Plan** | Status Cancelled; access until period end copy; CTA Reactivate / Choose plan |
| **Expired Plan** | Status Expired / lapsed; restricted entitlements messaging; Upgrade / Resubscribe |

Map `PAST_DUE` to Expired or warning under Success per Figma/ERROR_HANDLING.

---

## 13. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | All CTAs, plan cards, FAQ disclosures operable |
| Plan cards | Selected/current plan announced; price + credits as text |
| Progress bars | Text + progressbar semantics |
| Focus visible | Required |
| FAQ | `aria-expanded` |

---

## 14. Analytics

| Event | Trigger |
|-------|---------|
| **Membership Viewed** | Screen open (`manage_plan_opened` / equivalent) |
| **Upgrade Clicked** | Upgrade / Subscribe CTA |
| **Downgrade Clicked** | Downgrade / switch to Free CTA |
| **Credits Purchased** | Mock top-up success (or explicit purchase confirm) |
| **Billing Clicked** | Manage Billing / Invoice History / payment method |
| **FAQ Expanded** | FAQ item opened |

---

## 15. Security

| Rule | Spec |
|------|------|
| Auth required | Guests → Login then resume |
| Entitlements | Never grant Pro/Business from client alone — even in mock, do not flip real session tier without clear mock flag |
| Future Stripe | Webhook-authoritative (`SECURITY.md`) |
| This phase | UI mock only |

---

## 16. Developer Notes

| Rule | Spec |
|------|------|
| Data | **Mock only** |
| Integrations | **No Stripe**, **no backend** |
| Reuse | Plan cards, Credits Widget, Membership Widget, Plan Comparison, Upgrade Banner patterns — **no duplicates** |
| Prices | From `PRICING.md` / `plans.ts` config conceptually |
| Later | Checkout, Customer Portal, invoices, top-ups via verified webhooks |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 17. Navigation Summary

```text
Dashboard / Upgrade Banner / Profile → Manage Membership
        ├─ Upgrade → mock checkout / highlight Pro or Business
        ├─ Downgrade → confirm mock → Free messaging
        ├─ Manage Billing → placeholder
        ├─ Buy Credits → placeholder (Pro/Business)
        └─ Invoice History → placeholder
```

---

## 18. QA Checklist

□ Figma-exact layout  
□ Entry from Dashboard, Upgrade Banner, Profile  
□ Current Plan Card fields + Upgrade / Manage Billing  
□ Usage & credits progress  
□ Plan comparison with $29 / $99 and credit grants  
□ Billing summary placeholders  
□ Upgrade CTA + FAQ (if in Figma)  
□ States: Loading, Success, Error, Cancelled, Expired  
□ Mock only — no Stripe/backend  
□ Analytics events  
□ WCAG 2.2 AA  
□ Reused components only  

---

## 19. Non-goals (this phase)

| Out of scope |
|--------------|
| Real Stripe Checkout / Portal |
| Real invoices / payment method attach |
| Live credit top-up charges |
| Working teams/org billing seats |
| Guest Manage Membership without login |

---

**End of SCREEN-011 / SCREEN-011_MANAGE_MEMBERSHIP.md**
