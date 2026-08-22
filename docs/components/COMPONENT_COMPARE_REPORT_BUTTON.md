# COMPONENT — Compare Report Button

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-032 (Compare Report Button)  
**Component name:** Compare Report Button (`CompareReportButton`)  
**Primary surfaces:** Audit Report (Audit Summary actions) · Audit History Card secondary actions  
**Figma:** Compare Reports control — **exact match**  
**Priority:** P1 (Business feature; selector UI placeholder)  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Button primitives in `COMPONENT_MAPPING.md`.

**Related:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/PRICING.md` · `docs/SECURITY.md` · `docs/screens/SCREEN-010_AUDIT_REPORT.md` · `docs/screens/SCREEN-009_AUDIT_HISTORY.md` · `docs/components/COMPONENT_AUDIT_SUMMARY.md` · `docs/components/COMPONENT_AUDIT_HISTORY_CARD.md` · `docs/components/COMPONENT_LOCKED_CARD.md`

---

## 1. Purpose

Allows users to **compare two audit reports** to measure UX improvements over time.

This feature is available **only for Business plans**.

**This phase:** Button + tier gating + open **Compare Report Selector (placeholder only)**. No real compare workspace or backend.

**Reusable** on Report and History (and future Compare entry points).

**Do not redesign.** Match Figma.

---

## 2. Membership Rules

| Tier | Spec |
|------|------|
| **Guest** | **Hidden** — do not render |
| **Free** | **Locked** — visible gated control → Upgrade |
| **Pro** | **Locked** — visible gated control → Upgrade to Business |
| **Business** | **Enabled** — opens Compare Report Selector (placeholder) |

| Rule | Spec |
|------|------|
| Server (later) | Enforce Business tier on any compare API; UI gate is not enough |
| Pro messaging | Prefer “Upgrade to Business to compare reports” (not Pro PDF upgrade copy) |

---

## 3. Display

| Element | Spec |
|---------|------|
| **Button label** | **Compare Reports** |
| **Icon** | Compare icon (decorative if label present) |
| **Tooltip** | **Compare this audit with another report.** |

Locked: tooltip/accessible name may include upgrade requirement.

---

## 4. Interaction

| Tier / state | On click |
|--------------|----------|
| **Business + Enabled** | Open **Compare Report Selector** — **placeholder only** (mock modal/sheet: pick second audit stub) · fire **Compare Clicked** + **Compare Started** when selector opens |
| **Free / Pro + Locked** | Open Upgrade Modal / Plan Comparison (Business highlight) · **Upgrade Clicked** — do not open selector |
| **Disabled** | No-op (e.g. current audit still Processing / Failed with no report) |
| **Loading** | Prevent double activation while selector mounts |

Selector placeholder: list mock audits or “Compare coming soon” with dismiss — **do not** invent a full dual-report UI in this component.

---

## 5. States

| State | Spec |
|-------|------|
| **Default** | Business enabled idle |
| **Hover** | Figma hover |
| **Focused** | Visible focus ring |
| **Pressed** | Active press |
| **Loading** | Opening selector / preparing compare; `aria-busy` |
| **Disabled** | Temporarily unavailable (no completed peer reports, audit not Completed) |
| **Locked** | Free/Pro gated appearance; click → Upgrade |

Guest: component not mounted (Hidden ≠ Locked).

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `auditId` | string | Yes | Source audit to compare from |
| `tier` | `guest` \| `free` \| `pro` \| `business` | Yes | |
| `state` | `default` \| `loading` \| `disabled` \| `locked` | Yes | |
| `label` | string | No | Default “Compare Reports” |
| `tooltip` | string | No | Default tooltip |
| `onCompare` | action | Business enabled | Open selector placeholder |
| `onUpgrade` | action | Locked | Open Upgrade |
| `surface` | `report` \| `history` \| `summary` | Analytics | |
| `variant` | `button` \| `menuItem` | No | History overflow vs summary button |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | Enter/Space activate |
| Visible focus | Required |
| Name | “Compare reports” / “Upgrade to Business to compare reports” when Locked |
| Tooltip | Not sole accessible name |
| Loading | `aria-busy`; announce if needed |
| Selector placeholder | When opened, dialog a11y (trap, Esc) — owned by selector stub |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Compare Clicked** | Control activated (enabled or locked) | `auditId`, `tier`, `surface`, `gated` boolean |
| **Upgrade Clicked** | Locked path → upgrade | `source: compare_report`, `auditId` |
| **Compare Started** | Business path opens Compare Report Selector | `auditId`, `tier` |

Do not fire Compare Started on Upgrade path.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop / Tablet | Label + icon per Figma |
| Mobile | Full-width or menu item; ≥44px target |

---

## 10. Reuse

| Context | Spec |
|---------|------|
| Audit Summary | Quick action |
| Audit History Card | Secondary “Compare Report” |
| Future Compare hub | Same button to add a report |

One component — tier via props.

---

## 11. Developer Notes

| Note | Spec |
|------|------|
| Phase | **Mock functionality only** — **no backend** |
| Selector | Placeholder modal/list only; no dual-pane compare screen required yet |
| Guest | Do not render |
| Later | Real selector + compare view + API; Business entitlement server-side |
| Align | History card earlier said Business-only Compare — consistent with this button |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. QA Checklist

□ Label “Compare Reports” + icon + tooltip  
□ Guest hidden · Free/Pro locked→Upgrade · Business enabled→selector placeholder  
□ States: default, hover, focus, pressed, loading, disabled, locked  
□ Keyboard + visible focus · WCAG 2.2 AA  
□ Analytics: Compare Clicked, Upgrade Clicked, Compare Started  
□ Mock only; no backend; no full compare UI invented  
□ Reusable; Figma match  

---

## 13. Non-goals

| Out of scope (this phase) |
|---------------------------|
| Full side-by-side Compare Reports screen |
| Score-diff engine / API |
| Enabling Compare for Pro |
| Guest/Free real compare |

---

**End of COMPONENT / COMPONENT_COMPARE_REPORT_BUTTON.md**
