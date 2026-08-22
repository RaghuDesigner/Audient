# COMPONENT — Notification Settings Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-046 (Notification Settings Card)  
**Component name:** Notification Settings Card (`NotificationSettingsCard`)  
**Primary screen:** Settings — Notification Preferences (`docs/screens/SCREEN-019_SETTINGS.md`)  
**Related:** Preferences Card (`COMPONENT_PREFERENCES_CARD.md`) — language/theme; this card = **which notifications to receive** · Notifications inbox (`SCREEN-018`) — separate from preferences  
**Figma:** Notification preferences toggles on Settings — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Switch / list patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mocked preference state only** — do **not** connect to a notification backend / Supabase / push service.  
> **Reuse:** Accessible `Switch` primitive (already in `src/components/ui/switch.tsx` when implementing).

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-019_SETTINGS.md` · `docs/screens/SCREEN-018_NOTIFICATIONS.md` · `docs/components/COMPONENT_PREFERENCES_CARD.md` · `docs/components/COMPONENT_NOTIFICATION_ITEM.md`

---

## 1. Purpose

Allows users to **control which Audient notifications they receive**.

Preferences gate **future** notification delivery (in-app and/or email per product). They do **not** delete existing inbox items on SCREEN-018.

**Do not redesign.** Match Figma.

---

## 2. Notification Types

| Type | Spec |
|------|------|
| **Audit Completed** | Audit finished successfully |
| **Audit Failed** | Audit failed / needs attention |
| **Low Credits** | Credits near or at limit |
| **Billing** | Payment / invoice related |
| **Membership** | Plan / subscription related |
| **Team Activity** | Team/seat activity (Business-oriented) |
| **Product Updates** | Product / marketing product updates |

Align keys with SCREEN-019 / settings notification category config when implementing.

---

## 3. Controls

Use **accessible toggle controls** (switch).

Each toggle **must** include:

| Element | Spec |
|---------|------|
| **Label** | Notification type name (e.g. “Audit Completed”) |
| **Description** | Short supporting line explaining what the user will get |
| **Current state** | On / Off — conveyed in UI text or `aria-checked`, **not color alone** |

| Layout | Spec |
|--------|------|
| Row | Label + description left; switch right (stack on narrow) |
| Group | List under card title **Notification Preferences** (or Figma title) |

---

## 4. Behaviour

| Toggle | Spec |
|--------|------|
| **Enabled** (on) | Notification preference is **active** |
| **Disabled** (off) | Notification preference is **inactive** |

| Rule | Spec |
|------|------|
| Change | Update **local mock preference state** immediately or on Save — Figma / parent Save model |
| Persist | Mock store only this phase |
| Inbox | Existing Notification Items unchanged |
| Team Activity | May default off for Free/Pro; on for Business mock — product rule |

Optional card actions: Save / Cancel if Figma mirrors Profile/Preferences cards; otherwise live toggle + parent Settings Save.

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Toggles reflect saved mock prefs; interactive |
| **Saving** | Busy while committing mock prefs; switches may be disabled |
| **Saved** | Brief success feedback then Default |
| **Error** | Load or save failure — message + Retry |

No separate “Editing” required if toggles are always live; if card uses Edit mode, follow Preferences Card pattern.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `preferences` | map type → boolean | Yes | Current on/off per type |
| `descriptions` | map type → string | Optional | Override default descriptions |
| `state` | `default` \| `saving` \| `saved` \| `error` | Recommended | |
| `disabled` | boolean | No | Whole card (e.g. page loading) |
| `onChange` | (type, enabled) => void | Yes | Toggle change |
| `onSave` | action | Optional | If card-level Save |
| `onRetry` | action | Error | |
| `className` | string | No | |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Each switch operable (Space/Enter) |
| Screen reader | Toggle state **announced** (`role="switch"` + `aria-checked` + labelled by label/description) |
| Color | Do **not** rely only on color for on/off |
| Focus | Visible focus on each control |
| Saving | `aria-busy` on card region |

---

## 8. Analytics

| Event | Trigger |
|-------|---------|
| **Notification Preference Changed** | User toggles a preference (on or off) |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `type` (enum key), `enabled` (boolean) — no message bodies |

SCREEN-019 also lists **Notification Preferences Updated** on section save — parent may fire that; this card owns per-toggle **Changed**.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Label/description + switch on one row |
| **Tablet** | Same |
| **Mobile** | Stack description under label; switch aligned end; min 44px hit target |

---

## 10. Relationship to Siblings

| Surface | Spec |
|---------|------|
| **Preferences Card** | App chrome prefs — not notification types |
| **Notifications screen** | Inbox list — respect prefs later when generating mock events |
| **Settings screen** | Compose this card in Notification Preferences section |

---

## 11. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| State | Mocked preference map from `getMockSettingsScreen` |
| No | Notification backend · push · email service · Supabase |
| Switch | Reuse existing Switch component |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. Suggested descriptions (defaults — Figma wins)

| Type | Example description |
|------|---------------------|
| Audit Completed | When an audit finishes successfully |
| Audit Failed | When an audit fails or needs retry |
| Low Credits | When your credit balance is running low |
| Billing | Payments, invoices, and billing updates |
| Membership | Plan changes, renewals, and membership alerts |
| Team Activity | When teammates join or change seats |
| Product Updates | New features and product announcements |

---

## 13. QA Checklist

□ All seven notification types present  
□ Each toggle: label, description, current state  
□ Enabled / disabled behaviour updates mock prefs  
□ States: Default, Saving, Saved, Error  
□ Notification Preference Changed analytics  
□ WCAG 2.2 AA — SR announces state; not color-only  
□ Mock only — no notification backend  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Push / email delivery wiring |
| Per-channel (email vs in-app) matrix unless Figma adds it |
| Deleting inbox history when toggling off |

---

**End of COMPONENT_NOTIFICATION_SETTINGS_CARD.md**
