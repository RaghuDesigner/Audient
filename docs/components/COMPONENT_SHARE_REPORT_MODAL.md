# COMPONENT — Share Report Modal

**Status:** Draft (implementation-ready)  
**Last updated:** 2026-08-03  
**Owner:** Raghunath Kamlekar  
**Audience:** Product · Senior frontend · Security · QA  

**Component ID:** COMPONENT-031 (Share Report Modal)  
**Component name:** Share Report Modal (`ShareReportModal`)  
**Opened from:** Audit Summary / Report **Share Report** action  
**Figma:** Share modal when designed — **exact match**  
**Priority:** P1 (UI mock now; production share is security-sensitive)  

**Format:** Product / engineering handoff only — **no React, Next.js, TypeScript, HTML, or CSS code**.

> **Design system:** No `DESIGN_SYSTEM.md` — use **`docs/DESIGN_TOKENS.md`** + Figma + Dialog primitives.  
> **Product note:** Report share was previously lightly specified / often OOS for MVP. This brief defines the **modal UX + tier matrix**. **This phase = mock sharing only — no backend, no real public links.** Do not ship guessable public URLs without `SECURITY.md` controls (authz, expiry, revocation, audit ownership).

**Related:** `docs/prd.md` · `docs/SECURITY.md` · `docs/ACCESSIBILITY.md` · `docs/ANALYTICS.md` · `docs/PRICING.md` · `docs/screens/SCREEN-010_AUDIT_REPORT.md` · `docs/components/COMPONENT_AUDIT_SUMMARY.md` · `docs/components/COMPONENT_EXPORT_PDF_BUTTON.md` · `BUSINESS_RULES.md` (teams FUTURE)

---

## 1. Purpose

Allows users to **share an audit report with others**.

**Future versions** will support:

- Public / gated links  
- Email invitations  
- Organization sharing  

**This phase:** Mock UI only — simulate link generation/copy; no persistence, no real email, no org/team APIs.

**Reusable** whenever Share is offered (Report, Compare, Shared viewer chrome).

**Do not redesign.** Match Figma.

---

## 2. Membership Rules

| Tier | Share capabilities |
|------|-------------------|
| **Guest** | **Hidden** — Share control and modal not available |
| **Free** | **Share Link only** (Copy Link path) |
| **Pro** | **Share Link** + **Email Share** |
| **Business** | **Organization Share** + **Team Share** (+ link/email as Figma allows) |

| Rule | Spec |
|------|------|
| UI | Hide or disable options not in tier; disabled options may show Upgrade tooltip |
| Teams / Org | **Roadmap** — show Organization / Team Members options for Business as **placeholders** until BR-ENT teams ship; mock success only |
| Security | Mock links must not grant real cross-user access |

---

## 3. Modal Layout

```text
Header
  ↓
Report Information
  ↓
Share Options
  ↓
Permission Selector
  ↓
Generate Link
  ↓
Copy Link
  ↓
Footer Actions
```

| Region | Spec |
|--------|------|
| **Header** | Title e.g. “Share report” + Close |
| **Report Information** | Website name, audit date, score teaser (read-only) |
| **Share Options** | See §4 |
| **Permission Selector** | See §5 |
| **Generate Link** | CTA to create mock share link |
| **Copy Link** | Copy generated URL to clipboard |
| **Footer Actions** | Cancel / Done (and Send for Email when applicable) |

Overlay dims page; page inert while open.

---

## 4. Share Options

| Option | Tier | Spec |
|--------|------|------|
| **Copy Link** | Free+ | Generate + copy shareable link (mock URL) |
| **Email** | Pro+ | Email field(s) + send stub |
| **Organization** | Business | Org-wide share placeholder |
| **Team Members** | Business | Member picker placeholder |

Only show options allowed by §2.

---

## 5. Permissions

| Permission | Spec |
|------------|------|
| **View Only** | Default for Free/Pro link share |
| **Comment** | When comments exist; otherwise placeholder / disabled with “Coming soon” |
| **Edit (Business)** | Business only — placeholder until edit-collaboration exists |

| Rule | Spec |
|------|------|
| Free | View Only only (hide Comment/Edit or lock) |
| Pro | View Only + Comment if product allows; else View Only |
| Business | All three per Figma; Edit may be stub |
| Analytics | **Permission Changed** on change |

---

## 6. States

| State | Spec |
|-------|------|
| **Default** | Open; no link yet; options per tier |
| **Generating Link** | Busy on Generate; progress; block double-submit |
| **Link Generated** | Mock URL visible; Copy enabled |
| **Copied** | Brief “Copied” confirmation on Copy Link |
| **Error** | Friendly error (generate/copy/send failed); retry |

