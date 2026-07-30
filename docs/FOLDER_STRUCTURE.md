# Audient — Next.js Folder Structure

**Status:** Draft
**Last updated:** 2026-07-27
**Owner:** Raghunath Kamlekar
**Related:** Technical Architecture Document (§4), COMPONENT_ARCHITECTURE.md
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase

This document defines a scalable folder structure for the Audient codebase and explains the purpose of every folder. It is documentation only — no code.

---

## Guiding Principles
- **Feature-oriented + layered:** UI, business logic, and integrations are separated (`app/` → `services/` → `lib/`), while components/services cluster by domain (audit, billing, report).
- **Thin routes, rich services:** route handlers and pages stay thin; business logic lives in `services/`, reused by both the API and background workers.
- **Swappable integrations:** external providers (Supabase, Stripe, AI) live behind adapters in `lib/`.
- **Type safety everywhere:** shared `types/` plus generated Supabase types keep frontend, API, and workers in sync.
- **Path alias:** import via `@/…` rather than brittle relative paths.

---

## Top-Level Structure

```text
audient/
├── src/                  # All application source code
├── public/               # Static assets served as-is
├── docs/                 # Project documentation (PRD, architecture, this file)
├── supabase/             # Supabase local config, migrations, edge functions
├── workers/              # Background job workers (audit pipeline)
├── tests/                # Test suites (unit, integration, e2e)
├── scripts/              # One-off/maintenance & dev scripts
├── .env.example          # Documented environment variables (no secrets)
├── components.json       # shadcn/ui configuration
├── tailwind.config.ts    # Tailwind theme & design tokens
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript config (incl. @/ path alias)
└── package.json
```

### Top-Level Folder Purposes
- **`src/`** — All application code (keeps the repo root clean and tooling config separate from source).
- **`public/`** — Static files (logos, icons, fonts, images, `favicon`) served directly at the site root.
- **`docs/`** — All project documentation, including the PRD, technical architecture, database, API, and this structure.
- **`supabase/`** — Supabase project configuration: local development setup, SQL migrations, RLS policies, Auth hooks/triggers, and Edge Functions. **Single source of truth** for the database schema.
- **`workers/`** — Long-running background workers that process the audit queue (crawling, AI analysis, PDF generation) — separate from the web app because they exceed serverless time limits.
- **`tests/`** — Automated tests organized by type.
- **`scripts/`** — Developer and maintenance scripts (seeding, migrations helpers, one-off tasks).

---

## `src/` — Application Source

```text
src/
├── app/                  # Next.js App Router: routes, layouts, API handlers
├── components/           # React components (UI + domain)
├── features/             # (Optional) feature modules bundling UI + hooks + logic
├── hooks/                # Reusable React hooks (client-side logic)
├── lib/                  # Configured clients & integration adapters
├── services/             # Business logic / domain services (server-side)
├── types/                # Shared TypeScript types & interfaces
├── utils/                # Pure, framework-agnostic helper functions
├── config/               # App configuration & constants (plans, credit costs, nav)
├── styles/               # Global styles & Tailwind entry
└── middleware.ts         # Next.js middleware (auth/session, redirects)
```

### `src/app/` — Routing & API (App Router)
The Next.js App Router tree. Defines pages, shared layouts, and backend route handlers. Uses **route groups** to separate concerns without affecting URLs.

