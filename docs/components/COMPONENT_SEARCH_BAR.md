# COMPONENT — Search Bar

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-021 (Search Bar)  
**Component name:** Search Bar (`SearchBar`)  
**Primary screen:** Audit History (`docs/screens/SCREEN-009_AUDIT_HISTORY.md`)  
**Figma:** History / shared search field when designed — **exact match**  
**Priority:** P0 (with History search enhancement)  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** There is **no** `DESIGN_SYSTEM.md`. Use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md` (Input primitives).

**Related:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/screens/SCREEN-009_AUDIT_HISTORY.md` · `docs/components/COMPONENT_EMPTY_STATE.md`

---

## 1. Purpose

The Search Bar enables **authenticated users** to quickly locate previous audits from the **Audit History** screen.

The component must be **reusable** across modules, including:

| Module | Typical query targets |
|--------|------------------------|
| **Audit History** | Website name, URL, Audit ID |
| **Team Workspace** | Future — members/audits when teams ship (BR-ENT-003) |
| **Reports** | Report title / site / id |
| **Billing** | Invoice id / date labels (when billing search exists) |

Same chrome and behaviour; parent supplies placeholder, debounce handler, and result wiring.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Search icon** | Leading decorative icon (`aria-hidden`) |
| **Placeholder text** | See below |
| **Clear (X) button** | Visible **only when text exists**; clears query |

### Placeholder (History default)

**Search by website name, URL or Audit ID**

Other modules may override placeholder via props without changing layout.

---

## 3. Search Behaviour

### 3.1 Supported fields (Audit History)

| Field | Spec |
|-------|------|
| Website Name | Partial, case-insensitive |
| URL | Host/path partial match |
| Audit ID | Exact or prefix |

### 3.2 Interaction

| Rule | Spec |
|------|------|
| Live update | Results update **while typing** (parent list filters / API) |
| Debounce | **300ms** after last keystroke before emitting search |
| Clear | X clears value, emits cleared search, restores unfiltered list |
| Submit | Enter may force immediate search (flush debounce) — **Search Submitted** |
| Min length | Optional (e.g. 0 = allow empty; or 2 chars) — default: search from first character after debounce; empty query = clear constraint |

Parent owns fetching/filtering; Search Bar only emits debounced `query` changes.

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | Empty value; placeholder visible; no clear button |
| **Focused** | Focus ring; placeholder may remain until typing |
| **Typing** | Value present; clear (X) visible; debounce pending |
| **Loading** | Parent searching — show field `aria-busy` and/or trailing spinner per Figma; input remains editable unless disabled |
| **No Results** | Field stays in Success/Typing with value; **parent** shows Empty State (“No audits found.”) — Search Bar does not replace the list |
| **Disabled** | Not editable; muted; no clear; used when History offline or unauthorized |
| **Error** | Inline error text under field (e.g. search failed); retry via retype or parent Retry |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `value` | string | Yes | Controlled query |
| `placeholder` | string | No | Default = History placeholder |
| `state` | `default` \| `loading` \| `disabled` \| `error` | No | Visual state (focus/typing derived) |
| `errorMessage` | string \| null | Error | Inline error |
| `debounceMs` | number | No | Default **300** |
| `onChange` | (query) => void | Yes | Immediate value change (controlled) |
| `onSearch` | (query) => void | Yes | Debounced search emit |
| `onClear` | () => void | Yes | Clear activated |
| `onSubmit` | (query) => void | Optional | Enter submitted |
| `id` / `ariaLabel` | string | Recommended | Accessible name |
| `module` | `history` \| `reports` \| `billing` \| `team` \| … | Analytics | Context |

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Control | Native text input (or equivalent) with **ARIA label** / visible `<label>` (visually hidden OK if design is icon+placeholder only — prefer `aria-label="Search audits"`) |
| Keyboard | Tab to input; type; Enter submits; Tab to Clear; Enter/Space activates Clear |
| Clear | Named button — “Clear search” |
| Visible focus | Required on input and Clear |
| Loading | `aria-busy="true"` on input or combobox wrapper; do not steal focus |
| Error | `aria-invalid` + `aria-describedby` error text |
| Results | Announced by parent live region (“N audits found”) — not only by this component |

---

## 7. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Search Started** | First non-empty debounced emit in a session/focus (or first keystroke → first `onSearch`) | `module`, `queryLength` (not full query if PII-sensitive — prefer length/hash policy) |
| **Search Cleared** | Clear (X) or empty emit after non-empty | `module` |
| **Search Submitted** | Enter / explicit submit | `module`, `queryLength` |

Align with History **Search Used** (`SCREEN-009`) — map `search_started` / `search_used` consistently; avoid triple-counting the same debounce.

Do not log full URLs/emails in analytics if policy forbids; `queryLength` + `module` preferred.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full-width in History toolbar per Figma |
| **Tablet** | Same; may share row with filters |
| **Mobile** | Full-width; adequate tap target for Clear (≥44px) |

---

## 9. Reuse

| Rule | Spec |
|------|------|
| One component | Shared Search Bar for History, Reports, Billing, future Team |
| Customize | Placeholder, `module`, `onSearch` only |
| No forks | Do not build separate “HistorySearch” vs “BillingSearch” layouts |

---

## 10. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` — input border/focus/error |
| Icon | Leading search; trailing clear only when non-empty |
| No redesign | Spacing/type per Figma |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Controlled input | Parent holds `value` |
| Debounce | 300ms before `onSearch` |
| Phase 1 | Client filter on mock History data |
| Phase 2 | API `q=` / search param on `GET /audits` |
| Team Workspace | Stub reuse until teams exist — do not build teams UI here |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Search icon, placeholder, Clear when text exists  
□ Placeholder exact for History  
□ Debounce 300ms; live results via parent  
□ Search by name / URL / Audit ID (History)  
□ States: default, focused, typing, loading, disabled, error; no-results via parent Empty State  
□ Keyboard + ARIA label + visible focus  
□ Analytics: started, cleared, submitted  
□ Desktop / tablet / mobile  
□ Reusable across modules without layout forks  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Rendering the audit list itself |
| Filter chips / sort dropdown (sibling controls) |
| Building Team Workspace product |
| Full-text search inside PDF binaries |

---

**End of COMPONENT / COMPONENT_SEARCH_BAR.md**
