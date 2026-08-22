# SCREEN-018 — Notifications

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-018 (product brief)  
**Canonical mapping:** In-app notifications center · **SCREEN-M04** Notifications in `SCREEN_MAPPING.md`  
**Screen name:** Notifications  
**Figma:** Notifications page / bell destination — **exact match**  
**Priority:** P1  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` backlog reserved **SCREEN-018** for **500 Error / Boundary** (SCREEN-M10). This document is the **Notifications** screen. Prefer **SCREEN-M04** for engineering mapping; renumber when consolidating.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Phase:** **Mocked notification data only** — **no Supabase**, **no backend**, **no notification API**.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/components/COMPONENT_NOTIFICATION_ITEM.md` · `docs/components/COMPONENT_NOTIFICATION_GROUP.md`

---

## 1. Purpose

Provides users with a **centralized location** to view and manage Audient notifications.

Users must be able to:

| Capability | Spec |
|------------|------|
| View notifications | Full inbox list |
| Identify unread | Unread indicator + count |
| Filter notifications | Category / unread filters |
| Mark as read | Per notification on activate |
| Mark all as read | Bulk action |
| Navigate | Deep-link to relevant Audient screens |

The UI must **match the approved Figma exactly**.

---

## 2. Entry Points

```text
Application Header
        ↓
Notification Bell
        ↓
Notifications

Dashboard
        ↓
Notifications
```

| Prerequisite | Spec |
|--------------|------|
| Auth | Required — **Guest → Login**; resume → Notifications after auth |
| Bell | Header bell may show unread badge; “View all” from dropdown may land here |

Dropdown preview is a separate surface — same mock store, compact items.

---

## 3. Layout