```text
src/app/
├── (marketing)/          # Public, SEO-focused pages (landing, pricing, about)
├── (auth)/               # Auth screens (sign-in, sign-up, reset, verify)
├── (dashboard)/          # Authenticated app area
│   ├── dashboard/        # Home/overview
│   ├── audit/
│   │   ├── new/          # Start a new audit (URL / upload)
│   │   └── [auditId]/    # Audit results / report view
│   ├── history/          # Past audits
│   ├── billing/          # Plan, credits, upgrades
│   └── settings/         # User preferences
├── api/                  # Route handlers (backend endpoints)
│   ├── audits/           # Create/list/get audits
│   ├── billing/          # Checkout & portal sessions
│   ├── uploads/          # Signed upload URLs
│   ├── webhooks/stripe/  # Stripe webhook receiver
│   └── health/           # Health check
├── layout.tsx            # Root layout (providers, fonts)
└── globals.css           # Global stylesheet entry (Tailwind)
```
- **`(marketing)/`** — Public pages optimized for SEO (server-rendered); no auth required.
- **`(auth)/`** — Sign-in/up and account-access screens (built on Supabase Auth).
- **`(dashboard)/`** — All authenticated product screens; guarded by middleware/auth.
- **`api/`** — Backend endpoints (thin handlers that call `services/`), including the Stripe webhook and health check.

### `src/components/` — React Components
Grouped by domain, with generic primitives isolated. Aligns with COMPONENT_ARCHITECTURE.md.

```text
src/components/
├── ui/                   # shadcn/ui primitives (Button, Input, Card, Dialog…)
├── layout/               # AppShell, Navbar, Sidebar, Footer
├── dashboard/            # Dashboard-specific components
├── audit/                # AuditForm, ScoreCard, RecommendationCard…
├── report/               # ReportView, AnnotatedScreenshot, PdfDownload
├── pricing/              # PricingTable, PlanCard, UpgradeDialog
├── auth/                 # SignInForm, OAuthButtons, PasswordField
└── common/               # EmptyState, Loader, Toast, ConfirmDialog
```
- **`ui/`** — Design-system primitives generated/managed by shadcn/ui; the only place visual tokens are directly applied.
- **Domain folders** — Feature-specific components grouped for discoverability.
- **`common/`** — Cross-domain shared widgets.

### `src/features/` (Optional)
For larger features, a module can bundle its components, hooks, and local logic together (e.g., `features/audit/`). Use this when a feature grows enough that co-location beats global grouping. Optional — start with `components/` + `services/` and adopt `features/` as needed.

### `src/hooks/` — React Hooks
Reusable client-side stateful logic and data fetching, keeping components declarative.
- Examples: `useAudit` (submit/poll/fetch), `useCredits`, `useSubscription`, `useUser`, `useNotifications`.

### `src/lib/` — Integrations & Client Setup
Configured clients and adapters to external systems — the seam that keeps providers swappable.

```text
src/lib/
├── supabase/             # Browser, server, and admin Supabase clients
│   ├── client.ts         # Browser client
│   ├── server.ts         # Server client (SSR / route handlers)
│   └── admin.ts          # Service-role client (server-only)
├── stripe.ts             # Stripe SDK client
├── storage.ts            # Object storage / signed URL helpers
├── ai/                   # Provider-agnostic AI client
│   ├── index.ts          # Public interface (analyze())
│   └── providers/        # Swappable model providers
├── queue.ts              # Job queue (BullMQ) definitions
└── redis.ts              # Redis connection
```
- **`supabase/`** — Centralizes Supabase auth/db/storage clients: a browser client, a server client for SSR/route handlers, and a restricted service-role client for trusted server code only.
- Other adapters (`stripe`, `ai`, `storage`, `queue`) isolate third-party SDKs so business logic stays decoupled and testable.

### `src/services/` — Business Logic (Server-Side)
The domain core. Framework-agnostic services reused by both API route handlers and background workers.

```text
src/services/
├── audit/                # Audit lifecycle, crawling, analysis orchestration
├── credits/              # Reserve/deduct/refund credits (transactional)
├── billing/              # Stripe subscriptions & webhook handling
├── report/               # Report assembly & PDF generation
├── notification/         # Create/send notifications
└── user/                 # User/account operations
```
- Contains all rules (tier gating, credit logic, scoring). Route handlers and workers call these, never duplicating logic.

