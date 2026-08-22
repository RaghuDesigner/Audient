# COMPONENT-002 — Login Modal

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-01  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Auth · QA  

**Component ID:** COMPONENT-002  
**Component name:** Login Modal (`LoginModal`)  
**Screen / modal IDs:** SCREEN-003 · MDL-001  
**Figma:** `Screens/Screen3.png` (approved Login Modal frame)  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Extended engineering notes:** `docs/LOGIN_MODAL.md` (flows, auth errors, resume intent).  
**If this COMPONENT-002 brief and older docs conflict on UI copy, structure, or success navigation, this brief + Figma win** unless a business rule explicitly overrides (e.g. `PRICING.md` / `BUSINESS_RULES.md`).

**Related:** `docs/components/PROFILE_DROPDOWN_GUEST.md` · `docs/HOME_SCREEN.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_BEHAVIOR.md` · `docs/DESIGN_TOKENS.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/AUTH_API.md`

---

## Purpose

The Login Modal provides **secure authentication** for Guest Users attempting to access protected features within Audient.

The Login Modal is a **reusable component** and can be opened from multiple locations throughout the application.

It must **exactly match the approved Figma design**.

**The Figma is the single source of truth.**

**Do not redesign.**

---

## Source of Truth

| Rule | Spec |
|------|------|
| Source | **Approved Figma** (`Screen3`) |
| Visual match | Pixel-perfect implementation required |
| No creative interpretation | — |
| No spacing / typography / color changes | Use design tokens that match Figma |
| Auth methods | Exactly the three OAuth providers below — nothing else |

---

## Trigger Locations

The Login Modal can be opened from:

| Trigger | Notes |
|---------|--------|
| Guest Profile Dropdown | **Login** menu item (COMPONENT-001) |
| Login button | Any explicit Login CTA that opens this modal |
| Start Audit | When authentication is required (e.g. guest URL, guest quota exhausted path that requires auth) |
| Export PDF | Protected |
| History | Protected |
| Notifications | Protected |
| Manage Plan | Protected / guest subscribe gate |
| Account Settings | Protected |
| Any protected feature | Route guards, 401, session expired, etc. |

Every opener should pass a **source** (analytics) and optional **resume intent**. Do **not** open the modal for the first allowed guest screenshot audit when that path is permitted without auth.

---

## Modal Behaviour

| Behaviour | Spec |
|-----------|------|
| Presentation | Centered modal overlay |
| Overlay | Semi-transparent dim over the page |
| Background interaction | **Disabled** — page behind is inert |
| Focus | **Trap** keyboard focus inside the modal |
| Scroll | **Prevent page scrolling** while open |
| Position / size | Per Figma (desktop / tablet / mobile) |

---

## Authentication Providers

Display **exactly three** authentication buttons, in Figma order:

1. **Continue with Google**  
2. **Continue with Apple**  
3. **Continue with Microsoft**

| Forbidden | Spec |
|-----------|------|
| Email login | No |
| Password login | No |
| Signup UI | No (account created on first successful OAuth) |
| Forgot Password | No |
| Guest Login button | No |
| Other providers (e.g. GitHub) | No |

**Authentication is handled exclusively using OAuth.**

If Figma label text differs from “Continue with …”, **match Figma on-canvas copy** and update this doc.

---

## Button Behaviour

Each provider button must support these states and **follow Design Tokens**:

| State | Spec |
|-------|------|
| Default | Idle, clickable |
| Hover | Per tokens / Figma |
| Focus | Visible focus ring |
| Loading | Selected provider busy (`aria-busy`); siblings disabled |
| Disabled | When another provider is loading, offline, or rate-limited |
| Success | Session established → modal closes (no separate success screen required inside modal) |
| Error | Return to retryable idle; inline error in modal |

Only **one** provider may load at a time.

---

## Modal Actions

| Action | Spec |
|--------|------|
| Close Button | Closes modal (when not blocked during in-flight OAuth — prefer blocking dismiss while loading) |
| Click outside | Closes modal |
| Escape key | Closes modal |
| Successful authentication | Closes modal **automatically** |

