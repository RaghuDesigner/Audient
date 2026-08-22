# COMPONENT — Team Activity Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-055 (Team Activity Card)  
**Component name:** Team Activity Card (`TeamActivityCard`)  
**Primary screen:** Team / Business hub activity feed (when present)  
**Related:** Team Overview Card — summary metrics · Team Member Card — actors · Notification Item — different product surface (user inbox vs team audit trail)  
**Figma:** Team activity feed card — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + list / feed patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock activity feed only** — **no realtime** · **no backend** · **no Supabase**.  
> **Audience:** Business workspace activity trail for owners/admins.

**Related docs:** `docs/prd.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/components/COMPONENT_TEAM_OVERVIEW_CARD.md` · `docs/components/COMPONENT_TEAM_MEMBER_CARD.md` · `docs/components/COMPONENT_NOTIFICATION_ITEM.md`

---

## 1. Purpose

Displays **recent team activity**.

Shows a chronological (newest first) list of mock events so Business users understand what happened in the workspace — not a full audit log export or live stream.

**Do not redesign.** Match Figma.

---

## 2. Activities

| Type | Spec |
|------|------|
| **Audit Created** | A team member started an audit |
| **Audit Completed** | An audit finished successfully |
| **Audit Deleted** | An audit was removed |
| **Member Invited** | An invitation was sent |
| **Member Removed** | A member was removed from the team |
| **Role Changed** | A member’s role was updated |
| **Subscription Updated** | Plan / subscription change for the workspace |

Each item maps to one of these types for icon + copy template.

---

## 3. Display

Each activity row includes:

| Element | Spec |
|---------|------|
| **Activity Icon** | Type-specific icon (`aria-hidden` when text conveys meaning) |
| **User** | Actor display name (or “System” if no actor) |
| **Activity** | Human-readable description (may include subject: audit label, member email/name — mock) |
| **Timestamp** | Relative or absolute mock time label |

| Layout | Spec |
|--------|------|
| Card | Title e.g. **Team activity** + list of rows |
| Order | Newest first |
| Limit | Parent may pass N most recent (e.g. 5–10); “View all” optional if Figma shows it |

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | One or more mock activity rows |
| **Loading** | Skeletons / busy; `aria-busy`; no fake empty as truth |
| **Empty** | No activity yet — friendly empty message (distinct from Error) |

(Error optional if parent load fails — Figma; otherwise Loading → Default/Empty.)

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `items` | activity[] | Yes | Mock feed |
| `state` | `default` \| `loading` \| `empty` | Recommended | |
| `onViewAll` | action | No | Optional CTA |
| `className` | string | No | |

| Item fields | Spec |
|-------------|------|
| `id` | Opaque id |
| `type` | Activity enum above |
| `userName` | Actor label |
| `description` | Activity text (or derived from type + meta) |
| `timestamp` | Preformatted label |
| `avatarUrl` | Optional |

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| List | Semantic list or feed region with accessible name |
| Icon | Decorative when description present |
| Time | Not color-only; readable text |
| Loading / Empty | Announced appropriately |
| Keyboard | Any CTAs operable; ≥44px targets |

---

## 7. Analytics (recommended)

| Event | Trigger |
|-------|---------|
| **Team Activity Viewed** | Card viewed with items |
| **Team Activity Empty Viewed** | Empty state shown |

No PII beyond opaque ids when possible.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Icon + user/activity + timestamp in a row |
| **Tablet** | Same / slightly tighter |
| **Mobile** | Stack timestamp under activity; keep readable hierarchy |

---

## 9. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Feed | Mock activity array only |
| No | Realtime subscriptions · backend activity API · websockets |
| Reuse | Lucide (or existing) icons, typography, Skeleton, Empty pattern |
| Tokens | Design tokens only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 10. QA Checklist

□ All seven activity types representable  
□ Display: Icon, User, Activity, Timestamp  
□ States: Default, Loading, Empty  
□ Mock only — no realtime / no backend  
□ WCAG 2.2 AA  
□ Responsive  

---

## 11. Non-goals

| Out of scope |
|--------------|
| Live activity stream |
| Infinite scroll / pagination API |
| Filtering by activity type (unless Figma adds it) |
| Notification inbox sync |

---

**End of COMPONENT_TEAM_ACTIVITY_CARD.md**
