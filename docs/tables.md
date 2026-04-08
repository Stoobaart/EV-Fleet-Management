# Tables

This document specifies how all feature tables must be built. Read this before adding any new table to the project.

---

## File Structure

Each feature table owns the following files inside `src/features/<feature>/`:

```
components/
  <Feature>Table.jsx      # Table component with search, sort, and data rendering
  <Feature>Table.scss     # Scoped styles for the table component
api/
  use<Feature>.js         # TanStack Query hook + fetch function
```

The shared `DataTable` component lives in `src/shared/components/DataTable/DataTable.jsx` and is used by all feature tables — do not duplicate it.

---

## API Hook — `use<Feature>.js`

- One file per feature in `src/features/<feature>/api/`.
- Contains a private `fetch<Feature>` function and a named `use<Feature>` export.
- The fetch function accepts filter/sort/page params and appends them as URL search params.
- Always sends `limit=200` (rows per page).
- The API base URL is `http://localhost:3001/api/<feature>`.
- A 5-second abort timeout is applied via `AbortSignal.timeout(5000)`.
- Follows the error-handling pattern from `docs/data-fetching.md`: throw on failure — let TanStack Query catch it.
- `useQuery` query key includes all params that affect the result: `['<feature>', { search, sortBy, order, page }]`.
- `staleTime` must be set — use `1000 * 60 * 5` (5 min) for fleet-status data.

The server returns a paginated envelope — never a raw array:

```js
{ data: [...], total: number, page: number, totalPages: number }
```

```js
import { useQuery } from '@tanstack/react-query'

async function fetch<Feature>({ search, sortBy, order, page }) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (sortBy) params.set('sortBy', sortBy)
  if (order) params.set('order', order)
  if (page) params.set('page', page)
  params.set('limit', '200')

  const res = await fetch(`http://localhost:3001/api/<feature>?${params}`, {
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  return res.json()
}

export function use<Feature>({ search, sortBy, order, page } = {}) {
  return useQuery({
    queryKey: ['<feature>', { search, sortBy, order, page }],
    queryFn: () => fetch<Feature>({ search, sortBy, order, page }),
    staleTime: 1000 * 60 * 5,
  })
}
```

---

## Table Component — `<Feature>Table.jsx`

### URL state

- Search, sort column, sort direction, and current page are stored in URL search params via `useSearchParams`.
- This makes the table state bookmarkable and shareable.
- Params: `search`, `sortBy`, `order` (`"asc"` | `"desc"`, default `"asc"`), `page` (integer, default `1`).
- Changing search, sort, or a filter must reset `page` by deleting the param.

### Search input

- The input maintains its own local `useState` for the typed value so keystrokes feel instant.
- The URL param (and therefore the query) is only updated after debouncing via `useDebounce` from `src/shared/hooks/useDebounce.js`.
- Current debounce delay: **2000ms**.
- The `useEffect` that syncs the debounced value to `setSearchParams` must be in the dependency array: `[debouncedSearch, setSearchParams]`.

### Sort

- Clicking a sortable column header calls `handleSort(key)`.
- If `sortBy === key`, toggle `order` between `"asc"` and `"desc"`.
- Otherwise, set `sortBy` to the new key and reset `order` to `"asc"`.

### Columns definition

Define a `COLUMNS` constant at the module level (outside the component):

```js
const COLUMNS = [
  { key: '<fieldName>', label: '<Header Label>', sortable: false | true },
  ...
]
```

### Data guard

The API returns a paginated envelope. Always guard before passing rows to `DataTable`:

```js
const items = Array.isArray(data?.data) ? data.data : [];
const totalPages = data?.totalPages ?? 1;
```

### Render states

Wrap everything in `<ErrorBoundary>`. Inside, render in priority order:

1. `data?.error` — render an error message with class `<feature>-table__error`
2. `isPending` — render a loading message with class `<feature>-table__loading`
3. Default — render `<DataTable>`

### `DataTable` props

```jsx
<DataTable
  columns={COLUMNS}
  data={items}
  sortBy={sortBy}
  order={order}
  onSort={handleSort}
/>
```

---

### Pagination

Every table must render a `<Pagination>` component below the `<DataTable>`. The component is shared at `src/shared/components/Pagination/Pagination.jsx`.

```jsx
import { Pagination } from '../../../shared/components/Pagination/Pagination'

<Pagination
  page={page}
  totalPages={totalPages}
  onPrev={() => handlePageChange(page - 1)}
  onNext={() => handlePageChange(page + 1)}
/>
```

Props:

| Prop | Type | Description |
|---|---|---|
| `page` | `number` | Current page (1-based) |
| `totalPages` | `number` | Total number of pages from the server response |
| `onPrev` | `() => void` | Called when Prev is clicked |
| `onNext` | `() => void` | Called when Next is clicked |

The `Pagination` component disables Prev when `page <= 1` and Next when `page >= totalPages`. It always renders visibly — place it outside the virtualised list so it stays pinned to the bottom of the view. Adjust the feature's `__table` height token to leave room (e.g. subtract `~50px` more than before).

---

## Styles — `<Feature>Table.scss`

- Use `@use '../../../shared/styles/variables' as *;` at the top.
- Root class: `.<feature>-table` with `display: flex; flex-direction: column; gap: 16px`.
- `__controls`: `display: flex; gap: 12px; flex-wrap: wrap`.
- `__search`: `min-width: 300px`, border `1px solid var(--border)`, `border-radius: 8px`, focus border uses `$accent`.
- `__error`: `color: #c0392b; font-size: 14px`.
- `__loading`: `font-size: 14px; color: var(--text)`.

---

## Shared `DataTable` Component

Do not modify `DataTable` for feature-specific needs. It accepts:

| Prop | Type | Description |
|---|---|---|
| `columns` | `Array<{ key, label, sortable }>` | Column definitions |
| `data` | `Array<object>` | Row data — each object keyed by `col.key` |
| `sortBy` | `string` | Currently sorted column key |
| `order` | `"asc" \| "desc"` | Sort direction |
| `onSort` | `(key: string) => void` | Called when a sortable header is clicked |

`DataTable` uses `react-window` (`List`) for rendering. Row height is `45px`, overscan is `5`. The `List` measures its own container via an internal `ResizeObserver`, so no `AutoSizer` wrapper is needed. The container's height is set by the feature's `__table` SCSS class (e.g. `vehicles-table__table`), which uses `calc(100vh - Xpx)` to fill the viewport dynamically.
