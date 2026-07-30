# Audient — Cursor Development Rules

**Status:** Active
**Last updated:** 2026-07-27
**Owner:** Raghunath Kamlekar
**Related:** COMPONENT_ARCHITECTURE.md, FOLDER_STRUCTURE.md, SECURITY.md, TECHNICAL_ARCHITECTURE.md

These are the engineering rules the AI (and all contributors) must follow when building Audient. Each rule includes the reasoning behind it. To have Cursor apply these automatically, this content can also live as a rule under `.cursor/rules/` (or `AGENTS.md`).

---

## Core Rules

### 1. Always Use Reusable Components
**Rule:** Before creating UI, check whether a suitable component already exists in `src/components/ui` (shadcn primitives) or the domain folders (`audit/`, `billing/`, `report/`, etc.). Build new UI by composing existing components; only create a new component when nothing fits, and place it in the correct layer.

**Why:** Reuse keeps the UI consistent (a product that *sells* good UX must look coherent), reduces bugs (fix once, fixed everywhere), and speeds development. Shared widgets like `ScoreCard`, `SeverityBadge`, and `RecommendationCard` are reused across results, history, and the PDF — so the web and PDF always match. Duplicating UI instead leads to visual drift and double maintenance.

### 2. Never Duplicate Code (DRY)
**Rule:** Do not copy-paste logic. Extract shared logic into `utils/` (pure helpers), `hooks/` (client logic), or `services/` (business logic). If the same code appears twice, refactor it into a single source of truth.

**Why:** Duplication multiplies maintenance and bug surface — a fix or change must be made in every copy, and copies inevitably drift. Centralizing logic (e.g., credit calculations, formatting, validation) guarantees consistent behavior across the API, UI, and workers, and makes testing far easier.

### 3. Follow WCAG AA Accessibility
**Rule:** All UI must meet **WCAG 2.1 AA**: semantic HTML, keyboard operability, visible focus states, correct ARIA where needed, color contrast ≥ 4.5:1 for text, and never using color as the only signal (pair with text/icons). Images need meaningful `alt`; forms need associated labels and linked error messages.

**Why:** Accessibility is both an ethical and legal baseline — and uniquely important here because Audient *audits* accessibility. The product must exemplify what it recommends; shipping inaccessible UI would undermine credibility. AA is the widely accepted compliance target for GDPR/ADA-adjacent expectations.

### 4. Use TypeScript
**Rule:** All code is written in **TypeScript** with strict typing. No implicit `any`; define and reuse types from `src/types` and generated Supabase types. Public functions and component props have explicit types.

**Why:** Static typing catches errors at compile time (before users hit them), makes refactoring safe, and documents intent. Shared types keep the frontend, API, and workers in sync — critical for correctness in credit/billing logic where a mismatch could cost money.

### 5. Use Tailwind CSS
**Rule:** Style with **Tailwind utility classes** driven by the theme. Do not write ad-hoc CSS files or inline hardcoded style values; use Tailwind's tokens/utilities and `cn`-style class composition for variants.

**Why:** Tailwind enforces consistency (spacing, color, type all come from the shared scale), avoids CSS sprawl and specificity conflicts, and keeps styling colocated with markup for faster iteration. It also makes responsive and state variants trivial and uniform.

### 6. Use shadcn/ui
**Rule:** Build primitives on **shadcn/ui** components (in `src/components/ui`). Extend/compose them rather than importing competing UI libraries or hand-rolling primitives that shadcn already provides (Button, Dialog, Select, etc.).

**Why:** shadcn/ui gives accessible, unstyled-by-default primitives (built on Radix) that we own and can theme with our tokens — combining accessibility (supports Rule 3) with full design control. A single primitive source prevents inconsistent, competing component styles.

### 7. Follow My Design Tokens
**Rule:** Use the **design tokens** from the Figma design system (colors, spacing, typography, radii, shadows) as defined in `tailwind.config.ts`. Never hardcode hex colors, pixel values, or fonts outside the token system. Severity colors map to tokens (Critical/Major/Minor).

