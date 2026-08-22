# SCREEN-019 — Settings

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Screen ID:** SCREEN-019 (product brief)  
**Canonical mapping:** Account Settings hub — expands **SCREEN-010** (Personal) and adjacent preferences · Payment Details remain **SCREEN-011** / Billing surfaces  
**Screen name:** Settings  
**Figma:** Settings / Account Settings frames — **exact match**  
**Priority:** P1  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` backlog reserved **SCREEN-019** for **Offline** (SCREEN-M11). This document is **Settings**. Prefer mapping **SCREEN-010** for Personal profile overlap; renumber when consolidating.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock settings data only** — **no Supabase**, **no backend API**, **no real IdP linking**, **no real account deletion**.  
> **Payment methods:** Card capture stays out of this screen (R4 PCI) — link to Billing / SCREEN-011 patterns; do not collect PAN here.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-018_NOTIFICATIONS.md` · `docs/components/COMPONENT_DELETE_CONFIRMATION_MODAL.md` (if present) · profile dropdown docs

---

## 1. Purpose

The Settings screen allows **authenticated** Audient users to manage:

| Area | Spec |
|------|------|
| Account / profile | Name, photo, company, role |
| Preferences | Language, timezone, appearance, date format |
| Notification preferences | Category toggles |
| Security | Provider, sessions, sign-out |
| Connected accounts | Google / Apple / Microsoft (mock status) |
| Danger zone | Delete account (confirm; mock only) |

Settings must be **organized into clear sections** — not one endless form.

The UI must **match the approved Figma exactly**.

---

## 2. Entry Point

```text
Application Header
        ↓
Profile Menu
        ↓
Settings
```

Also: sidebar / nav “Settings” when present; deep link `/settings` (or product route).

| Prerequisite | Spec |
|--------------|------|
| Auth | Required |
| Guest | **Redirect to Login**; resume intent → Settings after auth |

---

## 3. Access

| User | Spec |
|------|------|
| **Guest** | Redirect to Login |
| **Authenticated** (Free / Pro / Business) | Full access to Settings |

---

## 4. Layout

