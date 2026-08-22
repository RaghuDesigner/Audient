# COMPONENT — FAQ Item

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-064 (FAQ Item)  
**Component name:** FAQ Item (`FaqItem`)  
**Primary use:** FAQ Accordion (`COMPONENT_FAQ_ACCORDION.md`) · Help & Support (`SCREEN-023`) · Manage Membership  
**Related:** FAQ Accordion — parent list composes multiple FAQ Items · Help Search — filters which items render · `FaqAccordionItem` type in `src/config/faq-accordion.ts`  
**Figma:** FAQ accordion row — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + disclosure patterns in `docs/ACCESSIBILITY.md`.  
> **Phase:** **Static / mock FAQ copy** — reusable across membership, pricing, and help modules.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/PRICING.md` · `docs/components/COMPONENT_FAQ_ACCORDION.md` · `docs/screens/SCREEN-023_HELP_AND_SUPPORT.md`

---

## 1. Purpose

Displays a **single expandable frequently asked question**.

One FAQ Item = one question control + one answer panel. **`FaqAccordion`** composes a list of FAQ Items; this component must **not** duplicate list/section chrome (heading, borders, multi-item keyboard roving).

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Question** | Full question text on the disclosure **button** — never empty |
| **Chevron** | Trailing expand/collapse indicator — rotates or reflects expanded state; **`aria-hidden`** |
| **Answer** | Plain-text paragraph(s) below question when expanded; links allowed |

| Rule | Spec |
|------|------|
| Layout | Full-width row; question left, chevron right |
| Touch | Question control **min-h-11** (44px) |
| Tokens | Design tokens only — no hardcoded colors |

---

## 3. Behaviour

| Action | Result |
|--------|--------|
| **Click question** | **Expand** answer (if collapsed) |
| **Click question again** | **Collapse** answer (if expanded) |
| **Enter / Space** | Same toggle when question button is focused |
| **Parent controlled** | `expanded` prop drives open state; `onToggle` notifies parent |

| Rule | Spec |
|------|------|
| Toggle | Each item toggles **independently** unless parent enforces exclusive accordion |
| Links in answer | Activate normally when expanded; do not collapse on link click |
| Analytics | Fire expand/collapse via parent or optional `module` prop — align FAQ Accordion events |

---

## 4. States

| State | Spec |
|-------|------|
| **Collapsed** | Question visible; answer **not** shown; `aria-expanded="false"` |
| **Expanded** | Answer visible; `aria-expanded="true"` |
| **Focused** | Visible focus ring on question button |

Optional (parent-driven):

| State | Spec |
|-------|------|
| **Disabled** | Question not interactive — rare; `aria-disabled` |

Loading skeleton for a single row is owned by **FAQ Accordion** — not required on FAQ Item alone.

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `id` | string | Yes | Stable faq id |
| `question` | string | Yes | Question copy |
| `answer` | string | Yes | Answer copy |
| `expanded` | boolean | Yes | Open/closed |
| `onToggle` | `(id) => void` | Yes | Toggle requested |
| `buttonId` | string | Recommended | For `aria-controls` / `aria-labelledby` pairing |
| `panelId` | string | Recommended | Answer region id |
| `module` | `membership` \| `pricing` \| `help` | No | Analytics context |
| `onKeyDown` | keyboard handler | No | Arrow navigation between siblings (parent/accordion) |
| `className` | string | No | |

Use shared `FaqAccordionItem` shape from `faq-accordion` config where possible.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Pattern | **Accordion disclosure** — one `<button>` per question |
| `aria-expanded` | `true` / `false` on question button |
| `aria-controls` | Points to answer panel `id` |
| Answer panel | `role="region"` (or equivalent) with `aria-labelledby` → question button `id` |
| DOM | Answer in tree when expanded; collapsed answers hidden (unmount or `hidden` — prefer conditional render matching current FaqAccordion) |
| Keyboard | **Tab** to question; **Enter** and **Space** toggle |
| Optional | **Arrow Up/Down** moves focus between FAQ Items in same list — handled by parent accordion |
| Focus | Visible focus ring on question button |
| Chevron | Decorative — meaning conveyed by question text + expanded state |

Do not use heading elements for the question **button** — button text is sufficient; section title remains on FAQ Accordion.

---

## 7. Analytics

Delegate to FAQ Accordion analytics or emit from toggle handler:

| Event | Trigger | Properties |
|-------|---------|------------|
| **FAQ Expanded** | Collapsed → expanded | `faqId`, `question`, `module` |
| **FAQ Collapsed** | Expanded → collapsed | `faqId`, `module` |

No PII in payloads.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full-width row inside accordion |
| **Tablet** | Same |
| **Mobile** | Full-width; min 44px question hit target; answer text wraps |

---

## 9. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **FAQ Accordion (COMPONENT-037)** | Maps `items[]` → list of `FaqItem`; owns section heading, list chrome, multi-expand policy, arrow-key roving |
| **Help Search** | Filters which items FaqAccordion renders — FAQ Item unchanged |
| **Manage Membership** | Membership module FAQs |

### Refactor note

Today FAQ row markup lives **inline** inside `FaqAccordion.tsx`. Implementing **`FaqItem`** should extract that row without changing behaviour or ARIA.

---

## 10. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `FaqAccordionItem` type · `faq-accordion` utils · typography tokens (`BodySmall` for answer) |
| Config | No separate copy file required — content from parent `items` |
| Component | `src/components/common/FaqItem.tsx` (or `src/components/faq/FaqItem.tsx`) |
| Compose | `FaqAccordion` renders `<ul><li><FaqItem … /></li></ul>` |
| Reusable | Membership · Pricing · Help — same component |
| No | Backend · CMS fetch · rich HTML answers this phase |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Question + chevron visible  
□ Click expands answer; click again collapses  
□ Collapsed / Expanded / Focused states  
□ `aria-expanded`, `aria-controls`, labelled answer region  
□ Enter and Space toggle when focused  
□ Optional Arrow Up/Down between items (accordion)  
□ WCAG 2.2 AA  
□ Reusable in membership, pricing, help  
□ FAQ Expanded / Collapsed analytics  
□ Figma match  

---

## 12. Non-goals

| Out of scope |
|--------------|
| FAQ section heading / list container |
| Exclusive vs multi-expand policy (parent accordion) |
| Help search filtering |
| Markdown/HTML rendering in answers |
| FAQ authoring UI |

---

**End of COMPONENT_FAQ_ITEM.md**