On dismiss (close / outside / Esc): return focus to the control that opened the modal.

---

## Success Behaviour

After successful login:

| Step | Spec |
|------|------|
| 1 | Close Login Modal |
| 2 | Refresh authentication state |
| 3 | Update Credits |
| 4 | Replace Guest Profile Menu with **User Profile Menu** |
| 5 | **Remain on current page** |
| 6 | Do **not** redirect unless explicitly required by the opener’s resume intent |

Resume intent (e.g. continue gated audit, open Manage Plan) may navigate or re-open a dialog **only when that was the reason the modal opened**. Default: stay put.

---

## Error Behaviour

| Case | Spec |
|------|------|
| Authentication fails | Display **inline error message** |
| Retry | Allowed — user can click a provider again |
| Modal | **Do not close** on error |
| Provider cancel / deny | Treat as soft failure; modal stays open |

---

## Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | All controls operable |
| Focus trap | Yes while open |
| ARIA Dialog | `role="dialog"`, `aria-modal="true"`, labelled by title |
| ARIA Labels | Close control and each provider button fully named |
| Visible focus | Required |
| Screen reader | Announce open; errors via `role="alert"` / assertive live region |
| Focus restore | Return to opener on close |
| Brand icons | Decorative (`aria-hidden`); name comes from button text |

---

## Analytics

| Event | Trigger |
|-------|---------|
| Login Modal Opened | Modal becomes visible |
| Provider Selected | User activates Google / Apple / Microsoft |
| Authentication Success | Session established |
| Authentication Failed | OAuth or session failure |
| Modal Closed | Dismiss without success (close / outside / Esc) — and/or any close; distinguish success vs dismiss in properties if needed |

Align property names with `ANALYTICS.md` (`login_modal_opened`, `oauth_started`, `oauth_succeeded`, `login_modal_dismissed`, etc.).

---

## Components

| Piece | Role |
|-------|------|
| **Modal** | Dialog surface (title, content, actions) |
| **Modal Overlay** | Dimmed backdrop; blocks page |
| **Provider Button** | Google / Apple / Microsoft OAuth CTAs |
| **Close Button** | Explicit dismiss control |
| **Divider** | Only if shown in Figma |
| **Footer** | Only if shown in Figma (e.g. terms line) — do not invent |

---

## Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Match Figma exactly |
| Tablet | Match Figma exactly |
| Mobile | Match Figma exactly |

Maintain the same providers, hierarchy, and behaviour — no alternate auth IA on small screens.

---

## Development Rules

| Rule | |
|------|--|
| Do not redesign | |
| Do not add additional authentication methods | |
| Do not implement Email/Password authentication | |
| Do not add Signup | |
| Do not add Forgot Password | |
| Do not add a Guest Login button | |
| Implement pixel-perfect from Figma | |

---

## QA Checklist (COMPONENT-002)

□ Visual match to Figma (overlay, centering, type, spacing, buttons)  
□ Exactly three providers: Continue with Google / Apple / Microsoft (or exact Figma labels)  
□ No email, password, signup, forgot password, guest login  
□ Opens from Guest Profile Login and other protected triggers  
□ Overlay dims; page inert; scroll locked; focus trapped  
□ Close via X, outside click, Escape  
□ Success: auto-close, auth refresh, credits update, guest menu → user menu, stay on page unless resume intent  
□ Error: inline message, retry, modal stays open  
□ Button states: hover, focus, loading, disabled, success path, error  
□ Analytics: opened, provider selected, success, failed, closed  
□ WCAG 2.2 AA  

---

## Developer Notes

1. Reuse one modal instance globally; open via shared auth UI state with `source` + resume intent.  
2. OAuth via Supabase: `google`, `apple`, `azure` (Microsoft).  
3. First login seeds Free membership + credits per `PRICING.md` / BUSINESS_RULES — not visible as a Signup form.  
4. COMPONENT-001 Login item only opens this modal; it must not navigate to a `/sign-in` page for the happy path.  
5. Detailed error codes and loading mutual-exclusion: see `docs/LOGIN_MODAL.md`.

---

**End of COMPONENT-002 / components/LOGIN_MODAL.md**
