# SCREEN-022 — Roles & Permissions

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Screen ID:** SCREEN-022 (product brief)  
**Canonical mapping:** Business organization role & permission management (roadmap — `SCREEN_MAPPING` notes team/seats as future)  
**Screen name:** Roles & Permissions  
**Route (recommended):** `/workspace/roles` — deep-linkable; child of Business Workspace  
**Figma:** Roles & Permissions / Team RBAC frames — **exact match**  
**Priority:** P1  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` backlog reserved **SCREEN-022** for **Terms of Service** (SCREEN-M14). This document is **Roles & Permissions**. Renumber when consolidating IDs.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock data only** — **no backend**, **no Supabase**, **no live RBAC enforcement**. Frontend permissions are **informative / mock-only**; real authorization will be enforced later by Supabase RLS / backend.  
> **Pricing:** Business = UI label for schema `ENTERPRISE` (`PRICING.md` / `plans.ts`).

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `docs/STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/SECURITY.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` ·  
`docs/screens/SCREEN-020_BUSINESS_WORKSPACE.md` ·  
`docs/components/COMPONENT_ROLE_PERMISSION_MATRIX.md` ·  
`docs/components/COMPONENT_TEAM_MEMBER_CARD.md` ·  
`docs/components/COMPONENT_SAVE_CHANGES_BUTTON.md` ·  
`docs/components/COMPONENT_DELETE_CONFIRMATION_MODAL.md` (confirm-dialog pattern)

---

## 1. Purpose

Allows **Business organization administrators** to manage team **roles** and understand **permissions** within Audient.

The screen defines what each default role can access and perform, lets authorized admins **assign roles to team members**, and persists changes through a **staged Save** flow (mock only).

The UI must **match the approved Figma exactly**.

---

## 2. Entry Point

```text
Application Header / Profile Menu
        ↓
Business Workspace (SCREEN-020)
        ↓
Roles & Permissions
```

Also: direct link `/workspace/roles`; “Manage roles” / “View permissions” from Business Workspace Role Permissions section; member **Edit role** from Team Member Card may deep-link here with member pre-selected (Figma wins).

| Prerequisite | Spec |
|--------------|------|
| Auth | Required |
| Plan | **Business** (`ENTERPRISE`) |
| Org permission | Actor must hold **Manage Roles** (Owner always; Admin by default — see §4) |

---

## 3. Access Rules

| User | Spec |
|------|------|
| **Guest** | **No Access** → Login; resume intent → this screen after auth if still eligible |
| **Free** | **No Access** → Upgrade / Manage Plan (Business CTA) |
| **Pro** | **No Access** → Upgrade to Business |
| **Business — authorized** | **Full Access** (Owner; Admin with Manage Roles) |
| **Business — unauthorized** | **Unauthorized** state (§12) — member lacks Manage Roles |

Do not invent Free/Pro team-role UIs on this screen.

---

## 4. Actor Permissions (mock)

| Actor role | Manage Roles | Notes |
|------------|:------------:|-------|
| **Owner** | ✓ | Full access to this screen |
| **Admin** | ✓ | Default; may be restricted by org config (future) |
| **Designer** | — | Unauthorized |
| **Analyst** | — | Unauthorized |
| **Viewer** | — | Unauthorized |

Mock auth exposes actor role for gating only. **Never rely on frontend checks for security** (`SECURITY.md`).

---

## 5. Layout

```text
Application Header
        ↓
Breadcrumb (e.g. Dashboard > Business Workspace > Roles & Permissions)
        ↓
Page Title
        ↓
Page description (optional — Figma)
        ↓
Section A — Role permission reference (matrix)
        ↓
Section B — Team member role assignment (list)
        ↓
Sticky / footer Save bar (when dirty)
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell (Header, profile menu, notification badge) |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Compose | **Reuse** Role Permission Matrix, Team Member Card patterns, Save Changes Button — do not recreate |

---

## 6. Default Roles

Five fixed role templates (not custom roles this phase):

| Role | Summary |
|------|---------|
| **Owner** | Full organization access |
| **Admin** | Organization administration |
| **Designer** | Product / audit work |
| **Analyst** | Analytics and reporting |
| **Viewer** | Read-only access |

