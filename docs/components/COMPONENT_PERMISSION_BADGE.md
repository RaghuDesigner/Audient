# COMPONENT — Permission Badge

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-14  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-060 (Permission Badge)  
**Component name:** Permission Badge (`PermissionBadge`)  
**Primary use:** Role Permission Matrix · Permission Group · Role Card · any compact permission status affordance  
**Related:** Role Permission Matrix Grant Mark (`RolePermissionMatrixGrantMark`) — matrix cell variant to align with or compose this badge · Permission Group (`COMPONENT_PERMISSION_GROUP.md`) · Role Permission Matrix (`COMPONENT_ROLE_PERMISSION_MATRIX.md`) · Badge primitive (`src/components/ui/badge.tsx`)  
**Figma:** Permission status pill / chip — **exact match**  
**Priority:** P1  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + `Badge` patterns in `COMPONENT_MAPPING.md`.  
> **Phase:** **Read-only display** — informative mock status only; not an authorization source.  
> **Rule:** **Never rely on color alone** — always pair token styling with visible text (and optional icon).

**Related docs:** `docs/prd.md` · `docs/COMPONENT_MAPPING.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/screens/SCREEN-022_ROLES_AND_PERMISSIONS.md` · `src/config/role-permission-matrix.ts` · `src/utils/role-permission-matrix.ts`

---

## 1. Purpose

Provides a **compact visual representation of permission status**.

Reusable anywhere a single permission (or summary grant) needs a small, scannable label — matrix cells, permission group rows, role summaries, tooltips, and table legends.

**Do not redesign.** Match Figma.

---

## 2. States

Four semantic status values:

| State | Meaning | Typical use |
|-------|---------|-------------|
| **Allowed** | Permission is granted for the role/context | Default granted cell |
| **Not Allowed** | Permission is not granted | Default denied cell |
| **Inherited** | Grant comes from role template or organization setting — not a direct override | Admin billing org flag; future inherited policy |
| **Restricted** | Permission exists but is blocked for actor/plan/context | Tier gate, unauthorized actor, locked feature teaser |

| Rule | Spec |
|------|------|
| Text | Each state has a **visible text label** (see §3) — icons optional, never alone |
| Mapping | Map from `RolePermissionGrantCell` + context (see §5) — single helper, no duplicate grant tables |
| Restricted | Use sparingly this phase; matrix/group use **Allowed / Not Allowed / Inherited** primarily |

---

## 3. Display

| Element | Spec |
|---------|------|
| **Badge** | Compact pill or rounded chip — compose on design-system `Badge` |
| **Label** | Accessible status text (required) |
| **Icon** | Optional leading symbol (`✓`, `—`, `↳`, `🔒` or Lucide equivalent) — **`aria-hidden`** |
| **Size** | `sm` default in dense tables; `md` in group rows — Figma wins |

### Default labels (Figma wins)

| State | Label |
|-------|-------|
| **Allowed** | Allowed |
| **Not Allowed** | Not allowed |
| **Inherited** | Inherited |
| **Restricted** | Restricted |

### Extended labels (org-dependent grants — SCREEN-022)

When mapping Admin billing cells, prefer **Inherited** state with labels:

| Condition | State | Label |
|-----------|-------|-------|
| Admin billing granted via org setting | Inherited | Allowed (organization setting) |
| Admin billing denied via org setting | Inherited | Not allowed (organization setting) |

These replace duplicating **Allowed / Not Allowed** copy on org-dependent cells when product prefers **Inherited** semantics.

---

## 4. Visual mapping (design tokens)

Map state → `Badge` variant — **tokens only**, no hardcoded hex:

| State | Badge variant (recommended) | Notes |
|-------|----------------------------|-------|
| **Allowed** | `success` | Green tint + success text token |
| **Not Allowed** | `neutral` | Muted surface |
| **Inherited** | `info` or `secondary` | Distinct from allowed/denied |
| **Restricted** | `warning` or `error` | Use `warning` + foreground text for small-size contrast per Badge rules |

Meaning must remain clear **without** color (text label required).

---

