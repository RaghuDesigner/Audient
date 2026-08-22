# COMPONENT — Permission Group

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-058 (Permission Group)  
**Component name:** Permission Group (`PermissionGroup`)  
**Primary screen:** Roles & Permissions (`docs/screens/SCREEN-022_ROLES_AND_PERMISSIONS.md`) · Role Permission Matrix mobile/detail surfaces  
**Related:** Role Permission Matrix (`COMPONENT_ROLE_PERMISSION_MATRIX.md`) — parent matrix · Role Permission Matrix Grant Mark — allowed state display · Role Card (`COMPONENT_ROLE_CARD.md`) — role summary · FAQ Accordion — disclosure patterns  
**Figma:** Permission group / accordion rows — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + disclosure / list patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Read-only display** of **mocked** permission grants — no backend · no live RBAC enforcement.  
> **Audience:** Business workspace admins / owners reviewing permissions for a role or in the matrix.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-022_ROLES_AND_PERMISSIONS.md` · `src/config/role-permission-matrix.ts` · `src/utils/role-permission-matrix.ts`

---

## 1. Purpose

**Groups related permissions** under a single category heading.

Reusable wherever permissions are listed by category — mobile role cards inside Role Permission Matrix, role detail panels, and future permission editors (read-only this phase). One component instance = **one group** (e.g. Audit); the parent composes all six groups.

**Do not redesign.** Match Figma.

---

## 2. Groups

Six fixed groups (SCREEN-022 authoritative — align with `ROLE_PERMISSION_GROUPS`):

| Group key | Group name | Permissions included |
|-----------|------------|----------------------|
| `audit` | **Audit** | View Dashboard · Run Audit |
| `reports` | **Reports** | View Audit Reports · Export Reports |
| `team` | **Team** | Manage Team · Invite Members · View Team Activity |
| `organization` | **Organization** | Manage Organization |
| `billing` | **Billing** | Manage Billing · View Invoices |
| `administration` | **Administration** | Manage Roles |

Do not invent additional groups or permissions without product sign-off.

---

## 3. Display

Each **Permission Group** renders:

| Element | Spec |
|---------|------|
| **Group name** | Category heading (e.g. **Audit**) |
| **Permission name** | Human-readable permission label (from `ROLE_PERMISSION_LABELS`) |
| **Permission description** | Short explanatory line (see §4) |
| **Allowed state** | **Allowed** or **Not allowed** — icon + visible text; org-setting variants for Admin billing when applicable |

| Rule | Spec |
|------|------|
| Read-only | No toggles / no edit mode this phase |
| Allowed state | Reuse `RolePermissionMatrixGrantMark` or equivalent — **not color alone** |
| Empty group | Do not render a group with zero permissions |
| Order | Permissions within group follow `ROLE_PERMISSION_KEYS` order in config |

Optional: permission count badge on group header (e.g. “2 permissions”) — **Figma wins**.

---

## 4. Permission descriptions (mock baseline — Figma wins)

Store in `permission-group` config; keyed by `RolePermissionKey`. Parent may override for tests only.

| Permission | Description |
|------------|-------------|
| **View Dashboard** | Access the organization dashboard and overview metrics |
| **Run Audit** | Start new screenshot and URL audits |
| **View Audit Reports** | Open completed audit reports |
| **Export Reports** | Export reports to PDF and other formats |
| **Manage Team** | Add, remove, and manage team members |
| **Invite Members** | Send invitations to join the organization |
| **View Team Activity** | See recent team activity in the workspace |
| **Manage Organization** | Update organization profile and settings |
| **Manage Billing** | Manage plan, payment methods, and billing details |
| **View Invoices** | View and download billing invoices |
| **Manage Roles** | View and assign team member roles |

Descriptions are **informative only** — not an authorization source.

---

## 5. Allowed state

| State | Display (Figma wins) |
|-------|----------------------|
| **Allowed** | Granted — e.g. check + **“Allowed”** |
| **Not allowed** | Not granted — e.g. dash + **“Not allowed”** |
| **Org-dependent (Admin billing)** | **“Allowed (organization setting)”** / **“Not allowed (organization setting)”** when `adminBillingEnabled` affects Admin billing permissions |

Grant resolution must use existing `resolveRolePermissionGrant()` — **do not duplicate** grant logic.

---

## 6. States

| State | Spec |
|-------|------|
| **Expanded** | Group content visible — default on **desktop**; open accordion panel on **mobile** |
| **Collapsed** | Group header visible; permission rows hidden — default on **mobile** when accordion closed |
| **Loading** | Skeleton group header + 1–3 skeleton permission rows; `aria-busy` on group |

| Rule | Spec |
|------|------|
| Desktop | Treat as **always Expanded** — no collapse affordance unless Figma shows optional collapse on desktop |
| Mobile | Accordion — **Collapsed** by default; user expands to **Expanded** |
| Error | Handled at parent (matrix/screen) — group does not own Error state |

---

## 7. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** (`md+`) | **Visible group** — static section: group name as heading + permission list (no accordion) |
| **Tablet** (`md+`) | Same as desktop when embedded in matrix scroll; or accordion if inside narrow role panel — **Figma wins** |
| **Mobile** (`< md`) | **Accordion** — one `PermissionGroup` = one collapsible panel; proper disclosure semantics |

| Layout (mobile accordion) | Spec |
|---------------------------|------|
| Header | Tappable summary row: group name + chevron |
| Body | Permission rows: name, description, allowed state |
| Multi-open | Multiple groups may be open simultaneously unless Figma specifies exclusive accordion |

---

## 8. Behaviour

| Rule | Spec |
|------|------|
| Data | Permissions and grants supplied by parent from `buildRolePermissionMatrixGroupSections()` or equivalent |
| Role context | When showing grants for **one role**, parent passes `role` for accessible naming (e.g. “Audit permissions for Admin”) |
| Toggle (mobile) | Click / Enter / Space on summary toggles Expanded ↔ Collapsed |
| Desktop | No toggle — content always visible |
| Enforcement | Informative UI only — actual gates remain server-side later |

---

## 9. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `groupId` | `audit` \| `reports` \| … | Yes | Group key |
| `groupLabel` | string | No | Defaults from `ROLE_PERMISSION_GROUP_LABELS` |
| `permissions` | `{ key, label, description, grant }[]` | Yes | Rows for this group |
| `role` | role key | No | Context for aria when single-role view |
| `expanded` | boolean | No | Controlled expanded state (mobile) |
| `defaultExpanded` | boolean | No | Uncontrolled default (mobile) |
| `onExpandedChange` | action | No | Mobile accordion toggle |
| `state` | `default` \| `loading` | No | |
| `layout` | `auto` \| `static` \| `accordion` | No | `auto` = static desktop / accordion mobile |
| `className` | string | No | |

`grant` uses `RolePermissionGrantCell` from shared utils.

---

## 10. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Desktop static group | `<section>` with `aria-labelledby` pointing to group heading; permission list uses `<ul>` / `<dl>` semantics |
| Mobile accordion | **Proper accordion semantics:** |
| | • Prefer native `<details>` / `<summary>` **or** WAI-ARIA Accordion pattern (`button` + `aria-expanded`, `aria-controls`, panel `id`) |
| | • Summary/button receives visible focus ring |
| | • Panel content id referenced by `aria-controls` when using ARIA pattern |
| Allowed state | Text label always present — not icon/color only |
| Keyboard | Tab to summary (mobile) or permission actions; Enter/Space toggles accordion; Esc does not close native `<details>` unless custom pattern adds it |
| Loading | `aria-busy="true"` on group; sr-only “Loading permissions…” |
| Reduced motion | Chevron rotation respects `prefers-reduced-motion` when animated |

---

## 11. Analytics (recommended)

| Event | Trigger |
|-------|---------|
| **Permission Group Expanded** | Mobile accordion opened |
| **Permission Group Collapsed** | Mobile accordion closed |

Properties: `groupId`, optional `role` — no PII. Parent/matrix may dedupe.

---

## 12. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Role Permission Matrix** | Desktop: group header rows in table; Mobile: compose `PermissionGroup` per role card (replace inline mobile group helper when implementing) |
| **Role Permission Matrix Grant Mark** | Renders allowed state cell in each permission row |
| **Role Card** | Summary only — detail drill-down may use Permission Group in a future panel |
| **FAQ Accordion** | Similar disclosure UX — reuse focus/chevron tokens; content model differs |

---

## 13. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `role-permission-matrix` config + utils for groups, labels, grants |
| Descriptions | New `ROLE_PERMISSION_DESCRIPTIONS` in config (or `permission-group` config) — single source |
| No | Backend · Supabase · permission editing · second grant table |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Suggested files (implementation) | `src/config/permission-group.ts` · `src/utils/permission-group.ts` · `src/components/team/PermissionGroup.tsx` · refactor `RolePermissionMatrixMobileGroup` to compose `PermissionGroup` |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ Six groups: Audit, Reports, Team, Organization, Billing, Administration  
□ Each permission: name, description, allowed state  
□ Desktop: group always visible (expanded)  
□ Mobile: accordion expand/collapse  
□ Loading skeleton  
□ WCAG 2.2 AA — accordion semantics, keyboard, not color-only  
□ Grants from shared matrix utils — no duplicate logic  
□ Mock only — no backend  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Editing / toggling permissions |
| Custom permission groups |
| Free/Pro permission groups |
| Live Supabase / server RBAC sync |
| Full matrix table (parent Role Permission Matrix owns table layout) |

---

**End of COMPONENT_PERMISSION_GROUP.md**
