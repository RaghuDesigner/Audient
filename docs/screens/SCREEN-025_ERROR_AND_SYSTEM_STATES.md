# SCREEN-025 — Error & System States

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Legal · QA  

**Screen ID:** SCREEN-025 (product brief)  
**Canonical mapping:** System / error surfaces (SCREEN-M09 404 · SCREEN-M10 500/boundary · SCREEN-M11 Offline/network · SCREEN-M16 Session Expired · SCREEN-M17 Maintenance · audit service unavailable aligns with `AI_UNAVAILABLE` taxonomy)  
**Screen name:** Error & System States  
**Route (recommended):** Dedicated routes and/or global handlers — e.g. Next.js `not-found` (404) · `error.tsx` boundary (500) · `/system/{type}` demo routes for QA · inline panels on failed flows  
**Figma:** Error & system state frames — **exact match**  
**Priority:** P1 (P2 resilience in `MISSING_SCREENS_PLAN.md`)  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_EMPTY_STATE.md` / calm centered layout patterns.  
> **Phase:** **Mocked error states only** — QA via route or query param; **no backend changes**, **no real error reporting API** this phase.  
> **Security:** **Never expose** stack traces, API keys, tokens, internal server details, or raw database errors in UI.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/ERROR_HANDLING.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/components/COMPONENT_EMPTY_STATE.md` · `docs/screens/SCREEN-003_AUDIT_FAILED.md` · `STATE_MANAGEMENT.md`

---

## 1. Purpose

Provides **consistent, user-friendly handling** of application errors and system states.

Users see calm, actionable messaging with clear recovery paths. Engineering receives opaque correlation identifiers in UI (when appropriate) without leaking sensitive technical detail.

The UI must **match the approved Figma exactly**.

---

## 2. Error Types

| Type | Internal key (recommended) | Surface |
|------|----------------------------|---------|
| **404 Not Found** | `not_found` | Global not-found page |
| **403 Unauthorized** | `forbidden` | Full page or inline gate |
| **500 Server Error** | `server_error` | Error boundary / full page |
| **Network Error** | `network_error` | Banner or full page |
| **Session Expired** | `session_expired` | Modal or full page |
| **Audit Service Unavailable** | `audit_service_unavailable` | Audit flow failure (related: SCREEN-003 / `AI_UNAVAILABLE`) |
| **Maintenance** | `maintenance` | Full-page system state |
| **Generic Error** | `generic_error` | Safe fallback when type unknown |

Fixed set this phase — map copy from §3; store in `src/config/error-system-states.ts`.

---

## 3. Copy & Actions (authoritative)

Exact strings below unless Figma overrides.

### 404 Not Found

| Element | Copy |
|---------|------|
| **Heading** | Page not found |
| **Description** | The page you're looking for doesn't exist or may have moved. |
| **Primary** | Go to Dashboard |
| **Secondary** | Go Back |

### 403 Unauthorized

| Element | Copy |
|---------|------|
| **Heading** | Access denied |
| **Description** | You don't have permission to access this page. |
| **Primary** | Go to Dashboard |
| **Secondary** | Back |

### 500 Server Error

| Element | Copy |
|---------|------|
| **Heading** | Something went wrong |
| **Description** | We couldn't complete your request. |
| **Primary** | Try Again |
| **Secondary** | Go to Dashboard |

### Network Error

| Element | Copy |
|---------|------|
| **Heading** | Connection problem |
| **Description** | Check your internet connection and try again. |
| **Primary** | Retry |

### Session Expired

| Element | Copy |
|---------|------|
| **Heading** | Your session has expired |
| **Description** | Please log in again to continue. |
| **Primary** | Login |

### Audit Service Unavailable

| Element | Copy |
|---------|------|
| **Heading** | Audit service temporarily unavailable |
| **Description** | Audient couldn't complete the audit service request. |
| **Primary** | Try Again |
| **Secondary** | Back to Dashboard |

### Maintenance

| Element | Copy |
|---------|------|
| **Heading** | Audient is temporarily unavailable |
| **Description** | We're performing maintenance. Please try again later. |

No required actions this phase unless Figma adds a status link.

### Generic Error

| Element | Copy |
|---------|------|
| **Heading** | Something went wrong |
| **Description** | We couldn't complete your request. Please try again or return to the dashboard. |
| **Primary** | Try Again (when retry applies) |
| **Secondary** | Go to Dashboard |

Safe fallback — no internal details.

---

## 4. Layout

```text
Application Header (Guest or Authenticated — context-dependent)
        ↓
Centered content band (max-width readable)
        ↓
Status illustration / icon (decorative — not color-only)
        ↓
Heading (H1)
        ↓
Description
        ↓
Optional Error ID (opaque — §6)
        ↓
Primary action
        ↓
Secondary / tertiary actions
        ↓
Footer (marketing/legal shell when applicable)
```

| Rule | Spec |
|------|------|
| Shell | Reuse Home / Dashboard chrome where Figma shows app header; standalone minimal shell OK for global 404/500 |
| Compose | Prefer reusable **Error State** / **EmptyState**-style panel — do not fork one-off layouts per type |
| Focus | Move focus to heading on full-page error mount |
| Empty vs error | Empty lists use **EmptyState** — this screen is for **errors / system states** only |

---

## 5. Error Actions (global hierarchy)

| Priority | Actions | Typical use |
|----------|---------|-------------|
| **Primary** | Retry · Try Again · Login | Recover or re-authenticate |
| **Secondary** | Go to Dashboard · Back to Dashboard | Safe home |
| **Tertiary** | Go Back · Back | Browser history / previous route |

