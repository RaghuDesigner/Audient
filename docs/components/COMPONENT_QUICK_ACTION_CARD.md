# COMPONENT-015 — Quick Action Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-015  
**Component name:** Quick Action Card (`QuickActionCard`)  
**Screen:** Authenticated Dashboard Quick Actions (`SCREEN-008_AUTHENTICATED_DASHBOARD.md`)  
**Figma:** Dashboard shortcut cards — **exact match**  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/screens/SCREEN-008_AUTHENTICATED_DASHBOARD.md` · `docs/COMPONENT_MAPPING.md` · `docs/DESIGN_TOKENS.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/PRICING.md` · `docs/SECURITY.md` · `docs/components/COMPONENT_WELCOME_CARD.md` · `docs/components/COMPONENT_LOCKED_CARD.md` · `docs/components/COMPONENT_PLAN_COMPARISON.md`

---

## 1. Purpose

Reusable **dashboard shortcut** card that routes the user into a primary workflow (start audit, upload, URL, history, reports).

Used in a row/grid of Quick Actions on the Authenticated Dashboard. **One component** — many actions via props/variants.

**Do not redesign.** Match Figma.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Icon** | Action-specific icon per Figma (`aria-hidden` when title is visible) |
| **Title** | Short action name |
| **Description** | One-line supporting copy |
| **Arrow** | Trailing affordance indicating navigation / activation |

Entire card is one interactive control (button or link-styled button), not separate clickable icon/title unless Figma requires a nested control.

---

## 3. Actions (variants)

| Action key | Typical title (match Figma) | Behaviour |
|------------|----------------------------|-----------|
| `start_audit` | Start Audit | Open primary audit entry (upload or chooser per product) |
| `upload_screenshot` | Upload Screenshot | Screenshot audit flow |
| `paste_url` | Paste URL / Analyze Website URL | Pro/Business → URL flow; Free/Guest → Upgrade Modal / Plan Comparison |
| `history` | History / View Audit History | Navigate to History |
| `reports` | Reports | Navigate to latest report / reports list per product IA |

Dashboard may show a subset (e.g. Upload, URL, History). Extra keys keep the component reusable without new card designs.

---

## 4. States

| State | Spec |
|-------|------|
| **Default** | Idle card |
| **Hover** | Figma hover surface/elevation/cursor pointer |
| **Focus** | Visible focus ring (keyboard) |
| **Pressed** | Active/pressed style; then navigate or open modal |
| **Disabled** | Not activatable — e.g. offline, insufficient credits for start, or feature unavailable; **explain in text** (title/description or `aria-describedby`), not color-only |
| **Loading** | `aria-busy`; prevent double activation; optional spinner on card |

Gated URL for Free is preferably **not** silently disabled — activate → Upgrade (enabled card with gate on click), unless Figma shows a disabled/locked treatment (then pair with lock copy).

---

## 5. Behaviour

| Rule | Spec |
|------|------|
| Activate | Click / Enter / Space → `onAction(actionKey)` |
| Tier gates | Enforced by parent + server (`SECURITY.md` / `PRICING.md`); card emits intent only |
| Loading | Stay in Loading until navigation starts or modal opens |
| Disabled | No navigation; announce reason to AT |

---

## 6. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `action` | `start_audit` \| `upload_screenshot` \| `paste_url` \| `history` \| `reports` \| custom | Yes | Which shortcut |
| `title` | string | Yes | Card title |
| `description` | string | Yes | Supporting copy |
| `icon` | icon id / node | Yes | Display icon |
| `state` | `default` \| `disabled` \| `loading` | Yes | Interactive state (hover/focus/pressed are ephemeral) |
| `disabledReason` | string | When disabled | Accessible explanation |
| `href` | string \| null | Optional | If navigational link semantics preferred |
| `tier` | `guest` \| `free` \| `pro` \| `business` | Recommended | Analytics / gate hints |
| `onAction` | action | Yes | Parent handler |
| `size` | `default` \| `compact` | No | Figma density |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Control | Single focusable card control with accessible name = title (+ description if needed) |
| Keyboard | Enter / Space activate |
| Focus / Hover / Pressed | Visible focus; hover not required for keyboard users |
| Disabled | `aria-disabled` or disabled button; reason available to SR |
| Loading | `aria-busy="true"` |
| Icon / Arrow | Decorative (`aria-hidden`) |
| Contrast | Title/description/icon meet contrast on card surface |

---

## 8. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `quick_action_clicked` | Card activated | `action`, `tier` |
| Align Dashboard | Map to **New Audit Clicked** (`mode: screenshot\|url`), **History Opened**, etc. | Same click — do not double-count conflicting KPIs; prefer one canonical event + `action` prop |

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Horizontal/grid of cards per Figma |
| Tablet | Reflow columns per Figma |
| Mobile | Stack full-width cards; large tap targets (≥44px) |

Same component at all breakpoints — layout is parent grid.

---

## 10. Reuse

| Context | Spec |
|---------|------|
| Authenticated Dashboard | Primary Quick Actions row |
| Empty state CTA | May reuse `start_audit` / `upload_screenshot` styling |
| Guest | Generally not on Guest Landing; if used, URL/history gates apply |

**Reusable** across Free / Pro / Business dashboards without forking designs.

---

## 11. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma |
| Tokens | `DESIGN_TOKENS.md` |
| Arrow | Always present unless Figma omits for a variant |
| No Locked Card blur | Gating opens Upgrade Modal; use COMPONENT-011 only if Figma shows locked shortcut |

---

## 12. Developer Notes

| Note | Spec |
|------|------|
| Presentational | Parent owns navigation, modals, credit checks |
| Phase 1 | Mock handlers / routes |
| Phase 2 | Wire to audit entry, History, Reports, Upgrade Modal |
| Do not | Build five unrelated card components |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Icon, title, description, arrow present  
□ Actions: Start Audit, Upload Screenshot, Paste URL, History, Reports  
□ Hover, focus, pressed, disabled, loading match Figma + a11y  
□ Free URL → upgrade path; Pro URL → audit path  
□ Keyboard operable; WCAG 2.2 AA  
□ Responsive stack/grid  
□ Analytics with `action` (aligned to Dashboard events)  
□ Reused without per-action layout forks  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Full upload dropzone UI inside the card |
| Plan comparison table |
| Welcome Card content |
| Computing credits inside the card |

---

**End of COMPONENT-015 / COMPONENT_QUICK_ACTION_CARD.md**
