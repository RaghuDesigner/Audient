# COMPONENT-019 — AI Tips Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-019  
**Component name:** AI Tips Card (`AiTipsCard`)  
**Screen:** Authenticated Dashboard — AI Tips (`SCREEN-008_AUTHENTICATED_DASHBOARD.md`)  
**Figma:** AI tip / insight card — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/screens/SCREEN-008_AUTHENTICATED_DASHBOARD.md` · `docs/ACCESSIBILITY.md` · `docs/DESIGN_TOKENS.md` · `docs/ANALYTICS.md` · `docs/COMPONENT_MAPPING.md` · `docs/prd.md`

---

## 1. Purpose

Display **helpful AI tips** — short product or UX insights that educate users and reinforce Audient’s value without blocking core workflows.

Shows **one tip at a time** on the Dashboard (rotating catalog). Supplementary content — never the only channel for credits, errors, or audit status.

**Do not redesign.** Match Figma.

---

## 2. Content Categories

Tips are tagged by category for rotation / filtering:

| Category | Focus |
|----------|--------|
| **UX Tips** | Usability, hierarchy, CTAs, flows |
| **Accessibility Tips** | WCAG-oriented practices, inclusive design |
| **SEO Tips** | Content clarity, structure, discoverability (UX-relevant SEO) |
| **Performance Tips** | Perceived speed, weight, mobile experience |

| Rule | Spec |
|------|------|
| Mix | Rotate across categories over time; do not show only one category forever |
| Tone | Plain language for SMB owners (PRD) — actionable, not jargon-heavy |
| Length | Description fits card (≈2–4 lines); full detail via **Read More** |
| Source | Curated tip catalog (CMS/config/static JSON) — not live model hallucinations on Dashboard |

---

## 3. Display

| Element | Spec |
|---------|------|
| **Title** | Tip headline |
| **Description** | Short body copy |
| **Illustration** | Decorative image/icon per tip or category (Figma) |
| **Read More** | Link/button to expand in-card, open tip detail, or help article per product IA |

Optional (if Figma): category chip (UX / Accessibility / SEO / Performance).

---

## 4. States

| State | Spec |
|-------|------|
| **Loading** | Skeleton for illustration, title, description, Read More; `aria-busy` |
| **Success** | Tip content visible; rotation enabled per §5 |
| **Error** | Friendly fallback (“Tips unavailable”) + Retry; or hide card — do not show broken image + empty text |

---

## 5. Behaviour

| Behaviour | Spec |
|-----------|------|
| Default | Show one tip (Success) |
| Rotation | Advance to next tip on interval and/or Next control if Figma provides one |
| **Reduced motion** | Auto-rotate **off**; show static tip; manual Next/Read More still OK (`ACCESSIBILITY.md`) |
| Pause | Pause auto-rotate on hover/focus when auto-rotate is on |
| Read More | Expand disclosure **or** navigate to article — match Figma; use `aria-expanded` if disclosure |
| Empty catalog | Treat as Error / hide widget |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `loading` \| `success` \| `error` | Yes | Card state |
| `tipId` | string | Success | Stable tip id |
| `category` | `ux` \| `accessibility` \| `seo` \| `performance` | Success | Content category |
| `title` | string | Success | Title |
| `description` | string | Success | Description |
| `illustration` | url \| icon id \| null | Optional | Illustration |
| `readMoreHref` | string \| null | Optional | External/help link |
| `readMoreMode` | `link` \| `expand` | No | Read More behaviour |
| `expanded` | boolean | If expand | Disclosure state |
| `onReadMore` | action | Recommended | Read More handler |
| `onRetry` | action | Error | Retry load |
| `onNext` | action | Optional | Manual advance |
| `autoRotate` | boolean | No | Default true; force false under reduced motion |

Parent may pass a single tip or a list + index for rotation.

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Structure | Heading/title + description; category announced if shown |
| Illustration | Decorative `alt=""` / `aria-hidden` unless it conveys unique meaning |
| Read More | Clear name (“Read more about {title}”) |
| Expand | `aria-expanded` when in-card disclosure |
| Live region | If tip auto-changes, **polite** update throttled — or prefer manual Next to avoid SR spam |
| Reduced motion | No essential info only in animation; auto-rotate disabled |
| Keyboard | Read More / Next / Retry operable; focus visible |
| Error | Alert or status text + Retry |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `ai_tip_impressed` | Tip shown (dedupe per tipId/session) | `tipId`, `category` |
| `ai_tip_read_more_clicked` | Read More | `tipId`, `category` |
| `ai_tip_next_clicked` | Manual next | `tipId` |
| `ai_tip_error` | Error state | `reason` |

---

## 9. Reuse

| Context | Spec |
|---------|------|
| Authenticated Dashboard | Primary — one card |
| Results / empty states | Optional reuse of same tip card |
| Free / Pro / Business | Same component; tips need not be tier-gated unless product wants Pro-only tips later |

**Reusable** across categories via `category` + content props — not four separate tip components.

---

## 10. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Illustration | Per Figma; consistent card chrome across categories |
| No redesign | Spacing/type per Figma |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Content | Static/config catalog in Phase 1; optional CMS later |
| Not LLM | Do not call the audit model to invent Dashboard tips each load |
| Rotation | Client-side index or server “tip of day” |
| Phase 1 | Mock 4+ tips across categories |
| Phase 2 | Persist “dismissed” / last tip index if product requires |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Title, description, illustration, Read More  
□ Categories: UX, Accessibility, SEO, Performance represented in catalog  
□ Loading / Success / Error + Retry  
□ Auto-rotate pauses on focus/hover; off under reduced motion  
□ Read More expand or link works with a11y  
□ WCAG 2.2 AA  
□ Analytics impress + read more  
□ Reusable; Figma match  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Full help center |
| Audit findings (Finding Card) |
| Live AI chat |
| Blocking CTAs for billing/errors |

---

**End of COMPONENT-019 / COMPONENT_AI_TIPS_CARD.md**
