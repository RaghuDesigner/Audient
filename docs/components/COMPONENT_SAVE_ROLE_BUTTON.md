# COMPONENT — Save Role Button

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-061 (Save Role Button)  
**Component name:** Save Role Button (`SaveRoleButton`)  
**Primary screen:** Roles & Permissions (`docs/screens/SCREEN-022_ROLES_AND_PERMISSIONS.md`)  
**Related:** Save Changes Button (`COMPONENT_SAVE_CHANGES_BUTTON.md`) — shared save UX primitive to compose · Role Selector (`COMPONENT_ROLE_SELECTOR.md`) — stages member role changes · Roles Permissions Screen — owns dirty baseline and mock persist · Unsaved-changes leave guard — sibling screen pattern  
**Figma:** Roles & Permissions save bar — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Button patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock save only** — no backend · no Supabase · **do not implement actual authorization** (UI gating is informative).  
> **Reuse:** Compose on design-system primary `Button` and/or **`SaveChangesButton`** with roles-specific copy and analytics.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/STATE_MANAGEMENT.md` · `docs/screens/SCREEN-022_ROLES_AND_PERMISSIONS.md` · `src/config/roles-permissions-screen.ts` · `src/utils/roles-permissions-screen.ts`

---

## 1. Purpose

Saves **staged role and permission changes** on the Roles & Permissions screen.

Primary persist action for administrator-assigned member roles. Parent screen stages changes via Role Selector; this button commits the staged map to the **mock store** only.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Button** | Primary variant (design-system primary) |
| **Label** | **Save** or **Save changes** — Figma exact string |
| **Loading label** | **Saving…** while busy — keep accessible name clear |
| **Placement** | Save bar / footer on SCREEN-022 — inline with Cancel (discard) when shown |

Pair with **Cancel** (revert staged roles to last saved baseline) — Cancel is a sibling control, not part of this component.

---

## 3. States

| State | Spec |
|-------|------|
| **Disabled** | No staged changes (`dirty === false`); or parent extra disable (unauthorized actor, loading screen) |
| **Default** | Enabled when unsaved staged role changes exist (`dirty === true`) |
| **Loading** | Mock save in flight — disabled interaction; busy indicator |
| **Success** | Brief confirmation after mock save succeeds |
| **Error** | Mock save failed — return to Enabled (still dirty); retry via same button |

| Visual (via Button primitive) | Spec |
|-------------------------------|------|
| **Hover** | Hover styles when Enabled |
| **Focused** | Visible focus ring (keyboard) |
| **Pressed** | Active / pressed styles when Enabled |

---

## 4. Behaviour

| Condition | Spec |
|-----------|------|
| **Disabled** | No changes exist — staged role map equals saved baseline |
| **Default / Enabled** | One or more staged member role changes |
| **Loading** | While mock save runs — block duplicate activation |
| **Success** | Show confirmation: **“Permissions updated successfully.”** |
| **Error** | Show failure message; remain dirty; user may retry Save |

### Save flow

```text
Administrator stages role change(s) via Role Selector (confirm each)
        ↓
dirty === true → Save Role Button Enabled
        ↓
Click Save
        ↓
Loading (Saving…)
        ↓
Mock persist (parent onSave)
        ↓
Success → "Permissions updated successfully." → clear dirty; update saved baseline
        OR
