# CLAUDE.md

## Rules — MUST READ FIRST

The `docs/` directory contains rules that govern all planning and code changes.
**Before every plan or change, read all files in `docs/` and adhere to them.**

- [`docs/rules.md`](./docs/rules.md) — coding standards, conventions, and constraints
- [`docs/data-fetching.md`](./docs/data-fetching.md) — data fetching patterns and error handling
- [`docs/tables.md`](./docs/tables.md) — table implementation spec; read before adding any new table
- [`docs/design-system.md`](./docs/design-system.md) — design tokens, spacing/colour/radius scales, and styling rules; read before any style change
- [`docs/testing.md`](./docs/testing.md) — test types, mock patterns, assertion style, and naming conventions; read before writing or changing any test
- [`docs/pages.md`](./docs/pages.md) — page component structure and conventions; read before creating or modifying any page

## Project Overview

EV Fleet Management — React 19 + Vite 8 single-page app.

## Stack

- **Framework:** React 19
- **Build tool:** Vite 8
- **Linting:** ESLint 9 with react-hooks and react-refresh plugins

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Project Structure

```
src/
  main.jsx              # Entry point
  index.css             # Global resets and variables
  app/                  # Router, layout, global providers
  features/
    dashboard/          # Analytics cards and dashboard page
    drivers/            # Drivers table and page
    vehicles/           # Vehicles table, detail page, assignment modal
  shared/
    components/         # DataTable, Navbar, StatCard, PieChart, ErrorBoundary
    data/               # Static lookup data (e.g. makeDomains)
    hooks/              # useDebounce, useTheme
    styles/             # Shared SCSS variables and mixins
  __mocks__/            # Jest style mock and setup polyfills
public/
  favicon.svg
  icons.svg             # SVG sprite sheet
```
