# COMPONENT — Error State

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA · Legal  

**Component ID:** COMPONENT-072 (Error State)  
**Component name:** Error State (`ErrorStatePanel`)  
**Primary screen:** Error & System States (`docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md`)  
**Also reusable on:** Global `not-found` / `error.tsx` boundaries · inline section failures (History, Notifications, Settings, Billing, Audit flows) · Audit Failed surfaces (`docs/screens/SCREEN-003_AUDIT_FAILED.md`)  
**Related:** Empty State (`COMPONENT_EMPTY_STATE.md`) — no data, not an error · Locked Card (`COMPONENT_LOCKED_CARD.md`) — tier gate, not a failure · Button primitive · `docs/ERROR_HANDLING.md` · `docs/ACCESSIBILITY.md`  
**Figma:** Error & system state frames — **exact match** per variant  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + calm centered layout patterns shared with Empty State.  
> **Phase:** **Mock error presentation only** — copy and actions from config; **no backend error ingestion**, **no real monitoring API** this phase.  
> **Security rule:** **Never expose** stack traces, API keys, tokens, internal server details, raw database errors, endpoint paths, or HTTP status codes in UI.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md` · `src/config/error-system-states.ts`

---

## 1. Purpose

Provides a **reusable, generic error presentation** for failures and system states across Audient.

Users see calm, actionable messaging with clear recovery paths. Engineering may surface an **opaque correlation id** when appropriate — without leaking sensitive technical detail.

**Do not redesign.** Match Figma for each variant’s illustration, copy, and action hierarchy.

**Empty ≠ Error.** Use **Empty State** when a list or section has no data. Use **Error State** when a fetch, route, permission check, or system condition fails.

---

## 2. Display

Centered panel (section or full-page band). Compose with design-system **Button** primitives — do not fork one-off error layouts per screen.

| Element | Spec |
|---------|------|
| **Illustration** | Variant-specific icon or artwork — decorative; meaning must not rely on color alone |
| **Error Title** | Short heading (H1 on full-page; appropriate level when inline in a section) |
| **Description** | One–two lines explaining what happened in plain language |
| **Error ID** | Optional opaque correlation id — e.g. `AUD-ERR-XXXX` — shown only for server/generic/audit-service variants (see §6) |
| **Primary Action** | Main recovery — Retry · Try Again · Login · Go to Dashboard (variant-dependent) |
| **Secondary Action** | Alternate safe exit — Go Back · Back to Dashboard · Go to Dashboard (variant-dependent) |

Omit Secondary Action when Figma / variant config shows primary only.

| Layout | Spec |
|--------|------|
| **Desktop** | Centered column; actions inline or stacked with consistent gap |
| **Tablet** | Same |
| **Mobile** | Full-width stacked actions; min **44px** touch targets |

### Variant copy (authoritative — align with SCREEN-025)

| Variant | Internal key | Error Title | Description (summary) | Primary | Secondary |
|---------|--------------|-------------|------------------------|---------|-----------|
| **404** | `not_found` | Page not found | Page doesn't exist or may have moved | Go to Dashboard | Go Back |
| **403** | `forbidden` | Access denied | No permission to access this page | Go to Dashboard | Back |
| **500** | `server_error` | Something went wrong | Couldn't complete your request | Try Again | Go to Dashboard |
| **Network** | `network_error` | Connection problem | Check internet and try again | Retry | — |
| **Generic** | `generic_error` | Something went wrong | Try again or return to dashboard | Try Again | Go to Dashboard |

Extended system variants (same component, config-driven — SCREEN-025): `session_expired` · `audit_service_unavailable` · `maintenance`. Use the same layout; copy and actions come from `ERROR_SYSTEM_STATE_DEFINITIONS`.

Store all strings in `src/config/error-system-states.ts` — not hardcoded in screens.

---

## 3. Behaviour

| Action | Spec |
|--------|------|
| **Try Again / Retry** | Parent provides handler — re-fetch, re-run operation, or `router.refresh()` / boundary `reset()` |
| **Go to Dashboard** | Authenticated → `/dashboard`; guest → `/` (Figma wins if different) |
| **Go Back / Back** | Browser history when available; else Dashboard/home fallback |
| **Login** | Open Login Modal with `source: session_expired` and preserved `next` return path |

| Rule | Spec |
|------|------|
| Retry busy | Primary disabled + busy label while retry in flight (mock delay OK) |
| Maintenance | Non-dismissible when maintenance variant — no required actions unless Figma adds status link |
| Inline vs page | Same component — `size: section` inside Card/widget; `size: page` in `main` with optional app chrome |
| Parent owns logic | Component renders copy + actions; navigation and retry handlers live in parent or screen shell |
| Not loading | Do not show Error State while skeleton/loading is active — parent transitions loading → error |

No real API error parsing this phase — variant selected by route, query param, or parent state.

---

## 4. States

| State | Spec |
|-------|------|
| **404** | `not_found` — global not-found and missing routes |
| **403** | `forbidden` — RBAC / tier gate (mock this phase) |
| **500** | `server_error` — route error boundary and unhandled failures |
| **Network** | `network_error` — offline / fetch failure; may also use compact banner variant (Figma wins) |
| **Generic** | `generic_error` — safe fallback when type unknown |
| **Retry busy** | Primary action disabled; busy indicator on primary |
| **With Error ID** | Optional line below description when variant requires correlation id |
| **Without Error ID** | 404, 403, network, session — no opaque id line |

QA demo: `/system/error?state={key}` on SCREEN-025 QA route.

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `variant` / `stateType` | `not_found` \| `forbidden` \| `server_error` \| `network_error` \| `generic_error` \| extended SCREEN-025 keys | Yes | Which error variant |
| `errorId` | string \| null | No | Opaque id — auto-generated mock when omitted and variant shows id |
| `retrying` | boolean | No | Busy state on primary |
| `onPrimary` | `(action) => void` | When actions shown | Primary / retry / login handler |
| `onSecondary` | `(action) => void` | When secondary shown | Back / dashboard handler |
| `size` | `page` \| `section` | No | Full-page band vs inline card padding |
| `className` | string | No | Layout wrapper override |

Parent screen shell (`SystemStateScreen`) may add Header/Footer, analytics, and action routing — Error State remains presentation-only.

---

## 6. Security (Error ID)

When appropriate (**500**, **generic**, **audit service unavailable**), show:

```text
Error ID: AUD-ERR-XXXX
```

| Rule | Spec |
|------|------|
| Format | `AUD-ERR-` + short alphanumeric (4–8 chars) — mock generator in dev |
| Purpose | Support reference — user may cite in Help & Support |
| Never show | Stack traces · API keys · tokens · SQL · endpoint paths · raw JSON · internal exception messages |
| Screen readers | Announce Error ID as supplementary text after description |

Backend may log full detail server-side — UI remains sanitized per `ERROR_HANDLING.md` and `SECURITY.md`.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Announcement | Full-page: `role="alert"` or focus move to **Error Title** (`h1`) so screen readers announce title + description |
| Heading | Single **`h1`** per full-page error; inline section uses appropriate heading level in page outline |
| Illustration | Decorative — `aria-hidden` if title + description convey meaning |
| Actions | Real **buttons** with discernible names; keyboard operable; visible focus rings |
| Color | Error cue not color-only — icon + text |
| Error ID | Readable by screen readers; not the only carrier of meaning |
| Session / Login | If Login opens modal, focus trap per Login Modal spec |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **404 Viewed** | 404 variant shown | `errorType`, `surface` |
| **403 Viewed** | 403 variant shown | `errorType`, `surface` |
| **500 Viewed** | 500 variant shown | `errorType`, `errorId`, `surface` |
| **Network Error** | Network variant shown | `errorType`, `surface` |
| **Retry Clicked** | Try Again / Retry activated | `errorType`, `errorId` |
| **Dashboard Clicked** | Go to Dashboard / Back to Dashboard | `errorType`, `errorId` |

`surface`: `page` \| `banner` \| `inline`. No PII. Dev stub `console.info` in development. Consent-gated per `ANALYTICS.md` when CMP ships.

Implement in `src/lib/analytics/error-system-events.ts`.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Centered column; primary + secondary actions with gap |
| **Tablet** | Same |
| **Mobile** | Full-width stacked actions — primary → secondary |

---

## 10. Relationship to Other Components

| Component / Screen | Spec |
|--------------------|------|
| **Empty State (COMPONENT-020)** | No data — not an error |
| **Locked Card (COMPONENT-011)** | Tier upsell — not a system failure |
| **SystemStateScreen** | Full-page shell — Header, Footer, action routing; composes Error State |
| **SCREEN-003 Audit Failed** | Domain-specific copy — may compose Error State panel or share layout tokens |
| **Help & Support** | User may contact support citing Error ID (future optional link) |

---

## 11. Reuse

| Context | Spec |
|---------|------|
| Global 404 | `not_found` — `not-found.tsx` |
| Error boundary | `server_error` — `error.tsx` |
| Section fetch failure | `generic_error` or `network_error` inside widget Card |
| Permission gate | `forbidden` — full page or inline |
| Audit service down | `audit_service_unavailable` — audit flow |
| Session timeout | `session_expired` — Login primary action |

**Reusable across Audient** — do not invent per-screen error layouts.

---

## 12. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Config | `src/config/error-system-states.ts` — keys, copy, action labels, routes |
| Utils | `src/utils/error-system-states.ts` — mock `AUD-ERR-XXXX` generator, state parse, action list helpers |
| Component | `src/components/system/ErrorStatePanel.tsx` |
| Screen shell | `src/components/system/SystemStateScreen.tsx` — chrome + handlers |
| Analytics | `src/lib/analytics/error-system-events.ts` |
| Routes | `not-found.tsx` · `error.tsx` · `/system/error` QA page |
| Reuse | Empty State layout tokens · Button · Card wrapper when inline |
| Guard | Show only when parent is **not loading** and operation **failed** |
| No | Backend changes · Sentry wiring · real correlation API · exposing HTTP codes to users |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Illustration, Error Title, Description, Primary Action; Secondary when specified  
□ Variants: 404, 403, 500, Network, Generic render correct copy  
□ Extended SCREEN-025 variants use same component without layout fork  
□ Error ID shown only where appropriate — opaque `AUD-ERR-` format  
□ Generic / 500 never expose stack, API, or DB details  
□ Retry busy disables primary; Try Again / Dashboard / Back behaviours work (mock)  
□ WCAG 2.2 AA — alert/focus, keyboard actions, decorative icon  
□ Desktop / tablet / mobile  
□ Analytics events fire (dev stub)  
□ Distinct from Empty State and Locked Card  
□ Reused without per-screen layout forks  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Real error monitoring (Sentry/Datadog) integration |
| Backend error schema changes |
| Inline form field validation errors (use Input/Form error patterns) |
| Rate-limit UI (429) — defer unless added to taxonomy |
| Custom per-resource 403 messages for every route |
| Exposing HTTP status codes to users |
| Auto-retry with exponential backoff beyond simple Retry click |

---

**End of COMPONENT-072 / COMPONENT_ERROR_STATE.md**