```text
Application Header
        ↓
Breadcrumb
        ↓
Page Title
  "Settings"
        ↓
Settings Navigation / Sections
        ↓
Settings Content
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell |
| Structure | Sectioned navigation + content panel — **not** a single long form |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Figma | Navigation pattern (tabs / side nav / accordion) — **Figma wins** |

### Breadcrumb (recommended)

```text
Dashboard > Settings
```

---

## 5. Settings Sections

### 5.1 Profile

| Field | Spec |
|-------|------|
| **Profile Photo** | Avatar + edit affordance; mock upload only |
| **Full Name** | Editable (or First + Last if Figma — align with SCREEN-010) |
| **Email Address** | **Read-only** — managed by identity provider (SSO) |
| **Company Name** | Optional editable |
| **Role** | Optional editable (job title / role label) |

| Rule | Spec |
|------|------|
| Email | Do not allow client email change (account-takeover risk — VALIDATION_RULES / SECURITY) |
| R6 | Do **not** show duplicate Email fields; one read-only email |
| Placeholders | Missing optional fields → **“Not provided”** |
| Avatar | Type/size validation on mock select; no real storage API |

Analytics: **Profile Updated** on successful mock save of this section (or overall save if single Save).

---

### 5.2 Preferences

| Control | Spec |
|---------|------|
| **Language** | Select from supported app languages (mock list) |
| **Time Zone** | Select (mock IANA / product list) |
| **Appearance** | Light / Dark / System — use design tokens & theme provider patterns |
| **Date Format** | Supported formats (e.g. locale presets) |

Align with VAL-SET / API settings fields where documented (`theme`, `timezone`, `language`). No inventing unsupported locales.

Analytics: **Preferences Updated**.

---

### 5.3 Notification Preferences

Users control which **notification categories** they receive (in-app and/or email per Figma — mock toggles).

| Category | Spec |
|----------|------|
| Audit Completed | Toggle |
| Audit Failed | Toggle |
| Low Credits | Toggle |
| Billing | Toggle |
| Membership | Toggle |
| Team Activity | Toggle |
| Product Updates | Toggle |

| Rule | Spec |
|------|------|
| UI | Accessible switches (not color-only) |
| Inbox | Preferences do **not** delete existing Notification Items; they gate future mock generation later |
| Default | Product defaults in mock seed (e.g. Product Updates off optional) |

Analytics: **Notification Preferences Updated**.

---

### 5.4 Security

| Element | Spec |
|---------|------|
| **Authentication Provider** | Display current SSO provider (Google / Apple / Microsoft) |
| **Active Session Information** | Mock session summary (device / last active / approximate location optional) |
| **Sign Out** | Ends current mock session → Login / Guest home |
| **Sign Out All Devices** | Mock confirmation → clear all mock sessions flag |

| Hard rule | Spec |
|-----------|------|
| Do **not** expose passwords, refresh tokens, or auth secrets |
| No password change UI (SSO-only auth product) |

Analytics: **Security Settings Viewed** (section focus) · **Sign Out Clicked**.

---

### 5.5 Connected Accounts

Supported providers:

| Provider | Status display |
|----------|----------------|
| **Google** | Connected / Not Connected |
| **Apple** | Connected / Not Connected |
| **Microsoft** | Connected / Not Connected |

| Rule | Spec |
|------|------|
| Phase | **Mock status only** — no real account linking / unlinking |
| CTA | Connect / Disconnect may be disabled or toast “Coming soon” |
| Current IdP | Match signed-in mock user’s provider as Connected |

Analytics: **Connected Account Viewed**.

---

### 5.6 Danger Zone

| Action | Spec |
|--------|------|
| **Delete Account** | Destructive CTA |

| Confirmation | Spec |
|--------------|------|
| Required | Confirmation modal (reuse Delete Confirmation pattern) |
| Copy | Clear irreversible warning; mock: “This will schedule account deletion” / Figma text |
| Confirm | **Delete Account Initiated** analytics · mock success toast · **do not permanently delete** data |
| Cancel | **Delete Account Cancelled** · close modal |

Future: `DELETE /me` cancel-sub-first rules (`API_MAPPING`) — out of scope this phase.

---

## 6. Save Behaviour

| Control | Spec |
|---------|------|
| **Save Changes** | Persists dirty fields to **mock settings store** |
| **Cancel** | Reverts unsaved edits to last loaded mock snapshot |

| After successful mock save | Spec |
|----------------------------|------|
| Feedback | **“Settings saved successfully.”** (toast or inline live region) |
| Dirty flag | Cleared |

| Validation | Spec |
|------------|------|
| Timing | On Save (and blur for fields per VALIDATION_RULES) |
| Errors | Inline field errors — not toast-only |
| Email | Never submitted as editable |

Section-level Save vs single global Save — **Figma wins**; behaviour rules above apply either way.

---

## 7. Unsaved Changes

If the user has modified settings and attempts to leave (nav, section switch if destructive, browser back):

| Element | Spec |
|---------|------|
| Dialog | Unsaved changes confirmation |
| **Stay** | Remain on Settings; keep edits |
| **Discard Changes** | Revert to last saved mock; continue navigation |

Do not silently discard.

---

## 8. Loading State

| Spec | Detail |
|------|--------|
| UI | Skeletons / loading indicators for nav + content |
| a11y | `aria-busy` on main settings region |
| Rule | Do not show Empty placeholders as if they were loaded truth while Loading |

---

## 9. Error State

| Element | Spec |
|---------|------|
| **Message** | **Unable to load your settings.** |
| **Actions** | **Retry** · **Back** (Dashboard) |

---

## 10. Empty / Default State

| Condition | Spec |
|-----------|------|
| Optional profile missing | Placeholder **“Not provided”** |
| No connected secondary IdPs | **Not Connected** labels |
| Not an error | Distinct from load Error |

---

## 11. Relationship to Other Screens

| Screen | Spec |
|--------|------|
| **SCREEN-010 Personal** | Profile section may subsume or deep-link; avoid two competing profile UIs |
| **SCREEN-011 Payment Details** | Billing method — link out; not Settings card form |
| **Manage Membership / Billing** | Plan/credits — not duplicated here beyond links |
| **Notifications (018)** | Inbox vs **preferences** (this screen) |

---

## 12. Responsive Behaviour

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Two-column where appropriate (nav + content, or avatar + form) |
| **Tablet** | Narrower content; clear section hierarchy |
| **Mobile** | Single-column |

Settings navigation on mobile may become (Figma):

- Dropdown  
- Horizontal scroll  
- Collapsible sections  

---

## 13. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Full form, toggles, nav, dialogs |
| Visible focus | Required |
| Labels | Proper form labels; read-only email announced as read-only |
| Toggles | Accessible checked state |
| Dialogs | Unsaved + Delete confirmation: focus trap, Escape, return focus |
| Color | Do not communicate Connected / error / dirty by color alone |

---

## 14. Analytics

| Event | Trigger |
|-------|---------|
| **Settings Viewed** | Screen open |
| **Profile Updated** | Profile fields saved |
| **Preferences Updated** | Preferences saved |
| **Notification Preferences Updated** | Notification toggles saved |
| **Security Settings Viewed** | Security section viewed |
| **Connected Account Viewed** | Connected Accounts section viewed |
| **Sign Out Clicked** | Sign Out |
| **Delete Account Initiated** | Confirm delete in modal |
| **Delete Account Cancelled** | Cancel / dismiss delete modal |

No PII (full email, tax IDs) in marketing analytics payloads.

---

## 15. Mock Data

| Rule | Spec |
|------|------|
| Source | Mock profile + preferences + notification prefs + connected status |
| No | Supabase · backend API · real IdP management · real deletion |
| Theme | May apply Appearance to local theme provider for demo only |
| Save | Client mock store only |

---

## 16. Security

| Rule | Spec |
|------|------|
| Auth gate | Guest → Login |
| Email immutable | Client cannot change SSO email |
| Secrets | Never display tokens / passwords |
| Delete | Confirm + mock only; production requires server + cancel-sub rules |
| Sessions | Sign out clears client session; “all devices” mock flag only |

---

## 17. Components to Reuse

| Need | Reuse |
|------|--------|
| Avatar / profile chrome | Existing profile / avatar patterns |
| Toggles | Shared switch / checkbox primitives |
| Delete confirm | `DeleteConfirmationModal` / shared confirm dialog |
| Theme | Existing theme provider |
| Forms | Shared Input, Select, Button, toast |

Create section shells only if Figma requires; do not recreate Payment card forms.

---

## 18. Navigation Summary

```text
Profile Menu → Settings
        ├─ Profile / Preferences / Notifications / Security / Connected / Danger
        ├─ Save Changes → mock persist + success message
        ├─ Cancel → revert dirty
        ├─ Sign Out → end session
        └─ Delete Account → confirm → mock initiate (no hard delete)
