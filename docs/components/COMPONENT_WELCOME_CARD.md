# COMPONENT-014 — Welcome Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-014  
**Component name:** Welcome Card (`WelcomeCard`)  
**Screen:** Authenticated Dashboard — top of main content (`SCREEN-008_AUTHENTICATED_DASHBOARD.md` · SCREEN-004 / SCREEN-009)  
**Figma:** Approved Welcome / dashboard header card — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** There is **no** `DESIGN_SYSTEM.md` in the repo. Use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.

**Related:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ANALYTICS.md` · `docs/DESIGN_TOKENS.md` · `docs/ACCESSIBILITY.md` · `docs/PRICING.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-008_AUTHENTICATED_DASHBOARD.md`

---

## 1. Purpose

The Welcome Card is displayed at the **top of the Authenticated Dashboard**.

It **welcomes the user** and **summarizes current account status** (identity, plan, credits, usage).

The design must **exactly match the approved Figma**. Do not redesign.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Welcome message** | Time-based greeting + optional short status line per Figma |
| **User Avatar** | Profile photo or initials fallback |
| **User Name** | Display name from profile |
| **Membership Badge** | Guest / Free / Pro / Business (and status cue if PAST_DUE when product shows it) |
| **Current Credits** | Remaining credits — **server-authoritative** |
| **Current Month Usage** | Usage vs monthly grant (progress and/or used count per Figma) |

Visual hierarchy, spacing, and type: **Figma only**.

---

## 3. Behaviour — Personalized Greeting

Greeting changes based on the user’s **local time**:

| Local time (inclusive guidance) | Greeting |
|---------------------------------|----------|
| 05:00–11:59 | **Good Morning** |
| 12:00–16:59 | **Good Afternoon** |
| 17:00–04:59 | **Good Evening** |

| Rule | Spec |
|------|------|
| Composition | e.g. “Good Morning, {FirstName}” — match Figma punctuation/order |
| Name missing | Fall back to “Good Morning” / “there” / email local-part per product copy — never blank awkward “Good Morning, ” |
| Timezone | Browser local timezone; do not force UTC for greeting |
| Recompute | On mount; optional refresh if card stays mounted across noon/evening boundary |

---

## 4. States

### 4.1 Loading

| Aspect | Spec |
|--------|------|
| UI | Skeleton for avatar, name, badge, credits, usage |
| A11y | `aria-busy="true"`; polite “Loading account summary” (or equivalent) |
| Data | Do not flash zeros as real balances |

### 4.2 Success

| Aspect | Spec |
|--------|------|
| UI | All fields populated from hydrated session / `GET /me` + credits |
| Greeting | Time-based message + name |
| Credits / usage | Match server values |

### 4.3 Empty

| Aspect | Spec |
|--------|------|
| When | Profile name/avatar missing but session valid — still Success-like with fallbacks; **or** first-run with zero usage |
| UI | Initials avatar; greeting without name or with fallback; credits may be full grant with **0** usage |
| Not | Do not use Empty for logged-out users (they should not see this card on Dashboard) |

### 4.4 Error

| Aspect | Spec |
|--------|------|
| When | Profile/credits failed to load after session init |
| UI | Friendly inline error; optional Retry |
| Credits | Do not invent balances |
| A11y | `role="alert"` for error text |

---

## 5. Tier Support (reusable)

| Tier | Badge | Credits / usage |
|------|-------|-----------------|
| **Guest** | Guest | Teaser remaining / 1-audit framing if card is ever shown outside full Dashboard |
| **Free** | Free | Remaining of **300** monthly grant (`PRICING.md`) |
| **Pro** | Pro | Remaining of **1,000** (+ top-ups if balance includes them — follow API/Figma) |
| **Business** | Business | Remaining of **10,000** / usage tracking |

Primary placement is **Authenticated Dashboard** (Free / Pro / Business). Guest support keeps the component reusable if product surfaces a welcome summary on a guest-limited workspace later — **do not** put Guest marketing Landing content inside this card.

One component — vary data/badge, not four layouts.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `loading` \| `success` \| `empty` \| `error` | Yes | Card state |
| `displayName` | string \| null | Success | User name |
| `avatarUrl` | string \| null | No | Avatar image |
| `tier` | `guest` \| `free` \| `pro` \| `business` | Yes | Membership badge |
| `membershipStatus` | `active` \| `past_due` \| … \| null | No | Optional badge modifier |
| `creditsRemaining` | number \| null | Success | Current credits |
| `monthlyLimit` | number \| null | Success | Monthly grant |
| `usageAmount` | number \| null | Success | Used this period (or derived) |
| `errorMessage` | string | Error | User-facing error |
| `onRetry` | action | Error | Retry hydrate |
| `onCreditsClick` | action | Optional | Open credits / billing |
| `onBadgeClick` | action | Optional | Open Manage Plan |

Greeting string is derived in the component (or parent) from local time + `displayName` — not hardcoded per hour in copy decks.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Name | Region/heading includes greeting + user name |
| Avatar | Meaningful `alt` (e.g. “Avatar for Jane Doe”) or decorative if name is adjacent and alt empty is intentional |
| Badge | Text label (not color-only) |
| Credits | Announce e.g. “240 of 300 credits remaining” |
| Usage | Progressbar or text equivalent for month usage |
| Loading / Error | Busy + alert semantics |
| Keyboard | Interactive credits/badge targets operable if clickable |
| Focus visible | Required on interactive elements |

---

## 8. Analytics

| Event | Spec |
|-------|------|
| **Dashboard Viewed** | Primary page-level event when Authenticated Dashboard loads (`home_viewed` / `dashboard_viewed`) |

| Rule | Spec |
|------|------|
| Ownership | Prefer **one** Dashboard Viewed per dashboard visit (screen or layout) — Welcome Card must **not** double-fire if the page already emits it |
| Card role | May attach props (`tier`, `credits_remaining`) to that event, or fire `welcome_card_impressed` once if product wants component-level funnel detail |
| No PII | Do not send full email/name in analytics payloads beyond allowed traits policy |

Align with `ANALYTICS.md` (`home_viewed`, `credits_remaining`, `plan_name`).

---

## 9. Usage

| Context | Spec |
|---------|------|
| Authenticated Dashboard | Top widget (primary) |
| Reuse | Same card for Free / Pro / Business (and Guest if needed) |
| Not for | Guest Landing hero; Session Initialization loader |

Credits Widget on the same dashboard may duplicate credit numbers — follow Figma (Welcome summary vs dedicated Credits Widget); values must stay consistent from the same store.

---

## 10. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Badge | Shared badge patterns from `COMPONENT_MAPPING.md` where applicable |
| No redesign | Spacing/type/color per Figma |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Reusable | Guest · Free · Pro · Business via props |
| Data | Phase 1 mock; Phase 2 bind to session hydrate / `GET /me` + credits |
| Authority | Credits and plan from server only (`SECURITY.md`) |
| Greeting | Local time bands in §3 |
| Logic | Presentational card; parent supplies account summary |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Figma match at top of Dashboard  
□ Greeting switches Morning / Afternoon / Evening by local time  
□ Avatar, name, membership badge, credits, month usage  
□ Loading / Success / Empty fallbacks / Error + retry  
□ Free 300 · Pro 1,000 · Business 10,000 limits correct when mocked/API  
□ Credits not spoofable client-side  
□ WCAG 2.2 AA  
□ Dashboard Viewed once per visit (no double-count)  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Full Credits Widget charts (sibling dashboard widget) |
| Profile edit / avatar upload (Account Settings) |
| Quick Action cards |
| OAuth / Session Initialization UI |

---

**End of COMPONENT-014 / COMPONENT_WELCOME_CARD.md**
