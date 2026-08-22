# COMPONENT — Billing Details Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-04  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · Security · QA  

**Component ID:** COMPONENT-036 (Billing Details Card)  
**Component name:** Billing Details Card (`BillingDetailsCard`)  
**Primary screens:** Billing & Payments (`docs/screens/SCREEN-012_BILLING_AND_PAYMENTS.md`) · Checkout (`docs/screens/SCREEN-013_CHECKOUT.md`)  
**Also used on:** Account Settings — Payment Details · Invoice / receipt views (read-only)  
**Related:** Checkout Summary (`COMPONENT_CHECKOUT_SUMMARY.md`) — plan snapshot; Billing Summary — money lines; this card = **customer billing identity & address**  
**Figma:** Billing information / billing details block — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + form / card patterns in `COMPONENT_MAPPING.md`.  
> **Validation:** Align with `docs/VALIDATION_RULES.md` — inline field errors, not toast-only.  
> **Phase:** Mock / client state only — no Stripe Customer sync, no Supabase persist, no API in this phase.  
> **PII:** Treat all fields as sensitive when stored later (`SECURITY.md`).

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/ERROR_HANDLING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-012_BILLING_AND_PAYMENTS.md` · `docs/screens/SCREEN-013_CHECKOUT.md`

---

## 1. Purpose

Displays **billing information entered by the customer**.

**Reusable** as:

| Mode | Surface |
|------|---------|
| **Editable** | Billing & Payments — collect / update before Proceed to Checkout |
| **Read Only** | Checkout confirmation · Payment Success · Invoice · Billing History detail |

One component — switch via `mode` / state **Read Only**, not two unrelated layouts.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Full Name** | Required — billing contact name |
| **Email Address** | Required — often prefilled from authenticated session; editable only if Figma allows (SSO email may be read-only per profile rules) |
| **Company Name** | Optional |
| **Billing Address** | Required — street / line address |
| **Country** | Required — select |
| **State** | Shown when country requires region; required when visible (product rule) |
| **Postal Code** | Shown/required per country rules when applicable |
| **Tax ID** | Optional — GST / VAT / tax identifier placeholder |

| Rule | Spec |
|------|------|
| Labels | Visible labels on all inputs (not placeholder-only) |
| Optional markers | Company Name, Tax ID marked optional in UI |
| Prefill | Mock or session email/name when available |
| Checkout | Prefer **Read Only** of values from Billing & Payments; edit via Back to Billing unless Figma shows inline edit |

---

## 3. States

| State | Spec |
|-------|------|
| **Default** | Editable form ready; no field errors |
| **Loading** | Skeleton fields or disabled inputs; `aria-busy` |
| **Validation Error** | One or more fields invalid — inline errors; focus first invalid on submit attempt |
| **Read Only** | Display values as text (or disabled inputs); no edit chrome unless parent adds “Edit” → Billing & Payments |

Parent may compose Loading while hydrating mock profile; Validation Error is field-level and/or form-level after Proceed / Pay Now gate.

---

## 4. Validation

### Required

| Field | Spec |
|-------|------|
| Full Name | Non-empty; trim whitespace |
| Email | Non-empty; valid email format |
| Address (Billing Address) | Non-empty |
| Country | Selected value required |

### Optional

| Field | Spec |
|-------|------|
| Company Name | Empty allowed |
| Tax ID | Empty allowed; if present, basic format/length check (mock rules OK until tax provider) |

### Conditional (recommended)

| Field | Spec |
|-------|------|
| State | Required when country has subdivisions and field is shown |
| Postal Code | Required when country uses postal codes and field is shown |

| Behaviour | Spec |
|-----------|------|
| Timing | Validate on blur (field) and on parent submit (Proceed to Checkout / save) |
| Messages | Inline under field; specific copy (e.g. “Enter a valid email”) |
| Block submit | Parent must not advance while Read Only=false and required invalid |
| Toast | Do not rely on toast alone for validation |

Align message tone with `VALIDATION_RULES.md` / `ERROR_HANDLING.md`.

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `default` \| `loading` \| `validation_error` \| `read_only` | Yes | Or derive validation from field errors |
| `mode` | `edit` \| `read_only` | Recommended | Maps to editable vs confirmation |
| `fullName` | string | Recommended | |
| `email` | string | Recommended | |
| `companyName` | string \| null | Optional | |
| `billingAddress` | string | Recommended | |
| `country` | string \| null | Recommended | ISO or catalog code |
| `stateRegion` | string \| null | Optional | State / province |
| `postalCode` | string \| null | Optional | |
| `taxId` | string \| null | Optional | |
| `errors` | map field → message | Validation | |
| `emailReadOnly` | boolean | No | Force email locked (SSO) |
| `onChange` | field updates | Edit | Controlled by parent |
| `onBlurValidate` | optional | Edit | |
| `countryOptions` | list | Edit | Mock country list |

No payment-method or card props.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Labels | Programmatic label for every field |
| Errors | Associated with fields (`aria-describedby` / `aria-invalid`); announced on submit |
| Keyboard | Full tab order through fields and country select |
| Visible focus | Required |
| Read Only | Still readable as text; not an empty unlabeled region |
| Optional | Indicated in accessible name or adjacent text |
| Loading | `aria-busy` on the card region |

---

## 7. Analytics

| Event | Trigger |
|-------|---------|
| **Billing Details Viewed** | Card mounts / enters viewport |
| **Billing Details Updated** | User successfully changes and commits a field set (blur-save or parent “continue” with valid form) — not every keystroke |

| Payload (recommended) | Spec |
|-----------------------|------|
| | `mode` (`edit` \| `read_only`), `hasCompany`, `hasTaxId`, `country` — **do not** send full address, tax ID, or email raw to marketing analytics |

Consent: marketing destinations only after cookie consent.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Multi-column field grid per Figma |
| **Tablet** | Reflow to fewer columns |
| **Mobile** | Single-column stack; full-width inputs |

---

## 9. Relationship to Sibling Components / Screens

| Surface | Spec |
|---------|------|
| **Billing & Payments** | Editable Billing Details Card before Proceed |
| **Checkout** | Read Only Billing Details (Name, Email, Address, Country, Tax placeholder) |
| **Checkout Summary** | Plan — not address |
| **Billing Summary** | Money totals — not identity |

Do not duplicate address inside Checkout Summary.

---

## 10. Security & Privacy

| Rule | Spec |
|------|------|
| PII | Name, email, address, tax ID are sensitive — mock local state only this phase |
| Tax ID | Never log full tax ID to analytics or client error trackers |
| Persist later | Server-side Customer / billing profile; TLS; least privilege |
| Email | Prefer SSO-linked email; avoid account-takeover via unrestricted email change (`VALIDATION_RULES` profile notes) |

---

## 11. Mock Data

| Rule | Spec |
|------|------|
| Source | Parent mock object / session stub |
| Countries | Static mock list |
| No | API persist · Stripe Customer Tax IDs · address autocomplete APIs (optional later) |

---

## 12. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Single component for edit + read-only |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Architecture | Controlled by parent; validation messages from parent or shared schema conceptually (Zod later) |
| Figma | Exact match |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ All display fields present (incl. optional Company, Tax ID)  
□ Required: Full Name, Email, Address, Country  
□ Optional: Company, Tax ID  
□ States: Default, Loading, Validation Error, Read Only  
□ Inline validation on submit/blur  
□ Checkout uses Read Only; Billing & Payments uses Edit  
□ Analytics: Viewed / Updated (no raw PII in payloads)  
□ WCAG 2.2 AA  
□ Desktop / Tablet / Mobile  
□ Mock only — no backend  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Payment method / card capture |
| Live tax calculation from Tax ID |
| Address autocomplete providers (unless Figma requires later) |
| Server persistence this phase |

---

**End of COMPONENT_BILLING_DETAILS_CARD.md**
