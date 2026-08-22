# COMPONENT — Contact Support Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-065 (Contact Support Card)  
**Component name:** Contact Support Card (`ContactSupportCard`)  
**Primary screen:** Help & Support (`docs/screens/SCREEN-023_HELP_AND_SUPPORT.md`)  
**Related:** Contact Support Modal (`ContactSupportModal`) — approved mock contact flow · Help Search — no-results recovery CTA · Support Requests empty state — reuses same handler · Login Modal — guest path  
**Figma:** Help & Support “Still need help?” band — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Card / CTA patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock contact flow only** — **no external helpdesk** (Zendesk, Intercom, Freshdesk), **no backend**, **no email pipeline**.

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-023_HELP_AND_SUPPORT.md` · `src/config/help-support-screen.ts`

---

## 1. Purpose

Encourages users to **contact Audient support** when self-service help is insufficient.

Prominent call-to-action band on Help & Support — and reusable anywhere a support escalation affordance is needed (e.g. search no-results, empty support requests).

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Heading** | **Still need help?** |
| **Description** | Supporting line — default: *“Our team typically responds within one business day.”* (Figma exact copy) |
| **Primary CTA** | **Contact Support** — primary `Button` |

| Layout | Spec |
|--------|------|
| **Container** | Rounded surface band / Card — token border + background |
| **Desktop** | Heading + description left; CTA right (inline row) |
| **Mobile** | Stacked — full-width CTA; min **44px** hit target |

Align copy with `HELP_SUPPORT_COPY.contactHeading`, `contactDescription`, `contactCta` in `help-support-screen.ts`.

---

## 3. Behaviour

| User | Action on CTA |
|------|----------------|
| **Authenticated** | Opens approved **Contact Support** flow — `ContactSupportModal` (subject + message form; mock submit → toast) |
| **Guest** | Opens **Login Modal** with return intent to `/help` **or** same public stub per Figma — **no real ticket** |

| Rule | Spec |
|------|------|
| Flow | Component emits `onContactSupport` — parent wires modal vs login |
| Mock only | Submit shows confirmation toast; optional append to mock ticket list on Help screen |
| Backend | **No** API, Supabase, Zendesk, Intercom, Freshdesk, mailto-only production path unless Figma specifies guest stub |
| Idempotency | CTA remains available after modal close |

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | Heading, description, enabled CTA |
| **Hover / Focus / Pressed** | Via design-system Button |
| **Disabled** | Optional — parent loading; CTA disabled + `aria-disabled` |
| **Loading** | Optional — rare; CTA `isLoading` while parent prepares modal |

Card itself has no async loading state this phase.

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `onContactSupport` | action | Yes | CTA activated — parent opens modal or login |
| `heading` | string | No | Override “Still need help?” |
| `description` | string | No | Override body copy |
| `ctaLabel` | string | No | Override “Contact Support” |
| `disabled` | boolean | No | Disable CTA |
| `fullWidthCta` | boolean | No | Mobile stacked layout (default responsive) |
| `className` | string | No | |

Parent owns modal open state and guest vs auth routing.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Heading | Semantic heading (`h2` in section context) — **“Still need help?”** |
| CTA | Keyboard activatable; visible focus ring |
| Description | Associated with section — visible text, not `aria-hidden` |
| Color | CTA label readable — not icon-only |
| Touch | Min 44px button height on mobile |

---

## 7. Analytics

Align with SCREEN-023 **Support Contact Clicked**:

| Event | Trigger | Properties |
|-------|---------|------------|
| **Support Contact Clicked** | CTA activate | `source: help_screen` (or prop override), `isGuest` |

Fire from parent or component via `help-support-events` — dev stub only.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Horizontal band — text block + CTA end-aligned |
| **Tablet** | Same or stacked per Figma |
| **Mobile** | Column stack; full-width primary button |

---

## 9. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Contact Support Modal** | Authenticated flow destination — form + mock submit |
| **Help Support Screen** | Primary placement below FAQ |
| **Help Search** | Inline no-results link may call same `onContactSupport` |
| **Empty State (support requests)** | Primary CTA reuses same handler |
| **Card (ui)** | Optional wrapper — or bordered `section` per Figma |

### Refactor note

Today contact band markup is **inline** in `HelpSupportScreen.tsx`. Extract into **`ContactSupportCard`** without changing copy or behaviour.

---

## 10. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `HELP_SUPPORT_COPY` · primary `Button` · `ContactSupportModal` |
| Config | `src/config/contact-support-card.ts` — optional thin copy re-exports |
| Component | `src/components/help/ContactSupportCard.tsx` |
| No | External helpdesk embed · real email send · Supabase tickets |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Heading: “Still need help?”  
□ Description visible  
□ CTA: “Contact Support”  
□ Authenticated → Contact Support modal  
□ Guest → Login or public stub per product  
□ Mock submit only — no helpdesk  
□ Support Contact Clicked analytics  
□ WCAG 2.2 AA — keyboard + focus  
□ Desktop / tablet / mobile layout  
□ Reusable from search no-results and empty requests  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Contact form fields (modal owns form) |
| Live chat widget |
| Zendesk / Intercom / Freshdesk integration |
| Phone / mailto as sole production path without product sign-off |
| Support ticket list |

---

**End of COMPONENT_CONTACT_SUPPORT_CARD.md**