> **Alignment note:** Existing component docs (`COMPONENT_TEAM_MEMBER_CARD`, `COMPONENT_INVITE_MEMBER_MODAL`, `COMPONENT_ROLE_PERMISSION_MATRIX`) reference **Manager** instead of **Designer / Analyst**. **SCREEN-022 role set is authoritative** for this screen; update component specs and mock enums when implementing.

**Owner** cannot be assigned via invite or role dropdown (same as Invite Member Modal). At least one Owner must remain (mock validation).

---

## 7. Permission Groups

Permissions are grouped for matrix display and mobile expandable cards:

| Group | Permissions |
|-------|-------------|
| **Audit** | View Dashboard · Run Audit |
| **Reports** | View Audit Reports · Export Reports |
| **Team** | Manage Team · Invite Members · View Team Activity |
| **Organization** | Manage Organization |
| **Billing** | Manage Billing · View Invoices |
| **Administration** | Manage Roles |

Each permission cell / row uses one of two states:

| State | Display (Figma wins) |
|-------|----------------------|
| **Allowed** | Granted — e.g. check + “Allowed” accessible text |
| **Not Allowed** | Not granted — e.g. dash + “Not allowed” accessible text |

**Do not communicate permission state using color alone** — pair icon/badge with text (`ACCESSIBILITY.md`).

---

## 8. Role Definitions (reference matrix)

The permission matrix is the **canonical reference** for default grants. Cells are **read-only** on this screen (role templates are fixed; admins assign roles, not individual permission toggles).

### 8.1 Owner

Full organization access.

| Permission | State |
|------------|:-----:|
| View Dashboard | Allowed |
| Run Audit | Allowed |
| View Audit Reports | Allowed |
| Export Reports | Allowed |
| Manage Team | Allowed |
| Invite Members | Allowed |
| Manage Roles | Allowed |
| Manage Organization | Allowed |
| Manage Billing | Allowed |
| View Invoices | Allowed |
| View Team Activity | Allowed |

### 8.2 Admin

Organization administration.

| Permission | State |
|------------|:-----:|
| View Dashboard | Allowed |
| Run Audit | Allowed |
| View Audit Reports | Allowed |
| Export Reports | Allowed |
| Manage Team | Allowed |
| Invite Members | Allowed |
| Manage Roles | Allowed |
| Manage Organization | Allowed |
| Manage Billing | **Org-dependent** (see §8.6) |
| View Invoices | **Org-dependent** (follows Manage Billing org config) |
| View Team Activity | Allowed |

### 8.3 Designer

Product / audit work.

| Permission | State |
|------------|:-----:|
| View Dashboard | Allowed |
| Run Audit | Allowed |
| View Audit Reports | Allowed |
| Export Reports | Allowed |
| View Team Activity | Allowed |
| Manage Team | Not Allowed |
| Invite Members | Not Allowed |
| Manage Roles | Not Allowed |
| Manage Organization | Not Allowed |
| Manage Billing | Not Allowed |
| View Invoices | Not Allowed |

### 8.4 Analyst

Analytics and reporting.

| Permission | State |
|------------|:-----:|
| View Dashboard | Allowed |
| View Audit Reports | Allowed |
| Export Reports | Allowed |
| View Team Activity | Allowed |
| Run Audit | Not Allowed |
| Manage Team | Not Allowed |
| Invite Members | Not Allowed |
| Manage Roles | Not Allowed |
| Manage Organization | Not Allowed |
| Manage Billing | Not Allowed |
| View Invoices | Not Allowed |

### 8.5 Viewer

Read-only access.

| Permission | State |
|------------|:-----:|
| View Dashboard | Allowed |
| View Audit Reports | Allowed |
| View Team Activity | Allowed |
| Run Audit | Not Allowed |
| Export Reports | Not Allowed |
| Manage Team | Not Allowed |
| Invite Members | Not Allowed |
| Manage Roles | Not Allowed |
| Manage Organization | Not Allowed |
| Manage Billing | Not Allowed |
| View Invoices | Not Allowed |

### 8.6 Organization configuration (Admin billing)

**Manage Billing** and **View Invoices** for **Admin** depend on mock organization configuration:

| Mock org setting | Admin billing cells |
|------------------|---------------------|
| `adminBillingEnabled: true` | Allowed |
| `adminBillingEnabled: false` | Not Allowed |

