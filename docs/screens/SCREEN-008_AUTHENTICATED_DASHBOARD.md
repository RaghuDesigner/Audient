# SCREEN-008 — Authenticated Dashboard

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-02  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · QA  

**Screen ID:** SCREEN-008 (product brief)  
**Canonical mapping:** **SCREEN-004** (Free Home) · **SCREEN-009** (Pro/Business Home) in `SCREEN_MAPPING.md`  
**Screen name:** Authenticated Dashboard  
**Entry:** Immediately after successful login / Session Initialization  
**Figma:** Approved Authenticated Dashboard — **exact match**  
**Priority:** P0  

**Format:** Functional specification only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **ID note:** `SCREEN_MAPPING` uses SCREEN-008 for Payment Success; Session Initialization also used SCREEN-008. This doc is the **post-login primary workspace**. Implement as Free (004) / Pro·Business (009) variants of one dashboard.  
> **Design system:** No `DESIGN_SYSTEM.md` — use `DESIGN_TOKENS.md` + Figma + component specs below.

**Read with:** `docs/prd.md` · `docs/SCREEN_MAPPING.md` · `docs/COMPONENT_MAPPING.md` · `STATE_MANAGEMENT.md` · `docs/ANALYTICS.md` · `docs/ACCESSIBILITY.md` · `docs/SECURITY.md` · `docs/PRICING.md` · `docs/LAYOUT_SPECIFICATION.md` · `docs/screens/SCREEN-008_SESSION_INITIALIZATION.md` · component specs listed in §5

---

## 1. Purpose

This is the **primary workspace for authenticated users**.

Users arrive here **immediately after successful login** (via Session Initialization).

Unlike the Guest Home, this screen focuses on **productivity rather than marketing**.

| Do | Do not |
|----|--------|
| Start audits, monitor credits/plan, open recent work | Guest marketing hero / conversion-only landing |
| Match approved Figma exactly | Invent new sections or duplicate components |

---

## 2. Business & User Goals

| Business | User |
|----------|------|
| Increase audit frequency | Start a new audit quickly |
| Improve retention | See recent audits and tips |
| Drive Pro / Business upgrades | Monitor credits and membership |
| Surface account status | Open History / Manage Plan / Settings |

---

## 3. Layout

| Rule | Spec |
|------|------|
| Shell | **Global application shell** (`LAYOUT_SPECIFICATION` / AppShell) |
| Header | **Unchanged** pattern — logo, tagline, credits, avatar (crown for Pro/Business) |
| Profile | **Authenticated Profile** menu (not Guest Profile Dropdown) — Profile · Manage Plan · History · Account Settings · Logout (all enabled) |
| Main | Vertical dashboard stack in §4 |
| Footer | App shell **Footer** (legal / contentinfo) |

Remove Guest Landing marketing blocks. Do not show Guest-only disabled menu items.

---

## 4. Screen Structure

Vertical order (top → bottom):

```text
Header
  ↓
Welcome Card
  ↓
Quick Actions
  ↓
Credits Widget
  ↓
Membership Widget
  ↓
Recent Audits
  ↓
AI Tips
  ↓
Footer
```

| Rule | Spec |
|------|------|
| Order | Maintain this structure unless Figma explicitly reorders — **Figma wins** on grid/columns (e.g. Credits + Membership side-by-side) while preserving the same sections |
| No extras | Do not add Features/FAQ or other Guest marketing sections |

---

## 5. Components Used

Reuse existing component specs — **no duplicate components**.

| Section | Component spec |
|---------|----------------|
| Welcome Card | `docs/components/COMPONENT_WELCOME_CARD.md` (COMPONENT-014) |
| Quick Actions | `docs/components/COMPONENT_QUICK_ACTION_CARD.md` (COMPONENT-015) |
| Recent Audits | `docs/components/COMPONENT_RECENT_AUDIT_CARD.md` (COMPONENT-016) |
| Credits Widget | `docs/components/COMPONENT_CREDITS_WIDGET.md` (COMPONENT-017) |
| Membership Widget | `docs/components/COMPONENT_MEMBERSHIP_WIDGET.md` (COMPONENT-018) |
| AI Tips | `docs/components/COMPONENT_AI_TIPS_CARD.md` (COMPONENT-019) |
| Empty (no audits) | `docs/components/COMPONENT_EMPTY_STATE.md` (COMPONENT-020) |

Also reuse: shell Header/Footer, Authenticated Profile menu, Upgrade Modal / Plan Comparison when Quick Action or Membership Upgrade requires them.

---

## 6. Behaviour

### 6.1 Data

| Rule | Spec |
|------|------|
| Phase 1 | **Display mock data** for all widgets |
| Phase 2 | Replace with `GET /me`, credits, membership, `GET /audits?limit=5` |
| Authority | Credits and plan **server-authoritative** later — mocks must not teach client-side grants (`SECURITY.md`) |

### 6.2 Welcome Card

Personalized greeting (time-based), avatar, name, membership badge, credits summary — see COMPONENT-014.

