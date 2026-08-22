# COMPONENT — Profile Settings Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-044 (Profile Settings Card)  
**Component name:** Profile Settings Card (`ProfileSettingsCard`)  
**Primary screen:** Settings — Profile (`docs/screens/SCREEN-019_SETTINGS.md`)  
**Also related:** Account Settings · Personal (**SCREEN-010**) — prefer one reusable card to avoid duplicate profile UIs  
**Related:** `UserAvatar` — photo/initials display · Billing Details Card — different domain (address/tax)  
**Figma:** Profile settings block on Settings — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + form / card patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mocked profile data only** — no backend · no Supabase · no real avatar upload storage.  
> **Security:** Email is **read-only** (SSO-managed). Do not allow client email change.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-019_SETTINGS.md`

---

## 1. Purpose

Allows **authenticated users** to **view and edit basic profile information**.

Reusable on Settings (Profile section) and any future Account Settings Personal surface — one card, not two competing forms.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Profile Photo** | Avatar (photo or initials) + optional change affordance |
| **Full Name** | Display / edit |
| **Email** | Display — always **read-only** |
| **Company** | Display / edit; optional |
| **Role** | Display / edit (job title); optional |

| Rule | Spec |
|------|------|
| Placeholders | Missing optional Company / Role → **“Not provided”** in Default (view) mode |
| Labels | Visible labels on all fields |
| R6 | Single email field only — no duplicate |

---

## 3. Behaviour

| Field | Editable |
|-------|----------|
| Full Name | Yes |
| Company | Yes |
| Role | Yes |
| Email | **No** — read-only; hint that it is managed by the sign-in provider |
| Profile Photo | Mock change only (toast / file picker stub) — no real upload API |

| Mode flow | Spec |
|-----------|------|
| Default | Read-only presentation (or inline-ready fields per Figma) |
| Edit | User activates **Edit** → fields become editable (except email) |
| Save | Validate → mock persist via parent → **Saved** feedback |
| Cancel | Discard draft → return to last saved values |

Parent Settings screen may own a global Save; this card still supports local Edit / Save / Cancel when used standalone or when Figma shows card-level actions.

---

## 4. Actions

| Action | Spec |
|--------|------|
| **Edit** | Enter Editing state; fire **Profile Edit Started** |
| **Save** | Validate + commit mock profile; fire **Profile Updated** |
| **Cancel** | Revert unsaved field edits; exit Editing |

Optional: Change photo button in both Default and Editing.

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | View mode; saved values; Edit available |
| **Editing** | Editable fields focused; Save / Cancel visible |
| **Saving** | Save in progress; controls busy (`aria-busy`); prevent double submit |
| **Saved** | Brief success feedback (toast or inline) then Default |
| **Error** | Load failure or save failure — message + Retry / stay in Editing with inline field errors |

| Not this component | Spec |
|--------------------|------|
| Page Loading skeleton | Parent Settings Loading |
| Danger Zone delete | Separate Settings section |

---

## 6. Validation

| Field | Spec |
|-------|------|
| **Full Name** | **Required** — non-empty after trim; max length (e.g. 80) |
| **Company** | Optional |
| **Role** | Optional |
| **Email** | Not validated for edit (immutable display) |

| Behaviour | Spec |
|-----------|------|
| Timing | On Save; optional blur for Full Name |
| Errors | Inline under field — not toast-only |
| Block save | Invalid Full Name prevents commit |

Align with VALIDATION_RULES / SCREEN-019 name rules.

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `default` \| `editing` \| `saving` \| `saved` \| `error` | Recommended | Or derive from local UI |
| `fullName` | string | Yes | |
| `email` | string | Yes | Read-only display |
| `company` | string \| null | Optional | |
| `role` | string \| null | Optional | |
| `avatarUrl` | string \| null | Optional | |
| `errors` | map field → message | Validation | |
| `onEdit` | action | Yes | Enter edit mode |
| `onSave` | action (values) | Yes | Parent mock persist |
| `onCancel` | action | Yes | Revert |
| `onChangePhoto` | action | Optional | Mock photo |
| `className` | string | No | |

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Edit / Save / Cancel / fields / photo control operable |
| Visible focus | Required |
| Labels | Proper form labels; email announced as read-only |
| Errors | Associated with fields (`aria-invalid` / describedby) |
| Avatar | Accessible name (e.g. “Avatar for {name}”) |
| Saving | Busy state announced |

---

## 9. Analytics

| Event | Trigger |
|-------|---------|
| **Profile Settings Viewed** | Card mounts / Profile section shown |
| **Profile Edit Started** | Edit activated |
| **Profile Updated** | Successful mock save |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `hasCompany`, `hasRole` — **no** email or full name in marketing analytics |

---

## 10. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Avatar + form (often two-column: photo left, fields right) |
| **Tablet** | Same hierarchy; may stack |
| **Mobile** | Single column; avatar on top; full-width actions |

---

## 11. Relationship to Settings Screen

| Surface | Spec |
|---------|------|
| **SCREEN-019 Profile section** | Prefer composing this card instead of one-off panel markup |
| **Global Save Changes** | Parent may wrap card dirty state; card-level Save still valid when Figma shows it |
| **Unsaved changes dialog** | Parent owns leave-page confirm; card Cancel only reverts card draft |

---

## 12. Mock Data

| Rule | Spec |
|------|------|
| Source | Mock profile from session / `getMockSettingsScreen` |
| No | Supabase · `PATCH /me` · real avatar storage |
| Photo | Local preview URL optional for demo only |

---

## 13. Security

| Rule | Spec |
|------|------|
| Email immutable | Never writable in UI |
| PII | Name / company / role sensitive when persisted later |
| Auth | Authenticated users only (parent gate) |

---

## 14. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `UserAvatar`, `Input`, `Button`, toast |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Controlled | Parent or local draft — prefer controlled from Settings store |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 15. QA Checklist

□ Displays photo, full name, email, company, role  
□ Edit Full Name / Company / Role; email read-only  
□ Actions: Edit, Save, Cancel  
□ States: Default, Editing, Saving, Saved, Error  
□ Full Name required; Company / Role optional  
□ Analytics: Viewed, Edit Started, Updated  
□ WCAG 2.2 AA · keyboard · labels · focus  
□ Desktop / Tablet / Mobile  
□ Mock only — no backend / Supabase  

---

## 16. Non-goals

| Out of scope |
|--------------|
| Email change / verification flows |
| Real avatar upload pipeline |
| Password / SSO linking (Connected Accounts section) |
| Billing address fields |

---

**End of COMPONENT_PROFILE_SETTINGS_CARD.md**
