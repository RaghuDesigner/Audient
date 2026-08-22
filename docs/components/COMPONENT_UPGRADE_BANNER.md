# COMPONENT-012 — Upgrade Banner

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Growth · QA  

**Component ID:** COMPONENT-012  
**Component name:** Upgrade Banner (`UpgradeBanner`)  
**Figma:** Large upgrade / plan-compare section on Guest Results and related Free upsell surfaces  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/screens/SCREEN-007_GUEST_AUDIT_RESULTS.md` · `docs/components/COMPONENT_LOCKED_CARD.md` · `docs/COMPONENT_MAPPING.md` (`UpgradeDialog`, PricingTable / PlanCard) · `docs/PRICING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/components/LOGIN_MODAL.md`

---

## 1. Purpose

Convert **Guest** and **Free** users into **Pro** or **Business** members.

Also supports retention / expansion variants (**Pro Renewal**, **Business**) with the same banner chrome and different copy/CTAs — **not** four separate designs.

Primary placement: Guest Audit Results (large section). May appear on Free Results, credit exhaustion, or billing surfaces when Figma shows it.

**Do not redesign.** Match Figma. Prices/credits follow **`PRICING.md`** (Pro **$29**/1,000 · Business **$99**/10,000) if Figma labels are stale.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Headline** | Conversion-focused title per variant / Figma |
| **Description** | Short supporting copy (value of unlocking full report, PDF, URL audits, etc.) |
| **Feature Highlights** | Bullet or chip list of unlocked benefits (tier-appropriate) |
| **Upgrade CTA** | Primary — typically **Upgrade to Pro** |
| **Compare Plans CTA** | Secondary — open plan comparison / Manage Plan |
| **Business CTA** | Secondary/tertiary — **View Business Plans** (or equivalent Figma label) |

Optional (only if Figma shows): inline Guest vs Pro vs Business comparison row — same component region, not a new page section invented outside Figma.

---

## 3. Variants

| Variant | Audience | Intent | Typical CTAs |
|---------|----------|--------|--------------|
| **Guest** | Anonymous | Login + Pro conversion; tease full report/PDF/URL | Upgrade to Pro → Upgrade Modal (auth may precede checkout); Compare Plans; Business CTA |
| **Free** | Logged-in Free | Upgrade to Pro for URL, PDF, full findings | Upgrade to Pro → checkout / Manage Plan; Compare Plans; Business CTA |
| **Pro Renewal** | Pro (e.g. renewing / past-due risk / end of period messaging) | Keep Pro active | Renew / Update billing (primary); Compare Plans optional; Business CTA as upsell |
| **Business** | Pro considering volume **or** Business expansion messaging | Move to / reinforce Business | View Business / Upgrade to Business; Compare Plans; primary may differ per Figma |

| Rule | Spec |
|------|------|
| One component | Switch copy, highlights, and CTA targets via `variant` |
| Guest auth | If checkout requires account, Upgrade flow: Login Modal → resume Upgrade / Manage Plan |
| Entitled Pro/Business | Do not show Guest/Free conversion banner when user already has the promoted entitlement — use Renewal/Business variants only when product rules say so |
| Dismiss | Allowed when Figma shows dismiss; persist dismiss per session/user preference as product defines |

---

## 4. Behaviour

| Control | Spec |
|---------|------|
| **Upgrade CTA** | Opens Upgrade Modal and/or Manage Plan Subscribe for Pro (`reason` e.g. `upgrade_banner`) |
| **Compare Plans CTA** | Opens Manage Plan / pricing comparison (SCREEN-005) — Login first if Guest and surface is protected |
| **Business CTA** | Focuses Business plan (Manage Plan Enterprise/Business card or Business checkout path) |
| **Dismiss** (if present) | Hides banner; fires **Dismissed**; does not grant entitlements |

Never grant Pro/Business from the client alone — Stripe/webhook authoritative (`SECURITY.md` / PRICING).

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `variant` | `guest` \| `free` \| `pro_renewal` \| `business` | Yes | Banner variant |
| `headline` | string | Recommended | Override; else variant default / Figma |
| `description` | string | Recommended | Supporting copy |
| `highlights` | string[] | Recommended | Feature highlights |
| `upgradeLabel` | string | No | Primary CTA label |
| `compareLabel` | string | No | Compare Plans label |
| `businessLabel` | string | No | Business CTA label |
| `dismissible` | boolean | No | Show dismiss control |
| `source` | string | Analytics | e.g. `guest_results`, `free_results`, `credits` |
| `auditId` | string \| null | Optional | Context when on Results |
| `onUpgrade` | action | Yes | Primary upgrade path |
| `onComparePlans` | action | Yes | Compare plans path |
| `onBusiness` | action | Yes | Business CTA path |
| `onDismiss` | action | If dismissible | Dismiss handler |

---

## 6. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Upgrade clicked** | Primary Upgrade CTA | `variant`, `source`, `auditId`, `targetTier` (usually `pro`) |
| **Compare plans clicked** | Compare Plans CTA | `variant`, `source` |
| **Business plan clicked** | Business CTA | `variant`, `source` (align SCREEN-007) |
| **Dismissed** | Dismiss control | `variant`, `source` |
| Impression (recommended) | Banner shown | `variant`, `source`, `auditId` |

Align names with `ANALYTICS.md` (`upgrade_clicked`, `compare_plans_clicked`, `banner_dismissed`, etc.).

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Structure | Region/landmark or labeled section (e.g. heading = Headline) |
| Keyboard | All CTAs and dismiss operable |
| Focus visible | Required |
| Contrast | Headline, body, CTAs meet contrast on banner background |
| Dismiss | Named “Dismiss upgrade offer” (or equivalent); do not rely on ✕ alone without accessible name |
| SR | Highlights as a list when presented as bullets |

---

## 8. Usage

| Context | Spec |
|---------|------|
| Guest Audit Results | **Guest** variant — large section after locked content (SCREEN-007) |
| Free Results | **Free** variant |
| Billing / renewal prompts | **Pro Renewal** when applicable |
| Business upsell | **Business** variant from Pro or dedicated surfaces |
| Locked Card | Sibling teaser; banner is the **plan comparison / primary conversion** block — do not duplicate entire banner inside each Locked Card |

---

## 9. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma upgrade banner |
| Size | Large section per Guest Results spec |
| Tokens | `DESIGN_TOKENS.md` |
| Plan numbers | `PRICING.md` authoritative for $29 / $99 and credit grants |
| No redesign | Same layout structure across variants; copy/CTA emphasis may shift |

---

## 10. Developer Notes

| Note | Spec |
|------|------|
| Reuse | One banner; four variants |
| Compose | May embed or link to shared plan highlight data from `plans.ts` / PRICING — no hardcoded conflicting prices |
| Phase 1 | Static Figma copy per variant |
| Phase 2 | Optional CMS/config for headlines; CTAs wire to real checkout |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Headline, description, feature highlights, three CTA types (as shown in Figma)  
□ Guest / Free / Pro Renewal / Business variants swap copy correctly  
□ Upgrade → Upgrade Modal / checkout path  
□ Compare Plans → pricing / Manage Plan  
□ Business CTA → Business plan path  
□ Dismiss (if any) hides + analytics  
□ Analytics: upgrade, compare, business, dismissed  
□ WCAG 2.2 AA; keyboard; labeled dismiss  
□ Prices match PRICING.md  
□ Figma match  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Full Manage Plan modal UI (separate screen) |
| Locked Card blur teasers (COMPONENT-011) |
| Payment form fields |
| Granting entitlements client-side |

---

**End of COMPONENT-012 / COMPONENT_UPGRADE_BANNER.md**
