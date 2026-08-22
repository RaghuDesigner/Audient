# COMPONENT — FAQ Accordion

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-037 (FAQ Accordion)  
**Component name:** FAQ Accordion (`FaqAccordion`)  
**Primary screen:** Manage Membership (`docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md`)  
**Figma:** Membership FAQ accordion — **exact match**; only ship if present in Figma  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma.  
> **Content:** Sample Q&A below — replace with Figma/CMS copy when available; answers must not contradict `PRICING.md` / BUSINESS_RULES.

**Related:** `docs/PRICING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md` · `docs/components/COMPONENT_PLAN_COMPARISON_TABLE.md`

---

## 1. Purpose

Displays **membership FAQs** in an expandable list so users can resolve common billing/plan questions without leaving Manage Membership.

**Reusable** for Pricing marketing, Help, and other FAQ surfaces via different `items` props.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Question** | FAQ question text (heading/button) |
| **Answer** | Supporting answer (rich text plain paragraphs; links OK) |
| **Expand / Collapse** | Disclosure control (chevron) — one or multiple open per Figma (default: one at a time **or** multi — prefer multi unless Figma is exclusive accordion) |

Optional section title: “Frequently asked questions” per Figma.

---

## 3. Sample Questions (Manage Membership)

Use as mock content until CMS/Figma copy is final:

| Question | Answer guidance (product-aligned) |
|----------|-----------------------------------|
| **How do I upgrade?** | Use Upgrade on this page or Plan Comparison; choose Pro or Business and complete checkout (mock now; Stripe later). |
| **Can I cancel anytime?** | Yes — cancel at period end keeps access until renewal date; then Free entitlements apply (confirm final cancel policy in BUSINESS_RULES). |
| **How do credits work?** | Each screenshot/URL audit spends credits by plan (`PRICING.md`). Balance is server-authoritative. |
| **Do unused credits roll over?** | **Purchased top-up credits roll over**; monthly plan grants reset on renewal per `PRICING.md` — state clearly in the answer. |
| **Can I change to yearly billing?** | If yearly is offered in Figma/product, explain toggle; if not yet sold, answer “Coming soon” rather than inventing yearly prices. |

Do not invent Team/API features in answers.

---

## 4. States

| State | Spec |
|-------|------|
| **Collapsed** | Question visible; answer hidden |
| **Expanded** | Answer visible; `aria-expanded="true"` |
| **Loading** | Skeleton question rows while FAQ content loads |

Error (failed CMS load): parent shows Error + Retry or static fallback samples.

---

## 5. Behaviour

| Rule | Spec |
|------|------|
| Toggle | Click/Enter/Space on question row toggles that item |
| Exclusive vs multi | Follow Figma; if exclusive, opening one closes others |
| Links in answers | Real links (Upgrade deep-link, docs) when available |
| Empty | Hide FAQ section if `items.length === 0` |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `items` | `{ id, question, answer }[]` | Yes | FAQ entries |
| `state` | `loading` \| `ready` | No | |
| `allowMultiple` | boolean | No | Multi-expand; default per Figma |
| `expandedIds` | string[] | Controlled optional | |
| `onExpandedChange` | (ids) => void | Optional | |
| `heading` | string | No | Section title |
| `module` | `membership` \| `pricing` \| `help` | Analytics | |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Pattern | Accordion: button per question with **`aria-expanded`**, `aria-controls` → answer panel id |
| Keyboard | Tab to questions; Enter/Space toggle; optional Arrow keys between headers |
| Focus visible | On question controls |
| Headings | Section heading + question as button text (avoid empty buttons) |
| Answer | In the accessibility tree when expanded only (or always in DOM but hidden with `hidden`/`visibility` correctly) |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **FAQ Expanded** | Item opens | `faqId`, `question` (or slug), `module` |
| **FAQ Collapsed** | Item closes | `faqId`, `module` |

Align Manage Membership **FAQ Expanded**.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full-width accordion in membership column |
| **Tablet** | Same |
| **Mobile** | Full-width; large tap targets on question rows |

---

## 10. Reuse

| Context | Spec |
|---------|------|
| Manage Membership | Sample membership FAQs |
| Marketing Pricing | Same component, different `items` |
| Help Center | Same pattern |

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Chevron | Reflects expanded state |
| No redesign | |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Content | Static array for mock; CMS later |
| Answers | Keep consistent with PRICING / cancel policy docs |
| Yearly | Don’t invent prices in FAQ if product hasn’t set them |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Question, answer, expand/collapse  
□ Sample membership questions present in mock  
□ Collapsed / Expanded / Loading  
□ `aria-expanded` + keyboard · WCAG 2.2 AA  
□ FAQ Expanded / Collapsed analytics  
□ Desktop / tablet / mobile  
□ Reusable; Figma match; answers don’t contradict PRICING  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Full help center search |
| Live chat |
| Inventing FAQ section when absent from Figma |
| Billing form inside answers |

---

**End of COMPONENT / COMPONENT_FAQ_ACCORDION.md**
