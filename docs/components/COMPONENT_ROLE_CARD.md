# COMPONENT — Role Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-057 (Role Card)  
**Component name:** Role Card (`RoleCard`)  
**Primary screen:** Roles & Permissions (`docs/screens/SCREEN-022_ROLES_AND_PERMISSIONS.md`) · Business Workspace role summaries (when present)  
**Related:** Role Permission Matrix (`COMPONENT_ROLE_PERMISSION_MATRIX.md`) — permission detail · Team Member Card (`COMPONENT_TEAM_MEMBER_CARD.md`) — member counts by role · Team Overview Card — org context  
**Figma:** Role summary card / role picker tile — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + card patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock data only** — no backend · no Supabase · no live RBAC enforcement.  
> **Audience:** Business workspace admins / owners reviewing or selecting organization roles.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-022_ROLES_AND_PERMISSIONS.md` · `docs/components/COMPONENT_ROLE_PERMISSION_MATRIX.md` · `src/config/team-member-card.ts` · `src/config/role-permission-matrix.ts`

---

## 1. Purpose

Displays a **single Business role** and its **summary**.

Reusable in role grids, pickers, or summary strips on Roles & Permissions and Business Workspace surfaces. One card = one role template; list/grid composition is the parent screen’s job.

Educates admins about each default role at a glance before they view the full permission matrix or assign members.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Role Name** | Owner · Admin · Designer · Analyst · Viewer — labels from `TEAM_MEMBER_ROLE_LABELS` |
| **Description** | Short summary of the role’s scope (see §4) |
| **Number of Permissions** | Count of **Allowed** permissions for this role from the mock matrix (see §5) |
| **Member Count** | Number of team members currently assigned this role (mock integer from parent) |
| **Status** | Role template status label (see §6) |

| Rule | Spec |
|------|------|
| Labels | Visible or accessible names for Description, Permissions, Members, Status |
| Status | Conveyed with **text** (and optional badge) — **not color alone** |
| Permissions count | Derived from `role-permission-matrix` config — do not hardcode a second grant table |
| Empty / zero | Member count `0` is valid — show **“0 members”** (Figma exact string) |

Optional icon or role accent per Figma — tokens only; no hardcoded hex.

---

## 3. Roles

Five fixed **system** role templates (SCREEN-022 authoritative):

| Role key | Role Name |
|----------|-----------|
| `owner` | Owner |
| `admin` | Admin |
| `designer` | Designer |
| `analyst` | Analyst |
| `viewer` | Viewer |

Align keys and labels with `TeamMemberCard` / `InviteMemberModal` enums. Custom roles are **out of scope** this phase.

---

## 4. Descriptions (mock baseline — Figma wins)

| Role | Description |
|------|-------------|
| **Owner** | Full organization access |
| **Admin** | Organization administration |
| **Designer** | Product and audit work |
| **Analyst** | Analytics and reporting |
| **Viewer** | Read-only access |

Store in component config; parent may override for localization tests only.

---

## 5. Number of Permissions

| Rule | Spec |
|------|------|
| Source | Count **Allowed** cells for the role from `DEFAULT_ROLE_PERMISSION_MATRIX` via existing `role-permission-matrix` utils |
| Admin billing | When `adminBillingEnabled` is false, Admin **Manage Billing** and **View Invoices** count as not allowed; when true, count as allowed — pass org flag from parent so count matches matrix |
| Display | e.g. **“11 permissions”** / **“5 permissions”** — singular/plural per Figma |
| Do not | Maintain a separate permission-count map |

**Default mock counts** (`adminBillingEnabled: true`):

| Role | Allowed permissions |
|------|:-------------------:|
| Owner | 11 |
| Admin | 11 |
| Designer | 5 |
| Analyst | 4 |
| Viewer | 3 |

With `adminBillingEnabled: false`, Admin shows **9**.

---

## 6. Status

Role **template** status (not member Active/Invited/Suspended — that belongs on Team Member Card).

| Status | Spec |
|--------|------|
| **System** | Built-in Audient role template — default for all five roles this phase |
| **Custom** | Reserved for future custom roles — **not implemented** |

| Rule | Spec |
|------|------|
| Display | Text label **“System”** (or Figma exact) |
| Meaning | Role template cannot be deleted or renamed this phase |

---

## 7. Actions

| Action | Spec |
|--------|------|
| **View Permissions** | Focus / scroll to Role Permission Matrix for this role; or filter/highlight role column — parent handler (mock navigation acceptable) |
| **Edit Role** | Shown **only where permitted** — **disabled or hidden** for all system template roles this phase (SCREEN-022 non-goals: no custom role editor) |

| Rule | Spec |
|------|------|
| Owner | **Edit Role** never enabled for Owner template |
| Actor gating | Hide or disable actions when actor lacks **Manage Roles** (Designer / Analyst / Viewer actors) — parent responsibility |
| Layout | Inline buttons vs overflow menu — **Figma wins** |
| Card click | Optional: entire card selectable → **Selected** state + `onSelect` — Figma wins |

**Edit Role (future):** When custom roles exist, enable only for custom roles and actors with Manage Roles.

---

## 8. States

Interaction / visual states (orthogonal to §6 Status field):

| State | Spec |
|-------|------|
| **Default** | Role summary + actions at rest |
| **Selected** | Role is active in a picker / highlights linked matrix column — border/background per Figma (`ring-ring`, `border-primary`, etc.) |
| **Hover** | Hover affordance on interactive card/buttons — tokens only |
| **Focused** | Visible `focus-visible` ring on card and action controls (keyboard) |
| **Disabled** | Card or actions non-interactive — reduced opacity + `aria-disabled`; Edit Role when not permitted |

| Rule | Spec |
|------|------|
| Selected vs Status | **Selected** is UI selection; **System** is template metadata — do not conflate |
| Loading | Prefer parent/screen skeleton; optional per-card skeleton if Figma shows it |

---

## 9. Behaviour

| Rule | Spec |
|------|------|
| Read-only data | Role templates and grants are informative — no inline permission editing on this card |
| Member count | Supplied by parent from mock roster aggregation |
| View Permissions | Must not mutate data; may set `highlightedRole` on Role Permission Matrix |
| Enforcement | Actual authorization remains server-side later — mock only |

---

## 10. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `role` | `owner` \| `admin` \| `designer` \| `analyst` \| `viewer` | Yes | Role key |
| `memberCount` | number | Yes | Members assigned this role |
| `adminBillingEnabled` | boolean | No | Affects Admin permission count (default `true`) |
| `selected` | boolean | No | Selected picker state |
| `disabled` | boolean | No | Disable card interactions |
| `showEditRole` | boolean | No | Default `false` for system roles |
| `onViewPermissions` | action | Optional | View Permissions handler |
| `onEditRole` | action | Optional | Edit Role handler (future custom roles) |
| `onSelect` | action | Optional | Whole-card select (picker) |
| `className` | string | No | |

Description and permission count should be **derivable inside the component** from shared config/utils when props omitted.

---

## 11. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Semantics | Use `<article>` or list item with accessible name: **“{Role Name} role, {memberCount} members, {permissionCount} permissions”** |
| Status | Status text exposed to assistive tech — not color-only badge |
| Actions | Buttons with visible labels; min 44×44px touch targets |
| Selected | `aria-pressed` or `aria-current="true"` on selectable card when Selected |
| Disabled | `aria-disabled="true"`; remove from tab order when fully disabled |
| Keyboard | Tab to card/actions; Enter/Space activate focused control; visible focus ring |

---

## 12. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Card in grid (2–3 columns) or horizontal strip — Figma wins |
| **Tablet** | 2-column grid or stacked strip |
| **Mobile** | Single-column stack; actions full-width if Figma |

---

## 13. Analytics (recommended)

| Event | Trigger |
|-------|---------|
| **Role Card Viewed** | Card enters viewport (optional; parent may dedupe) |
| **Role Permissions View Clicked** | View Permissions action |
| **Role Edit Clicked** | Edit Role action (when enabled) |
| **Role Card Selected** | Card selected in picker |

Properties: `role` key only — no PII. Align with `docs/ANALYTICS.md` naming.

---

## 14. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `team-member-card` role enum · `role-permission-matrix` utils for permission counts · Card / Button / Badge / Typography primitives |
| Data | Mock descriptions in `role-card` config; member counts from `getMockTeamMembers()` aggregation |
| No | Backend · Supabase · custom role CRUD · second permission system |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| File plan (implementation) | `src/config/role-card.ts` · `src/utils/role-card.ts` · `src/components/team/RoleCard.tsx` · `src/lib/analytics/role-card-events.ts` |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 15. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Role Permission Matrix** | Detail view; Role Card summary links via View Permissions / `highlightedRole` |
| **Team Member Card** | Person-centric; Role Card is role-centric |
| **Team Member Role Row** | Assigns members to roles; Role Card does not assign members |
| **Roles & Permissions screen** | Primary consumer — optional role summary grid above matrix |

---

## 16. QA Checklist

□ Roles: Owner, Admin, Designer, Analyst, Viewer  
□ Fields: Name, Description, Permission count, Member count, Status  
□ Permission count matches matrix (incl. Admin billing org flag)  
□ Actions: View Permissions; Edit Role disabled/hidden for system roles  
□ States: Default, Selected, Hover, Focused, Disabled  
□ WCAG 2.2 AA — keyboard, focus, not color-only status  
□ Mock only — no backend  
□ Reuses shared role + permission config — no duplicate grant table  

---

## 17. Non-goals

| Out of scope |
|--------------|
| Custom role create/edit/delete |
| Inline permission toggles on the card |
| Free/Pro role cards |
| Live Supabase / server RBAC sync |
| Member assignment UI (use Team Member Role Row / Invite modal) |

---

**End of COMPONENT_ROLE_CARD.md**
