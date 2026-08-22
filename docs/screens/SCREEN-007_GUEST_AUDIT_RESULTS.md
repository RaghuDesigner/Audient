# SCREEN-007 — Guest Audit Results (Limited Preview)

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Growth · QA  

**Screen ID:** SCREEN-007 (product brief) · Guest variant of **SCREEN-M02** (Audit Report / Result)  
**Screen name:** Guest Audit Results (Limited Preview)  
**Prior screens:** Audit Completed (`SCREEN-004_AUDIT_COMPLETED.md`) or Audit Processing → Completed  
**Figma:** Approved Guest Results / limited report frame — **exact match required**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING.md` currently uses **SCREEN-007** for the **Payment Failed Modal**. This document is the **Guest limited results** surface. Prefer mapping as **M02-guest** / renumber when consolidating. Do not confuse with payment failure UI.  
> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `COMPONENT_MAPPING.md`.  
> **Pricing authority:** `docs/PRICING.md` — Pro **$29**/1,000 · Business **$99**/10,000 · Guest **1** screenshot · brief report only · PDF gated.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `docs/ANALYTICS.md` · `STATE_MANAGEMENT.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/screens/SCREEN-004_AUDIT_COMPLETED.md` · `docs/components/LOGIN_MODAL.md` · `BUSINESS_RULES.md`

---

## 1. Purpose

This screen displays a **limited preview** of the completed UX audit for **Guest Users**.

| Primary goal | Spec |
|--------------|------|
| Not | Show the entire report |
| Yes | Convince the user that upgrading to **Pro** or **Business** provides significant value |

The design must **exactly match the approved Figma**. No redesign, no invented sections, no spacing/typography/color changes outside tokens that implement Figma.

---

## 2. Business Goals

| Goal | How this screen supports it |
|------|-----------------------------|
| Increase **Guest → Pro** conversion | Tease score + top findings; lock the rest; Upgrade to Pro CTA |
| Increase **Guest → Login** conversion | History locked → Login Modal; post-login claim of guest audit |
| Increase **Pro subscription** rate | Clear Guest vs Pro vs Business comparison + PDF lock → Upgrade |

Aligns with PRD free/guest teaser → paid funnel and `PRICING.md` feature gates (brief summary only; full report + PDF for Pro/Business).

---

## 3. User Goals

| Goal | Spec |
|------|------|
| Understand website quality | Overall score, grade, short summary, five category scores |
| Trust Audient | Real top 3 findings with severity + copy |
| See upgrade value | Locked findings count, locked recommendations, plan comparison, locked PDF |

---

## 4. User Type

| Type | Spec |
|------|------|
| **Guest** | Only audience for this limited-preview variant |
| Authenticated Free / Pro | Use Free-brief or full Results (separate variants of M02) — **not** this guest conversion layout unless product reuses sections carefully |

---

## 5. Layout

| Rule | Spec |
|------|------|
| Shell | **Reuse the existing application shell** (same as Home / Processing) |
| Header | **Unchanged** — logo, tagline, credits teaser, guest avatar |
| Main | **Replace Processing section with Results** content |
| Figma | Pixel-perfect spacing and hierarchy |

Do not add Features/FAQ or other marketing sections not in the Results Figma.

---

## 6. Entry / Exit

### 6.1 Entry

```text
Guest audit COMPLETED
        → Audit Completed interstitial (optional, 2–3s)
        → Guest Audit Results (this screen)
