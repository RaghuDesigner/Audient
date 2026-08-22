# COMPONENT — Security Settings Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-047 (Security Settings Card)  
**Component name:** Security Settings Card (`SecuritySettingsCard`)  
**Primary screen:** Settings — Security (`docs/screens/SCREEN-019_SETTINGS.md`)  
**Related:** Profile / Preferences / Notification Settings Cards — different domains · Connected Accounts — IdP link status (separate card) · Danger Zone — account deletion (separate) · Delete Confirmation Modal / Confirm Dialog — pattern for Sign Out All Devices  
**Figma:** Security block on Settings — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + card / Confirm Dialog patterns in `COMPONENT_MAPPING.md`.  
> **Auth:** Use the **existing mock authentication architecture** (`AuthProvider` / `useAuth` / mock session). Do **not** create a second authentication system.  
> **Phase:** Sign-out flows are **mocked** (or existing mock `signOut`). No Supabase schema / Auth API changes for this card.  
> **Secrets:** Never display passwords, access tokens, API keys, or authentication secrets.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/TECHNICAL_ARCHITECTURE.md` · `docs/SECURITY.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-019_SETTINGS.md` · `docs/components/COMPONENT_DELETE_CONFIRMATION_MODAL.md` · `docs/components/COMPONENT_PROFILE_SETTINGS_CARD.md`

---

## 1. Purpose

Provides users with **security and session-management options**.

Reusable on Settings Security section. Does **not** replace Connected Accounts or Danger Zone.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Authentication Provider** | Current SSO provider label (e.g. Google / Apple / Microsoft) — read-only |
| **Current Session** | Mock session summary (e.g. device / browser label) — read-only |
| **Last Active** | Mock relative or absolute “last active” label — read-only |

| Optional (if Figma) | Spec |
|---------------------|------|
| Location | Approximate mock location string — never IP raw dump unless product requires |

| Rule | Spec |
|------|------|
| Labels | Visible labels on every readout |
| Empty | Sensible placeholders if mock session fields missing — never invent secrets |

---

## 3. Actions

| Action | Spec |
|--------|------|
| **Sign Out** | Sign the **current** user out via existing mock auth flow |
| **Sign Out All Devices** | Show **confirmation** first, then mocked multi-session clear |

No password change · no MFA enrollment UI in this card unless Figma adds later (SSO-first product).

---

## 4. Sign Out

| Step | Spec |
|------|------|
| 1 | User activates **Sign Out** |
| 2 | Fire **Sign Out Clicked** |
| 3 | Call existing auth `signOut` (mock session clear / redirect per `AuthProvider`) |
| 4 | User lands on Login / Guest home per existing routes |

| Rule | Spec |
|------|------|
| Auth | **Existing** mock authentication only — no parallel logout API |
| Confirm | Not required for single Sign Out unless Figma adds it |
| Secrets | Do not log or display tokens during logout |

---

## 5. Sign Out All Devices

| Step | Spec |
|------|------|
| 1 | User activates **Sign Out All Devices** |
| 2 | Fire **Sign Out All Devices Clicked** |
| 3 | Enter **Confirmation** — accessible dialog (reuse Confirm Dialog / AlertDialog pattern) |
| 4 | Cancel / Escape / dismiss → return to **Default**; no session change |
| 5 | Confirm → **Processing** → mocked clear-all-sessions behaviour |
| 6 | **Success** feedback then end sessions / redirect per product (typically same as Sign Out for mock) |
| 7 | Failure → **Error** with Retry or dismiss |

| Mock behaviour | Spec |
|----------------|------|
| Frontend only | Set mock “all devices signed out” flag / clear mock session store — **no** real device revocation API |
| No Supabase | Do not change Supabase Auth sessions or project settings |

| Confirmation copy (defaults — Figma wins) | Spec |
|-------------------------------------------|------|
| Title | Sign out all devices? |
| Body | This ends sessions on every device using your account. You will need to sign in again. |
| Confirm | Sign out all devices (destructive / primary per Figma) |
| Cancel | Cancel |

Default focus: **Cancel** (safest) unless Figma specifies otherwise.

---

## 6. States

| State | Spec |
|-------|------|
| **Default** | Provider + session + last active visible; actions enabled |
| **Confirmation** | Sign Out All Devices dialog open; focus trapped |
| **Processing** | Sign-out or sign-out-all in progress; actions disabled; busy indicator |
| **Success** | Brief success feedback (toast / status) then redirect or Default as appropriate |
| **Error** | Sign-out failure message + Retry (or stay signed in) |

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `authProvider` | enum label / key | Yes | Display provider |
| `currentSession` | string | Yes | Device / session label |
| `lastActive` | string | Yes | Last active label |
| `locationLabel` | string | No | Optional mock location |
| `state` | `default` \| `confirmation` \| `processing` \| `success` \| `error` | Recommended | |
| `onSignOut` | action | Yes | Invokes existing mock `signOut` |
| `onSignOutAllDevices` | action | Yes | Mock clear-all after confirm |
| `onRetry` | action | Error | |
| `className` | string | No | |

---

## 8. Security Rules

**Never display:**

| Forbidden |
|-----------|
| Passwords |
| Access tokens |
| Refresh tokens |
| API keys |
| Authentication secrets |
| Raw session JWT / cookie values |

| Rule | Spec |
|------|------|
| Auth system | Reuse existing architecture only |
| Supabase | **No** Supabase changes for this component |
| Analytics | No tokens or emails in event payloads |

---

## 9. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | All actions and dialog controls operable |
| Confirmation | Accessible dialog: `role="dialog"`, `aria-modal="true"`, labelled by title, described by body; focus trap; Escape closes; return focus to trigger |
| Processing | `aria-busy` on card / dialog; announce status |
| Color | Do not rely only on color for success / error |

---

## 10. Analytics

| Event | Trigger |
|-------|---------|
| **Security Settings Viewed** | Card / Security section viewed |
| **Sign Out Clicked** | User activates Sign Out |
| **Sign Out All Devices Clicked** | User activates Sign Out All Devices (before or when opening confirm — fire once on CTA) |

No PII or secrets in payloads.

---

## 11. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Readouts stacked or two-column per Figma; actions in a row |
| **Tablet** | Same |
| **Mobile** | Stack readouts; full-width action buttons; min 44px targets |

---

## 12. Relationship to Siblings

| Surface | Spec |
|---------|------|
| **Connected Accounts** | Link/unlink IdPs — not this card |
| **Danger Zone** | Delete account — separate confirmation flow |
| **AuthProvider / useAuth** | Sole session source for Sign Out |

---

## 13. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Session | Mock device / last active from settings mock bundle |
| Sign Out | Existing mock auth flow only |
| Sign Out All | Mocked behaviour + confirmation UI |
| No | Second auth system · Supabase Auth changes · real multi-device revocation |
| Tokens | Design tokens only — no hardcoded colors |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ Authentication Provider, Current Session, Last Active displayed  
□ Sign Out uses existing mock auth  
□ Sign Out All Devices requires accessible confirmation  
□ States: Default, Confirmation, Processing, Success, Error  
□ Never shows passwords / tokens / API keys / secrets  
□ Analytics: Viewed · Sign Out Clicked · Sign Out All Devices Clicked  
□ WCAG 2.2 AA — dialog keyboard / focus  
□ No Supabase changes · no second auth system  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Password reset / change UI |
| Real multi-device session list from IdP |
| Connected Accounts connect/disconnect |
| Delete Account (Danger Zone) |

---

**End of COMPONENT_SECURITY_SETTINGS_CARD.md**
