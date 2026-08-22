# COMPONENT-020 — Empty State

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-020  
**Component name:** Empty State (`EmptyState`)  
**Figma:** Empty state blocks (Dashboard, History, Notifications, etc.) — **exact match** per variant  
**Priority:** P0  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

**Related:** `docs/COMPONENT_MAPPING.md` (Empty State) · `docs/screens/SCREEN-008_AUTHENTICATED_DASHBOARD.md` · `docs/components/COMPONENT_QUICK_ACTION_CARD.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/DESIGN_TOKENS.md` · `STATE_MANAGEMENT.md` (`EMPTY-STATE-*`)

---

## 1. Purpose

Displayed whenever **dashboard sections (or other lists) have no data**, guiding the user to the next useful action instead of a blank region.

**Do not redesign.** Match Figma for each variant’s illustration and copy.

---

## 2. Display

| Element | Spec |
|---------|------|
| **Illustration** | Variant-specific empty artwork / icon (decorative unless it carries unique meaning) |
| **Headline** | Short empty title |
| **Description** | One–two lines explaining why it’s empty and what to do |
| **Primary CTA** | Main recovery action (required for actionable empties) |
| **Secondary CTA** | Optional alternate action (e.g. Learn more, View plans) |

Omit Secondary CTA when Figma shows primary only.

---

## 3. Examples (variants)

Same component; vary `variant` / copy / CTAs:

| Variant | Headline (example) | Primary CTA (example) | Secondary (example) |
|---------|----------------------|------------------------|---------------------|
| **No Audits** | No audits yet. | Start Your First Audit | View plans / Learn how (if Figma) |
| **No Reports** | No reports yet. | Run an audit | — |
| **No Notifications** | No notifications | Back to Dashboard / Got it | — |
| **No Credits** | You’re out of credits | Upgrade / Buy Credits | Compare plans |

| Rule | Spec |
|------|------|
| Copy | Prefer exact Figma strings (Dashboard uses **“No audits yet.”** + **“Start Your First Audit”**) |
| No Credits | Distinct from Credits Widget Exhausted chrome — may appear in a section or full panel; CTA must not invent credits client-side |
| Extensibility | History empty, search-no-results (if ever), etc. reuse this pattern |

---

## 4. Behaviour

| Rule | Spec |
|------|------|
| Primary CTA | Triggers parent handler (start audit, upgrade, navigate) |
| Secondary CTA | Secondary navigation or dismiss |
| Not an error | Empty ≠ Error State — use Error UI when fetch fails |
| Loading | Do not show Empty while still Loading — parent shows skeleton first |
| Tier | Primary CTA respects gates (e.g. Free URL still upgrade-gated after “start”) |

---

## 5. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `variant` | `no_audits` \| `no_reports` \| `no_notifications` \| `no_credits` \| `custom` | Yes | Which empty |
| `headline` | string | Yes | Headline |
| `description` | string | Recommended | Description |
| `illustration` | id / url / node | Recommended | Illustration |
| `primaryLabel` | string | When CTA shown | Primary CTA label |
| `secondaryLabel` | string \| null | No | Secondary CTA label |
| `onPrimary` | action | When primary shown | Primary handler |
| `onSecondary` | action | When secondary shown | Secondary handler |
| `size` | `section` \| `page` | No | Inline section vs full-page empty |
| `tier` | plan tier | Analytics | Context |

---

## 6. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Heading | Headline as heading (appropriate level in page outline) |
| Illustration | Decorative (`alt=""` / `aria-hidden`) if headline+description convey meaning |
| CTAs | Real **buttons** or links with clear names |
| Keyboard | Primary/Secondary operable; focus visible |
| Focus | On section empty, ensure CTA is reachable in tab order after preceding chrome |
| Contrast | Text and CTAs meet contrast on surface |

---

## 7. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `empty_state_impressed` | Empty shown | `variant`, `tier` |
| `empty_state_primary_clicked` | Primary CTA | `variant` |
| `empty_state_secondary_clicked` | Secondary CTA | `variant` |

Align Dashboard **New Audit Clicked** / **Upgrade Clicked** when those are the primary actions — one canonical event + `source: empty_state` preferred over double-firing.

---

## 8. Reuse

| Context | Spec |
|---------|------|
| Dashboard Recent Audits | **No Audits** |
| Reports list | **No Reports** |
| Notifications (M04) | **No Notifications** |
| Credits / billing | **No Credits** (or exhausted messaging) |
| History | Populated empty screen (`SCREEN-013`) — same component |

**Reusable** across the application — do not invent one-off empty layouts per screen.

---

## 9. Visual / Design Rules

| Rule | Spec |
|------|------|
| Source | Approved Figma empty frames |
| Tokens | `DESIGN_TOKENS.md` |
| Density | Section empties sit inside widget cards; page empties center in `main` |
| No redesign | Illustration/spacing per Figma |

---

## 10. Developer Notes

| Note | Spec |
|------|------|
| Mapping | `EmptyState` in `COMPONENT_MAPPING.md` |
| Phase 1 | Static variants for Dashboard + History |
| Phase 2 | Wire CTAs to audit entry, Upgrade Modal, notifications route |
| Guard | `items.length === 0` **and** not loading **and** not error |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 11. QA Checklist

□ Illustration, headline, description, primary CTA; secondary when specified  
□ Variants: No Audits, No Reports, No Notifications, No Credits  
□ Not shown during loading or on fetch error  
□ CTAs keyboard-accessible; heading semantics  
□ WCAG 2.2 AA  
□ Analytics impress + CTA clicks  
□ Reused without per-screen layout forks  
□ Figma match (incl. “No audits yet.” / “Start Your First Audit”)  

---

## 12. Non-goals

| Out of scope |
|--------------|
| Error / offline banners |
| Locked Card upsell blur (COMPONENT-011) |
| Skeleton loading states |
| Inventing empty copy not in Figma |

---

**End of COMPONENT-020 / COMPONENT_EMPTY_STATE.md**
