# EV Fleet Management

A single-page application for managing an electric vehicle fleet — 300 vehicles, 100 drivers.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Compiler | React Compiler (babel-plugin-react-compiler) |
| Routing | React Router 7 |
| Server state | TanStack Query 5 |
| Styling | SCSS + design token system |
| Backend | Express 5 (Node.js) |
| Table rendering | react-window |

## Running the app

```bash
npm run server   # Express API on http://localhost:3001
npm run dev      # Vite dev server on http://localhost:5173
npm test         # Jest
npm run lint     # ESLint
```

## Features

### Vehicles (`/vehicles`)
- Virtualized table — 300 vehicles, no scroll performance degradation
- Server-side sort, search (debounced), and filter (make, year, status)
- Paginated — 200 rows per page, Prev/Next always visible in the viewport
- Brand favicon per make via Google's favicon service
- All state (search, sort, filters, page) in URL params — bookmarkable and shareable

### Drivers (`/drivers`)
- Driver roster with vehicle assignment tracking
- Server-side sort, search (debounced)
- Paginated — 200 rows per page, Prev/Next always visible in the viewport
- All state (search, sort, page) in URL params

### Dashboard (`/`)
- Fleet analytics overview

## Architecture

### Structure

Feature-based: each feature owns its components, API hooks, styles, and tests in `src/features/<feature>/`. Shared utilities live in `src/shared/`.

```
src/
  features/
    vehicles/     # api/, components/, hooks/, pages/, __tests__/
    drivers/
    dashboard/
  shared/
    components/   # DataTable, Pagination, ErrorBoundary, Navbar
    hooks/        # useDebounce
    styles/       # SCSS design tokens
    data/         # makeDomains
  app/
    router.jsx
server/
  features/
    vehicles/     # controller, router, data
    drivers/
    analytics/
```

### State by scope

| Scope | Tool |
|---|---|
| URL params | Search, sort, filters, page — bookmarkable, browser-history-aware |
| `useState` | Raw search input (pre-debounce) |
| TanStack Query | All server data — fetching, caching, synchronization |

### Server-side data pipeline

All filtering, sorting, searching, and pagination runs on the Express server. The client sends `search`, `sortBy`, `order`, `make`, `year`, `status`, `page`, and `limit` as query params. The server returns a paginated envelope:

```json
{ "data": [...], "total": 42, "page": 1, "totalPages": 3 }
```

Page size is fixed at 200 rows. Changing search, sort, or a filter resets page to 1. Each unique param combination gets its own TanStack Query cache entry — navigating back to a visited page is instant.

### Key decisions

**Thrown errors over error-as-data** — fetch functions throw on failure so TanStack Query's built-in retry fires automatically. The `isError`/`error`/`refetch` shape is consistent across all queries and data is guaranteed present on the success path.

**Optimistic mutation updates** — the assignment mutation updates the UI immediately in `onMutate` and rolls back in `onError`, making driver assignment feel instant.

**Virtualized table rendering** — `react-window` renders only visible rows. The `DataTable` wrapper uses `display: flex; flex-direction: column` so the list container fills the exact remaining height after the header via `flex: 1; min-height: 0`, which `react-window`'s internal `ResizeObserver` measures correctly.

**Shared `Pagination` component** — Prev/Next controls are extracted to `src/shared/components/Pagination/` so any future table can reuse them without duplicating disabled-state logic. The component is stateless — it owns no URL or page knowledge.

**React Compiler** — `babel-plugin-react-compiler` inserts memoization at build time, eliminating manual `useMemo`/`useCallback`/`memo` calls.

**Token-based design system** — all colors, spacing, border-radius, and typography are defined as SCSS variables (`_variables.scss`) and CSS custom properties (`index.css`). Dark mode is implemented by redefining the CSS custom properties — no component styles change.
