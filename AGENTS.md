# Audient — Contributor & AI Agent Guide

Audient is an AI-powered UX Audit SaaS. Read the docs before writing code.

## Source of Truth

- **Engineering rules:** `docs/CURSOR_RULES.md` (reusable components, DRY, WCAG AA, strict TS, Tailwind tokens, shadcn/ui, ≤250-line components, logic out of UI, mobile-first, security-by-default).
- **Folder structure:** `docs/FOLDER_STRUCTURE.md`.
- **Architecture / DB / API / Auth / Security:** `docs/TECHNICAL_ARCHITECTURE.md`.
- **Pricing & credits (authoritative):** `docs/PRICING.md` + `src/config/plans.ts`.
- **Screens:** `docs/SCREEN_MAPPING.md`; missing screens/scenarios: `docs/MISSING_SCREENS_PLAN.md`.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v3 · shadcn/ui · Supabase (Auth/DB/Storage) · React Hook Form · Zod · Framer Motion · Lucide · ESLint · Prettier.

## Conventions

- Import via the `@/*` alias (maps to `src/*`).
- Routes/pages stay thin; business logic lives in `src/services`, integrations in `src/lib`, client logic in `src/hooks`, pure helpers in `src/utils`.
- Style only with Tailwind design tokens defined in `tailwind.config.ts` / `globals.css`; never hardcode colors or spacing.
- Build UI on shadcn/ui primitives in `src/components/ui`.

## Checks (run before committing)

```bash
npm run typecheck
npm run lint
npm run format
```