```

---

## 19. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Existing components; no duplicates |
| Tokens | Design tokens only |
| Architecture | Thin page; section components; mock settings store |
| Later | `GET/PATCH /me`, `GET/PATCH /settings`, `DELETE /me`, real IdP link |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 20. QA Checklist

□ Entry from Profile Menu → Settings  
□ Guest → Login; authenticated access  
□ Sections: Profile, Preferences, Notification Preferences, Security, Connected Accounts, Danger Zone  
□ Email read-only; no duplicate email  
□ Notification category toggles listed  
□ Connected Google / Apple / Microsoft mock statuses  
□ Delete Account requires confirmation; no permanent delete  
□ Save / Cancel + “Settings saved successfully.”  
□ Unsaved changes Stay / Discard  
□ Loading / Error / Not provided placeholders  
□ Desktop two-column · Tablet · Mobile nav pattern  
□ Analytics events listed  
□ WCAG 2.2 AA  
□ Mock only — no Supabase/API/IdP/deletion  

---

## 21. Non-goals (this phase)

| Out of scope |
|--------------|
| Real Supabase / API persistence |
| Real OAuth account linking |
| Password auth |
| Raw payment card capture |
| Permanent account / data deletion |
| Offline screen (other SCREEN-019 in mapping) |

---

**End of SCREEN-019 / SCREEN-019_SETTINGS.md**