### 6.3 Quick Actions

Render Quick Action Cards for at least:

| Action | Spec |
|--------|------|
| **Start New Audit** | Primary audit entry |
| **Upload Screenshot** | Screenshot audit flow |
| **Analyze URL** | Free → Upgrade Modal / Plan Comparison; Pro/Business → URL audit flow |
| **History** | Navigate to History |

See COMPONENT-015 for states (hover/focus/disabled/loading).

### 6.4 Credits Widget

Display **remaining credits**, monthly grant, used, progress, renewal as applicable — COMPONENT-017.  
States: Loading / Success / Warning / Exhausted.

### 6.5 Membership Widget

Display **current membership** (Free / Pro / Business), renewal, benefits, Upgrade CTA (Free), Manage Plan CTA — COMPONENT-018.

### 6.6 Recent Audits

| Condition | Spec |
|-----------|------|
| **Data exists** | Display up to **5** `RecentAuditCard`s (website, thumbnail, score, date, status, plan, Open Report) |
| **Empty** | Display `EmptyState` — **“No audits yet.”** + **“Start Your First Audit”** (COMPONENT-020 · No Audits) |

Card status routes: Completed → Report · Failed → Audit Failed · Processing → Processing.

### 6.7 AI Tips

Display **rotating** tips (UX / Accessibility / SEO / Performance) — COMPONENT-019.  
Honor `prefers-reduced-motion` (no auto-rotate; static tip OK).

### 6.8 Tier variants

| Tier | Differences |
|------|-------------|
| Free | URL Quick Action gated; Membership Upgrade CTA; no crown |
| Pro / Business | URL enabled; crown in header; Manage Plan emphasis |

---

## 7. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Keyboard | All cards, CTAs, profile menu operable |
| Screen reader | Labels for credits, plan, scores, statuses, empty state |
| Visible focus | Required |
| Landmarks | Skip link → `main`; header / main / footer |
| Live regions | Tip rotation throttled; credits updates polite when changing |

---

## 8. Analytics

| Event | Trigger |
|-------|---------|
| **Dashboard Viewed** | Dashboard ready (`home_viewed` / `dashboard_viewed` — once per visit) |
| **Start Audit** | Start New Audit quick action |
| **Upload Image** | Upload Screenshot quick action |
| **Analyze URL** | Analyze URL quick action |
| **History Opened** | History quick action or profile → History |
| **Upgrade Clicked** | Membership Upgrade (or credits upgrade CTA) |

Align property names with `ANALYTICS.md`. Do not double-fire Dashboard Viewed from Welcome Card and page.

---

## 9. Responsive

| Breakpoint | Spec |
|------------|------|
| **Desktop** | Full shell; sections per Figma (stack or 2-column widgets) |
| **Tablet** | Same sections; reflow gaps/columns per Figma |
| **Mobile** | Stack: Welcome → Quick Actions → Credits → Membership → Recent → Tips → Footer; header condenses |

Maintain productivity hierarchy — do not drop Credits/Membership on mobile.

---

## 10. Security

| Rule | Spec |
|------|------|
| Auth required | Guests never see this screen |
| Profile | Authenticated menu only |
| Audits | Scoped to current user |
| Credits / plan | Server truth in Phase 2 |

---

## 11. Developer Notes

| Rule | Spec |
|------|------|
| Reuse | Existing component specs only — **no duplicate components** |
| Mock | All widgets use mock data initially |
| Backend | Integrate later without changing layout contracts |
| Entry | Session Initialization success → this screen |
| Shell | Do not rebuild Header/Footer per page |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 12. Navigation Summary

```text
Login success → Session Initialization
        ↓
Authenticated Dashboard
        ├─ Quick Actions → audit flows / History / Upgrade (Free URL)
        ├─ Recent audit → Report | Failed | Processing
        ├─ Membership / Credits Upgrade → Upgrade / Manage Plan
        └─ Profile menu → Profile | Manage Plan | History | Settings | Logout → Guest Home
```

---

## 13. QA Checklist

□ Arrives after login; productivity layout (not Guest marketing)  
□ Shell + unchanged header + Authenticated Profile  
□ Structure: Welcome → Quick Actions → Credits → Membership → Recent → AI Tips → Footer  
□ Only listed components; no duplicates  
□ Mock data in all widgets  
□ Recent audits: cards or EmptyState  
□ Free URL gated; Pro URL enabled  
□ AI tips rotate; reduced-motion safe  
□ WCAG 2.2 AA; keyboard; SR; visible focus  
□ Analytics events listed above  
□ Desktop / tablet / mobile  

---

## 14. Non-goals

| Out of scope |
|--------------|
| Guest Landing / Guest Profile Dropdown |
| Full History page (only recent + link) |
| Full report embedded on dashboard |
| Payment Success Modal (other SCREEN-008) |
| Inventing widgets not in Figma / §4 |

---

**End of SCREEN-008 / SCREEN-008_AUTHENTICATED_DASHBOARD.md**