Display org-dependent cells with accessible label e.g. “Allowed (organization setting)” / “Not allowed (organization setting)”. Editing this org flag is **out of scope** this phase unless Figma shows a toggle — matrix reflects mock config only.

---

## 9. Sections

| Section | Component / pattern | Spec |
|---------|---------------------|------|
| **Role permission reference** | `RolePermissionMatrix` | Roles × permissions grid; grouped headers optional; **read-only** |
| **Team member roles** | `TeamMemberCard` list + role selector | Assign role per member; staged changes |
| **Save** | `SaveChangesButton` | Enabled when staged changes exist |

### 9.1 Role permission reference

| Rule | Spec |
|------|------|
| Data | Mock matrix from §8 |
| Interaction | Reference only — no cell toggles |
| Highlight | Optional: highlight column/row for **selected role** when user focuses a member’s role dropdown (Figma) |
| Analytics | **Roles Viewed** on first meaningful paint of matrix |

### 9.2 Team member role assignment

| Element | Spec |
|---------|------|
| List | Mock team members (name, email, avatar, current role, status) |
| Role control | Select / dropdown: **Admin · Designer · Analyst · Viewer** — **not Owner** (Owner transfer is out of scope) |
| Current user | Actor cannot demote self below Admin if sole Owner (mock guard) |
| Owner rows | Role control **disabled** with explanation (“Organization owner”) |
| Invited members | Role may be pre-set from invite; editable when staged |

---

## 10. Role Selection & Confirmation

When an administrator changes a team member’s role:

```text
Select new role
        ↓
Show confirmation dialog
        ↓
Confirm → stage change (dirty)
Cancel → revert control to previous role
```

| Confirmation copy (recommended) | Spec |
|---------------------------------|------|
| Title | Change role for {member name}? |
| Body | {Member} will move from **{old role}** to **{new role}**. Permissions update when you save. |
| Primary | Confirm |
| Secondary | Cancel |

Reuse **Confirm Dialog** pattern (`DeleteConfirmationModal` / `ConfirmDialog` chrome — non-destructive variant). Focus default: **Cancel**.

| Rule | Spec |
|------|------|
| Staging | Confirmed change updates **staged** role only — not persisted until Save |
| Analytics | **Role Selected** on confirm; include `fromRole`, `toRole` (no email) |
| Revert | Cancel on dialog or Save bar Cancel (if shown) restores last saved roles |

---

## 11. Save Behaviour

Changes are **staged first** (`dirty === true`). Align with Settings / `SaveChangesButton` patterns (`STATE_MANAGEMENT.md` screen-local dirty flags).

```text
Edit member role(s) → Confirm each change → Staged (dirty)
        ↓
Click Save
        ↓
Show loading (Saving…)
        ↓
Mock successful save
        ↓
Show confirmation: "Permissions updated successfully."
        ↓
Clear dirty; update “saved” baseline
```

| Step | Spec |
|------|------|
| **Save disabled** | No staged changes |
| **Save enabled** | One or more staged role changes |
| **Saving** | Button loading; block duplicate save; `aria-busy` on main or button |
| **Saved** | Success toast or live region: **“Permissions updated successfully.”** |
| **Error** | Inline / toast error; remain dirty; Retry via Save |
| **Leave guard** | If dirty, warn on navigate away (unsaved changes pattern from Settings) |

| Analytics | Trigger |
|-----------|---------|
| **Role Save Started** | Save clicked while dirty |
| **Role Save Completed** | Mock persist success |
| **Role Save Failed** | Mock persist failure |

**Permission Changed** event: fire when a role change is **confirmed** in the dialog (staged), with `permission` = effective capability delta summary or `changeType: "member_role"` — avoid PII.

---

## 12. States

| State | Spec |
|-------|------|
| **Default** | Matrix + member list loaded; Save disabled |
| **Editing** | Staged role change(s); Save enabled; optional “Unsaved changes” indicator |
| **Saving** | Save in progress |
| **Saved** | Post-save success feedback; clean baseline |
| **Error** | Failed to load or save — message + Retry |
| **Unauthorized** | Actor lacks Manage Roles — §13 |
| **Loading** | Skeleton for matrix + member list; `aria-busy` on main |

Empty roster (Business org with zero members) is valid **Empty** — not Error.

---

## 13. Unauthorized State