## 5. Data mapping

| Source | Spec |
|--------|------|
| `RolePermissionGrantCell` | `granted: true` → **Allowed**; `granted: false` → **Not Allowed** |
| `orgDependent: true` | Map to **Inherited** with organization-setting labels (§3) |
| `restricted` flag (future prop) | **Restricted** |
| Manual `state` prop | Override for Storybook / edge cases |

Provide one helper (e.g. `permissionBadgeFromGrantCell`) in utils — **do not** maintain a parallel permission engine.

---

## 6. States (interaction / UI)

| State | Spec |
|-------|------|
| **Default** | Static badge — read-only |
| **Loading** | Optional skeleton chip same footprint — parent or `isLoading` prop |
| **Compact** | Reduced padding / stacked icon+text for matrix cells (Grant Mark layout) |

No hover-required behaviour; optional tooltip with full permission name on hover/focus — Figma wins.

---

## 7. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `state` | `allowed` \| `not_allowed` \| `inherited` \| `restricted` | Yes* | Semantic status |
| `cell` | `RolePermissionGrantCell` | Alt. to `state` | Auto-map via helper |
| `label` | string | No | Override default label |
| `size` | `sm` \| `md` \| `lg` | No | Maps to Badge sizes |
| `compact` | boolean | No | Matrix-style stacked layout |
| `icon` | ReactNode | No | Override default icon |
| `className` | string | No | |

\* Provide `state` **or** `cell` (helper derives state).

---

## 8. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Text | Visible status word(s) always present |
| Color | Supplement only — never sole indicator |
| Icon | Decorative icons `aria-hidden`; meaning in text |
| Screen readers | Badge text is read as status (e.g. “Allowed”); optional `title` for long org-setting strings |
| Contrast | Token pairs must meet contrast for text size (Badge `warning` uses foreground on tint) |
| Focus | If badge is interactive (rare), visible focus ring; default is non-interactive `span` |

---

## 9. Responsive

| Context | Spec |
|---------|------|
| **Matrix / group rows** | `compact` + `sm` on mobile; may stack icon above text |
| **Legends / cards** | `md` inline with label |
| **Never** | Shrink text below readable minimum — wrap or truncate with full text in `title` |

---

## 10. Relationship to Other Components

| Component | Spec |
|-----------|------|
| **Role Permission Matrix Grant Mark** | Specialized matrix cell wrapper; should **compose** `PermissionBadge` or share the same config/helper |
| **Permission Group** | One badge per permission row |
| **Role Card** | Optional summary badge — not required if counts suffice |
| **Badge (ui)** | Base primitive — do not fork styling |

---

## 11. Analytics

No dedicated events required. Parent matrix/group analytics cover views. Optional `permission_badge_viewed` only if product needs funnel detail — default **omit**.

---

## 12. Mock Data / Developer Notes

| Rule | Spec |
|------|------|
| Reuse | `Badge` · `role-permission-matrix` utils · token variants |
| Config | `src/config/permission-badge.ts` — labels, state enum, icon map |
| Utils | `src/utils/permission-badge.ts` — `permissionBadgeFromGrantCell()`, label resolver |
| Component | `src/components/team/PermissionBadge.tsx` (or `src/components/common/PermissionBadge.tsx` if used outside team) |
| Refactor | Align `RolePermissionMatrixGrantMark` to delegate to `PermissionBadge` when implementing |
| No | Backend · Supabase · live RBAC · color-only status |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 13. QA Checklist

□ States: Allowed, Not Allowed, Inherited, Restricted  
□ Visible text on every variant  
□ Not color-only  
□ Maps correctly from `RolePermissionGrantCell` + org-dependent  
□ Uses design tokens via `Badge`  
□ WCAG 2.2 AA contrast and screen reader labels  
□ Reusable in matrix, group, and legend contexts  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Clickable permission toggles |
| Custom per-permission colors outside token map |
| Server-side authorization enforcement |
| Free/Pro permission badges on this phase’s Business RBAC surfaces |

---

**End of COMPONENT_PERMISSION_BADGE.md**
