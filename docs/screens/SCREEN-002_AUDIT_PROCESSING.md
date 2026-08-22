# SCREEN-002 — Audit Processing

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-01  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-002 (product brief) · **SCREEN-M01** (canonical in `SCREEN_MAPPING.md`)  
**Screen name:** Audit Processing  
**Entry CTA:** **Analyze Website** (Guest/Free/Pro Home success state) — same product action as historical **GO** when Figma uses that label  
**Figma:** Audit Processing / progress frame when designed; until then follow this spec + Home chrome from `Screens/Screen1` (do not invent a new app shell)  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** There is **no** `DESIGN_SYSTEM.md` in the repo. Use **`docs/DESIGN_TOKENS.md`** plus COMPONENT_* / Figma for visual tokens.  
> **State authority:** Repo-root **`STATE_MANAGEMENT.md`** (audit lifecycle `AUDIT-STATE-*`).  
> **ID note:** Other drafts also used SCREEN-002 (Guest menu / upload success). In `SCREEN_MAPPING.md`, progress is **SCREEN-M01**. Implement one Processing experience; align IDs when product renumbers.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ERROR_HANDLING.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/HOME_SCREEN.md` · `docs/screens/home_upload_success.md` · `docs/ANALYTICS.md`

---

## 1. Purpose

The screen appears **immediately after** the user clicks **Analyze Website** (when the audit start is accepted).

It informs the user that the **AI is processing the audit**, shows progress through named stages, and reassures them while work runs (screenshot typically ≤ ~90s; URL ≤ ~8 minutes per `SCREEN_MAPPING` real-time contract).

On success, the user proceeds to the **Audit Report** (SCREEN-M02).  
On failure, the user proceeds to **Audit Failure** (SCREEN-M03 / ERROR_HANDLING taxonomy).  
On cancel (if enabled), return Home with cancel + refund rules per SCREEN_MAPPING / BUSINESS_RULES.

---

## 2. User Types

| User | Can reach Processing |
|------|----------------------|
| Guest | Yes — after allowed screenshot audit start |
| Free | Yes — screenshot (URL gated before this screen) |
| Pro / Business | Yes — screenshot or URL |

Guests/Free must **not** enter Processing for gated URL audits; Login Modal / Upgrade Dialog happen **before** this screen.

---

## 3. Layout

| Rule | Spec |
|------|------|
| Page chrome | **Same page layout as the Home Screen** — header (logo, tagline, credits, avatar), hero region structure per Figma/Home |
| What changes | **Replace only the upload area** with the processing state |
| Do not | Redesign Home into a dashboard; do not add sidebar-only chrome; do not invent new marketing sections |
| Tokens | Surfaces, primary, type, spacing from `DESIGN_TOKENS.md` / Figma |

Processing is a **state of Home’s main content band** (upload card region), not a different product shell — unless a dedicated Figma progress frame later requires a full-page variant; until then, follow this “Home + replace upload area” rule.

---

## 4. Entry / Exit

### 4.1 Entry

```text
Home (idle / upload success)
        │
        ▼
Analyze Website (accepted)
        │
        ▼