When a Business user opens the screen without **Manage Roles**:

| Element | Spec |
|---------|------|
| Message | **You don't have permission to manage roles.** |
| CTA | **Back to Workspace** → `/workspace` |
| Matrix / editors | Hidden — do not leak editable controls |

This is an **authorization gate**, not a plan upgrade gate.

---

## 14. Security

| Rule | Spec |
|------|------|
| Frontend | **Mock-only** permission gating for UX |
| Enforcement | Real authorization via Supabase RLS / backend later |
| Never | Rely on frontend permissions for security |
| Data | Mock team members and role assignments only |
| PII | No tokens/secrets in UI or analytics payloads |

---

## 15. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Landmarks | Main, labelled sections (reference matrix, member roles) |
| Table / matrix | Proper table or grid semantics; row/column headers; caption or `aria-labelledby` |
| Permission cells | Textual Allowed / Not allowed — not color-only |
| Role selectors | Labelled (`Role for {name}`); announce change in dialog |
| Keyboard | All CTAs, role selects, dialog, Save, matrix scroll region |
| Focus | Visible; trap in confirmation dialog; restore focus on close |
| Status | Saving / success / error via live region where appropriate |
| Skip link | Existing app skip link |

---

## 16. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full permission matrix (roles × permissions); member list beside or below per Figma |
| **Tablet** | Condensed matrix; horizontal scroll with sticky permission labels |
| **Mobile** | **Role cards** with **expandable permission groups** per role; stacked member cards; sticky Save when dirty |

Never shrink text below readable minimum; horizontal scroll preferred over illegible columns.

---

## 17. Analytics

| Event | Trigger | Properties (recommended) |
|-------|---------|---------------------------|
| **Roles Viewed** | Screen opens (authorized) | `tier`, `actorRole` |
| **Role Selected** | Role change confirmed in dialog | `fromRole`, `toRole` |
| **Permission Changed** | Staged role change confirmed | `changeType: "member_role"`, `fromRole`, `toRole` |
| **Role Save Started** | Save clicked | `stagedChangeCount` |
| **Role Save Completed** | Mock save success | `stagedChangeCount` |
| **Role Save Failed** | Mock save failure | `errorCode` (mock) |

No full emails in analytics. Align naming with `docs/ANALYTICS.md` conventions when instrumenting.

---

## 18. Relationship to Other Screens

| Screen | Spec |
|--------|------|
| **Business Workspace (020)** | Parent hub; link in / breadcrumb from Role Permissions section |
| **Settings (019)** | Personal account — not org RBAC |
| **Manage Membership / Billing** | Plan purchase — not role editing |
| **Invite Member Modal** | Assigns initial role on invite; changes persist here after save |

---

## 19. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `RolePermissionMatrix`, `TeamMemberCard`, `SaveChangesButton`, Confirm Dialog |
| Data | Mock members, role enum (Owner / Admin / Designer / Analyst / Viewer), matrix config §8, optional `adminBillingEnabled` |
| QA override | `?state=loading\|empty\|error\|success\|unauthorized` for manual QA (consistent with other screens) |
| No | Backend · Supabase org APIs · custom roles · per-permission cell editing · Owner transfer · realtime sync |
| Auth | Existing mock auth — gate on Business tier + actor Manage Roles |

**Do not generate implementation code in this document.**

---

## 20. QA Checklist

□ Guest / Free / Pro → No Access  
□ Business Owner / Admin → Full Access  
□ Designer / Analyst / Viewer actor → Unauthorized + Back to Workspace  
□ Five roles in reference matrix with correct grants  
□ Admin billing respects mock org config  
□ Role assignment: confirm dialog before staging  
□ Save: disabled → enabled → Saving → “Permissions updated successfully.”  
□ States: Loading, Empty, Error, Unauthorized  
□ Leave guard when dirty  
□ Analytics events listed  
□ WCAG 2.2 AA — matrix, keyboard, not color-only  
□ Mock only — no backend  

---

## 21. Non-goals

| Out of scope |
|--------------|
| Custom roles or per-permission toggles |
| Owner transfer / ownership demotion |
| Live Supabase RLS / server RBAC |
| Real email / invite flows |
| Terms of Service (other SCREEN-022 in mapping) |

---

**End of SCREEN-022_ROLES_AND_PERMISSIONS.md**