Email/Org/Team mock sends may reuse Success toast without leaving modal, or close — per Figma.

---

## 7. Behaviour

| Action | Spec |
|--------|------|
| Open | From Share Report → **Share Opened** |
| Generate Link | Mock delay → fake URL (e.g. `https://app.audient.example/share/mock-{id}`) → Link Generated |
| Copy Link | Clipboard write → Copied; if no link yet, Generate first or disable Copy |
| Email Shared | Validate email format client-side; mock send → analytics (no API) |
| Org / Team | Placeholder confirm → analytics; no real ACL |
| Cancel / Esc / backdrop | Close without sharing; focus restore |
| Close while Generating | Prefer block dismiss until settle or cancel generation |

---

## 8. Props (contract — conceptual)

| Prop | Values | Required | Description |
|------|--------|----------|-------------|
| `open` | boolean | Yes | |
| `auditId` | string | Yes | |
| `reportLabel` | string | Recommended | Website name for Report Information |
| `tier` | `free` \| `pro` \| `business` | Yes | (Guest never opens) |
| `state` | `default` \| `generating` \| `link_generated` \| `copied` \| `error` | Yes | |
| `shareUrl` | string \| null | When generated | Mock or real URL |
| `permission` | `view` \| `comment` \| `edit` | Yes | |
| `onPermissionChange` | action | Yes | |
| `onGenerateLink` | action | Yes | |
| `onCopyLink` | action | Yes | |
| `onEmailShare` | action | Pro+ | |
| `onOrgShare` / `onTeamShare` | action | Business | |
| `onClose` | action | Yes | |
| `errorMessage` | string \| null | Error | |

---

## 9. Accessibility

| Requirement | Spec |
|-------------|------|
| Standard | **WCAG 2.2 AA** |
| Dialog | `role="dialog"`, `aria-modal="true"`, labelled by header |
| **Focus trap** | While open |
| **Esc** | Closes when allowed |
| Keyboard | Tab through options, permission, Generate, Copy, footer |
| Focus restore | Return to Share trigger |
| Copied | Polite live announcement “Link copied” |
| Generating | `aria-busy` on Generate control |
| Permissions | Radiogroup or labelled select |

---

## 10. Security (mandatory for future real share)

| Rule | Spec |
|------|------|
| Mock phase | No real authorization; URLs must not unlock production data |
| Future links | Unpredictable tokens, expiry, revocation, owner-scoped ACL |
| Permissions | Server-enforced View/Comment/Edit |
| Email | No PII leakage in analytics; rate-limit invites |
| Org/Team | Only after teams product + RLS |
| Ownership | Sharer must own audit; recipients get least privilege |

See `SECURITY.md` — tier gating and ownership; do not weaken for share convenience.

---

## 11. Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| **Share Opened** | Modal opens | `auditId`, `tier` |
| **Link Generated** | Mock/real link created | `auditId`, `permission` |
| **Link Copied** | Copy succeeds | `auditId` |
| **Email Shared** | Email share activated (mock OK) | `auditId` (not raw email) |
| **Permission Changed** | Permission selector change | `auditId`, `permission` |

---

## 12. Responsive

| Breakpoint | Spec |
|------------|------|
| Desktop | Centered modal |
| Tablet | Same |
| Mobile | Full-width / sheet per Figma; stacked options; large tap targets |

---

## 13. Developer Notes

| Note | Spec |
|------|------|
| Phase | **Mock sharing only** — **no backend** |
| Guest | Do not mount opener or modal |
| Free | Link option only |
| Placeholders | Org/Team/Comment/Edit may be non-functional |
| Clipboard | Use secure clipboard API; fallback select-text if denied |
| Later | Real share service + SECURITY checklist before enablement |
| Reusable | One modal; tier props drive options |
| No implementation code in this document | |

**Do not generate implementation code in this document.**

---

## 14. QA Checklist

□ Layout regions present  
□ Guest hidden · Free link-only · Pro + email · Business org/team options  
□ Permissions: View Only / Comment / Edit (Business)  
□ States: Default → Generating → Generated → Copied / Error  
□ Focus trap; Esc closes; keyboard  
□ Analytics events  
□ Mock only; no real access grant  
□ Desktop / tablet / mobile · WCAG 2.2 AA · Figma match  

---

## 15. Non-goals

| Out of scope (this phase) |
|---------------------------|
| Real public link service |
| Real email delivery |
| Live org/team ACL |
| Password-protected links (unless later product) |
| Share for Guests |

---

**End of COMPONENT / COMPONENT_SHARE_REPORT_MODAL.md**
