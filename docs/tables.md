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
- The fetch function accepts filter/sort params and appends them as URL search params.
- The API base URL is `http://localhost:3001/api/<feature>`.
- A 5-second abort timeout is applied via `AbortSignal.timeout(5000)`.
- Follows the error-handling pattern from `docs/data-fetching.md`: never throw — return `{ error }` on failure.
- `useQuery` query key includes all params that affect the result: `['<feature>', { search, sortBy, order }]`.
- `staleTime` must be set — use `1000 * 60 * 5` (5 min) for fleet-status data.

```js
import { useQuery } from '@tanstack/react-query'

async function fetch<Feature>({ search, sortBy, order }) {
  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (sortBy) params.set('sortBy', sortBy)
    if (order) params.set('order', order)

    const res = await fetch(`http://localhost:3001/api/<feature>?${params}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { error: `Request failed with status ${res.status}` }
    return res.json()
  } catch (err) {
    return { error: err.message }
  }
}

export function use<Feature>({ search, sortBy, order } = {}) {
  return useQuery({
    queryKey: ['<feature>', { search, sortBy, order }],
    queryFn: () => fetch<Feature>({ search, sortBy, order }),
    staleTime: 1000 * 60 * 5,
  })
}
```

---

## Table Component — `<Feature>Table.jsx`

### URL state

- Search, sort column, and sort direction are stored in URL search params via `useSearchParams`.
- This makes the table state bookmarkable and shareable.
- Params: `search`, `sortBy`, `order` (`"asc"` | `"desc"`, default `"asc"`).

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

Always guard the query result before passing to `DataTable`:

```js
const items = Array.isArray(data) ? data : [];
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

`DataTable` uses `react-virtualized` (`AutoSizer` + `List`) for rendering. Row height is `45px`, table height is `600px`, overscan is `5`.
