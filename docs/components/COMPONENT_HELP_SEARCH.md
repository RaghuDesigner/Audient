# COMPONENT — Help Search

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-062 (Help Search)  
**Component name:** Help Search (`HelpSearch`)  
**Primary screen:** Help & Support (`docs/screens/SCREEN-023_HELP_AND_SUPPORT.md`)  
**Related:** Search Bar (`COMPONENT_SEARCH_BAR.md`) — base input chrome · Help & Support screen — parent layout · FAQ Accordion — FAQ matches may filter in sibling section · Contact Support — no-results recovery CTA  
**Figma:** Help & Support search field + results region — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Input patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock data only** — in-memory help index; **no backend**, **no CMS**, **no external search**.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-023_HELP_AND_SUPPORT.md` · `src/config/help-support-screen.ts` · `src/utils/help-support-screen.ts` · `src/data/mock-help-support.ts`

---

## 1. Purpose

Searches **Audient help content** on the Help & Support screen.

Combines the shared search field with help-specific placeholder, debounced query emission, matching results affordances, and a no-results state — while filtering **mock articles and FAQs** only.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Search icon** | Leading decorative icon (`aria-hidden`) — via Search Bar |
| **Search input** | Single-line text field; placeholder **Search help articles** |
| **Clear action** | Trailing **X** button — visible only when query is non-empty; labeled “Clear search” |

Optional below the field (Figma wins):

| Element | Spec |
|---------|------|
| **Results count** | Screen-reader-only live region when matches change |
| **Matching articles** | Short list of article title + summary (parent or this component) |
| **No-results message** | Inline panel — “No articles match your search.” + hint to contact support |

FAQ matches may update the FAQ Accordion sibling rather than duplicating FAQ text in the search results list — **one results surface** per Figma.

---

## 3. Behaviour

### 3.1 Data source

| Rule | Spec |
|------|------|
| Corpus | Mock help articles + FAQ questions/answers from `mock-help-support` |
| Match fields | Article **title**, **summary**, **tags**, **category label**; FAQ **question** (and optionally **answer** text) |
| Match type | Case-insensitive partial substring |
| Guest | Search **public** corpus only (`guestVisible` articles); authenticated users search full mock index |
| Category filter | When parent passes active category, scope search to that category before text match |

### 3.2 Interaction

| Rule | Spec |
|------|------|
| Live filter | Results update while typing |
| Debounce | **300ms** after last keystroke before emitting search (Search Bar default) |
| Clear | Clears input; restores unfiltered help view; resets no-results state |
| Enter | Flushes debounce and runs search immediately |
| Empty query | Clears text constraint; show default categories + full FAQ (respecting category filter) |
| No API | **No** network requests, Supabase, or CMS fetch |

### 3.3 Results

| Condition | Spec |
|-----------|------|
| **Matches found** | Show matching articles list (if Figma); filter FAQ Accordion to matching items **or** show count in live region |
| **No matches** | Show no-results state — not a global screen error |
| **Loading** | Skeleton field while parent screen loads; do not show no-results during initial load |

### No-results copy (defaults)

| Element | String |
|---------|--------|
| **Headline** | No articles match your search. |
| **Hint** | Try different keywords or contact support. |
| **Recovery** | Link/button to **Contact Support** (same handler as screen Contact CTA) |

Align with `HELP_SUPPORT_COPY` in `help-support-screen.ts`.

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | Empty query; placeholder visible; no clear button |
| **Focused** | Visible focus ring on input |
| **Typing** | Non-empty value; clear visible; debounce pending |
| **Loading** | Parent screen loading — skeleton or `aria-busy` on input |
| **Results** | One or more matches — articles and/or FAQs |
| **No Results** | Non-empty query, zero matches — inline empty message |
| **Disabled** | Input not editable when parent forbids interaction |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `query` | string | Yes | Controlled search string |
| `onQueryChange` | (query) => void | Yes | Immediate value updates |
| `onSearch` | (query) => void | Yes | Debounced search emit |
| `onClear` | () => void | Yes | Clear activated |
| `results` | `{ articles, faqs, totalCount }` | Recommended | From `searchHelpContent()` helper |
| `category` | category key \| null | No | Active category filter from parent |
| `guest` | boolean | No | Restrict corpus for guest users |
| `state` | `default` \| `loading` \| `disabled` | No | Visual / busy state |
| `onContactSupport` | action | No | No-results recovery + screen CTA |
| `className` | string | No | |

Parent (Help & Support screen) owns mock data, category selection, and FAQ accordion filtering.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Label | Proper search label — visible or `aria-label="Search help articles"` (exact placeholder may serve as accessible name when documented) |
| Input | Native search/text input with visible focus ring |
| Clear | Named button — **Clear search**; keyboard activatable |
| Keyboard | Tab to input; type; Enter submits; Tab to Clear; Enter/Space on Clear |
| Results | Polite live region announces match count changes — e.g. “3 results found” (screen reader only acceptable) |
| No results | Message readable by assistive tech; Contact Support recovery is keyboard reachable |
| Loading | `aria-busy="true"` when loading; do not move focus unexpectedly |
| Color | No-results is text-based — not color-only |

---

## 7. Analytics

Align with SCREEN-023 **Help Search** event (screen or component may fire once per debounced emit — avoid duplicate with Search Bar generic events).

| Event | Trigger | Properties |
|-------|---------|------------|
| **Help Search** | Debounced query executed | `queryLength`, `resultCount`, `isGuest`, `category` (optional) |

Do not log full query text if policy restricts; prefer `queryLength`.

Optional alignment with Search Bar **Search Cleared** when module = `help`.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full-width search in Help page header area |
| **Tablet** | Full-width; no-results panel stacks below field |
| **Mobile** | Full-width input; Clear target ≥ **44px**; no-results text wraps |

---

## 9. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Search Bar (COMPONENT-021)** | **Compose** — do not fork input chrome; pass `module="help"` and help placeholder |
| **FAQ Accordion** | FAQ portion of results — filter `items` prop when query/category active |
| **Help Support Categories** | Category selection narrows search scope via parent |
| **Contact Support** | No-results recovery opens same flow as screen CTA |
| **Empty State (COMPONENT-020)** | Use inline no-results panel on Help Search — full Empty State optional if Figma shows compact inline only |

### Implementation note

Target: thin **`HelpSearch`** wrapper composing **`SearchBar`** + results/no-results region, delegating filter logic to **`searchHelpContent()`** in utils — not a parallel search engine.

---

## 10. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `SearchBar` · `searchHelpContent()` · `HELP_SUPPORT_COPY` · `mock-help-support` |
| Config | Extend `help-support-screen.ts` or `help-search.ts` for placeholder / no-results copy |
| Utils | `src/utils/help-support-screen.ts` — single search helper |
| Component | `src/components/help/HelpSearch.tsx` (or inline in `HelpSupportScreen` until extracted) |
| Analytics | `help-support-events.ts` — `helpSearch()` |
| No | Backend · Supabase · Zendesk/Intercom · CMS · full-text index service |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Search icon, input, clear when text exists  
□ Placeholder: “Search help articles”  
□ Debounced search over mock articles + FAQs  
□ Matching results shown (articles and/or filtered FAQ)  
□ No-results state with recovery to Contact Support  
□ Guest searches public corpus only  
□ Category filter scopes search when active  
□ WCAG 2.2 AA — label, keyboard, focus, live region  
□ Desktop / tablet / mobile  
□ Help Search analytics with `queryLength` + `resultCount`  
□ Mock only — no backend  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Global site search outside Help |
| AI / semantic search |
| Search inside PDF attachments |
| Live CMS or helpdesk query |
| Rendering full article detail pages (future) |
| Duplicate Search Bar input implementation |

---

**End of COMPONENT_HELP_SEARCH.md**
