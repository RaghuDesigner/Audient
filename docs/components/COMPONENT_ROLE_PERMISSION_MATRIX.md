# COMPONENT — Role Permission Matrix

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-054 (Role Permission Matrix)  
**Component name:** Role Permission Matrix (`RolePermissionMatrix`)  
**Primary screen:** Team / Business roles & permissions (when present)  
**Related:** Team Member Card / Invite Member Modal — role labels must stay consistent · Team Overview Card — Business context  
**Figma:** Role × permission matrix — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + table / data-display patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Read-only display** of **mocked** permission grants — no backend · no live RBAC enforcement API.  
> **Audience:** Business workspace admins / owners reviewing what each role can do.

**Related docs:** `docs/prd.md` · `docs/SECURITY.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/components/COMPONENT_TEAM_MEMBER_CARD.md` · `docs/components/COMPONENT_INVITE_MEMBER_MODAL.md`

---

## 1. Purpose

Displays **permissions for each Business role**.

Educates users about Owner / Admin / Manager / Viewer capabilities. Does **not** edit permissions this phase (read-only matrix).

**Do not redesign.** Match Figma.

---

## 2. Roles (columns or rows — Figma wins)

| Role | Spec |
|------|------|
| **Owner** | Full control |
| **Admin** | Broad management |
| **Manager** | Operational scope |
| **Viewer** | Read-oriented |

Align keys/labels with Team Member Card role enum.

---

## 3. Permissions

| Permission | Spec |
|------------|------|
| **View Audits** | See audit list / reports (as entitled) |
| **Create Audits** | Start new audits |
| **Delete Audits** | Delete audits |
| **Invite Members** | Invite teammates |
| **Manage Billing** | Billing / plan / payment surfaces |
| **Manage Team** | Roles, remove members, team settings |
| **Export Reports** | PDF / export actions |
| **Manage Settings** | Workspace / org settings |

Each cell is **granted** or **not granted** (check / dash / Yes / No — Figma wins). Meaning must not rely on color alone.

---

## 4. Display

| Element | Spec |
|---------|------|
| **Permission matrix table** | Roles × permissions grid |
| Caption / title | e.g. “Role permissions” (Figma) |
| Legend (optional) | Explain granted vs not granted if icons used |

| Layout options (Figma wins) | Spec |
|-----------------------------|------|
| A | Permissions as rows; roles as columns |
| B | Roles as rows; permissions as columns |

Prefer sticky first column/header on scroll when the matrix is wide.

---

## 5. Default mock grants (product baseline — adjust to Figma if different)

| Permission | Owner | Admin | Manager | Viewer |
|------------|:-----:|:-----:|:-------:|:------:|
| View Audits | ✓ | ✓ | ✓ | ✓ |
| Create Audits | ✓ | ✓ | ✓ | — |
| Delete Audits | ✓ | ✓ | — | — |
| Invite Members | ✓ | ✓ | — | — |
| Manage Billing | ✓ | — | — | — |
| Manage Team | ✓ | ✓ | — | — |
| Export Reports | ✓ | ✓ | ✓ | — |
| Manage Settings | ✓ | ✓ | — | — |

This table is **mock documentation** for UI seeding — not a live authz engine.

---

## 6. States

| State | Spec |
|-------|------|
| **Default** | Matrix rendered from mock config |
| **Loading** | Skeleton table; `aria-busy` |
| **Error** | Unable to load permissions — Retry |

---

## 7. Behaviour

| Rule | Spec |
|------|------|
| Read-only | No cell toggles / no edit mode this phase |
| Data | Static mock matrix in config |
| Enforcement | Actual feature gates remain elsewhere; this UI is informative |

---

## 8. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `matrix` | role × permission → boolean | Optional | Override default mock |
| `state` | `default` \| `loading` \| `error` | Recommended | |
| `onRetry` | action | Error | |
| `className` | string | No | |

---

## 9. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Table | Proper `<table>` (or grid with equivalent semantics): headers for roles and permissions |
| Cells | Accessible text for granted / not granted (e.g. “Allowed” / “Not allowed”) — not color-only icons |
| Caption | Table caption or `aria-labelledby` |
| Keyboard | Scrollable region reachable; Retry operable |
| Focus | Visible focus on interactive controls |

---

## 10. Analytics (recommended)

| Event | Trigger |
|-------|---------|
| **Role Permission Matrix Viewed** | Matrix enters view |

No PII.

---

## 11. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full matrix visible |
| **Tablet** | Horizontal scroll with sticky permission labels |
| **Mobile** | Horizontal scroll and/or stacked role cards listing permissions — **Figma wins**; never shrink text below readable size |

---

## 12. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Display | Read-only |
| Data | Mock matrix config |
| No | Backend · Supabase RLS UI · live permission edits |
| Tokens | Design tokens only |
| Reuse | Typography, table patterns, Skeleton, Button (Retry) |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Roles: Owner, Admin, Manager, Viewer  
□ All eight permissions listed  
□ Matrix table read-only  
□ Granted / not granted not color-only  
□ WCAG 2.2 AA table semantics  
□ Mock only — no backend  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Editing permissions per workspace |
| Custom roles |
| Live sync with server RBAC |
| Free/Pro role matrices |

---

**End of COMPONENT_ROLE_PERMISSION_MATRIX.md**
