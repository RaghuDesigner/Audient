# SCREEN-020 — Business Workspace

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · Security · QA  

**Screen ID:** SCREEN-020 (product brief)  
**Canonical mapping:** Business / Team membership management hub (roadmap seats — `SCREEN_MAPPING` notes Team/Invite as future; this screen is the product brief for that hub)  
**Screen name:** Business Workspace  
**Route (recommended):** `/workspace` or `/team` — product decides; deep-linkable  
**Figma:** Business Workspace / Team management frames — **exact match**  
**Priority:** P1  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` backlog reserved **SCREEN-020** (with 023) for **Legal & Consent**. This document is **Business Workspace**. Renumber when consolidating IDs.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock data only** — **no backend**, **no Supabase** team APIs, **no real email invites**, **no live RBAC enforcement**.  
> **Pricing:** Business = UI label for schema `ENTERPRISE` (`PRICING.md` / `plans.ts`).

**Read with:** `docs/prd.md` · `docs/PRICING.md` · `docs/SCREEN_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` ·  
`docs/components/COMPONENT_TEAM_OVERVIEW_CARD.md` ·  
`docs/components/COMPONENT_BUSINESS_USAGE_WIDGET.md` ·  
`docs/components/COMPONENT_TEAM_MEMBER_CARD.md` ·  
`docs/components/COMPONENT_INVITE_MEMBER_MODAL.md` ·  
`docs/components/COMPONENT_ROLE_PERMISSION_MATRIX.md` ·  
`docs/components/COMPONENT_TEAM_ACTIVITY_CARD.md`

---

## 1. Purpose

**Business membership management hub.**

Authenticated **Business** users manage team overview, usage, members, invites, role permissions, and recent team activity in one workspace screen.

The UI must **match the approved Figma exactly**.

---

## 2. Entry Point

```text
Application Header / Profile Menu / Sidebar
        ↓
Business Workspace
```

Also: Manage Membership / Billing “Manage team” links when present; upgrade success may deep-link Business users here.

| Prerequisite | Spec |
|--------------|------|
| Auth | Required |
| Plan | **Business** (`ENTERPRISE`) only for full access |

---

## 3. Access Rules

| User | Spec |
|------|------|
| **Guest** | **No Access** → Login (existing login flow); resume intent → Workspace after auth if still Business |
| **Free** | **No Access** → Upgrade / Manage Plan (Business CTA) |
| **Pro** | **No Access** → Upgrade to Business |
| **Business** | **Full Access** |

Do not invent Free/Pro seat UIs on this screen.

---

## 4. Layout

```text
Application Header
        ↓
Breadcrumb (e.g. Dashboard > Business Workspace)
        ↓
Page Title
        ↓
Primary actions (Invite Member, …)
        ↓
Sections (scroll or sub-nav — Figma wins)
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell (Header, profile menu, notification badge) |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Compose | **Reuse all Business components** — do not recreate |

---

## 5. Sections

Compose in this hierarchy (Figma may reorder visually):

| Section | Component | Spec |
|---------|-----------|------|
| **Team Overview** | `TeamOverviewCard` | Team name, plan, member/audit/credit snapshots |
| **Business Usage** | `BusinessUsageWidget` | Summary metrics, progress bars, mock charts |
| **Team Members** | `TeamMemberCard` list | Roster of mock members |
| **Invite Member** | `InviteMemberModal` (+ CTA) | Opened from Invite action |
| **Role Permissions** | `RolePermissionMatrix` | Read-only permission table |
| **Team Activity** | `TeamActivityCard` | Recent mock activity feed |

---

## 6. Actions

| Action | Spec |
|--------|------|
| **Invite Member** | Opens Invite Member Modal (mock send only) |
| **Manage Members** | Focus / scroll to Team Members section (or member detail — Figma) |
| **View Activity** | Focus / scroll to Team Activity (or expand “View all”) |
| **View Usage** | Focus / scroll to Business Usage |

Member row actions (View / Edit / Remove) follow `TeamMemberCard` — mock only; Remove confirms.

---

## 7. States

| State | Spec |
|-------|------|
| **Loading** | Page/section skeletons; `aria-busy` on main; do not show Empty as truth |
| **Empty** | Valid Business workspace with no members/activity yet — empty member list and/or empty activity (distinct from Error / No Access) |
| **Error** | Unable to load workspace — message + Retry + Back to Dashboard |

No Access (Guest/Free/Pro) is an **access gate**, not Empty.

---

## 8. Unsaved / Modal behaviour

| Flow | Spec |
|------|------|
| Invite | Modal validate → mock success → append Invited member / bump pending (mock store) |
| Remove member | Confirm → mock remove from list |
| Leave page | No global dirty form required; open modals close on navigate |

---

## 9. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Landmarks | Main, labelled sections |
| Keyboard | All CTAs, member actions, modal, matrix scroll |
| Focus | Visible; return focus after Invite / Remove dialogs |
| Status | Not color-only (member status, matrix grants, usage progress) |
| Skip link | Existing app skip link |

---

## 10. Analytics

| Event | Trigger |
|-------|---------|
| **Workspace Viewed** | Business user opens screen |
| **Invite Member Clicked** | Invite CTA / open modal |
| **Team Member Viewed** | View on a Team Member Card |
| **Permission Matrix Viewed** | Role Permission Matrix enters view |
| **Usage Viewed** | Business Usage Widget viewed |

Align payloads with component analytics where already defined; avoid PII (no full emails in marketing events).

---

## 11. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Multi-column overview + usage; member cards in list/grid |
| **Tablet** | Stack usage under overview |
| **Mobile** | Single-column sections; sticky Invite CTA if Figma; matrix/usage mobile patterns from components |

---

## 12. Relationship to Other Screens

| Screen | Spec |
|--------|------|
| **Settings (019)** | Personal prefs / security — not team seats |
| **Manage Membership / Billing** | Plan & credits purchase — link out; do not duplicate checkout |
| **Dashboard** | Entry + credits; Workspace is deeper team hub |
| **Notifications** | User inbox ≠ team activity feed |

---

## 13. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | All Business components listed in §5 |
| Data | Mock overview, usage, members, activity, permission matrix |
| No | Backend · Supabase org APIs · real email · live RBAC · realtime activity |
| Auth | Existing mock auth — gate on Business tier |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ Guest / Free / Pro → No Access; Business → Full Access  
□ Sections: Overview, Usage, Members, Invite, Permissions, Activity  
□ Actions: Invite, Manage Members, View Activity, View Usage  
□ States: Loading, Empty, Error  
□ Analytics events listed  
□ WCAG 2.2 AA  
□ Components reused — no duplicates  
□ Mock only — no backend  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Real seat billing enforcement |
| SMTP / Supabase invites |
| Custom roles editor |
| Legal & Consent (other SCREEN-020 in mapping) |

---

**End of SCREEN-020_BUSINESS_WORKSPACE.md**
