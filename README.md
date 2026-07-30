# Audient

AI-powered UX audits that help small businesses find and fix the user-experience problems hurting their conversions. Submit a screenshot or a live URL and get an expert-level, evidence-grounded UX audit in minutes.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v3 + shadcn/ui + `tailwindcss-animate`
- **Backend / Data:** Supabase (Auth, Postgres, Storage) via `@supabase/ssr`
- **Forms & Validation:** React Hook Form + Zod
- **Animation:** Framer Motion
- **Icons:** Lucide
- **Tooling:** ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js `>=18.18` (see `.nvmrc` → Node 22)
- A Supabase project (for Auth/DB/Storage)

### Setup

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

See `.env.example`. The core required values are the Supabase URL, anon key, and service-role key. Additional integrations (Stripe, Redis, AI provider, Prisma `DATABASE_URL`) are documented there for later sprints.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with autofix |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |

## Project Structure

A feature-oriented, layered structure (`app/` → `services/` → `lib/`). See `docs/FOLDER_STRUCTURE.md` for the full rationale.

```text
src/
├── app/            # App Router: (marketing) (auth) (dashboard) route groups + api/
├── components/     # ui (shadcn) + domain components (audit, report, billing, ...)
├── constants/      # App configuration & business constants (plans, nav, credit costs)
├── contexts/       # React context definitions
├── providers/      # React provider components (theme, query, session, ...)
├── features/       # Optional feature modules
├── hooks/          # Client-side React hooks
├── lib/            # Integration adapters (supabase/, ai/)
├── services/       # Server-side business logic (audit, credits, billing, ...)
├── styles/         # Global styles / token extensions
├── types/          # Shared TypeScript types
├── utils/          # Pure, framework-agnostic helpers
└── middleware.ts   # Supabase session refresh + route protection
public/             # Static assets (brand/, icons, images)
supabase/           # Migrations, edge functions, local config
prisma/             # Prisma schema & migrations (later sprints)
workers/            # Background audit pipeline workers
tests/              # unit / integration / e2e
```

## Documentation

Product and engineering docs live in [`docs/`](./docs): PRD, technical architecture, database schema, API design, security, folder structure, component architecture, AI workflow, development roadmap, and the [engineering rules](./docs/CURSOR_RULES.md) all contributors follow.
```
