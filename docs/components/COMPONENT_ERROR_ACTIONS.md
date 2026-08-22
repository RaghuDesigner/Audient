# COMPONENT — Error Actions

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-074 (Error Actions)  
**Component name:** Error Actions (`ErrorActions`)  
**Primary consumer:** Error State (`docs/components/COMPONENT_ERROR_STATE.md` — COMPONENT-072)  
**Also reusable on:** System State screens (`docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md`) · inline section failures · Audit Failed surfaces (`docs/screens/SCREEN-003_AUDIT_FAILED.md`) · offline / network banners when Figma shows inline actions  
**Related:** Error State (COMPONENT-072) — composes actions below description · Error Illustration (COMPONENT-073) — visual only, no actions · Button primitive (`src/components/ui/button.tsx`) · Empty State CTAs (`COMPONENT_EMPTY_STATE.md`) — separate non-error actions · `docs/ERROR_HANDLING.md`  
**Figma:** Error & system state action rows — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + existing **Button** variants.  
> **Phase:** **Mock action handlers only** — parent or screen shell owns navigation, retry, and login logic; **no backend** this phase.  
> **Interaction rule:** Actions recover or exit safely — never expose technical failure details in labels or handlers.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md` · `src/config/error-system-states.ts` · `src/config/error-state.ts`

---

## 1. Purpose

Provides **consistent actions for error states** — a standardized primary/secondary action row that matches SCREEN-025 hierarchy and design-system button variants.

**Error State** owns copy and layout; **Error Actions** owns the action buttons, their labels, visual states, and accessibility for the action cluster.

**Do not redesign.** Match Figma button order, variants, and spacing.

---

## 2. Actions

Four canonical action keys. Labels may vary per error type (see §3).

| Action | Internal key | Typical label(s) | Role |
|--------|--------------|------------------|------|
| **Retry** | `retry` | Retry · Try Again | Re-run failed operation or refresh route |
| **Go Back** | `go_back` | Go Back · Back | Return via browser history or safe fallback |
| **Go to Dashboard** | `go_to_dashboard` | Go to Dashboard · Back to Dashboard | Navigate to safe home (`/dashboard` auth · `/` guest) |
| **Login** | `login` | Login | Open Login Modal or sign-in with preserved return path |

| Priority | Spec |
|----------|------|
| **Primary** | First action in row — filled **primary** Button variant |
| **Secondary** | Second action — **outline** Button variant |
| **Tertiary** | Optional third action (defer unless Figma shows) — ghost or outline per design system |

Omit actions not configured for the current error type (e.g. Network error — primary only).

Store action keys and default labels in `src/config/error-system-states.ts` · `src/config/error-state.ts` · recommended `src/config/error-actions.ts`.

---

## 3. Display

Compose exclusively with design-system **Button** — do not fork custom error buttons.

| Element | Spec |
|---------|------|
| **Primary button** | `variant: primary` — main recovery action |
| **Secondary button** | `variant: outline` — alternate safe exit |
| **Layout** | Centered row on desktop/tablet when space allows; stacked full-width on mobile |
| **Order** | Primary first, then secondary (top → bottom on mobile) |
| **Touch targets** | Min **44px** height (`min-h-11`) on all actions |

### Label mapping (authoritative — align SCREEN-025)

| Error type | Primary action | Secondary action |
|------------|----------------|------------------|
| 404 (`not_found`) | Go to Dashboard | Go Back |
| 403 (`forbidden`) | Go to Dashboard | Back |
| 500 (`server_error`) | Try Again | Go to Dashboard |
| Network (`network_error`) | Retry | — |
| Session expired (`session_expired`) | Login | — |
| Audit service unavailable | Try Again | Back to Dashboard |
| Maintenance (`maintenance`) | — | — |
| Generic (`generic_error`) | Try Again | Go to Dashboard |

Per-state label overrides live in config (e.g. Network uses **Retry** not **Try Again**; 403 secondary is **Back**).

---

## 4. Behaviour

| Action | Behaviour |
|--------|-----------|
| **Retry / Try Again** | Parent `onRetry` or screen shell re-fetch / `router.refresh()` / boundary `reset()` |
| **Go Back / Back** | `router.back()` when history exists; else Dashboard/home fallback |
| **Go to Dashboard** | Authenticated → `/dashboard`; guest → `/` unless Figma overrides |
| **Login** | Open Login Modal (`source: session_expired`) or navigate sign-in with `next` return path |

| Rule | Spec |
|------|------|
| Parent owns logic | Error Actions renders buttons and invokes callbacks — no embedded routing in the presentation component |
| Idempotent retry | Retry may be clicked once per in-flight operation — see Loading state |
| Maintenance | No actions when error type defines none — component renders null or empty action row |
| Analytics | Fire **Retry Clicked** / **Dashboard Clicked** from parent or wrapper — see §8 |

No real API integration this phase.

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Primary and/or secondary enabled; labels from config or props |
| **Loading** | Primary shows busy label (e.g. **Retrying…**); primary **disabled**; `aria-busy` on primary; secondary disabled while primary retry in flight |
| **Disabled** | Individual buttons disabled when parent sets `disabled` — e.g. global screen loading, maintenance with no actions |

| Rule | Spec |
|------|------|
| Loading scope | Loading applies to **Retry / Try Again** primary only unless Figma shows global busy |
| Secondary during retry | Secondary disabled during primary retry to prevent conflicting navigation |
| No actions | When both primary and secondary are null/omitted — render no action row |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `primaryAction` | `retry` \| `go_to_dashboard` \| `login` \| null | No | Primary action key |
| `secondaryAction` | `go_back` \| `go_to_dashboard` \| null | No | Secondary action key |
| `primaryLabel` | string | When primary shown | Override label |
| `secondaryLabel` | string | When secondary shown | Override label |
| `onPrimary` | `(action) => void` | When primary shown | Primary handler |
| `onSecondary` | `(action) => void` | When secondary shown | Secondary handler |
| `loading` | boolean | No | Primary busy / retry in flight |
| `loadingLabel` | string | No | Default **Retrying…** |
| `disabled` | boolean | No | Disable all actions |
| `size` | `page` \| `section` | No | Affects full-width vs auto width on sm+ |
| `className` | string | No | Wrapper override |

Error State passes resolved actions from variant config; SystemStateScreen wires handlers to router and Login Modal.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Controls | Real **`<button type="button">`** elements via design-system Button — not divs |
| Keyboard | All actions tabbable; Enter/Space activate; visible focus rings |
| Labels | Discernible accessible names match visible label text |
| Loading | Primary sets `aria-busy="true"` and `disabled` while loading; busy text announced |
| Order | DOM order matches visual order (primary → secondary) |
| Touch | Min 44px touch targets on mobile |
| Color | Action purpose not conveyed by color alone — label text required |

Action cluster sits inside Error State `role="alert"` region — buttons remain individually focusable.

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Retry Clicked** | Retry / Try Again activated | `errorType`, `errorId` (opaque) |
| **Dashboard Clicked** | Go to Dashboard / Back to Dashboard activated | `errorType`, `errorId` |

Dev stub in `src/lib/analytics/error-system-events.ts`. No PII. Parent or SystemStateScreen fires events — Error Actions may accept optional `onAnalytics` callback if decoupling preferred.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Actions inline or wrapped, centered; `sm:w-auto` on buttons |
| **Tablet** | Same |
| **Mobile** | Full-width stacked buttons; primary above secondary |

---

## 10. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Error State (COMPONENT-072)** | Primary consumer — action row below description / error id |
| **Error Illustration (COMPONENT-073)** | No actions — illustration only |
| **Button (ui/button)** | **Reuse** — primary and outline variants; `isLoading` / `disabled` props |
| **SystemStateScreen** | Maps action keys to router, refresh, Login Modal |
| **Login Modal (COMPONENT-002)** | Login action target for session expired |
| **Empty State (COMPONENT-020)** | Separate CTA pattern for empty data — not error actions |

---

## 11. Reuse

| Context | Typical actions |
|---------|-----------------|
| Global 404 | Go to Dashboard · Go Back |
| 403 gate | Go to Dashboard · Back |
| Error boundary | Try Again · Go to Dashboard |
| Network / offline | Retry |
| Session expired | Login |
| Inline section error | Try Again · Go to Dashboard |

**Reusable across Audient** — one Error Actions implementation; config-driven labels and which actions appear.

---

## 12. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Config | `src/config/error-actions.ts` — action keys, default labels, busy copy |
| Reuse | `src/config/error-system-states.ts` — per-state primary/secondary action keys |
| Component | `src/components/common/ErrorActions.tsx` (recommended alongside Error State) |
| Integration | Error State delegates action row to Error Actions; remove duplicated Button markup |
| Button | `src/components/ui/button.tsx` — `variant`, `fullWidth`, `disabled`, optional `isLoading` |
| No | Custom error button styles · hardcoded hex · inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Retry, Go Back, Go to Dashboard, Login render with correct labels per error type  
□ Primary = filled; secondary = outline  
□ Loading disables primary and shows busy label  
□ Disabled state blocks interaction  
□ Maintenance / no-action types render no button row  
□ WCAG 2.2 AA — keyboard, focus, aria-busy on retry  
□ Mobile full-width stacked; desktop centered  
□ Reuses Button component — no forked styles  
□ Analytics events fire from parent on Retry / Dashboard (dev stub)  
□ Reused via Error State without per-screen button forks  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Destructive actions (Delete, Reset) on error surfaces |
| Tertiary action row unless Figma adds it |
| Auto-retry timers or exponential backoff UI |
| Link-styled actions instead of Button (unless Figma specifies) |
| Form submit buttons inside error panels |
| Exposing HTTP status or error codes in button labels |

---

**End of COMPONENT-074 / COMPONENT_ERROR_ACTIONS.md**
