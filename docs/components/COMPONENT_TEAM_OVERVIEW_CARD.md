# COMPONENT — Team Overview Card

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Component ID:** COMPONENT-051 (Team Overview Card)  
**Component name:** Team Overview Card (`TeamOverviewCard`)  
**Primary screen:** Team / Business hub (when present) · Business Dashboard overview region  
**Related:** Credit meter / billing surfaces — credits remaining must match plan rules (`PRICING.md`) · Seat / invite lists — detail tables are siblings, not this card  
**Figma:** Team overview summary card — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + card / metric patterns in `COMPONENT_MAPPING.md`.  
> **Audience:** **Business** accounts (`ENTERPRISE` / Business label). Free / Pro typically do not show this card (or see upgrade empty — Figma wins).  
> **Phase:** **Mocked team data only** — no backend · no Supabase team APIs.

**Related docs:** `docs/prd.md` · `docs/PRICING.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-008_AUTHENTICATED_DASHBOARD.md` (if team region appears there)

---

## 1. Purpose

Displays **high-level team information** for Business accounts.

Gives owners/admins a at-a-glance snapshot of team identity, plan, membership, activity, and credit headroom — not a full member roster or invite workflow.

**Do not redesign.** Match Figma.

---

## 2. Display

| Field | Spec |
|-------|------|
| **Team Name** | Organization / workspace name |
| **Plan** | Current plan label (Business; align with `PRICING.md` — UI label **Business**, schema may be `ENTERPRISE`) |
| **Total Members** | Count of all members (active + inactive if product counts them; Figma definition wins) |
| **Active Members** | Count currently active |
| **Pending Invitations** | Count of outstanding invites |
| **Total Audits** | Aggregate audits for the team (mock) |
| **Credits Remaining** | Team/workspace credit balance remaining |

| Rule | Spec |
|------|------|
| Labels | Visible label per metric |
| Numbers | Locale-friendly formatting; do not invent live Stripe balances |
| Credits | Follow product credit rules; never invent prices outside `PRICING.md` |
| Hierarchy | Team Name + Plan as identity header; metrics as secondary readouts |

---

## 3. States

| State | Spec |
|-------|------|
| **Default** | All fields populated from mock team data |
| **Loading** | Skeletons / busy indicator; `aria-busy`; no fake “0” metrics presented as truth |
| **Error** | Unable to load team overview — message + Retry |

---

## 4. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `teamName` | string | Yes | |
| `plan` | string / plan enum | Yes | Display label |
| `totalMembers` | number | Yes | |
| `activeMembers` | number | Yes | |
| `pendingInvitations` | number | Yes | |
| `totalAudits` | number | Yes | |
| `creditsRemaining` | number \| “unlimited” | Yes | Mock balance |
| `state` | `default` \| `loading` \| `error` | Recommended | |
| `onRetry` | action | Error | |
| `className` | string | No | |

---

## 5. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Structure | Landmark/region with accessible name (e.g. “Team overview”) |
| Metrics | Each value associated with its label (not color-only meaning) |
| Loading | `aria-busy`; announce loading status |
| Error | `role="alert"` + Retry operable by keyboard |
| Focus | Visible focus on Retry / any interactive affordances |
| Keyboard | All interactive controls operable |

---

## 6. Analytics

| Event | Trigger |
|-------|---------|
| **Team Overview Viewed** | Card enters view / mounts for Business user |

No PII beyond opaque team id if needed later; mock phase: no email lists in payload.

---

## 7. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Header + metric grid (multi-column per Figma) |
| **Tablet** | 2-column metrics or stacked pairs |
| **Mobile** | Single-column stack; readable type; min 44px hit targets on actions |

---

## 8. Entitlement

| Tier | Spec |
|------|------|
| **Business** | Show card with mock team data |
| **Free / Pro** | Hide, or Upgrade placeholder if Figma requires — do not invent seats for Free/Pro |
| **Guest** | Not shown |

---

## 9. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Data | Mocked team overview object only |
| No | Backend · Supabase org tables · live seat sync · real invite counts from IdP |
| Tokens | Design tokens only — no hardcoded colors, no inline CSS |
| Reuse | Existing card chrome / typography / Button for Retry |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 10. QA Checklist

□ Team Name, Plan, Total Members, Active Members, Pending Invitations, Total Audits, Credits Remaining  
□ States: Default, Loading, Error  
□ Team Overview Viewed analytics  
□ WCAG 2.2 AA  
□ Desktop / Tablet / Mobile  
□ Business-only (or Figma empty for other tiers)  
□ Mock only — no backend  

---

## 11. Non-goals

| Out of scope |
|--------------|
| Member list / roles table |
| Invite / revoke flows |
| Real billing sync for credits |
| Free/Pro seat management |

---

**End of COMPONENT_TEAM_OVERVIEW_CARD.md**
