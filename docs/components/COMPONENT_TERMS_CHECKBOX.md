# COMPONENT — Terms Checkbox

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-04  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · Legal · QA  

**Component ID:** COMPONENT-037 (Terms Checkbox)  
**Component name:** Terms Checkbox (`TermsCheckbox`)  
**Primary screen:** Checkout (`docs/screens/SCREEN-013_CHECKOUT.md`)  
**Also reusable on:** Billing & Payments (if Figma), sign-up / legal gates, credit-pack purchase confirmation  
**Related:** Privacy Notice (adjacent copy on Checkout — separate from this control) · Pay Now CTA (parent-owned)  
**Figma:** Terms acceptance control on Checkout — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + checkbox / link patterns in `COMPONENT_MAPPING.md`.  
> **Legal URLs:** Point to real Terms of Service and Privacy Policy routes/pages when available; placeholders OK in mock phase.  
> **Phase:** UI gate only — record acceptance version/timestamp when backend exists (`SECURITY.md` / compliance).

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-013_CHECKOUT.md`

---

## 1. Purpose

Ensures users **accept Terms of Service and Privacy Policy before payment**.

Reusable consent control: parent binds checked state to **Pay Now** (or equivalent) enablement.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Checkbox** | Single required acceptance control |
| **Label** | **“I agree to the Terms of Service and Privacy Policy.”** |
| **Terms Link** | “Terms of Service” within (or adjacent to) the label — opens Terms page |
| **Privacy Link** | “Privacy Policy” within (or adjacent to) the label — opens Privacy page |

| Rule | Spec |
|------|------|
| Links | Must be operable **without** toggling the checkbox (click/activate link ≠ check) |
| Open | New tab or in-app legal route per product convention; indicate external if new tab |
| Copy | Exact Figma/legal-approved string; do not invent alternate marketing copy |
| Privacy Notice | Longer SSL/PCI blurb on Checkout is **not** this component — compose beside it |

---

## 3. Behaviour

| Checkbox | Pay button (parent) |
|----------|---------------------|
| **Unchecked** | **Pay Now disabled** (or blocked on click with Validation Error) |
| **Checked** | **Pay Now enabled** (other form validity still applies) |

| Interaction | Spec |
|-------------|------|
| Toggle | Click label or checkbox toggles checked state |
| Link activate | Navigates to legal doc; does **not** auto-check |
| Uncheck after check | Re-disables Pay; may fire **Terms Rejected** |
| Parent submit without check | Show **Validation Error**; do not start checkout |

Preferred pattern: disable Pay while unchecked **and** show Validation Error if user still activates Pay (e.g. via keyboard race or if disable is delayed).

---

## 4. States

| State | Spec |
|-------|------|
| **Unchecked** | Default on Checkout entry (never pre-checked) |
| **Checked** | User accepted; Pay may enable |
| **Validation Error** | Attempted pay / continue without acceptance — inline error near checkbox |
| **Disabled** | Entire control disabled (e.g. checkout Loading, payment in flight, or read-only receipt context) |

| Rule | Spec |
|------|------|
| Pre-check | **Forbidden** — must be explicit user action |
| Persistence | Mock session may remember within flow; new checkout session starts Unchecked unless product defines resume rules |
| Error clear | Checking the box clears Validation Error |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `checked` | boolean | Yes | Controlled by parent |
| `state` | `unchecked` \| `checked` \| `validation_error` \| `disabled` | Recommended | Or derive from `checked` + `error` + `disabled` |
| `disabled` | boolean | No | |
| `errorMessage` | string \| null | Validation | e.g. “Accept the Terms of Service and Privacy Policy to continue.” |
| `termsHref` | url | Yes | Terms of Service |
| `privacyHref` | url | Yes | Privacy Policy |
| `label` | string | No | Override only with legal approval; default string above |
| `onCheckedChange` | action | Yes | Parent updates Pay enablement |
| `termsVersion` / `privacyVersion` | string | Future | For acceptance audit log |
| `id` | string | Recommended | Associate label + error |

Parent owns Pay Now `disabled={!checked \|\| …}`.

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Space/Enter toggle checkbox; Tab to checkbox and both links |
| Visible focus | On checkbox and links |
| ARIA / semantics | Native checkbox (or equivalent) with accessible name including agreement intent |
| Links | Distinct accessible names: “Terms of Service”, “Privacy Policy” |
| Error | `aria-invalid` / `aria-describedby` to error text; announce on Validation Error |
| Disabled | Conveyed to AT; not focusable if truly disabled (or focusable+readonly per platform pattern — prefer disabled + parent busy) |
| Name | Avoid “checkbox” alone — name must include agree-to-terms meaning |

---

## 7. Analytics

| Event | Trigger |
|-------|---------|
| **Terms Accepted** | Checkbox transitions to checked |
| **Terms Rejected** | Checkbox transitions from checked → unchecked |

| Rule | Spec |
|------|------|
| Not on view | Viewing alone does not fire Accepted |
| Validation Error | Optional separate event later; do not count as Rejected |
| Consent | Analytics destinations after cookie consent; acceptance **operational** log may be separate when backend exists |
| Payload (recommended) | `context` (`checkout` \| …), `termsVersion`, `privacyVersion` — no PII |

Align with SCREEN-013 **Terms Accepted**; **Terms Rejected** extends the brief for uncheck.

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Checkbox + wrapped label/links on one or two lines per Figma |
| **Tablet** | Same; comfortable tap targets |
| **Mobile** | Full-width label wrap; min 44×44 px checkbox hit target; links remain tappable without toggling |

---

## 9. Relationship to Checkout

```text
Checkout
  → Terms Checkbox (this component)
  → Privacy Notice (separate copy)
  → Pay Now (enabled only when Checked + other validity)
```

| Gate | Spec |
|------|------|
| SCREEN-013 **Terms Not Accepted** | Maps to Unchecked + Validation Error on pay attempt |
| Mock Pay Now | Still no real charge; Terms gate required regardless |

---

## 10. Security & Compliance

| Rule | Spec |
|------|------|
| Explicit consent | No pre-check; no “agree by continuing” without control if Figma shows checkbox |
| Record later | Store user id, timestamp, terms/privacy versions on successful pay / checkout start |
| Links | HTTPS legal pages; keep versions current |
| Do not | Bundle unrelated marketing opt-ins into this checkbox |

---

## 11. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Single component anywhere payment/legal gate is required |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Controlled | Parent owns checked + Pay disabled coupling |
| Links vs checkbox | Hit-testing must not toggle on link activation |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Label exact: “I agree to the Terms of Service and Privacy Policy.”  
□ Terms + Privacy links open correct pages; do not toggle checkbox  
□ Unchecked → Pay disabled; Checked → Pay enabled  
□ States: Unchecked, Checked, Validation Error, Disabled  
□ Never pre-checked on Checkout entry  
□ Analytics: Terms Accepted / Terms Rejected  
□ WCAG 2.2 AA · keyboard · ARIA / native semantics · visible focus  
□ Desktop / Tablet / Mobile tap targets  
□ Reusable; tokens only  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Full legal page content |
| Marketing email opt-in |
| Payment gateway / Stripe  
| Auto-accept on scroll |

---

**End of COMPONENT_TERMS_CHECKBOX.md**
