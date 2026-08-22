# SCREEN-017 — Invoice History

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-09  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Billing · Security · QA  

**Screen ID:** SCREEN-017 (product brief)  
**Canonical mapping:** Billing invoices / payment records · related **SCREEN-M06** Billing Management / Invoices in `SCREEN_MAPPING.md`  
**Screen name:** Invoice History  
**Figma:** Invoice history / billing invoices frames — **exact match**  
**Priority:** P1  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` reserved **SCREEN-017** for **404 Not Found** backlog. This document is **Invoice History**. Renumber when consolidating.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Phase:** **Mocked invoice records only** — **no Stripe**, **no Supabase**, **no backend API**, **no real invoice retrieval**, **no actual PDF generation**.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/VALIDATION_RULES.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/screens/SCREEN-011_MANAGE_MEMBERSHIP.md` · `docs/screens/SCREEN-012_BILLING_AND_PAYMENTS.md` · `docs/screens/SCREEN-015_PAYMENT_SUCCESS.md` · `docs/components/COMPONENT_BILLING_SUMMARY.md` · `docs/components/COMPONENT_CHECKOUT_SUMMARY.md` · `docs/components/COMPONENT_BILLING_DETAILS_CARD.md`

---

## 1. Purpose

Allows **authenticated users** to view previous **subscription invoices** and **payment records**.

Accessible from:

| Source | Spec |
|--------|------|
| **Manage Membership** | Via Billing Summary → Invoice History |
| **Billing & Payments** | Link / breadcrumb path |
| **Payment Success** | **View Invoice** → Invoice History (or detail deep-link within history) |
| **Account Settings** | Billing / invoices entry when Figma provides it |

The UI must **match the approved Figma exactly**.

---

## 2. Entry Points

```text
Manage Membership
        ↓
Billing Summary
        ↓
Invoice History

Payment Success
        ↓
View Invoice
        ↓
Invoice History
```

Also: Billing & Payments → invoices link; Account Settings → invoices.

| Prerequisite | Spec |
|--------------|------|
| Auth | Required — Guest → **Login**; resume intent → Invoice History after auth |

---

## 3. Layout

```text
Application Header
        ↓
Breadcrumb
        ↓
Page Title
  "Invoice History"
        ↓
Billing Summary
        ↓
Search
        ↓
Filters
        ↓
Invoice Table
        ↓
Pagination
```

| Rule | Spec |
|------|------|
| Shell | Authenticated app shell |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Title | **Invoice History** |

### Breadcrumb (recommended)

```text
Dashboard > Manage Membership > Invoice History
```

Or `… > Billing & Payments > Invoice History` depending on entry.

---

## 4. Billing Summary

Display:

| Field | Spec |
|-------|------|
| **Current Plan** | Free / Pro / Business |
| **Current Billing Cycle** | Monthly / Yearly / N/A for Free |
| **Next Billing Date** | Renewal / next invoice date (N/A for Free) |
| **Current Subscription Cost** | Price for cycle (`PRICING.md`) |

**Reuse** `COMPONENT_BILLING_SUMMARY` / Billing Summary block where appropriate — do not invent a second billing summary component with conflicting fields.

---

## 5. Search

Users may search invoices by:

| Criterion | Spec |
|-----------|------|
| **Invoice Number** | Partial/exact match against mock numbers (e.g. `INV-2026-001`) |
| **Plan** | Match plan name / tier label |

| Behaviour | Spec |
|-----------|------|
| Debounce | Client debounce or on submit per Figma |
| Empty query | Show full (filtered) list |
| No matches | Empty search results message (distinct from never-paid Empty State) |
| Validation | Safe string length; no special security-sensitive parsing (VALIDATION_RULES tone) |
| Analytics | **Invoice Search** |

---

## 6. Filters

| Filter | Spec |
|--------|------|
| **Date** | Range or period picker (mock) |
| **Plan** | Free credit packs / Pro / Business / All (whatever catalog appears in mock invoices) |
| **Status** | Paid · Pending · Failed · Refunded · All |

| Behaviour | Spec |
|-----------|------|
| Combine | Search + filters AND together |
| Clear | Clear filters control when any filter active |
| Analytics | **Invoice Filter Used** (include filter type) |

---

## 7. Invoice Table

| Column | Spec |
|--------|------|
| **Invoice Number** | e.g. INV-2026-001 |
| **Date** | Invoice / charge date |
| **Plan** | Plan purchased or billed |
| **Billing Cycle** | Monthly / Yearly / One-time (credit packs if present) |
| **Amount** | Amount + currency |
| **Status** | See §8 |
| **Actions** | View Invoice · Download PDF |

| Rule | Spec |
|------|------|
| Sort | Default newest first; column sort if Figma |
| Row | Whole-row open View optional; keep Actions keyboard-accessible |
| Security | Only current user’s mock invoices — never other users’ data |

---

## 8. Status

| Status | Spec |
|--------|------|
| **Paid** | Successful payment |
| **Pending** | In flight / awaiting confirmation (mock) |
| **Failed** | Charge did not complete |
| **Refunded** | Refunded (mock) |

Status conveyed with **text label** (badge ok) — not color alone.

---

## 9. Actions

| Action | Spec |
|--------|------|
| **View Invoice** | Open **modal** or **details view** with Invoice Details (§10) |
| **Download PDF** | **Placeholder only** — no real PDF generation |

| Download placeholder | Spec |
|----------------------|------|
| Click | Toast or inline “PDF download coming soon” / no-op with disabled styling if product prefers |
| Analytics | **Invoice Download Clicked** always fire on click (even placeholder) |
| Future | Stripe invoice PDF URL or server-generated PDF |

---

## 10. Invoice Details

For the **initial frontend** implementation, View Invoice opens a **modal** or **details panel**.

