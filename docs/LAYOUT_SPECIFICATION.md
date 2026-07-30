# Audient — Layout Specification

**Status:** Implemented (layout shell only)  
**Last updated:** 2026-07-30  
**Related:** `COMPONENT_MAPPING.md` · `DESIGN_TOKENS.md` · `ACCESSIBILITY.md` · `FRONTEND_TASKS.md` (FM-01)

Reusable application chrome. **No business screens** (no audit form, credits meter, auth menus, or billing).

---

## Breakpoints

| Name | Width | Behaviour |
|------|-------|-----------|
| Mobile | &lt; 768px | Sticky header; sidebar as drawer; stacked breadcrumb |
| Tablet | 768–1023px | Same drawer nav; wider content gutters at `lg` padding |
| Desktop | ≥ 1024px (`lg`) | Sticky header; collapsible sidebar rail; side-by-side content |

---

## Landmarks

| Region | Element |
|--------|---------|
| Skip link | First focusable → `#main` |
| Banner | `Navbar` → `<header>` |
| Navigation | `Sidebar` → `<aside>` + inner `<nav>` |
| Main | `Page` → `<main id="main">` (scrollable) |
| Contentinfo | `Footer` → `<footer>` |
| Breadcrumb | `<nav aria-label="Breadcrumb">` |

---

## Components

| File | Role |
|------|------|
| `app-shell.tsx` | Composes skip + navbar + sidebar + main + footer |
| `navbar.tsx` | Sticky header; logo; `end` slot; sidebar toggle |
| `sidebar.tsx` | Desktop collapse + mobile drawer; `items` prop |
| `breadcrumb.tsx` | Trail links + current page |
| `footer.tsx` | Legal links |
| `skip-link.tsx` | Skip to main |
| `page.tsx` / `container.tsx` | Main landmark + width gutters |

---

## Dark mode

`ThemeProvider` stores `light` \| `dark` \| `system`.  
**Visual dark palette is not shipped** (`darkPaletteReady={false}`) — ACCESSIBILITY §25 / DESIGN_TOKENS.

---

## Usage (later pages)

```tsx
<AppShell
  showSidebar
  sidebarItems={[/* Dashboard, History, … */]}
  headerEnd={/* CreditMeter + Avatar later */}
  breadcrumbs={[{ label: "Home", href: "/" }, { label: "History", current: true }]}
>
  {/* page content */}
</AppShell>
```
