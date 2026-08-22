# COMPONENT-016 — Recent Audit Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-016  
**Component name:** Recent Audit Card (`RecentAuditCard`)  
**Screen:** Authenticated Dashboard — Recent Audits (`SCREEN-008_AUTHENTICATED_DASHBOARD.md`); reusable on History list rows when Figma shares the pattern  
**Figma:** Recent audit / history preview cards — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/screens/SCREEN-008_AUTHENTICATED_DASHBOARD.md` · `docs/components/COMPONENT_OVERALL_SCORE_CARD.md` · `docs/components/COMPONENT_FINDING_CARD.md` · `docs/screens/SCREEN-003_AUDIT_FAILED.md` · `docs/screens/SCREEN-002_AUDIT_PROCESSING.md` · `docs/COMPONENT_MAPPING.md` · `docs/DESIGN_TOKENS.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/PRICING.md`

---

## 1. Purpose

Display a **previous audit** as a compact card so users can recognize the site, see score/status at a glance, and open the report (or follow status).

Primary use: **latest audits** on the Authenticated Dashboard (parent shows up to **5**). Same component may back History list items when layout matches Figma.

**Do not redesign.** Match Figma.

---

## 2. Fields

| Field | Spec |
|-------|------|
| **Website** | Site name, hostname, or page title under audit |
| **Thumbnail** | Screenshot / preview image; placeholder when missing |
| **Overall Score** | 0–100 when available (Completed); hide or “—” while Processing; omit fake scores on Failed unless a partial score exists |
| **Audit Date** | Localized created/completed date (Figma format) |
| **Audit Status** | Text + badge: Processing / Completed / Failed (and Cancelled if product shows it) |
| **Plan Used** | Free / Pro / Business (tier at time of audit, if stored) |
| **Open Report Button** | Primary action when report is available; label per Figma (e.g. Open Report) |

---

## 3. States

| State | Spec |
|-------|------|
| **Loading** | Skeleton: thumbnail, title, score, meta, button |
| **Empty** | Not a single-card state — parent shows dashboard empty (“No audits yet.”). Card itself is omitted when there is no audit |
| **Completed** | Score + Open Report enabled → Results / report |
| **Failed** | Status Failed; CTA becomes **View details** / Retry per Figma → Audit Failed |
| **Processing** | Status Processing; score pending; CTA **View progress** (or disabled “Processing…”) → Audit Processing |

Map server `QUEUED`/`PROCESSING` → Processing UI; `COMPLETED` → Completed; `FAILED` → Failed; cancelled → Failed-like or Cancelled badge if Figma defines it.

---

## 4. Behaviour

| Status | Open Report / CTA |
|--------|-------------------|
| Completed | Navigate to report (Guest preview N/A here — user is authenticated; Free brief vs Pro full per tier) |
| Failed | Navigate to Audit Failed for that `auditId` |
| Processing | Navigate to Audit Processing for that `auditId` |
| PDF | Not required on this card; PDF remains on report / History |

| Rule | Spec |
|------|------|
| Whole card click | Optional — if Figma makes the card clickable, same destination as CTA; ensure one accessible name |
| Ownership | Only user’s audits (`SECURITY.md` — 404 otherwise) |
| Score | Display text number; decorative mini-gauge only if Figma shows it |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `auditId` | string | Yes | Audit id |
| `websiteName` | string | Yes | Website label |
| `thumbnailUrl` | string \| null | No | Thumbnail |
| `score` | 0–100 \| null | No | Overall score |
| `auditDate` | datetime | Yes | Display date |
| `status` | `loading` \| `processing` \| `completed` \| `failed` | Yes | Card status |
| `planUsed` | `free` \| `pro` \| `business` \| null | Recommended | Plan used |
| `ctaLabel` | string | No | Override button label |
| `onOpen` | action | Yes | Open report / progress / failure |
| `compact` | boolean | No | Density for History vs Dashboard |

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Name | Accessible name includes website, status, score when present — e.g. “example.com, Completed, score 72” |
| Thumbnail | Meaningful `alt` or decorative if website name is adjacent |
| Status | Text badge — not color-only |
| Score | Announced as number out of 100 |
| Button | Clear label (“Open report”, “View progress”, “View error details”) |
| Keyboard | CTA and card (if clickable) operable; focus visible |
| Loading | `aria-busy` on skeleton card |

---

## 7. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `recent_audit_card_impressed` | Card visible (dedupe per audit) | `auditId`, `status`, `score` |
| `recent_audit_opened` | CTA / card open | `auditId`, `status`, `destination` |

Align with `report_viewed` when destination is report (`source: dashboard_recent`).

---

## 8. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Horizontal card: thumb + meta + score + CTA per Figma |
| Tablet | Same hierarchy; tighten gaps |
| Mobile | Stack thumbnail / meta / CTA; full-width tap targets |

**Reusable** at all breakpoints via parent list layout.

---

## 9. Reuse

| Context | Spec |
|---------|------|
| Dashboard Recent Audits | Up to 5 cards |
| History | Optional shared card/row pattern |
| Free / Pro / Business | Same card; report depth gated on destination screen |

Do not fork per-tier card designs.

---

## 10. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | Status colors from design tokens; paired with text |
| Plan Used | Badge/chip per Figma |
| Empty list | Parent Empty State — not this component |

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Presentational | Parent fetches `GET /audits?limit=5` |
| Phase 1 | Mock audits in all statuses |
| Phase 2 | Bind real status/score/thumbnail |
| Navigation | Route by `status` + `auditId` |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Fields: website, thumbnail, score, date, status, plan used, Open Report  
□ Loading skeleton; Completed / Failed / Processing behaviours  
□ Parent empty state when zero audits (no orphan empty card)  
□ Keyboard + WCAG 2.2 AA; status/score not color-only  
□ Responsive stack  
□ Reused on Dashboard (and History if applicable)  
□ Analytics impress + open  
□ Figma match  

---

## 13. Non-goals

| Out of scope |
|--------------|
| Full report content inside the card |
| Dashboard empty-state copy (parent) |
| PDF download control (report/History) |
| Editing or deleting audits (unless Figma adds later) |

---

**End of COMPONENT-016 / COMPONENT_RECENT_AUDIT_CARD.md**
