# COMPONENT — Notification Badge

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-042 (Notification Badge)  
**Component name:** Notification Badge (`NotificationBadge`)  
**Primary surfaces:** Application Header · Notification Bell · Notifications page header · Dashboard · Mobile Navigation  
**Related:** Notification Item (`COMPONENT_NOTIFICATION_ITEM.md`) — per-row unread; this component = **aggregate unread count** chrome  
**Figma:** Header bell + unread count badge — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Badge / icon-button patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mocked unread count** — no backend · no Supabase · no notification API.  
> **Count scope:** **Total unread** across full inbox — **not** reduced by active NotificationFilter (SCREEN-018).

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/screens/SCREEN-018_NOTIFICATIONS.md` · `docs/components/COMPONENT_NOTIFICATION_ITEM.md` · `docs/components/COMPONENT_NOTIFICATION_FILTER.md`

---

## 1. Purpose

Displays the **number of unread notifications**.

**Reusable** in:

| Surface | Spec |
|---------|------|
| **Application Header** | Bell icon + badge overlay |
| **Dashboard** | Unread summary chip if Figma |
| **Notification Bell** | Icon trigger with count |
| **Mobile Navigation** | Compact bell + badge in nav bar |

One component family — `showIcon` / `variant` for bell-only trigger vs count-only chip vs combined, not separate badge implementations per surface.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Notification Bell Icon** | Standard bell affordance when `showIcon` / bell variant (Lucide/Figma) |
| **Unread Count** | Numeric badge when unread &gt; 0 |

| Layout (typical) | Spec |
|------------------|------|
| Bell + badge | Icon button with badge positioned top-right (overlay) |
| Count-only | Text/chip “3 unread” on Notifications page header without bell |

Badge must remain legible on light/dark surfaces (tokenized).

---

## 3. Behaviour — Count rules

| Unread count | Display |
|--------------|---------|
| **0** | **Do not display** numeric badge (bell may still show with no count) |
| **1–99** | Display exact number |
| **100+** | Display **`99+`** |

| Rule | Spec |
|------|------|
| Source | Parent passes `unreadCount` from mock store (`countUnreadNotifications` pattern) |
| Sync | Updates when NotificationItem marked read, Mark All Read, or mock seed changes |
| Filter | Active NotificationFilter does **not** change badge count |
| Loading | Hide numeric badge or show skeleton dot — do not show stale count as truth |

---

## 4. States

| State | Spec |
|-------|------|
| **No Notifications** | `unreadCount === 0` — no numeric badge |
| **Unread Notifications** | Badge visible with formatted count |
| **Loading** | Optional skeleton on bell/badge region; `aria-busy`; no misleading number |

Loading is optional prop `state="loading"` or parent defers render until count known.

---

## 5. Interaction (Bell trigger)

When rendered as **clickable bell** (header / mobile nav):

| Action | Spec |
|--------|------|
| Click / activate | Opens notification dropdown **or** navigates to Notifications screen — parent `onClick` |
| Analytics | **Notification Bell Clicked** |
| View | **Notification Bell Viewed** when bell enters viewport / mounts in header |

Count-only chip on Notifications page may be non-interactive (`aria-hidden` count duplicate if heading already announces unread).

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `unreadCount` | number | Yes | Raw unread total |
| `state` | `default` \| `loading` | No | |
| `variant` | `bell` \| `badge_only` \| `inline` | No | Layout mode |
| `showIcon` | boolean | No | Bell icon (default true for `bell`) |
| `onClick` | action | When bell | Open dropdown / navigate |
| `href` | string | Optional | Link-style bell instead of button |
| `disabled` | boolean | No | |
| `className` | string | No | |
| `id` | string | No | |

Formatted display string derived internally: `formatUnreadCount(unreadCount)` → hidden | `"5"` | `"99+"`.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Accessible name | Bell button includes unread in name, e.g. **“You have 5 unread notifications.”** or **“Notifications, no unread notifications.”** |
| Zero unread | **“Notifications”** or **“Notifications, no unread notifications”** — do not rely on badge color alone |
| Badge | Count text in accessible name; decorative badge shell may be `aria-hidden` if name includes count |
| Keyboard | Bell operable when interactive; visible focus ring |
| Loading | `aria-busy` on control; name indicates loading if needed |
| Mobile | ≥44px touch target for bell |

Do not use color-only red dot without text count in accessible name.

---

## 8. Analytics

| Event | Trigger |
|-------|---------|
| **Notification Bell Viewed** | Bell control visible (header mount / dropdown anchor) — dedupe per session optional |
| **Notification Bell Clicked** | User activates bell |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `unreadCount` (capped bucket: 0, 1-99, 99+), `surface` (`header`, `mobile_nav`, `dashboard`) |

Count-only inline variant may omit bell events unless it is the same control.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Bell in header; badge overlay |
| **Tablet** | Same |
| **Mobile** | Bell in mobile nav; badge scales; dropdown may become sheet (parent) |

Badge font size and min-width per Figma; must not clip `99+`.

---

## 10. Relationship to Siblings

| Component | Spec |
|-----------|------|
| **NotificationItem** | Row-level unread dot |
| **NotificationFilter** | Unread filter does not change badge total |
| **MarkAllReadButton** | Sets `unreadCount` to 0 → badge hides |
| **Notifications screen header** | May reuse `badge_only` / `inline` for “3 unread” text |

---

## 11. Mock Data

| Rule | Spec |
|------|------|
| Count | `items.filter(n => !n.read).length` on mock catalog |
| No | Live `GET /notifications` |
| QA | Test 0, 1, 42, 100, 150 for display rules |

---

## 12. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Single component + `formatUnreadCount` helper |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Presentational | Parent owns mock store and navigation |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ 0 unread → no numeric badge  
□ 1–99 → exact number  
□ 100+ → `99+`  
□ States: none, unread, loading  
□ Accessible label with count (e.g. “You have 5 unread notifications.”)  
□ Not color-only  
□ Bell Viewed / Clicked analytics  
□ Desktop / Tablet / Mobile  
□ Mock count only — no backend  
□ Syncs with mark-read / mark-all-read  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Push notification permission UI |
| Real-time WebSocket count |
| Per-category unread breakdown on badge |
| Notification dropdown panel (separate composition) |

---

**End of COMPONENT_NOTIFICATION_BADGE.md**
