# COMPONENT — System Status Banner

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Design · QA  

**Component ID:** COMPONENT-075 (System Status Banner)  
**Component name:** System Status Banner (`SystemStatusBanner`)  
**Primary screen:** Error & System States (`docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md`) · app shell / layout chrome  
**Also reusable on:** Dashboard header band · Help & Support status strip · audit processing flows when service degraded · guest marketing shell when maintenance announced  
**Related:** Error State (COMPONENT-072) — full-page maintenance / network failure · Error Actions (COMPONENT-074) — optional banner CTA (Retry · Learn more) · Error Illustration (COMPONENT-073) — not used in compact banner · Upgrade Banner / toast patterns — separate upsell surfaces · `docs/DESIGN_TOKENS.md` · SCREEN-M11 Offline/network · SCREEN-M17 Maintenance  
**Figma:** System status banner frames — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + existing **Button** / alert strip patterns.  
> **Phase:** **Mock status only** — selected via config, env flag, or query param; **no real monitoring integration** (Statuspage, Datadog, etc.) this phase.  
> **Security:** User-facing copy only — never expose internal incident IDs, stack traces, or infrastructure details in the banner.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md` · `docs/ERROR_HANDLING.md`

---

## 1. Purpose

Displays **system-wide service status** — a compact, persistent banner that informs users when Audient is operational, degraded, unavailable, or under maintenance.

Distinct from **Error State** full-page surfaces: the banner is for **ambient awareness** at the app shell level (e.g. sticky top band). Full-page maintenance or network failure may still use Error State when Figma routes users to a blocking screen.

**Do not redesign.** Match Figma layout, copy tone, and status styling.

---

## 2. Statuses

Four canonical status keys. Store in `src/config/system-status-banner.ts`.

| Status | Internal key | User meaning (summary) | Typical visibility |
|--------|--------------|------------------------|--------------------|
| **Operational** | `operational` | All systems normal | Hidden by default, or subtle positive strip on status/settings views if Figma shows |
| **Degraded** | `degraded` | Partial impact — some features slow or limited | Visible banner — warning tone |
| **Unavailable** | `unavailable` | Major outage — core service down | Visible banner — error tone |
| **Maintenance** | `maintenance` | Planned downtime | Visible banner — informational/warning tone |

| Rule | Spec |
|------|------|
| Single active status | One banner reflects the **most severe** applicable mock status when multiple flags exist (unavailable > maintenance > degraded > operational) |
| Copy | Plain language — no HTTP codes, no internal service names unless product-approved (e.g. “Audit service”) |
| Operational default | When mock status is operational, **do not render** the banner in app shell unless Figma shows an explicit “all clear” strip |

### Default mock messages (align SCREEN-025 where applicable)

| Status | Message (example) |
|--------|-------------------|
| **Operational** | All systems operational |
| **Degraded** | Some Audient services are running slowly. You may experience delays. |
| **Unavailable** | Audient is temporarily unavailable. We're working to restore service. |
| **Maintenance** | Audient is undergoing scheduled maintenance. Please try again later. |

Figma copy wins over examples above.

---

## 3. Display

Horizontal banner strip — full width of content area or viewport per Figma.

| Element | Spec |
|---------|------|
| **Status indicator** | Icon + text label (e.g. “Degraded”, “Maintenance”) — **not color alone** |
| **Message** | Short status sentence — one line preferred; wrap on mobile |
| **Optional action** | Text link or compact **Button** (ghost/outline) — e.g. Retry · Learn more · Status page — omit when none configured |

| Layout | Spec |
|--------|------|
| **Desktop** | Indicator · message · action inline; centered or start-aligned per Figma |
| **Tablet** | Same or wrapped second line for long messages |
| **Mobile** | Stacked or wrapped; action remains tappable (min **44px** height if button) |
| **Placement** | Below global header or above `main` — sticky optional per Figma; must not obscure skip link target |

### Visual tokens (design system)

| Status | Suggested token use (Figma wins) |
|--------|----------------------------------|
| **Operational** | `success` accent on indicator (if shown) |
| **Degraded** | `warning` background/border + text |
| **Unavailable** | `error` / `destructive` accent + `surface` or muted banner background |
| **Maintenance** | `warning` or neutral `muted` + primary text |

No hardcoded hex — `DESIGN_TOKENS.md` only.

---

## 4. Behaviour

| Rule | Spec |
|------|------|
| Mock only | Status from config, localStorage stub, env var, or QA query (e.g. `?systemStatus=degraded`) — no polling API |
| Dismiss | **Operational / degraded / unavailable:** dismissible only if Figma shows close control; **maintenance** — non-dismissible when full outage mock |
| Optional action | Parent provides handler — Retry (refresh), navigate to Help, external status page (future) |
| Coexistence | Banner may show **while** user continues in app (degraded); full-page Error State replaces chrome when maintenance blocks app (SCREEN-025) |
| Guest + auth | Visible to both unless route-specific mock hides it |
| No auto-refresh | No background status polling this phase |

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Indicator + message + optional action for active status |
| **Hidden** | `operational` or `hidden` prop — no DOM mount (preferred over empty strip) |
| **Loading** | Defer — parent shell shows skeleton elsewhere; banner does not simulate fetch |
| **With action** | Action visible and keyboard-focusable |
| **Without action** | Message-only banner |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `status` | `operational` \| `degraded` \| `unavailable` \| `maintenance` | Yes | Active system status |
| `message` | string | No | Override default message for status |
| `actionLabel` | string \| null | No | Optional CTA label |
| `onAction` | `() => void` | When action shown | Action handler |
| `dismissible` | boolean | No | Show dismiss control when Figma allows |
| `onDismiss` | `() => void` | When dismissible | Persist dismiss in mock storage |
| `sticky` | boolean | No | Sticky top band |
| `className` | string | No | Wrapper override |

When `status === operational'`, component returns null unless `forceVisible` (optional QA prop).

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Status region | Use `role="status"` with `aria-live="polite"` for non-critical (degraded, maintenance) · `aria-live="assertive"` for unavailable if Figma treats as urgent |
| Color | **Status must not rely on color alone** — icon + visible text label (e.g. “Maintenance”) always present |
| Screen readers | Announce status label + message; action has discernible name |
| Indicator icon | Decorative if redundant with text label — `aria-hidden`; otherwise included in accessible name |
| Keyboard | Action and dismiss (if any) focusable with visible focus rings |
| Contrast | Text and indicators meet contrast on banner background |
| Motion | No flashing; respect `prefers-reduced-motion` |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **System Status Banner Viewed** | Banner mounted with non-operational status | `status`, `surface: banner` |
| **System Status Action Clicked** | Optional action activated | `status`, `actionLabel` |
| **System Status Dismissed** | Dismiss control used | `status` |

