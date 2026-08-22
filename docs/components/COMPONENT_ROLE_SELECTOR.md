# COMPONENT — Role Selector

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-059 (Role Selector)  
**Component name:** Role Selector (`RoleSelector`)  
**Primary screen:** Roles & Permissions (`docs/screens/SCREEN-022_ROLES_AND_PERMISSIONS.md`) · Team member role assignment surfaces  
**Related:** Role Change Confirm Modal (`RoleChangeConfirmModal`) — confirmation step · Team Member Role Row — current inline select pattern to refactor · Invite Member Modal — role pick on invite (no confirm) · Team Member Card — role labels · Save Changes Button — persist staged changes  
**Figma:** Member role dropdown / selector — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + form / select patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock state only** — no backend · no Supabase · **do not implement actual authorization** (UI gating is informative).  
> **Audience:** Business administrators with **Manage Roles** assigning roles to team members.

**Related docs:** `docs/prd.md` · `docs/VALIDATION_RULES.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-022_ROLES_AND_PERMISSIONS.md` · `src/config/team-member-card.ts` · `docs/components/COMPONENT_DELETE_CONFIRMATION_MODAL.md` (confirm-dialog pattern)

---

## 1. Purpose

Allows an **administrator** to **select a role** for a team member.

Encapsulates the role dropdown, confirmation dialog, and **staged change** callback — parent screen owns dirty state and Save. Does **not** persist to backend this phase.

**Do not redesign.** Match Figma.

---

## 2. Options

Five organization roles exist; **selectable options** depend on context:

| Role | In selector | Spec |
|------|:-----------:|------|
| **Owner** | Display only | Shown when member **is** Owner — control **disabled**; not offered as a new assignment |
| **Admin** | ✓ | Assignable |
| **Designer** | ✓ | Assignable |
| **Analyst** | ✓ | Assignable |
| **Viewer** | ✓ | Assignable |

Align keys and labels with `ASSIGNABLE_TEAM_MEMBER_ROLES` / `TEAM_MEMBER_ROLE_LABELS` in `team-member-card.ts`.

| Rule | Spec |
|------|------|
| Owner transfer | **Out of scope** — cannot promote a member to Owner via this control |
| Invite flow | Invite Member Modal may reuse option list without confirmation — separate field component acceptable |

---

## 3. Display

| Element | Spec |
|---------|------|
| **Label** | Required — e.g. **“Role for {member name}”** (visible + `aria-labelledby`) |
| **Control** | Native `<select>` or design-system Select — Figma wins |
| **Current value** | Member’s **staged** role (may differ from last saved until Save) |
| **Owner (disabled)** | Read-only field showing **Owner** + helper **“Organization owner”** |

Optional: short role hint on focus / description per option — **Figma wins**; not required if matrix covers detail.

---

## 4. Behaviour

When the administrator selects a **different** role:

```text
User selects new role in control
        ↓
Show confirmation dialog (Role Change Confirm Modal)
        ↓
Confirm → apply staged change (parent callback)
Cancel  → revert control to previous staged value
```

| Step | Spec |
|------|------|
| **Select change** | Open confirmation; do **not** update staged value until confirmed |
| **Confirm** | Call `onStageChange({ fromRole, toRole })`; update displayed value to `toRole` |
| **Cancel** | Close dialog; control shows prior `value` unchanged |
| **Same role** | No dialog if selected value equals current staged value |
| **Persist** | Parent Save bar persists all staged changes — selector does not call backend |

| Confirmation copy | Spec |
|-------------------|------|
| Title | Change role for {member name}? |
| Body | {Member} will move from **{old role}** to **{new role}**. Permissions update when you save. |
| Primary | Confirm |
| Secondary | Cancel |
| Focus default | **Cancel** |

Reuse **Role Change Confirm Modal** / Confirm Dialog chrome (non-destructive).

