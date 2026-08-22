# COMPONENT — Maintenance State

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA · Legal  

**Component ID:** COMPONENT-076 (Maintenance State)  
**Component name:** Maintenance State (`MaintenanceState`)  
**Primary screen:** Error & System States (`docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md`) · SCREEN-M17 Maintenance  
**Also reusable on:** App maintenance route · deploy-window full-page gate · mock QA via `/system/error?state=maintenance`  
**Related:** Error State (COMPONENT-072) — shared layout tokens; maintenance is a dedicated variant · Error Illustration (COMPONENT-073) — `maintenance` artwork · Error Actions (COMPONENT-074) — Retry · Back to Dashboard · System Status Banner (COMPONENT-075) — compact ambient notice (non-blocking) · `docs/ERROR_HANDLING.md` · `docs/ACCESSIBILITY.md`  
**Figma:** Maintenance full-page frame — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Error State layout patterns.  
> **Phase:** **Mock maintenance only** — flag, env, or query param; **no real status API**, **no deploy pipeline integration** this phase.  
> **Security rule:** **Do not expose internal maintenance information** — no deployment IDs, server/host names, stack traces, maintenance runbooks, or engineer-only ETAs in UI.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md` · `src/config/error-system-states.ts` · `src/config/system-status-banner.ts`

---

## 1. Purpose

Provides a **dedicated maintenance experience** — a full-page (or large section) state when Audient is temporarily unavailable due to scheduled or emergency maintenance.

Users see calm, product-safe messaging with optional public availability guidance and limited recovery actions. Engineering may enable the state via mock flags — never by surfacing internal incident detail.

**Do not redesign.** Match Figma for illustration, copy hierarchy, and actions.

**Banner ≠ Maintenance State.** **System Status Banner** (COMPONENT-075) is a compact strip for ambient awareness. **Maintenance State** is the blocking full-page experience (SCREEN-M17).

---

## 2. Display

Centered full-page band — compose from existing error-system building blocks; do not fork a one-off layout.

| Element | Spec |
|---------|------|
| **Illustration** | Maintenance type from **Error Illustration** (COMPONENT-073) — wrench / tools motif; decorative |
| **Heading** | Single **H1** — default **Audient is temporarily unavailable** (align SCREEN-025) |
| **Description** | Plain-language explanation — default **We're performing maintenance. Please try again later.** |
| **Expected availability** | Optional supplementary line when product provides a **public** ETA — e.g. “We expect to be back soon.” or locale-formatted window from mock config — omit when unknown |
| **Optional status action** | Secondary text link or compact control — e.g. “Check status” → Help (future) — omit unless Figma shows |
| **Actions** | **Error Actions** row — see §3 |

| Layout | Spec |
|--------|------|
| **Desktop** | Centered column; illustration → heading → description → availability → actions |
| **Tablet** | Same |
| **Mobile** | Full-width stacked actions; min **44px** touch targets |

### Copy (authoritative baseline — Figma wins)

| Element | Default copy |
|---------|--------------|
| **Heading** | Audient is temporarily unavailable |
| **Description** | We're performing maintenance. Please try again later. |
| **Expected availability (optional)** | We expect to be back soon. *(mock placeholder — replace with approved public ETA copy only)* |
| **Primary action** | Retry |
| **Secondary action** | Back to Dashboard |

Store strings in `src/config/maintenance-state.ts` (recommended) and align with `ERROR_SYSTEM_STATE_DEFINITIONS.maintenance` in `src/config/error-system-states.ts`.

---

## 3. Actions

| Action | Internal key | Label | Behaviour |
|--------|--------------|-------|-----------|
| **Retry** | `retry` | Retry · Try Again | Re-check availability — `router.refresh()` or parent retry handler (mock delay OK) |
| **Back to Dashboard** | `go_to_dashboard` | Back to Dashboard · Go to Dashboard | Authenticated → `/dashboard`; guest → `/` |

Compose via **Error Actions** (COMPONENT-074). Primary = Retry (filled); secondary = Back to Dashboard (outline).

| Rule | Spec |
|------|------|
| Non-dismissible | Full-page maintenance is **not dismissible** — no close control that bypasses the state |
| Retry busy | Primary disabled + busy label while retry in flight |
| Optional status action | Separate from primary/secondary — link only; does not replace Retry |

When Figma shows no actions, component may hide action row — **this brief specifies Retry + Back to Dashboard** as default unless Figma overrides.

---

## 4. Behaviour

| Rule | Spec |
|------|------|
| Mock only | Enabled via maintenance flag, `NEXT_PUBLIC_MOCK_MAINTENANCE`, query (`?state=maintenance`, `?systemStatus=maintenance`), or route guard — no polling |
| Guest + auth | Reachable without login — same copy for both |
| Full-page | Prefer **SystemStateScreen** shell with guest/auth header + footer when Figma shows app chrome |
| Coexistence with banner | Banner may show during partial degradation; full **Maintenance State** replaces main content when app is blocked |
| Expected availability | Show **only** when mock/config supplies user-safe ETA string — never compute from internal deploy metadata |
| No error ID | Do not show `AUD-ERR-` correlation id on maintenance — not a failure taxonomy |
| Security | Never expose internal maintenance information (see §8) |

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Illustration + heading + description + actions |
| **With expected availability** | Optional line below description |
| **Without expected availability** | Description only — no empty placeholder row |
| **Retry busy** | Primary Retry disabled; secondary disabled during retry |
| **With optional status action** | Link below availability or beside actions per Figma |
| **Inline section** | Rare — `size: section` inside card; same copy hierarchy at smaller scale |

QA: `/system/error?state=maintenance` · `/system/error?state=maintenance` with mock ETA in config.

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `heading` | string | No | Override H1 |
| `description` | string | No | Override body copy |
| `expectedAvailability` | string \| null | No | Public ETA message; null hides line |
| `statusActionLabel` | string \| null | No | Optional tertiary link label |
| `onStatusAction` | `() => void` | When status action shown | Handler |
| `primaryLabel` | string | No | Default Retry |
| `secondaryLabel` | string | No | Default Back to Dashboard |
| `onRetry` | `() => void` | Recommended | Retry handler |
| `onBackToDashboard` | `() => void` | Recommended | Dashboard / home navigation |
| `loading` | boolean | No | Retry busy |
| `size` | `page` \| `section` | No | Full-page vs inline |
| `className` | string | No | Wrapper override |

Parent shell (`MaintenanceStateScreen` or `SystemStateScreen`) wires routing via `useErrorActionHandlers` pattern.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Heading | Single **`h1`** on full-page maintenance |
| Announcement | `role="alert"` or focus move to **heading** on mount so screen readers announce state |
| Illustration | Decorative — `aria-hidden` when heading + description convey meaning |
| Expected availability | Readable text — not the only carrier of urgency (heading/description first) |
| Actions | Keyboard accessible; visible focus rings; real buttons via **Error Actions** |
| Color | Maintenance cue not color-only — illustration + text |
| Motion | No flashing; respect `prefers-reduced-motion` |

---

## 8. Security & copy rules

| Never show | Spec |
|------------|------|
| Internal deploy IDs | e.g. `deploy-2026-08-14-abc123` |
| Server / host / region names | Internal infrastructure labels |
| Maintenance runbooks | Engineer-only instructions |
| Raw API / 503 JSON | Sanitized product copy only |
| Stack traces | Same as Error State security rules |

| May show (when approved) | Spec |
|--------------------------|------|
| Public ETA | User-safe window — “Back by 3:00 PM IST” from config/CMS mock |
| Generic reassurance | “We expect to be back soon.” when precise ETA unknown |

---

## 9. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Maintenance Viewed** | Maintenance State mounted | `surface: page` |
| **Retry Clicked** | Retry activated | `errorType: maintenance` |
| **Dashboard Clicked** | Back to Dashboard activated | `errorType: maintenance` |
| **Status Action Clicked** | Optional status link | `actionLabel` |

Reuse `errorSystemAnalytics` / `systemStatusAnalytics` dev stubs where appropriate — no PII.

---

## 10. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Centered column; actions inline or stacked with gap |
| **Tablet** | Same |
| **Mobile** | Full-width stacked Retry → Back to Dashboard |

---

## 11. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Error State (COMPONENT-072)** | Generic shell — Maintenance State is specialized maintenance UX with ETA line |
| **Error Illustration (COMPONENT-073)** | `maintenance` type artwork |
| **Error Actions (COMPONENT-074)** | Retry + Back to Dashboard |
| **System Status Banner (COMPONENT-075)** | Compact strip — not full-page block |
| **SystemStateScreen** | May render Maintenance State when `stateType === maintenance` |
| **Help & Support** | Optional destination for status action (future) |

---

## 12. Reuse

| Context | Spec |
|---------|------|
| SCREEN-M17 / deploy window | Full-page Maintenance State |
| QA demo route | `/system/error?state=maintenance` |
| Mock env flag | `NEXT_PUBLIC_MOCK_MAINTENANCE=true` |

**One Maintenance State implementation** — config-driven copy; no per-route layout forks.

---

## 13. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Config | `src/config/maintenance-state.ts` — heading, description, ETA placeholder, action labels |
| Align | Update `ERROR_SYSTEM_STATE_DEFINITIONS.maintenance` actions when implementing Retry + Dashboard |
| Component | `src/components/system/MaintenanceState.tsx` (recommended) |
| Compose | Error Illustration + typography + Error Actions — DRY with Error State tokens |
| Screen | `MaintenanceStateScreen` or extend `SystemStateScreen` |
| Mock | `src/data/mock-maintenance-state.ts` — optional public ETA string |
| No | Real monitoring · PagerDuty · internal deploy API |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ Illustration, heading, description displayed  
□ Expected availability shown only when configured — user-safe copy  
□ Retry and Back to Dashboard actions work (mock)  
□ Retry busy disables actions  
□ No internal maintenance details in UI  
□ WCAG 2.2 AA — focus/alert, keyboard actions  
□ Desktop / tablet / mobile  
□ Distinct from System Status Banner strip  
□ Guest and authenticated users see maintenance  
□ Mock only — no monitoring integration  

---

## 15. Non-goals

| Out of scope |
|--------------|
| Real-time maintenance status API |
| Admin maintenance scheduling UI |
| Countdown timers tied to internal deploy clocks |
| Exposing HTTP 503 codes to users |
| Multiple maintenance tiers (partial vs full) in one component |
| Auto-refresh polling |

---

**End of COMPONENT-076 / COMPONENT_MAINTENANCE_STATE.md**
