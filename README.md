# EV Fleet Management

A single-page application for managing an electric vehicle fleet — tracking vehicles, drivers, and assignments across a 300-vehicle, 100-driver dataset.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Compiler | React Compiler (babel-plugin-react-compiler) |
| Routing | React Router 7 |
| Server state | TanStack Query 5 |
| Styling | SCSS + design token system |
| Backend | Express 5 (Node.js) |
| Table rendering | react-virtualized |

## Running the app

Two processes are required — start each in a separate terminal:

```bash
npm run server   # Express API on http://localhost:3001
npm run dev      # Vite dev server on http://localhost:5173
```

Other commands:

```bash
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Features

### Vehicles (`/vehicles`)
- Virtualized table rendering 300 vehicles with no scroll performance degradation
- Per-column sorting (make, model, year, driver, colour, range) — server-side
- Full-text search across plate, make, model, year, and driver — debounced, server-side
- Filter dropdowns for make, year, and assignment status — server-side, stacks with search and sort
- Brand favicon icons per vehicle make via Google's favicon service
- All table state (search, sort, filters) persisted in URL search params — bookmarkable and shareable

### Drivers (`/drivers`)
- Driver roster with vehicle assignment tracking

### Dashboard (`/`)
- Fleet analytics overview

## Architecture

### Feature-based structure

The project is organised by domain, not by file type. Each feature owns everything it needs — components, API hooks, styles, and state — co-located in `src/features/<feature>/`. Shared cross-feature utilities live in `src/shared/`.

```
src/
  features/
    vehicles/
      api/            # TanStack Query hooks
      components/     # VehiclesTable, etc.
      pages/          # Thin route-level wrappers
    drivers/
    dashboard/
  shared/
    components/       # DataTable, ErrorBoundary, Navbar
    hooks/            # useDebounce
    styles/           # SCSS design tokens (_variables.scss)
    data/             # Shared static data (makeDomains)
  app/
    router.jsx        # Route definitions
server/
  features/
    vehicles/         # Controller, router, data
    drivers/
    analytics/
```

### State management by scope

State is assigned to the right tool for its scope — nothing is over-centralised:

- **URL search params** — table state (search query, sort column, sort direction, active filters). Makes table state bookmarkable, shareable, and browser-history-aware with no extra work.
- **`useState`** — local ephemeral state, e.g. the raw search input value before debouncing.
- **TanStack Query** — all server data fetching, caching, and synchronisation. Each unique combination of params has its own cache entry via a structured query key.
- **Redux Toolkit** — reserved for global UI state that doesn't belong to a single component.

### Server-side filtering and sorting

All filtering, searching, and sorting happens on the Express server, not in the browser. The client sends params (`search`, `sortBy`, `order`, `make`, `year`, `status`) as URL query strings; the server applies them in order and returns only the matching, sorted result. This keeps the client free of data-manipulation logic and scales naturally if the data source is swapped to a real database.

### Derived data, not duplicated data

Vehicle assignment `status` (`assigned` / `unassigned`) is computed at query time in the server controller from the `driver` field, rather than stored as a separate column. This means there is one source of truth — the `driver` field — and `status` can never fall out of sync when assignments change.

### DataTable as a generic, composable component

`DataTable` (`src/shared/components/DataTable/`) is a feature-agnostic rendering component. It accepts a `columns` definition array that supports:

- `sortable` — enables clickable sort headers
- `width` — opts a column into a fixed pixel width instead of `flex: 1`
- `render` — custom cell renderer, enabling rich content (icons, badges) without leaking feature logic into the shared component

Feature tables pass their own `COLUMNS` config and remain fully in control of presentation without modifying the shared component.

### Virtualized table rendering

`DataTable` uses `react-virtualized` (`AutoSizer` + `List`) to render only the rows currently in the viewport. With 300 vehicles, this keeps rendering overhead flat regardless of dataset size.

### Design system

Styling uses a token-based design system defined in `src/shared/styles/_variables.scss` (SCSS variables, compile-time) and `src/index.css` (CSS custom properties, runtime — used for dark mode). Tokens cover spacing (`$space-1`–`$space-8`), colour, border-radius, typography, and semantic states (error/success/warning). No colours, spacing values, or border-radius values are hardcoded in component styles. See [`docs/design-system.md`](./docs/design-system.md) for the full token reference and styling rules.

### Filter options endpoint

Available filter values (makes, years) are derived dynamically from the live data via a dedicated `GET /api/vehicles/filters` endpoint rather than being hardcoded on the client. This means the dropdowns stay accurate if vehicles are added or removed.

### React Compiler

The project uses the React Compiler (`babel-plugin-react-compiler`) via `@vitejs/plugin-react`'s Babel integration. The compiler automatically inserts memoization at build time, eliminating the need to manually write `useMemo`, `useCallback`, or `memo` calls. All memoization is derived from the component's source code rather than maintained by hand.

### Search debouncing

The search input maintains its own local `useState` for the typed value so keystrokes feel instant. The URL param (and therefore the server query) is only updated after a debounce delay via a shared `useDebounce` hook — preventing a server request on every keystroke.