### `src/types/` — Shared Types
Central TypeScript definitions used across the app: domain types (`Audit`, `Recommendation`, `Report`, `User`, `Tier`, `Credit`), API request/response shapes, and re-exported Supabase generated types.

### `src/utils/` — Pure Helpers
Framework-agnostic, side-effect-free functions: formatting (dates, currency), scoring math, validation schemas (e.g., Zod), and small helpers. Easy to unit-test.

### `src/config/` — Configuration & Constants
Centralized app configuration as data: the **plan catalog** (tiers, prices, credit grants, feature flags), **credit costs** per action, navigation definitions, and feature flags. Keeps business constants out of scattered code.

### `src/styles/` — Styling
Global CSS entry, Tailwind layer definitions, and any design tokens/theme extensions that complement `tailwind.config.ts`.

### `src/middleware.ts`
Next.js middleware running at the edge on requests — used for **session/auth checks** (via Supabase), protecting `(dashboard)` routes, and redirects (e.g., unauthenticated → sign-in).

---

## `supabase/` — Supabase Project
```text
supabase/
├── migrations/           # SQL migrations (schema, RLS policies)
├── functions/            # Supabase Edge Functions (if used)
├── seed.sql              # Optional seed data for local dev
└── config.toml           # Local Supabase configuration
```
- **`migrations/`** — Versioned database changes, including **Row-Level Security** policies that enforce per-user data isolation.
- **`functions/`** — Optional serverless Edge Functions (e.g., an auth hook that seeds Users/Membership/Credits/Settings on sign-up).
- **`config.toml` / `seed.sql`** — Local development configuration and seed data.

---

## `workers/` — Background Workers
```text
workers/
├── index.ts              # Worker entry / queue consumer bootstrap
├── audit.worker.ts       # Runs the audit pipeline job
└── processors/           # Individual pipeline stages
```
- Consumes the audit job queue and executes the long-running pipeline (crawl → screenshots → extraction → accessibility → AI → storage → PDF). Imports from `src/services` and `src/lib` to avoid logic duplication. Runs on a container host (not Vercel serverless) due to execution-time needs.

---

## `tests/` — Testing
```text
tests/
├── unit/                 # Services & utils (pure logic)
├── integration/          # API route handlers + DB
└── e2e/                  # End-to-end flows (Playwright)
```
- **`unit/`** — Fast tests for business logic and helpers.
- **`integration/`** — Tests API handlers against a test database.
- **`e2e/`** — Full user-flow tests through the UI (sign-in, run audit, view results).

---

## Configuration Files (Root)
- **`components.json`** — shadcn/ui config (component style, aliases, Tailwind paths) controlling how primitives are generated into `src/components/ui`.
- **`tailwind.config.ts`** — Tailwind theme: design tokens (colors, spacing, typography, radius) derived from the Figma design system; the single source of visual styling truth.
- **`next.config.js`** — Next.js settings (image domains, redirects, experimental flags).
- **`tsconfig.json`** — TypeScript compiler options, including the `@/*` path alias to `src/*`.
- **`.env.example`** — Documents required environment variables (Supabase URL/keys, database URL, Stripe keys, AI keys, Redis URL) — never committed with real secrets.

---

## How It All Fits Together
- **A request** hits `src/app` (page or `api/` handler) → passes through `middleware.ts` for auth → the handler calls a **service** in `src/services` → which uses **adapters** in `src/lib` (Supabase, Stripe, AI, storage).
- **UI** is composed from `src/components` (shadcn `ui/` primitives → domain components), using `src/hooks` for data and `src/config` for constants.
- **Long audits** are enqueued by a service and executed in `workers/`, reusing the same `services/` and `lib/` — no duplicated logic.
- **The database** is defined/migrated via `supabase/migrations`, with generated types flowing into `src/types`.

This structure keeps the codebase **navigable, testable, and scalable** — new features add a route group, a few domain components, and a service, without disturbing existing code.
