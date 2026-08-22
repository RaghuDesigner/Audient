# COMPONENT — Invite Member Modal

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-13  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-053 (Invite Member Modal)  
**Component name:** Invite Member Modal (`InviteMemberModal`)  
**Primary screen:** Team / Business member management (when present)  
**Related:** Team Member Card (`COMPONENT_TEAM_MEMBER_CARD.md`) — Invited status after mock send · Team Overview Card — Pending Invitations count · Modal / Dialog primitives  
**Figma:** Invite member dialog — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Dialog / form patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Mock invitation flow only** — **no email sending** · **no backend** · **no Supabase**.  
> **Roles:** Invitees may be Admin / Manager / Viewer only — **not Owner** (Owner is not assignable via invite).

**Related docs:** `docs/prd.md` · `docs/VALIDATION_RULES.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/SECURITY.md` · `docs/components/COMPONENT_TEAM_MEMBER_CARD.md` · `docs/components/COMPONENT_TEAM_OVERVIEW_CARD.md`

---

## 1. Purpose

Invite **new members** into a **Business** workspace.

Opens as a modal from Team management (e.g. “Invite member” CTA). Completing the flow creates a **mock** pending invitation only — no real email delivery.

**Do not redesign.** Match Figma.

---

## 2. Fields

| Field | Spec |
|-------|------|
| **Email** | Required · invitee address |
| **Role** | Required · Admin / Manager / Viewer |
| **Message** | Optional · short personal note included in mock invite payload only |

| Rule | Spec |
|------|------|
| Labels | Visible labels on all fields |
| Email | Single email field this phase (no multi-invite CSV unless Figma adds it) |
| Message | Optional; empty allowed |

---

## 3. Roles (inviteable)

| Role | Spec |
|------|------|
| **Admin** | Invite as Admin |
| **Manager** | Invite as Manager |
| **Viewer** | Invite as Viewer |

| Not inviteable | Spec |
|----------------|------|
| **Owner** | Cannot be assigned via this modal |

Align labels with Team Member Card role enum (subset).

---

## 4. Actions

| Action | Spec |
|--------|------|
| **Send Invite** | Validate → mock send → Success |
| **Cancel** | Close modal · discard draft · no invite created |

| Rule | Spec |
|------|------|
| While Loading | Disable Send / Cancel dismiss per Modal `preventDismiss` if needed; show busy on Send |
| Escape / overlay | Same as Cancel when not Loading |

---

## 5. Validation

| Rule | Spec |
|------|------|
| **Valid Email Required** | Non-empty + valid email format; inline error |
| **Role Required** | Role must be selected; inline error |
| Message | No required validation; optional max length if product sets one |
| Timing | On Send (and blur for email per VALIDATION_RULES if applicable) |
| Errors | Field-level — not toast-only for validation |

---

## 6. States

| State | Spec |
|-------|------|
| **Default** | Form editable; Send enabled when ready (or always enabled and validate on click) |
| **Loading** | Mock invite in flight; `aria-busy`; controls disabled |
| **Success** | Confirmation feedback (toast and/or inline) · close modal · parent may append Invited member / bump pending count |
| **Error** | Mock failure message + Retry / stay open with values preserved |

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `open` | boolean | Yes | |
| `onOpenChange` / `onCancel` | action | Yes | |
| `onSend` | (email, role, message?) => void \| Promise | Yes | Mock handler — must not send real email |
| `state` | `default` \| `loading` \| `success` \| `error` | Recommended | |
| `defaultRole` | admin \| manager \| viewer | No | |
| `className` | string | No | |

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Dialog | `role="dialog"`, `aria-modal="true"`, labelled by title, described by intro if present |
| Focus | Trap focus; initial focus on Email (or first field); Escape closes when not Loading; return focus to trigger |
| Labels | Every field labelled; errors linked via `aria-describedby` / `aria-invalid` |
| Loading | Announce busy / “Sending invite…” |
| Success / Error | Live region or alert as appropriate |

---

## 9. Analytics (recommended)

| Event | Trigger |
|-------|---------|
| **Invite Member Modal Opened** | Modal opens |
| **Invite Member Sent** | Mock send succeeds |
| **Invite Member Cancelled** | Cancel / dismiss |
| **Invite Member Failed** | Mock error |

Payload: role only — avoid full email in marketing analytics when possible.

---

## 10. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Centered sm/md modal |
| **Tablet** | Same |
| **Mobile** | Full-width / near-fullscreen per Dialog size tokens; stacked actions; min 44px targets |

---

## 11. Security / Privacy

| Rule | Spec |
|------|------|
| No real email | Do **not** call email providers |
| No backend | Mock store / toast only |
| Secrets | Never display tokens |
| Owner | Cannot invite as Owner |

---

## 12. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Flow | Validate → brief mock delay → Success toast “Invitation sent (mock)” |
| Parent | May add Team Member Card with status **Invited** |
| Reuse | Existing `Modal` / Dialog, `Input`, select, `Button` |
| Tokens | Design tokens only |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ Fields: Email, Role, Message (optional)  
□ Roles: Admin, Manager, Viewer (not Owner)  
□ Send Invite / Cancel  
□ Validation: valid email + role required  
□ States: Default, Loading, Success, Error  
□ No real email · no backend  
□ WCAG 2.2 AA — dialog focus trap / Escape / return focus  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Bulk CSV invite |
| Real SMTP / Supabase invite links |
| Assigning Owner via invite |
| Seat billing enforcement beyond mock messaging |

---

**End of COMPONENT_INVITE_MEMBER_MODAL.md**