Error → remain dirty → Enabled (Retry)
```

| Rule | Spec |
|------|------|
| Staging | Button does **not** stage changes — parent owns `savedRoles` / `stagedRoles` map |
| Matrix | Role Permission Matrix is **read-only** this phase — Save persists **member role assignments** only |
| Idempotency | Ignore clicks while Loading |
| Mock only | Parent mock handler updates in-memory / mock data — no API |
| QA failure | Support `?saveFail=1` (or equivalent) on SCREEN-022 to exercise Error state |
| Leave guard | Parent shows unsaved-changes dialog on navigate away when dirty — not owned by this button |

### Copy (defaults)

| Context | String |
|---------|--------|
| **Success** | Permissions updated successfully. |
| **Error** | Unable to save permissions. Try again. |
| **Loading** | Saving… |
| **Disabled hint** | Optional `aria-label` suffix — e.g. “Save changes, no unsaved changes” |

Align with `ROLES_PERMISSIONS_COPY.saveSuccess` / `saveError` in `roles-permissions-screen.ts`.

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `dirty` | boolean | Yes | Staged changes differ from saved baseline |
| `onSave` | action | Yes | Mock persist — parent updates saved map on success |
| `disabled` | boolean | No | Extra disable (unauthorized, screen loading) |
| `state` | `default` \| `loading` \| `success` \| `error` | No | External override; omit for internal state machine |
| `label` | string | No | Override button label |
| `successMessage` | string | No | Override success confirmation |
| `errorMessage` | string | No | Override error message |
| `fullWidth` | boolean | No | Mobile stacked save bar |
| `className` | string | No | |
| `id` | string | No | For toolbar / label association |

Parent remains source of truth for dirty computation and mock persistence.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Activatable with **Enter** / **Space** when Enabled |
| Focus | **Visible** focus indicator on button |
| Disabled | Native `disabled` or `aria-disabled="true"` when no changes or Loading |
| Loading | **`aria-busy="true"`** on button; accessible name reflects busy state (e.g. “Saving permissions”) |
| Success | Announced via toast live region and/or `role="status"` — **“Permissions updated successfully.”** |
| Error | Announced via `role="alert"` or error toast — not color-only |
| Color | Success / Error supplement text — never sole indicator |
| Touch | Min **44px** hit target on mobile save bar |

---

## 7. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Inline in save bar with Cancel |
| **Tablet** | Same |
| **Mobile** | Full-width primary when stacked; min 44px height |

---

## 8. Analytics (recommended)

Align with `roles-permissions-events.ts` — **roles-specific** events, not Settings save events.

| Event | Trigger |
|-------|---------|
| **Role Save Started** | User activates Save while dirty |
| **Role Save Completed** | Mock persist succeeds |
| **Role Save Failed** | Mock persist fails |

| Property | Spec |
|----------|------|
| `stagedChangeCount` | Number of member role deltas being saved |
| `source` | `save_role_button` or screen source constant |

No PII (emails, names) in payloads.

---

## 9. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Save Changes Button** | Shared save UX (Loading / Success / Error machine, toast, Button primitive). **Prefer composing** `SaveChangesButton` with roles copy rather than duplicating logic |
| **Role Selector** | Stages individual member role changes — does not persist |
| **Roles Permissions Screen** | Owns dirty flags, saved/staged maps, mock save handler, leave guard, Cancel |
| **Cancel (screen)** | Reverts staged map — sibling control |

### Current implementation note

Today SCREEN-022 uses `SaveChangesButton` with `successMessage={ROLES_PERMISSIONS_COPY.saveSuccess}`. Implementing **`SaveRoleButton`** should be a thin roles-specific wrapper (copy + analytics + props defaults) over the same primitive — **no duplicate save state machine**.

---

## 10. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `SaveChangesButton` · primary `Button` · `ROLES_PERMISSIONS_COPY` · `rolesPermissionsDirty()` · `countStagedRoleChanges()` |
| Config | `src/config/save-role-button.ts` — labels, states, success/error copy |
| Utils | `src/utils/save-role-button.ts` — disabled/busy helpers if not reusing save-changes-button utils |
| Component | `src/components/team/SaveRoleButton.tsx` |
| Analytics | `src/lib/analytics/save-role-button-events.ts` (or extend `roles-permissions-events.ts`) |
| Mock delay | Align with `ROLES_PERMISSIONS_MOCK_SAVE_DELAY_MS` (~600ms) for realistic Loading |
| No | Backend · Supabase · live RBAC · permission matrix editing |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ **Disabled** when no staged changes  
□ **Default / Enabled** when dirty  
□ **Loading** while mock save runs; duplicate clicks blocked  
□ **Success:** “Permissions updated successfully.”  
□ **Error:** failure message; remains dirty; retry works  
□ Keyboard accessible with visible focus  
□ Loading / Success / Error announced to assistive tech  
□ WCAG 2.2 AA contrast and touch targets  
□ Mock save only — no backend  
□ Analytics: Role Save Started · Completed · Failed  
□ `?saveFail=1` exercises Error path  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Staging role changes (Role Selector + screen state) |
| Cancel button / unsaved leave dialog |
| Editing Role Permission Matrix cells |
| Owner transfer / custom roles |
| Server-side authorization enforcement |
| Real Supabase persist |

---

**End of COMPONENT_SAVE_ROLE_BUTTON.md**
