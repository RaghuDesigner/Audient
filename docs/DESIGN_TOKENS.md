# Audient Design Tokens

**Status:** Active — Phase 4 theme foundation  
**Source of truth:** Figma Design Tokens (transcribed below)  
**Code:** `src/styles/tokens.css` → `tailwind.config.ts` → utilities  
**Related:** `docs/COMPONENT_MAPPING.md`, `docs/CURSOR_RULES.md`, `docs/DEVELOPER_GUIDELINES.md`

Values marked **Documented** come from Figma. Values marked **Derived** are required for Tailwind/shadcn and are not inventing a new brand — light theme only (no dark palette).

---

## Colors

| Token | Hex | Kind | Tailwind |
|-------|-----|------|----------|
| Primary | `#1C018E` | Documented | `bg-primary` / `text-primary` |
| Secondary | `#8050E6` | Documented | `bg-secondary` / `text-secondary` |
| Success | `#16A34A` | Documented | `bg-success` / `text-success` |
| Warning | `#F59E0B` | Documented | `bg-warning` / `text-warning` |
| Error | `#DC2626` | Documented | `bg-error` / `text-error` |
| Background | `#FFFFFF` | Documented | `bg-background` |
| Surface | `#F8FDFF` | Documented | `bg-surface` / `bg-card` |

**Severity mapping**

| Severity | Token | Color |
|----------|-------|-------|
| Critical | `error` / `severity-critical` | `#DC2626` |
| Major | `warning` / `severity-major` | `#F59E0B` |
| Minor | `severity-minor` (neutral) | derived slate |

`destructive` is an alias of Error for shadcn/ui.

---

## Typography

**Font family (documented):** Manrope — loaded via `next/font` as `--font-sans` in `src/app/layout.tsx`.

### Font sizes & weights (documented)

| Role | Size | Weight | Tailwind |
|------|------|--------|----------|
| Heading 1 | 48px | 700 | `text-h1` / `font-bold` |
| Heading 2 | 40px | 600 | `text-h2` / `font-semibold` |
| Body large | 32px | 400 | `text-body-lg` / `font-regular` |
| Body | 24px | 400 | `text-body` / `font-regular` |
| smallBody | 18px | 400 | `text-body-sm` / `font-regular` |
| infoBody | 12px | 400 | `text-info` / `font-regular` |

### Font weights (documented)

| Token | Value | Tailwind |
|-------|-------|----------|
| regular | 400 | `font-regular` |
| semibold | 600 | `font-semibold` |
| bold | 700 | `font-bold` |

### Line heights (derived)

| Token | Value | Tailwind |
|-------|-------|----------|
| none | 1 | `leading-none` |
| tight | 1.2 | `leading-tight` (headings) |
| snug | 1.35 | `leading-snug` (body-lg) |
| normal | 1.5 | `leading-normal` (body) |
| relaxed | 1.65 | `leading-relaxed` |

### Letter spacing (derived)

| Token | Value | Tailwind |
|-------|-------|----------|
| tighter | -0.02em | `tracking-tighter` (h1) |
| tight | -0.01em | `tracking-tight` (h2) |
| normal | 0 | `tracking-normal` |
| wide | 0.02em | `tracking-wide` |

---

## Spacing

| Token | Value | Kind | Tailwind |
|-------|-------|------|----------|
| sm | 8px | Documented | `p-sm` / `gap-sm` / `m-sm` |
| md | 16px | Documented | `p-md` / `gap-md` / `m-md` |
| lg | 24px | Documented | `p-lg` / `gap-lg` / `m-lg` |

Container padding: 16px mobile / 24px desktop (`FRONTEND_TASKS` FM-01).

---

## Border Radius

| Token | Value | Kind | Tailwind |
|-------|-------|------|----------|
| Small | 4px | Documented | `rounded-sm` |
| Medium | 8px | Documented | `rounded-md` |
| Large | 16px | Documented | `rounded-lg` |
| Full | 9999px | Derived | `rounded-full` |

---

## Shadows

| Token | Kind | Tailwind |
|-------|------|----------|
| Shadow SM | Named in Figma; CSS derived | `shadow-sm` |
| Shadow MD | Named in Figma; CSS derived | `shadow-md` |
| Shadow LG | Named in Figma; CSS derived | `shadow-lg` |

Exact blur/offset values were not exported from Figma; soft neutrals are used (no purple glow).

---

## Opacity (derived)

| Token | Value | Tailwind |
|-------|-------|----------|
| 0 | 0 | `opacity-0` |
| 5 | 0.05 | `opacity-5` |
| 10 | 0.1 | `opacity-10` |
| 20 | 0.2 | `opacity-20` |
| 40 | 0.4 | `opacity-40` |
| 50 | 0.5 | `opacity-50` |
| 60 | 0.6 | `opacity-60` |
| 80 | 0.8 | `opacity-80` |
| 100 | 1 | `opacity-100` |

---

## Breakpoints (derived — mobile-first)

| Token | Min width | Tailwind |
|-------|-----------|----------|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1400px | `2xl:` |

---

## Z-index (derived)

| Token | Value | Tailwind |
|-------|-------|----------|
| base | 0 | `z-base` |
| raised | 10 | `z-raised` |
| dropdown | 50 | `z-dropdown` |
| sticky | 100 | `z-sticky` |
| overlay | 200 | `z-overlay` |
| modal | 300 | `z-modal` |
| toast | 400 | `z-toast` |
| tooltip | 500 | `z-tooltip` |

---

## Transitions (derived)

| Token | Value | Tailwind |
|-------|-------|----------|
| duration-fast | 150ms | `duration-fast` |
| duration-DEFAULT | 200ms | `duration` / `duration-DEFAULT` |
| duration-slow | 300ms | `duration-slow` |
| ease-in-out-smooth | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-in-out-smooth` |
| ease-out-expo | `cubic-bezier(0.16, 1, 0.3, 1)` | `ease-out-expo` |

Honor `prefers-reduced-motion` (enforced in `globals.css`).

---

## Usage rules

- Prefer utilities (`bg-primary`, `text-h1`, `rounded-md`, `gap-md`) — never hardcode `#1C018E` or raw `px` in components.
- If a token is missing, add it to `tokens.css` + `tailwind.config.ts` (+ this doc), then use it.
- Do not invent a dark theme until designed.