```text
Application Header
        ↓
Breadcrumb
        ↓
Page Header
        ↓
Notification Count
        ↓
Mark All as Read
        ↓
Notification Filters
        ↓
Notification Groups
        ↓
Pagination / Load More
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Figma | Section order may reflow; **Figma wins** |

### Breadcrumb (recommended)

```text
Dashboard > Notifications
```

---

## 4. Page Header

| Element | Spec |
|---------|------|
| **Title** | **Notifications** |
| **Unread count** | Display unread total in header region (e.g. “3 unread”) — sync with bell badge |

Reuse **NotificationBadge** (or equivalent) for count chip in header/bell consistency.

---

## 5. Components to Reuse

| Component | Role |
|-----------|------|
| **NotificationBadge** | Unread count in page header + header bell |
| **NotificationFilter** | Filter tabs/chips (All, Unread, categories) |
| **NotificationGroup** | Date buckets (Today, Yesterday, This Week, Earlier) |
| **NotificationItem** | Individual notification row |
| **NotificationEmptyState** | No notifications / filtered empty |
| **MarkAllReadButton** | “Mark all as read” control |

| Rule | Spec |
|------|------|
| Do not duplicate | Compose existing components — no one-off notification row CSS |
| Specs | Item + Group: `COMPONENT_NOTIFICATION_ITEM.md` · `COMPONENT_NOTIFICATION_GROUP.md` |
| Missing briefs | Badge, Filter, EmptyState, MarkAllRead may be thin wrappers — still tokenized and shared with dropdown |

---

## 6. Notification Categories & Types

### Categories (filters)

| Category | Types included |
|----------|----------------|
| **Audits** | Audit Completed · Audit Failed |
| **Billing** | Payment Successful · Payment Failed · Invoice Available |
| **Membership** | Low Credits · Subscription Activated · Subscription Renewal · Membership Upgrade · Membership Expiry |
| **Team** | Team Activity |
| **System** | System Notification |

### Types (full enum)

Audit Completed · Audit Failed · Low Credits · Payment Successful · Payment Failed · Subscription Activated · Subscription Renewal · Invoice Available · Membership Upgrade · Membership Expiry · Team Activity · System Notification

Each type uses NotificationItem icon/copy/deep-link rules (`COMPONENT_NOTIFICATION_ITEM.md`).

---

## 7. Notification Behaviour

| State | Spec |
|-------|------|
| **Unread** | Unread indicator; stronger visual hierarchy (weight/background) — **not color-only** |
| **Read** | Normal hierarchy; indicator hidden/dimmed |

**Click notification:**

1. **Mark as read** (mock client store).  
2. **Navigate** to relevant destination when applicable.

| Type | Destination (example) |
|------|------------------------|
| Audit Completed | Audit Report |
| Audit Failed | Audit History |
| Payment Successful | Invoice History |
| Low Credits | Manage Membership |
| Subscription Activated | Dashboard |
| Payment Failed | Billing & Payments / recovery path |
| Invoice Available | Invoice History / details |
| Subscription Renewal | Manage Membership |
| Membership Upgrade | Manage Membership |
| Membership Expiry | Manage Membership |
| Team Activity | Team/settings placeholder |
| System Notification | Stay or optional link |

Analytics: **Notification Clicked** · **Notification Marked Read** (per item).

---

## 8. Filtering

| Filter | Spec |
|--------|------|
| **All** | Default — all notifications |
| **Unread** | Unread only |
| **Audits** | Audit types |
| **Billing** | Billing types |
| **Membership** | Membership types |
| **Team** | Team Activity |
| **System** | System Notification |

| Behaviour | Spec |
|-----------|------|
| Default | **All** |
| Apply | Re-bucket into NotificationGroups; omit empty date groups |
| Count | Page unread count unchanged by filter (total unread) unless Figma shows filtered count — **default: total unread** |
| Analytics | **Notification Filter Used** |

---

## 9. Mark All Read

| Element | Spec |
|---------|------|
| Label | **Mark all as read** |
| Disabled | When unread count = **0** |
| On click | All notifications → read; unread count → 0; **success feedback** (toast or inline per Figma) |
| Analytics | **Mark All Read Clicked** · **Mark All Read Completed** |

Does not delete notifications. Header bell badge clears in sync.

---

## 10. Empty States

| Condition | Message | Action |
|-----------|---------|--------|
| **No notifications** (All, no data) | **You're all caught up** | Optional link to Dashboard / start audit if Figma |
| **Filtered empty** | **No notifications found** | **Clear Filter** → reset to All |

Use **NotificationEmptyState** — distinct copy for global empty vs filter empty.

---

## 11. Loading State

| Spec | Detail |
|------|--------|
| UI | **Skeleton notification items** (group headings optional skeleton) |
| a11y | `aria-busy` on list region |

---

## 12. Error State

| Element | Spec |
|---------|------|
| **Message** | **Unable to load notifications.** |
| **Actions** | **Retry** |

Do not show fake empty state on hard error.

---

## 13. Pagination / Load More

| Spec | Detail |
|------|--------|
| Control | Pagination or **Load More** per Figma |
| Order | Newest first within groups; groups Today → Earlier |
| Mock | Enough items to test pagination optional |
| Preserve | Active filter across pages |

---

## 14. Membership / Auth

| Tier | Spec |
|------|------|
| **Guest** | Redirect Login |
| **Free / Pro / Business** | Full notifications inbox (mock); Team filter may be sparse for non-Business |

Only current user’s notifications in mock filter.

---

## 15. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Filters → Mark all → items in group order |
| Tab order | Breadcrumb → page title → count → Mark all → filters → groups/items → pagination |
| Visible focus | Required |
| Screen reader | Announce page title + unread count; live region for Mark all success |
| Unread | Not color-only — text/indicator + SR state |
| Groups | Semantic sections (`NotificationGroup` headings) |
| Table/list | List semantics for items |

---

## 16. Analytics

| Event | Trigger |
|-------|---------|
| **Notifications Viewed** | Screen open |
| **Notification Clicked** | Item activated |
| **Notification Filter Used** | Filter changed |
| **Notification Marked Read** | Single item read |
| **Mark All Read Clicked** | Button pressed |
| **Mark All Read Completed** | All items marked read successfully |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `filter`, `type`, `notificationId`, `wasUnread` — no sensitive audit bodies in marketing analytics |

Consent: marketing after cookie consent.

---

## 17. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full layout with filters + grouped list |
| **Tablet** | Reflow filters (wrap/chips) |
| **Mobile** | **Compact notification list**; filters scroll/wrap; touch-friendly Mark all |

NotificationItem `compact` variant on mobile.

---

## 18. Mock Data

| Rule | Spec |
|------|------|
| Source | Static mock notifications — mixed types, read/unread, dates across all groups |
| No | Supabase · backend · `GET/PATCH /notifications` (future per SCREEN-M04) |
| Sync | Same mock store updates bell badge, dropdown preview, and this screen |
| Deep links | Mock ids for audit/report/invoice routes |

---

## 19. Security

| Rule | Spec |
|------|------|
| Auth | Login required |
| Scope | User sees only own notifications |
| Deep links | Open only resources user may access (authz when real) |
| Content | No secrets in notification bodies |

---

## 20. Relationship to Header Bell

```text
Notification Bell (header)
  ├─ NotificationBadge (unread count)
  ├─ Dropdown preview (optional NotificationItem compact)
  └─ “View all” → Notifications (this screen)
```

Mark-read on this screen updates bell count immediately (mock store).

---

## 21. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | NotificationGroup + NotificationItem + listed chrome components |
| Do not duplicate | One notification row implementation |
| Tokens | Design tokens only |
| State | Central mock notification store (read flags, filters) |
| Future | SCREEN-M04: `GET/PATCH /notifications`, push/email optional |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 22. Navigation Summary

```text
Header Bell / Dashboard
        ↓
Notifications (018)
        ├─ Filter / Mark all read
        ├─ Click item → mark read + destination
        └─ Empty / Error / Retry
```

---

## 23. QA Checklist

□ Entry from bell + Dashboard  
□ Title Notifications + unread count  
□ Mark all as read (disabled at zero) + success feedback  
□ Filters: All (default), Unread, Audits, Billing, Membership, Team, System  
□ Groups + NotificationItem; newest first  
□ Unread vs read hierarchy; click → read + navigate  
□ Empty: caught up vs filtered + Clear Filter  
□ Loading skeletons · Error + Retry  
□ Pagination / Load More  
□ Guest → Login  
□ Analytics six events  
□ WCAG 2.2 AA · keyboard · SR · unread not color-only  
□ Mobile compact list  
□ Mock only — no Supabase/backend/API  
□ Reused components; tokens only  

---

## 24. Non-goals (this phase)

| Out of scope |
|--------------|
| Push notifications / email delivery |
| Real-time WebSocket feed |
| Notification preferences editor (separate settings) |
| Delete / archive notifications unless Figma adds later |
| Backend `GET/PATCH /notifications` |

---

**End of SCREEN-018 / SCREEN-018_NOTIFICATIONS.md**