Audit Processing (this screen)
```

| Prerequisite | Spec |
|--------------|------|
| Valid input | Screenshot or URL already validated (success state) |
| Auth / tier | Gates cleared (guest URL and exhausted credits never land here) |
| Audit create | `POST /audits` accepted (or mock id in Phase 1) |

Fire **`processing_started`** when the processing UI becomes active.

### 4.2 Exit

| Outcome | Destination |
|---------|-------------|
| Completed | Audit Report (SCREEN-M02) — auto-navigate when terminal COMPLETED |
| Failed | Audit Failure (SCREEN-M03) — do not leave user stuck on 100% fake success |
| Cancelled (optional Cancel) | Confirm → cancel job → credits refunded when policy says so → **Home** |
| Session expired | Session Expired → Login Modal; reconcile audit on resume |

---

## 5. Components

| Component | Role |
|-----------|------|
| **Processing illustration** | Visual reassurance in the former upload area (per Figma) |
| **Circular progress indicator** | 0–100% ring/gauge; `role="progressbar"` |
| **Percentage** | Numeric progress (e.g. `42%`) — not color-only |
| **Current processing stage** | Label for the active stage (list in §6) |
| **Estimated remaining time** | Human-readable ETA (e.g. “About 45 seconds left”) |
| **Cancel button** | **Optional** — if present: keyboard accessible; confirm before destructive cancel |
| **Background tips carousel** | Rotating UX tips while waiting; must be pausable for a11y (see §9) |

Optional context (if Figma shows): thumbnail or URL string of the audit source — do not invent if not designed.

---

## 6. Processing Stages

Display stages in this order. Advance forward only; **never jump backwards** in stage index or percentage.

| # | Stage label (UI) |
|---|------------------|
| 1 | Upload complete |
| 2 | Validating image |
| 3 | Website detection |
| 4 | Accessibility analysis |
| 5 | UX heuristic evaluation |
| 6 | Visual Design evaluation |
| 7 | Performance analysis |
| 8 | SEO analysis |
| 9 | AI recommendation generation |
| 10 | Preparing PDF |
| 11 | Finalizing Report |

**Notes:**

- For **URL** audits, “Validating image” may be skipped or relabeled when the worker emits URL-specific stages — UI may map coarse worker progress onto this list without moving **backwards**.
- Sub-stage names are **UX labels**. Backend may emit coarse `progress` 0–1 (`SCREEN_MAPPING` / `STATE_MANAGEMENT.md`); do not block the screen on perfect 1:1 stage parity.
- Align loosely with `AUDIT-STATE-003`–`011` in `STATE_MANAGEMENT.md` (started → analyze → recommendations → PDF); this brief’s 11 labels are authoritative for **on-screen copy**.

---

## 7. Progress Behaviour

| Rule | Spec |
|------|------|
| Range | **0–100%** |
| Animation | **Smooth** toward the latest authoritative value |
| Monotonic | **Never jump backwards** — ignore stale lower percentages; clamp display to `max(previous, incoming)` |
| Stage order | Stage index only increases (or stays) until complete |
| Completion | Reach 100% + final stage → brief settle → navigate to Report |
| Failure | Do not fake 100%; transition to failure UX / M03 |
| ETA | Derived from `estimatedSecondsRemaining` or mock schedule; update without flickering every frame |
| Timing targets | Screenshot ~≤90s; URL ~≤480s (product expectations — not hard UI timeouts alone) |

---

## 8. States

| UI state | Behaviour |
|----------|-----------|
| Entering | Illustration + 0% or last known; stage 1; `processing_started` |
| Processing | % + stage + ETA update; tips carousel runs (unless reduced motion / paused) |
| Reconnecting | Offline banner per ERROR_HANDLING; keep last %; resume poll when online |
| Completing | 100% + Finalizing Report; then Report |
| Failed | `processing_failed` → Failure screen / inline failure per ERROR_HANDLING |
| Cancelling | Confirm → request cancel → `processing_cancelled` → Home |
| Cancel unavailable | Omit Cancel control (optional) — progress still must be understandable |

Map server `QUEUED` / `PROCESSING` / `COMPLETED` / `FAILED` / cancelled to the above (`STATE_MANAGEMENT.md`).

---

## 9. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** (`ACCESSIBILITY.md`) |
| Progress | `role="progressbar"` with `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow`, and `aria-valuetext` including stage |
| **ARIA live region** | Polite live region for **stage changes** (and optional ETA); **throttle** (e.g. on stage change or every few seconds — not every poll tick) |
| Keyboard | Cancel (if present) and carousel pause/next (if controls exist) operable; Tab order within processing region after header |
| Focus | On enter, move focus to progress status or heading for the processing region |
| **Reduced motion** | Honor `prefers-reduced-motion`: no essential info only in motion; circular indicator may snap/step; tips carousel **auto-rotate off** — show static tip or manual advance only |
| Tips carousel | Must not violate Pause/Stop/Hide: provide pause/stop **or** disable auto-rotate under reduced motion; tips are supplementary, not the only status channel |
| Color | Percentage + stage text required; illustration decorative (`alt=""` / `aria-hidden` as appropriate) |

---

## 10. Cancel (optional)

| Aspect | Spec |
|--------|------|
| Presence | Optional per product/Figma |
| Confirm | Required if cancel refunds or stops a paid job |
| Effect | Job → cancelled; refund per PRD / SCREEN_MAPPING failed/cancel policy |
| Analytics | `processing_cancelled` |
| A11y | Named button; focus returns appropriately after confirm dialog |

If Cancel is omitted in v1, document as deferred — progress + failure paths still ship.

---

## 11. Analytics

| Event | Trigger |
|-------|---------|
| `processing_started` | Processing UI active after Analyze Website accepted |
| `processing_cancelled` | User confirms cancel |
| `processing_completed` | Terminal success before/at navigate to Report |
| `processing_failed` | Terminal failure (include `reason` / taxonomy code when known) |

Align aliases with `ANALYTICS.md` / SCREEN_MAPPING (`audit_processing_watched`, `audit_completed`, `audit_failed`, `audit_cancelled`) via stable property mapping — do not double-fire conflicting semantics.

---

## 12. Error Behaviour

| Case | Spec |
|------|------|
| Create failed before Processing | Stay on Home; ERROR_HANDLING — never show fake progress |
| Worker FAILED mid-progress | `processing_failed` → SCREEN-M03 taxonomy (unreachable, AI unavailable, etc.) |
| Timeout | Surface failure / retry per ERROR_HANDLING — do not spin forever without feedback |
| Offline | Banner; pause optimistic mock advance in Phase 2; reconcile on reconnect |
| Refund-eligible failure | Credits refund messaging per ERROR_HANDLING / PRD |

Never crash; never clear unrelated Home header state.

---

## 13. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Home layout; processing replaces upload area |
| Tablet | Same hierarchy |
| Mobile | Same components stacked per Figma; circular progress + % + stage readable without horizontal scroll |

---

## 14. Developer Notes

### Phase 1 — Mocked progress (initial)

| Rule | Spec |
|------|------|
| Progress source | **Client mock** — advance % and stages on a timer |
| Monotonic | Still never jump backwards |
| Completion | After mock completes, navigate to Report stub or placeholder only if product allows; otherwise hold at 100% until Report exists |
| Cancel | May no-op or clear mock locally |
| No real credits burn in pure UI mocks unless wired to API |

### Phase 2 — Backend polling / realtime

| Rule | Spec |
|------|------|
| Status | `GET /audits/{id}/status` poll (~3s, backoff after 60s per SCREEN_MAPPING) |
| Optional | Supabase Realtime `audit:{id}` supersedes poll when connected |
| Payload | `{ status, progress, estimatedSecondsRemaining, stage? }` |
| UI | Map server progress → circular % + nearest stage label; clamp monotonic |
| Terminal | COMPLETED → Report; FAILED → Failure; cancel endpoint when Cancel ships |

**Do not generate implementation code in this document.** Wire UI to mock first, then swap the progress source to the polling API without changing layout contracts.

---

## 15. Navigation Summary

```text
Analyze Website
        ↓
Audit Processing (SCREEN-002 / M01)
        ├─ success → Audit Report (M02)
        ├─ failure → Audit Failure (M03)
        └─ cancel  → Home (refund per policy)
```

---

## 16. QA Checklist

□ Appears immediately after accepted Analyze Website  
□ Home chrome unchanged; only upload area → processing  
□ All 11 stages can appear in order (mock or mapped)  
□ % 0–100 smooth; never decreases  
□ ETA visible and updates sanely  
□ Tips carousel pausable / static under reduced motion  
□ Cancel optional path confirmed + analytics  
□ Live region throttled; progressbar semantics  
□ Keyboard + focus visible; WCAG 2.2 AA  
□ `processing_started` / `_completed` / `_failed` / `_cancelled`  
□ Phase 1 mock works without API  
□ Phase 2 poll/realtime contract ready to replace mock  

---

## 17. Non-goals

| Out of scope on this screen |
|-----------------------------|
| Full report content |
| OAuth / Login Modal UI (gates happen before entry) |
| Redesign of Home header/hero |
| Exact worker internal step names if they differ — map forward-only to §6 labels |

---

**End of SCREEN-002 / SCREEN-002_AUDIT_PROCESSING.md**
