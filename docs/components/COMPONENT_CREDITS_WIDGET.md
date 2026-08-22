# COMPONENT-017 — Credits Widget

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-017  
**Component name:** Credits Widget (`CreditsWidget` / aligns with `CreditMeter` in `COMPONENT_MAPPING.md`)  
**Screen:** Authenticated Dashboard (`SCREEN-008_AUTHENTICATED_DASHBOARD.md`); reusable in billing / header contexts when Figma matches  
**Figma:** Credits widget / Credit Meter — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/COMPONENT_MAPPING.md` (Credit Meter) · `docs/screens/SCREEN-008_AUTHENTICATED_DASHBOARD.md` · `docs/components/COMPONENT_WELCOME_CARD.md` · `docs/components/COMPONENT_UPGRADE_BANNER.md` · `docs/PRICING.md` · `docs/SECURITY.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/ERROR_HANDLING.md`

---

## 1. Purpose

Display **remaining audit credits** and period usage so users understand capacity before starting audits and can upgrade or buy more when low.

**Do not redesign.** Match Figma. Values are **server-authoritative** — never trust client-edited balances (`SECURITY.md`).

---

## 2. Display

| Element | Spec |
|---------|------|
| **Remaining Credits** | Current spendable balance |
| **Monthly Credits** | Plan monthly grant (Free **300** · Pro **1,000** · Business **10,000** per `PRICING.md`) |
| **Used Credits** | Credits consumed in the current period (or derived: grant − remaining when top-ups make derivation unsafe — prefer API `used` / `remaining` / `monthlyGrant`) |
| **Progress Bar** | Visual used vs grant (or used vs period allocation per Figma) |
| **Renewal Date** | Next credit reset / subscription renewal date when applicable |
| **Upgrade Button** | Primary CTA when user should upgrade or buy capacity (see §4) |

Welcome Card may also show credits — keep numbers consistent from the same store; layout follows Figma (summary vs full widget).

---

## 3. States

| State | Spec |
|-------|------|
| **Loading** | Skeleton for numbers, bar, renewal, button; `aria-busy` |
| **Success** | Healthy balance; normal styling; Upgrade optional/hidden per tier rules |
| **Warning** | Low credits (threshold product-defined, e.g. &lt; 20% of monthly grant or &lt; one screenshot cost); warning styling + stronger Upgrade / Buy CTA |
| **Exhausted** | Remaining **0** (or below cheapest audit cost); exhausted styling; Upgrade / Buy Credits emphasized; starting audits blocked upstream |

| Rule | Spec |
|------|------|
| Thresholds | Configure centrally; do not hardcode magic numbers in unrelated screens |
| Top-ups | Pro/Business purchased credits may raise `remaining` above `monthlyGrant` — progress UI must not look “over 100%” incorrectly; follow API fields / Figma |
| Business | High grant; still show usage; Upgrade may become Buy Credits / Contact Sales per Figma |

---

## 4. Upgrade Button Behaviour

| Tier | Button |
|------|--------|
| **Free** | **Upgrade** → Upgrade Modal / Plan Comparison / Manage Plan |
| **Pro** | Optional **Buy Credits** / Manage Plan (top-ups allowed); not “Upgrade to Pro” |
| **Business** | Manage / Contact Sales / top-up per Figma — not Free upgrade copy |
| **Guest** | If ever shown: Login / Upgrade path — guests normally use Landing teaser, not this widget |

Hide or change label when not applicable (e.g. Success + Pro with ample credits — Figma may still show a subtle Manage link).

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `loading` \| `success` \| `warning` \| `exhausted` | Yes | Visual/behavioural state (or derive from remaining) |
| `remaining` | number \| null | Success+ | Remaining credits |
| `monthlyCredits` | number \| null | Success+ | Monthly grant |
| `used` | number \| null | Success+ | Used this period |
| `renewalDate` | datetime \| null | Optional | Renewal / reset date |
| `tier` | `free` \| `pro` \| `business` \| `guest` | Yes | CTA + copy |
| `ctaLabel` | string | No | Override button label |
| `showCta` | boolean | No | Force show/hide CTA |
| `onUpgrade` | action | When CTA shown | Upgrade / buy / manage |
| `onViewDetails` | action | Optional | Deeper credits/billing |

Parent derives Warning/Exhausted from `remaining` + costs if `state` not passed explicitly.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Text | Announce e.g. “240 of 300 monthly credits remaining; 60 used; renews 1 September” |
| Progress bar | `role="progressbar"` with valuemin/max/now **or** equivalent text — not color-only |
| Warning / Exhausted | Status text + polite/assertive live update when entering Exhausted |
| CTA | Named button (“Upgrade plan”, “Buy credits”) |
| Keyboard | CTA operable; focus visible |
| Loading | Busy semantics; no fake “0” announced as real before load |

---

## 7. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `credits_viewed` | Widget impressed or expanded | `tier`, `remaining`, `state` |
| `credits_upgrade_clicked` / **Upgrade Clicked** | CTA activated | `tier`, `source: credits_widget` |
| Align | `credits_badge_clicked` if widget mirrors header badge behaviour | `ANALYTICS.md` |

Do not send ledger internals or PII.

---

## 8. Reuse

| Context | Spec |
|---------|------|
| Authenticated Dashboard | Primary Credits Widget |
| Billing / Manage Plan | Optional compact variant |
| Header | Prefer shared meter primitive (`CreditMeter`) — same numbers |

**Reusable** across Free / Pro / Business without layout forks — vary CTA and state styling only.

---

## 9. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | Success / warning / error (exhausted) from `DESIGN_TOKENS.md` |
| Progress | Fill reflects usage; pair with numeric remaining |
| No redesign | Spacing/type per Figma |

---

## 10. Developer Notes

| Note | Spec |
|------|------|
| Authority | `GET /credits` / `/me` only — never grant or invent client-side |
| Phase 1 | Mock remaining/used/limit/renewal + state demos |
| Phase 2 | Live ledger + renewal from membership |
| Sync | Welcome Card credits must match this widget |
| Costs | Screenshot/URL costs from `plans.ts` / PRICING for Exhausted vs “can afford one more” |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Remaining, monthly, used, progress bar, renewal, Upgrade CTA  
□ Loading / Success / Warning / Exhausted  
□ Free Upgrade vs Pro Buy Credits / Manage  
□ Progress correct with top-ups (no bogus &gt;100% UX)  
□ Server values only  
□ WCAG 2.2 AA; progress + text  
□ `credits_viewed` + CTA analytics  
□ Reusable; Figma match  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Full invoice history |
| Stripe checkout form inside the widget |
| Editing credit balance in UI |
| Guest Landing teaser (different chrome) |

---

**End of COMPONENT-017 / COMPONENT_CREDITS_WIDGET.md**
