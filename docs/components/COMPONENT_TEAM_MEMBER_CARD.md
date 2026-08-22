# COMPONENT — Team Member Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-052 (Team Member Card)  
**Component name:** Team Member Card (`TeamMemberCard`)  
**Primary screen:** Team / Business member list (when present)  
**Related:** Team Overview Card (`COMPONENT_TEAM_OVERVIEW_CARD.md`) — aggregate counts · UserAvatar — photo/initials · Danger / confirm patterns — Remove confirmation sibling  
**Figma:** Team member row / card — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + card / list / avatar patterns in `COMPONENT_MAPPING.md`.  
> **Audience:** **Business** team management surfaces.  
> **Phase:** **Mock data only** — no backend · no Supabase · no real invite/remove APIs.  
> **Privacy:** Do not expose auth tokens or secrets; email is display-only in mock UI.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/components/COMPONENT_TEAM_OVERVIEW_CARD.md`

---

## 1. Purpose

Displays a **single team member**.

Reusable in Team member lists / grids for Business accounts. One card = one person; roster composition is the parent screen’s job.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Avatar** | Photo or initials (`UserAvatar` pattern) |
| **Name** | Display name |
| **Email** | Member email (read-only display) |
| **Role** | Owner / Admin / Manager / Viewer |
| **Status** | Active / Invited / Suspended |
| **Last Active** | Relative or absolute mock timestamp label |

| Rule | Spec |
|------|------|
| Labels | Visible or accessible names for Role, Status, Last Active |
| Status | Conveyed with **text** (and optional badge) — **not color alone** |
| Empty | Sensible placeholders if optional fields missing — never invent secrets |

---

## 3. Roles

| Role | Spec |
|------|------|
| **Owner** | Highest privilege; typically cannot be removed by non-owners (product rule) |
| **Admin** | Manage members / settings (mock) |
| **Manager** | Operational management scope (mock) |
| **Viewer** | Read-only team access (mock) |

Role labels match Figma; permissions enforcement is mock-only this phase.

---

## 4. Status

| Status | Spec |
|--------|------|
| **Active** | Member can use the product |
| **Invited** | Invitation pending acceptance |
| **Suspended** | Access paused |

---

## 5. Actions

| Action | Spec |
|--------|------|
| **View** | Open member detail / read-only panel (mock navigation or toast) |
| **Edit** | Edit role / details (mock) — may be disabled for Viewer actors or Owner targets per Figma |
| **Remove** | Remove from team — requires confirmation; **mock only** (no real deletion) |

| Rule | Spec |
|------|------|
| Visibility | Actions may be hidden or disabled by actor role / target role (e.g. cannot Remove Owner) — Figma + product rules |
| Remove | Always confirm; never hard-delete account data from this card |

Optional overflow menu (“⋯”) vs inline buttons — **Figma wins**.

---

## 6. States

| State | Spec |
|-------|------|
| **Default** | Member fields + available actions |
| **Loading** | Skeleton / busy for this card (list-level loading preferred) |
| **Error** | Optional per-card action failure (e.g. mock remove failed) + Retry |

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `name` | string | Yes | |
| `email` | string | Yes | Display only |
| `avatarUrl` | string \| null | No | |
| `role` | `owner` \| `admin` \| `manager` \| `viewer` | Yes | |
| `status` | `active` \| `invited` \| `suspended` | Yes | |
| `lastActive` | string | Yes | Preformatted label |
| `actions` | which actions enabled | No | Override defaults |
| `onView` / `onEdit` / `onRemove` | actions | Optional | Parent handlers (mock) |
| `className` | string | No | |

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Name | Card / article named by member name |
| Avatar | Decorative when name present (`alt=""` / `aria-hidden` on decorative mark) |
| Status / Role | Announced as text — not color-only |
| Actions | Accessible names (e.g. “Remove Jane Doe”); keyboard operable; ≥44px targets |
| Focus | Visible focus rings |
| Menus | If overflow menu: Escape, arrow keys, return focus per dialog/menu patterns |

---

## 9. Analytics (recommended)

| Event | Trigger |
|-------|---------|
| **Team Member Viewed** | View action |
| **Team Member Edit Clicked** | Edit action |
| **Team Member Remove Clicked** | Remove action (before confirm) |

No full email in marketing payloads if avoidable — use opaque member id when available.

---

## 10. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Avatar + identity + role/status + actions in one row (or Figma card) |
| **Tablet** | Compact row / wrap actions |
| **Mobile** | Stack identity under avatar; full-width or icon actions; min 44px targets |

---

## 11. Relationship to Siblings

| Surface | Spec |
|---------|------|
| **Team Overview Card** | Counts (Total / Active / Pending) — this card is a list item |
| **Confirm dialog** | Remove uses confirm pattern (mock) |
| **Profile Settings** | Different domain (self profile vs teammate) |

---

## 12. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Data | Mock members only |
| No | Backend · Supabase · real invite/remove · real role sync |
| Reuse | `UserAvatar`, `Button`, tokens |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Avatar, Name, Email, Role, Status, Last Active  
□ Roles: Owner, Admin, Manager, Viewer  
□ Status: Active, Invited, Suspended (text, not color-only)  
□ Actions: View, Edit, Remove (mock; Remove confirms)  
□ WCAG 2.2 AA  
□ Mock only — no backend  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Full team roster page |
| Real SSO provisioning |
| Billing seat sync |
| Self-service password reset for teammates |

---

**End of COMPONENT_TEAM_MEMBER_CARD.md**