Button variants follow design system (primary filled · secondary outline). Min **44px** touch targets on mobile.

| Action | Behaviour |
|--------|-----------|
| **Go to Dashboard** | Navigate `/dashboard` (authenticated) or `/` (guest — Figma wins) |
| **Go Back / Back** | `router.back()` when history exists; else Dashboard |
| **Try Again / Retry** | Re-run failed operation or reload route — parent provides handler |
| **Login** | Open Login Modal or navigate sign-in with `next` return path |

---

## 6. Error Logging (UI-safe identifier)

When appropriate (500, generic, audit service), show an **opaque correlation id**:

```text
Error ID: AUD-ERR-XXXX
```

| Rule | Spec |
|------|------|
| Format | `AUD-ERR-` + short alphanumeric (e.g. 4–8 chars) — mock generator in dev |
| Purpose | Support reference only — user may cite in Help & Support |
| Never show | Stack traces · API keys · tokens · SQL · endpoint paths · raw JSON errors |
| Screen readers | Announce Error ID as supplementary text after description |

Backend may log full detail server-side — UI remains sanitized (`ERROR_HANDLING.md` · `SECURITY.md`).

---

## 7. Behaviour

| Rule | Spec |
|------|------|
| Guest | 404/500/maintenance reachable without login; Session Expired applies after auth attempt |
| Auth | 403 may appear when RBAC/tier blocks route — mock only this phase |
| Network | May use sticky banner (M11) **or** full page — Figma wins; same copy |
| Session | Preserve `next` URL for post-login return |
| Audit unavailable | Distinct from SCREEN-003 full failure taxonomy — may reuse failure panel with this copy for service-down mock |
| Retry | Idempotent retry UX — show busy on primary while retrying (mock delay OK) |
| Maintenance | Non-dismissible full page when flag enabled (mock env/query) |

No real API error ingestion this phase — types selected via route/query for QA.

---

## 8. Screen States

| State | Spec |
|-------|------|
| **Default** | Heading + description + actions for selected error type |
| **Loading / Retry busy** | Primary action disabled + busy indicator |
| **With Error ID** | Optional line below description |
| **Offline banner** | Compact variant — heading may shorten to “You're offline” if banner (align M11) |

QA query param (recommended): `?state=not_found|forbidden|server_error|network_error|session_expired|audit_service_unavailable|maintenance|generic_error` on `/system/error` demo route.

---

## 9. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Announcement | Full-page errors: `role="alert"` or focus move to **`h1`** so screen readers announce heading + description |
| Heading | Single **`h1`** per full-page state |
| Actions | Keyboard accessible; visible focus rings |
| Icon | Decorative — meaning in heading/text |
| Color | Error cue not color-only — icon + text |
| Session modal | Focus trap if modal presentation; Esc does not bypass Login when session dead |

---

## 10. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Centered column; actions inline or stacked with gap |
| **Tablet** | Same |
| **Mobile** | Full-width actions; stacked primary → secondary → tertiary |

---

## 11. Analytics

| Event | Trigger |
|-------|---------|
| **404 Viewed** | 404 page shown |
| **403 Viewed** | 403 page shown |
| **500 Viewed** | 500 / boundary page shown |
| **Network Error** | Network error surface shown |
| **Session Expired** | Session expired surface shown |
| **Audit Service Error** | Audit service unavailable shown |
| **Retry Clicked** | Try Again / Retry activated |
| **Dashboard Clicked** | Go to Dashboard / Back to Dashboard activated |

| Payload (recommended) | Spec |
|---------------------|------|
| | `errorType`, `errorId` (opaque), `surface` (page \| banner \| inline) — no PII |

Dev stub `console.info` in development. Consent-gated per `ANALYTICS.md` when CMP ships.

---

## 12. Relationship to Other Screens

| Screen | Spec |
|--------|------|
| **SCREEN-003 Audit Failed** | Domain-specific audit failures — may compose same error panel with taxonomy copy |
| **SCREEN-002 Processing** | Session expired during poll → Session Expired |
| **EmptyState (COMPONENT-020)** | No data — not an error |
| **Legal & Privacy** | Unrelated — separate trust screens |
| **Help & Support** | User may contact support citing Error ID (future link optional) |

---

## 13. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Config | `src/config/error-system-states.ts` — keys, copy, action labels, routes |
| Component | Reusable `ErrorStatePanel` / `SystemStateScreen` in `src/components/system/` (future COMPONENT spec) |
| Utils | `src/utils/error-system-states.ts` — mock `AUD-ERR-XXXX` generator, action handlers |
| Analytics | `src/lib/analytics/error-system-events.ts` |
| Routes | `not-found.tsx` · `error.tsx` · optional `/system/error` QA page |
| Reuse | `EmptyState` layout tokens · `Button` · `Card` — DRY |
| No | Backend changes · Sentry wiring · real correlation API |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ All eight error types render correct heading + description  
□ Actions match spec per type  
□ Generic error never exposes stack/API/DB details  
□ Error ID shown only where appropriate — opaque format  
□ Retry / Dashboard / Back behaviours work (mock)  
□ Session Expired → Login with return path  
□ WCAG 2.2 AA — alert/focus, keyboard actions  
□ Desktop / tablet / mobile  
□ Analytics events fire (dev stub)  
□ Mock states only — no backend  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Real error monitoring (Sentry/Datadog) integration |
| Backend error schema changes |
| Rate-limit UI (429) — defer unless added to taxonomy |
| Custom per-route 403 messages for every resource |
| Exposing HTTP status codes to users |
| Auto-retry with exponential backoff (beyond simple Retry click) |

---

**End of SCREEN-025_ERROR_AND_SYSTEM_STATES.md**