```

| Prerequisite | Spec |
|--------------|------|
| Session | Guest (anonymous) |
| Audit | Completed screenshot teaser audit |
| Data | Preview payload (mock in Phase 1; API later) |

Fire **Results Viewed** (`report_viewed` with `tier: guest` / `preview: true`).

### 6.2 Exit

| Action | Destination |
|--------|-------------|
| Upgrade to Pro | Upgrade Modal / Manage Plan subscribe path (M08 → pricing/checkout) |
| View Business Plans | Business plan focus (Manage Plan / pricing) — may require Login first if checkout needs account |
| Locked PDF | Upgrade Modal |
| Locked History (header or in-page) | Login Modal |
| Locked cards / recommendations CTA | Upgrade Modal (or Login then Upgrade — prefer Upgrade for paid value; Login if action requires account first) |
| Avatar → Login | Guest Profile Dropdown → Login Modal (`PROFILE_DROPDOWN_GUEST` / COMPONENT-002) |
| New audit (if shown) | Home — guest quota may be exhausted → Login / Upgrade per `PRICING.md` |

---

## 7. Components

### 7.1 Overall UX Score

| Element | Spec |
|---------|------|
| Large Score | Overall UX score (0–100) as text + gauge per Figma / `ScoreCard` |
| Overall Grade | Letter or band label per Figma (e.g. B / Good — match design) |
| Short Summary | Brief plain-language summary (Guest/Free depth) |

A11y: score as text (e.g. “Overall UX score 72 out of 100”); gauge not sole channel (`ACCESSIBILITY.md`).

### 7.2 Category Scores

Display **only** these five categories:

| Category |
|----------|
| Accessibility |
| Usability |
| Visual Design |
| Performance |
| SEO |

Each category displays:

| Element | Spec |
|---------|------|
| Score | Numeric |
| Status | Text status (e.g. Good / Needs work — per Figma) |
| Small icon | Per category / Figma |

### 7.3 Top Findings

| Rule | Spec |
|------|------|
| Count | **Only the top 3** findings |
| Per finding | **Severity** · **Title** · **Short Description** · **Thumbnail** (optional) |
| Components | `SeverityBadge`, issue/finding card patterns from `COMPONENT_MAPPING.md` |

Do not list the full findings set for guests.

### 7.4 Locked Findings

| Rule | Spec |
|------|------|
| Teaser copy | **“37 More Findings Available”** (or Figma count — if API provides `lockedCount`, display that number; mock may use 37) |
| Visual | **Blurred cards** |
| Icon | **Lock** icon |
| Content | **Do not reveal** titles, descriptions, or severities of locked items |
| Security | Blur is UX only — **server must not send** locked finding payloads to guests (`SECURITY.md` tier gating). Client must not embed full report JSON in the page for “blur CSS” alone. |

Click on locked area → treat as **Locked Card Clicked** → Upgrade Modal (default).

### 7.5 AI Recommendation Preview

| Rule | Spec |
|------|------|
| Count | **One** recommendation only |
| Length | **2–3 lines** max |
| Upsell | **“Unlock 24 more AI recommendations”** (or API `lockedRecommendationsCount`; mock may use 24) |
| Interaction | Upsell / lock click → Upgrade Modal |

### 7.6 Upgrade Banner

| Rule | Spec |
|------|------|
| Presentation | **Large section** per Figma |
| Compare | **Guest** · **Pro** · **Business** |
| Prices / credits | Follow **`PRICING.md`** ($29 Pro / $99 Business) if Figma shows stale $99/$199 — update **labels only**, keep layout |
| Primary CTA | **Upgrade to Pro** |
| Secondary CTA | **View Business Plans** |

### 7.7 Download PDF

| Rule | Spec |
|------|------|
| Visibility | **Visible but locked** |
| Click | Opens **Upgrade Modal** (not a real download) |
| Server | PDF endpoint must **403** for guests even if URL guessed (`SECURITY.md`) |
| Analytics | **PDF Clicked** |

### 7.8 History

| Rule | Spec |
|------|------|
| Visibility | **Visible but locked** (header menu and/or in-page control per Figma) |
| Click | Opens **Login Modal** |
| Analytics | **Login Clicked** (with `source: history_lock` or equivalent) |

---

## 8. Modals / Overlays

| Trigger | Opens |
|---------|--------|
| Upgrade to Pro / PDF / locked findings / recommendation unlock | **Upgrade Modal** (SCREEN-M08 / `UpgradeDialog`) |
| View Business Plans | Business-focused pricing / Manage Plan (Login first if required) |
| History lock / explicit Login | **Login Modal** (COMPONENT-002) |
| Guest avatar | Guest Profile Dropdown → Login |

After successful login: claim guest audit; resume intent (fuller Free brief or continue to Upgrade for PDF/Pro).

---

## 9. Analytics

| Event (brief) | Canonical / notes |
|---------------|-------------------|
| **Results Viewed** | `report_viewed` — `tier: guest`, `preview: true`, `auditId` |
| **Upgrade Clicked** | Upgrade to Pro / upgrade CTA — `source: guest_results` |
| **Login Clicked** | History lock or Login from this screen |
| **Locked Card Clicked** | Locked findings / blurred card / lock icon |
| **PDF Clicked** | Locked PDF control (`pdf` gate; not `pdf_downloaded`) |
| **Business Plan Clicked** | View Business Plans |

Align property names with `ANALYTICS.md`. Use `anonymous_id` until login alias.

---

## 10. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | All interactive controls operable; locked controls still focusable with clear “locked / upgrade required” names |
| ARIA labels | Score, categories, findings, locked regions, PDF, History, Upgrade CTAs |
| Screen reader | Announce preview nature; locked regions must **not** expose blurred text via accessible name (use “Locked findings, upgrade to unlock” — not hidden full copy) |
| Focus visible | Required |
| Score | Text + optional decorative gauge |
| Modals | Focus trap per Login / Upgrade specs |

---

## 11. Security

| Rule | Spec |
|------|------|
| Tier gating | Enforced **server-side** — UI locks are not sufficient (`SECURITY.md`) |
| Preview API | Guest report endpoint returns **only** allowed preview fields (score, categories, top 3, one recommendation, counts) |
| No leakage | Full findings/recommendations/PDF must not ship in client bundle or network for guests |
| Ownership | Guest audit scoped to anonymous session; claim on login; no cross-user access (404) |
| PDF | Signed URL never issued to guests |

---

## 12. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Match Figma |
| Tablet | Maintain hierarchy; Figma spacing |
| Mobile | Maintain hierarchy; stack score → categories → findings → locks → banner; Figma spacing |

---

## 13. States

| State | Behaviour |
|-------|-----------|
| Loading | Skeleton in results band (header unchanged) |
| Ready | Preview content + locks + upgrade banner |
| Empty / missing audit | Error / return Home — do not show fake locks over nothing |
| Upgrade / Login open | Overlay; results remain underneath |
| Offline | Banner; CTAs that need network explained |

Map to `RPT-STATE-002` brief/guest gating notes in `STATE_MANAGEMENT.md`.

---

## 14. Developer Notes

| Rule | Spec |
|------|------|
| Phase 1 | **Mock audit data** driving score, 3 findings, 1 recommendation, lock counts (37 / 24) |
| Phase 2 | Replace mock with guest-scoped preview API; keep layout identical |
| Reuse | `ScoreCard`, `SeverityBadge`, finding/recommendation cards, `UpgradeDialog`, Login Modal — composed to Figma, not redesigned |
| Counts | Prefer server-provided `lockedFindingsCount` / `lockedRecommendationsCount`; mocks may hardcode 37 and 24 to match Figma copy |
| Free vs Guest | Guest screen emphasizes conversion; Free brief may share components but different CTAs — do not silently give guests Pro payload |

**Do not generate implementation code in this document.**

---

## 15. Navigation Summary

```text
Audit Completed
        ↓
