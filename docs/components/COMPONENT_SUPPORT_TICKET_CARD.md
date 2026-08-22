# COMPONENT — Support Ticket Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-066 (Support Ticket Card)  
**Component name:** Support Ticket Card (`SupportTicketCard`)  
**Primary screen:** Help & Support (`docs/screens/SCREEN-023_HELP_AND_SUPPORT.md`) — Recent Support Requests  
**Related:** Support Ticket Detail Modal (`SupportTicketDetailModal`) — read-only detail on View · Help Support Requests Section — list composes multiple cards · Contact Support Modal — may append new mock ticket · Badge primitive — status chip  
**Figma:** Help & Support ticket row — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Card / Badge patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock data only** — **no backend**, **no Supabase**, **no external helpdesk ticketing**.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-023_HELP_AND_SUPPORT.md` · `src/config/help-support-screen.ts` · `src/data/mock-help-support.ts`

---

## 1. Purpose

Displays a **user's previous support request** as a scannable list row.

One card = one mock ticket summary (ID, subject, date, status). Authenticated users only — parent section hides the list for guests.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Ticket ID** | Opaque mock id — e.g. `AUD-1042`; monospace or semibold treatment |
| **Subject** | Request subject line — truncate with ellipsis on narrow viewports |
| **Date** | Submitted date — locale-formatted (e.g. “Aug 10, 2026”) |
| **Status** | Token **Badge** with visible text label |

Optional (Figma wins):

| Element | Spec |
|---------|------|
| **View** | Outline button — **View** — opens ticket detail modal |

Compose on design-system **Card** — default variant, medium padding.

| Layout | Spec |
|--------|------|
| **Desktop** | ID + status row; subject; date; View button end-aligned |
| **Mobile** | Stacked; full-width View button; min **44px** touch targets |

---

## 3. Status

Three mock status values — align with `HELP_SUPPORT_TICKET_STATUSES` in `help-support-screen.ts`:

| Status | Label | Meaning (mock) | Badge variant (recommended) |
|--------|-------|----------------|----------------------------|
| **Open** | Open | Newly submitted | `info` |
| **Pending** | Pending | Awaiting response | `warning` |
| **Resolved** | Resolved | Closed / completed | `success` |

| Rule | Spec |
|------|------|
| Text | Badge always shows readable status word — **not color-only** |
| Tokens | Map via `HELP_SUPPORT_TICKET_STATUS_LABELS` / `HELP_SUPPORT_TICKET_STATUS_VARIANTS` |

---

## 4. Behaviour

| Action | Spec |
|--------|------|
| **View** | Calls `onView(ticket)` — parent opens read-only detail modal |
| **Row click** | Optional — same as View if Figma shows whole-row activation; otherwise View button only |
| **Sort** | Parent sorts newest first before render |
| **New ticket** | After mock Contact Support submit, parent may prepend card — card is presentational |

| Rule | Spec |
|------|------|
| Data | `HelpSupportTicket` from mock bundle — no API fetch |
| Edit | Read-only — no inline status change this phase |
| Backend | **No** real ticketing system |

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | All fields visible |
| **Hover** | Card/button hover tokens when interactive |
| **Focused** | Visible focus on View control |
| **Disabled** | Rare — parent loading; non-interactive |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `ticket` | `HelpSupportTicket` | Yes | `{ id, ticketId, subject, message, submittedAt, status }` |
| `onView` | `(ticket) => void` | Yes | View / detail handler |
| `viewLabel` | string | No | Default **View** |
| `className` | string | No | |

Parent list maps `tickets[]` → one card each.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Structure | List item inside `<ul>` — parent section owns list semantics |
| View control | Named button — e.g. “View support request AUD-1042” |
| Status | Visible text on Badge; not conveyed by color alone |
| Subject | Readable; truncation OK if full subject in detail modal |
| Keyboard | Tab to View; Enter/Space activates |
| Focus | Visible focus ring on interactive controls |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Support Ticket Viewed** | View activated | `ticketId`, `status` |

Delegate to parent or fire from `onView` — align `help-support-events.ts`. No message body or PII in payloads.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Horizontal card content + inline View |
| **Tablet** | Same or stacked View |
| **Mobile** | Full-width View; subject truncates |

---

## 10. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Help Support Requests Section** | Section heading + empty state + `<ul>` of `SupportTicketCard` |
| **Support Ticket Detail Modal** | Full message + metadata on View |
| **Contact Support Modal** | Mock submit may add ticket shown by new card |
| **Badge (ui)** | Status chip |

### Refactor note

Today ticket row markup lives **inline** in `HelpSupportRequestsSection.tsx`. Extract into **`SupportTicketCard`** without changing fields or behaviour.

---

## 11. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `HelpSupportTicket` · `MOCK_HELP_TICKETS` · `formatHelpTicketDate()` · status Badge maps |
| Config | Optional `src/config/support-ticket-card.ts` — View label re-export |
| Component | `src/components/help/SupportTicketCard.tsx` |
| No | Backend · Supabase · Zendesk / Intercom / Freshdesk |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Ticket ID, Subject, Date, Status displayed  
□ Status: Open, Pending, Resolved with text labels  
□ View opens detail modal  
□ Badge uses tokens — not color-only  
□ Keyboard + focus on View  
□ Authenticated list only — guests hidden by parent  
□ Newest-first sort (parent)  
□ Support Ticket Viewed analytics  
□ Mock data only — no backend  
□ Desktop / mobile layout  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Ticket creation UI (Contact Support modal) |
| Status editing / agent replies |
| Real helpdesk sync |
| Attachments |
| Pagination (mock list is short) |

---

**End of COMPONENT_SUPPORT_TICKET_CARD.md**