Display:

| Field | Spec |
|-------|------|
| Invoice Number | |
| Invoice Date | |
| Customer | Name / email from mock billing profile |
| Plan | |
| Billing Cycle | |
| Subtotal | |
| Discount | |
| Tax | |
| Total | |
| Payment Status | Paid / Pending / Failed / Refunded |

| Rule | Spec |
|------|------|
| Reuse | Align field naming with payment/order summaries; optional Checkout Summary for plan block |
| PII | Customer fields from user-owned mock only |
| Close | Esc / close control; focus return to trigger |
| Analytics | **Invoice Viewed** |

---

## 11. PDF

**Download PDF** is a **placeholder**.

| Rule | Spec |
|------|------|
| Do not | Implement actual PDF generation yet |
| Do not | Call Stripe invoice PDF endpoints yet |

---

## 12. Empty State

| Element | Spec |
|---------|------|
| **Message** | **No invoices yet** |
| **Supporting** | **Your invoices will appear here after your first payment.** |
| **CTA** | **Manage Membership** |

Hide table chrome or show title + empty region per Figma. Billing Summary may still show current plan.

Distinguish **no invoices ever** from **search/filter yields zero** (“No invoices match your filters.” + Clear filters).

---

## 13. Loading State

| Spec | Detail |
|------|--------|
| UI | **Skeleton rows** (and skeleton Billing Summary if needed) |
| a11y | `aria-busy` on region |

---

## 14. Error State

| Element | Spec |
|---------|------|
| **Message** | **Unable to load invoices.** |
| **Actions** | **Retry** · **Back to Billing** |

Back to Billing → Manage Membership or Billing & Payments. No fake empty list presented as truth on hard error.

---

## 15. Membership Rules

| Tier | Spec |
|------|------|
| **Guest** | **Redirect to Login** |
| **Free** | Show Invoice History if user has **previous purchases** (past subscription or credit packs); otherwise Empty State |
| **Pro** | Full invoice history (mock) |
| **Business** | Full invoice history (mock) |

Failed payment attempts may appear as **Failed** rows if product includes them in mock history; optional — keep consistent with Payment Failure not creating invoices unless mock says so.

---

## 16. Pagination

| Spec | Detail |
|------|--------|
| Control | Page numbers or prev/next per Figma |
| Page size | Mock (e.g. 10) |
| Preserve | Filters/search across pages |
| a11y | Labeled pagination controls |

---

## 17. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Search, filters, table actions, pagination, modal |
| Table | Proper table headers / or card list with headings on mobile |
| Screen reader | Status labels; action buttons named with invoice number context |
| Visible focus | Required |
| Modal details | Dialog semantics; focus trap; return focus |
| Download | Disabled/placeholder announced clearly |

---

## 18. Analytics

| Event | Trigger |
|-------|---------|
| **Invoice History Viewed** | Screen open |
| **Invoice Search** | Search executed / committed |
| **Invoice Filter Used** | Filter applied |
| **Invoice Viewed** | View Invoice / details open |
| **Invoice Download Clicked** | Download PDF (placeholder included) |

No full invoice body or tax IDs in marketing analytics payloads.

---

## 19. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full invoice **table** |
| **Tablet** | Table or condensed columns per Figma |
| **Mobile** | Convert table rows into **responsive invoice cards** |

Card content: number, date, plan, amount, status, View / Download actions.

---

## 20. Mock Data

| Rule | Spec |
|------|------|
| Source | Static mocked invoice records only |
| Examples | **INV-2026-001**, **INV-2026-002**, **INV-2026-003** |
| Variety | Mix Paid / Pending / Failed / Refunded for UI QA |
| Amounts | Align with Pro/Business mock purchases and optional credit packs |
| No | Stripe Customer invoices · Supabase · API retrieval · real PDFs |

---

## 21. Security

| Rule | Spec |
|------|------|
| Authz | Authenticated user sees **only own** invoices (mock filtered by session user id) |
| PII | Customer fields on details are sensitive when real |
| PDF placeholder | Must not leak unsigned URLs to other users later |
| Guest | Login gate |

---

## 22. Navigation Summary

```text
Manage Membership / Billing / Payment Success / Settings
        ↓
Invoice History (017)
        ├─ View Invoice → modal / details
        ├─ Download PDF → placeholder
        ├─ Empty CTA → Manage Membership
        └─ Error → Retry / Back to Billing
```

---

## 23. Developer Notes

| Rule | Spec |
|------|------|
| Data | Mock only |
| No | Stripe · Supabase · backend API · real invoice retrieval · actual PDF |
| Reuse | BillingSummary; table/card patterns; pagination; empty/error shells |
| Tokens | Design tokens only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 24. QA Checklist

□ Entry from Manage Membership, Billing & Payments, Payment Success, Account Settings  
□ Title Invoice History + breadcrumb  
□ Billing Summary fields; reuses BillingSummary  
□ Search by invoice number and plan  
□ Filters: date, plan, status  
□ Table columns + status enum  
□ View Invoice details fields  
□ Download PDF placeholder only  
□ Empty / Loading skeletons / Error + Retry  
□ Guest → Login; Free/Pro/Business rules  
□ Pagination  
□ Mobile invoice cards  
□ Mock INV-2026-001…  
□ Analytics five events  
□ WCAG 2.2 AA · table/cards accessible  
□ No Stripe/Supabase/API/PDF generation  

---

## 25. Non-goals (this phase)

| Out of scope |
|--------------|
| Stripe Invoice / Charge API sync |
| Real PDF generation or email receipts |
| Cross-account invoice access |
| Editing or voiding invoices |
| Tax authority e-invoicing |

---

**End of SCREEN-017 / SCREEN-017_INVOICE_HISTORY.md**