Dev stub `console.info` in development. No PII. Implement in `src/lib/analytics/system-status-events.ts` (recommended).

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Single-line preferred; action end-aligned |
| **Tablet** | Wrap message if needed |
| **Mobile** | Full-width; stacked action below message if cramped |

---

## 10. Relationship to Other Components

| Component / Screen | Spec |
|--------------------|------|
| **Error State (COMPONENT-072)** | Full-page network / maintenance / generic errors — banner is compact alternative for M11 |
| **Error Actions (COMPONENT-074)** | Reuse Retry handler pattern for banner optional action |
| **SystemStateScreen** | Full-page maintenance — banner may precede redirect or coexist during partial degradation mock |
| **Header / DashboardHeader** | Banner mounts below header in layout shell |
| **Empty State / toasts** | Unrelated — no empty or success toast duplication |

---

## 11. Reuse

| Context | Typical status |
|---------|----------------|
| App layout shell | Degraded · unavailable · maintenance mock |
| Network offline (M11) | Map to `unavailable` or dedicated offline message — align SCREEN-025 network copy |
| Scheduled maintenance notice | `maintenance` |
| QA / demo | Query param toggles status without backend |

**Reusable across Audient** — one banner component; config-driven status and copy.

---

## 12. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Config | `src/config/system-status-banner.ts` — status keys, default messages, indicator labels, token mapping |
| Mock | `src/data/mock-system-status.ts` — current status for dev/QA |
| Component | `src/components/system/SystemStatusBanner.tsx` (recommended) |
| Layout | Mount from `layout.tsx` or header wrapper behind feature/mock flag |
| QA | `?systemStatus=degraded\|unavailable\|maintenance\|operational` on any route (mock parse) |
| Reuse | **Button** for optional action · Lucide icons for indicators until brand SVGs ship |
| No | Statuspage / Datadog / PagerDuty integration · real uptime API · incident webhook |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ All four statuses render correct indicator + message  
□ Operational hidden in app shell by default (unless forced for QA)  
□ Optional action works (mock handler)  
□ Dismiss behaviour matches spec per status  
□ WCAG 2.2 AA — not color-only, screen reader announces status + message  
□ Desktop / tablet / mobile layout  
□ Mock state only — no monitoring API calls  
□ Distinct from Error State full-page and Upgrade Banner  
□ Analytics events fire (dev stub) when banner shown / action clicked  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Real-time status monitoring or third-party status page embed |
| Per-service multi-banner stacks (audit vs billing vs auth) |
| Historical uptime charts or incident timeline |
| Push notifications for outages |
| Auto-retry with exponential backoff |
| Exposing internal incident or deployment IDs in UI |

---

**End of COMPONENT-075 / COMPONENT_SYSTEM_STATUS_BANNER.md**