Guest Audit Results (limited preview)
        ├─ Upgrade to Pro     → Upgrade Modal → checkout
        ├─ View Business Plans → Business pricing
        ├─ PDF (locked)       → Upgrade Modal
        ├─ History (locked)   → Login Modal
        └─ Locked cards       → Upgrade Modal
```

---

## 16. QA Checklist

□ Figma visual match (spacing, type, hierarchy)  
□ Header unchanged; Processing replaced by Results  
□ Overall score + grade + summary  
□ Five categories only with score, status, icon  
□ Exactly 3 findings visible with severity/title/description  
□ Locked findings: “37 More…” (or API count), blur, lock, **no revealed content**  
□ One recommendation (2–3 lines) + “Unlock 24 more…”  
□ Upgrade banner: Guest / Pro / Business; Upgrade to Pro; View Business Plans  
□ PDF locked → Upgrade Modal; History locked → Login Modal  
□ Network tab: no full report JSON for guest  
□ Analytics events fire  
□ Keyboard + WCAG 2.2 AA; SR does not read “blurred” secrets  
□ Mock data works; API-ready field contract documented in implementation later  

---

## 17. Non-goals

| Out of scope |
|--------------|
| Full Pro report |
| Real PDF download for guests |
| Guest History list |
| Payment Failed Modal (other SCREEN-007 in mapping) |
| Redesign away from Figma |

---

**End of SCREEN-007 / SCREEN-007_GUEST_AUDIT_RESULTS.md**