**Why:** Tokens are the single source of visual truth — using them guarantees brand consistency, makes rebrands/theme changes a one-place edit, and keeps the built product faithful to the Figma design. Hardcoded values cause drift and make global changes error-prone.

### 8. Keep Components Under 250 Lines
**Rule:** No component file exceeds **250 lines**. If it grows past that, split it into smaller subcomponents, extract logic into hooks/services, or break out presentational pieces.

**Why:** Small components are easier to read, test, reuse, and review. A file over 250 lines usually signals mixed responsibilities (UI + data + logic). Splitting improves reusability (Rule 1) and enforces separation of concerns (Rule 9), while keeping diffs and cognitive load manageable.

### 9. Separate Business Logic from UI
**Rule:** Components render UI and handle presentation only. Data fetching goes in `hooks/`; business rules (credit deduction, tier gating, scoring, billing) go in `services/`; integrations go in `lib/`. Presentational components receive data via props; container components/pages wire in the logic.

**Why:** This separation makes business logic testable in isolation (without rendering UI), reusable across the API and workers, and swappable without touching components. It also keeps components small (Rule 8) and prevents critical logic (e.g., credits) from being scattered and duplicated in the UI.

### 10. Generate Production-Ready Code
**Rule:** All code must be production-quality: handle loading/empty/error states, validate inputs, handle failures gracefully, avoid placeholders/TODOs in shipped paths, follow the security rules (auth, ownership, validation), and include meaningful naming. No console noise or dead code.

**Why:** Audient handles payments, user data, and long-running jobs — half-finished code causes real failures (lost credits, broken audits, security gaps). Building production-ready from the start avoids costly rework and protects users and revenue. Every async surface must account for failure, matching the app's reliability targets.

### 11. Mobile-First Responsive
**Rule:** Design and implement **mobile-first**: base styles target small screens, with Tailwind breakpoints (`sm`, `md`, `lg`) layering enhancements for larger screens. Every screen must be fully usable on mobile — no horizontal scroll, tap targets large enough, readable text.

**Why:** The PRD requires a responsive web app fully usable on mobile (no native apps in v1), and many small-business owners will check results on their phones. Mobile-first ensures the core experience works on the most constrained device first, then progressively enhances — rather than retrofitting mobile as an afterthought.

---

## Additional Standards (Supporting)

### 12. Follow the Project Structure
**Rule:** Place code in the correct folder per FOLDER_STRUCTURE.md — routes in `app/`, components by domain, logic in `services/`, adapters in `lib/`. Use the `@/` path alias.

**Why:** A predictable structure keeps the codebase navigable and scalable, and reinforces the layering that the other rules depend on.

### 13. Security by Default
**Rule:** Enforce authentication and ownership on every protected route, validate all inputs, never trust client-supplied amounts/IDs, keep secrets server-side, and apply the controls in SECURITY.md (SSRF checks, RLS, tier gating).

**Why:** Security must be built in, not bolted on. Audient processes untrusted URLs, uploads, and payments — every endpoint is a potential attack surface.

### 14. Accessibility & Reuse Are Non-Negotiable in Reviews
**Rule:** Code that duplicates components/logic, hardcodes styling, or fails WCAG AA should not be merged.

**Why:** These are the rules most likely to erode quality silently over time; enforcing them at review keeps the codebase healthy.

---

## Quick Checklist (apply to every change)
- [ ] Reused existing components/logic where possible (Rules 1, 2)
- [ ] Meets WCAG AA — semantics, keyboard, contrast, non-color signals (Rule 3)
- [ ] TypeScript with explicit types; no `any` (Rule 4)
- [ ] Styled with Tailwind + design tokens; no hardcoded values (Rules 5, 7)
- [ ] Built on shadcn/ui primitives (Rule 6)
- [ ] Component under 250 lines (Rule 8)
- [ ] Business logic in services/hooks, not components (Rule 9)
- [ ] Handles loading/empty/error; production-ready (Rule 10)
- [ ] Mobile-first responsive; usable on small screens (Rule 11)
- [ ] Correct folder placement & security controls (Rules 12, 13)