| Rule | Spec |
|------|------|
| Mock only | Staged state lives in parent React state / mock store |
| Authorization | Do not enforce real RBAC in this component — parent may hide/disable entire selector |
| Analytics | Fire **Role Selected** / **Permission Changed** on confirm (SCREEN-022) — no email in payload |

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Enabled select showing current staged role |
| **Selected** | Dropdown open / option highlighted — native select or listbox pattern |
| **Focused** | Visible focus ring on control |
| **Disabled** | Owner row, unauthorized actor, or parent `disabled` — `aria-disabled`; explain Owner case |
| **Loading** | Control disabled + busy indicator while parent loads member (optional) |
| **Error** | Inline error below control (e.g. mock save failed on member) + `aria-invalid` |

| Rule | Spec |
|------|------|
| Staged vs saved | Component displays **staged** `value` from parent; parent passes `savedRole` only for revert on screen Cancel |
| Dialog open | While confirmation open, avoid duplicate dialogs |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `memberId` | string | Yes | Target member |
| `memberName` | string | Yes | For label and confirm copy |
| `value` | role key | Yes | Current **staged** role |
| `disabled` | boolean | No | Force disable (Owner, unauthorized) |
| `state` | `default` \| `loading` \| `error` | No | |
| `errorMessage` | string | No | Shown when `state === error` |
| `onStageChange` | `(from, to) => void` | Yes | After confirm — stage only |
| `onFocus` | action | No | Optional — highlight matrix column |
| `id` | string | No | For label association |
| `className` | string | No | |

Parent remains source of truth for staged role map.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Label | Visible label linked via `htmlFor` / `aria-labelledby` — **“Role for {name}”** |
| Control | Native select or accessible listbox with labelled options |
| Disabled | `aria-disabled="true"` + text explanation for Owner |
| Error | `aria-invalid="true"` + `aria-describedby` pointing to error message |
| Keyboard | Tab to control; arrow keys change option; Enter/Space opens native select; dialog trap while confirm open |
| Focus | Restore focus to select after dialog cancel/confirm |
| Live region | Optional polite announcement on staged change after confirm |

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Mobile** | Full-width select (`min-h-11` touch target) |
| **Desktop** | Max width per Figma (e.g. `sm:max-w-xs`); aligns in member row |

---

## 9. Analytics (recommended)

| Event | Trigger |
|-------|---------|
| **Role Selector Opened** | Optional — focus/open dropdown |
| **Role Selected** | Confirm accepted |
| **Role Select Cancelled** | Confirm dismissed |

Properties: `fromRole`, `toRole`, `memberId` (opaque id) — no email.

Align with `roles-permissions-events.ts` when instrumenting.

---

## 10. Relationship to Existing Implementation

| Today | Target |
|-------|--------|
| `TeamMemberRoleRow` inline `<select>` + parent `RoleChangeConfirmModal` | Extract into **`RoleSelector`** composing select + modal |
| `RolesPermissionsScreen` | Owns staged map, dirty, Save; passes props to `RoleSelector` per member |
| Invite Member Modal | Role pick without confirm — may share **options list** helper, not full selector behaviour |

Refactor note: implementing `RoleSelector` should **replace** duplicate select/confirm wiring in `TeamMemberRoleRow` without changing SCREEN-022 save flow.

---

## 11. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `ASSIGNABLE_TEAM_MEMBER_ROLES` · `TEAM_MEMBER_ROLE_LABELS` · `RoleChangeConfirmModal` · `inputShellVariants` select styling (Invite Member Modal pattern) |
| Config | `src/config/role-selector.ts` — copy, states |
| Utils | `src/utils/role-selector.ts` — option builders, disabled rules |
| Component | `src/components/team/RoleSelector.tsx` |
| Analytics | `src/lib/analytics/role-selector-events.ts` (or extend roles-permissions events) |
| No | Backend · Supabase · real authorization · Owner assignment · immediate persist |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Options: Admin, Designer, Analyst, Viewer selectable  
□ Owner: disabled read-only with explanation  
□ Change → confirm → staged callback; cancel reverts  
□ States: Default, Focused, Disabled, Loading, Error  
□ Proper label for member  
□ WCAG 2.2 AA keyboard + focus  
□ Mock only — no backend  
□ No real authorization enforcement  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Assigning Owner / ownership transfer |
| Persisting without parent Save |
| Custom roles |
| Live Supabase / server RBAC |
| Permission editing (use Role Permission Matrix) |

---

**End of COMPONENT_ROLE_SELECTOR.md**
