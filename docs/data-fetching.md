# Data Fetching

## Tool

Use **TanStack Query** for all server state. Query hooks live in `src/features/<feature>/api/`.

## Error Handling

Fetch functions MUST throw on failure. Do not catch errors or return `{ error }` objects — let TanStack Query catch the thrown error and expose it via `isError`/`error`:

```js
async function fetchSomething() {
  const res = await fetch('/api/something')
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  return res.json()
}
```

Consumers destructure `isError`, `error`, and `refetch` from the query hook:

```js
const { data, isPending, isError, error, refetch } = useQuery(...)

if (isError) {
  // render error state with retry
}
```

Every error state must render an inline Retry button that calls `refetch`:

```jsx
{isError && (
  <p className="my-component__error">
    {error.message}
    <button className="my-component__retry" onClick={refetch}>Retry</button>
  </p>
)}
```

Style the Retry button as a ghost/secondary button using design tokens (see `docs/design-system.md` — Error states).

## Caching

All queries MUST configure `staleTime` to enable data caching. Do not rely on TanStack Query's default of `0` (which refetches on every mount).

```js
useQuery({
  queryKey: ['something'],
  queryFn: fetchSomething,
  staleTime: 1000 * 60 * 5, // 5 minutes — adjust per resource
})
```

Choose `staleTime` based on how frequently the data changes:
- High-frequency (live telemetry): 30s–1min
- Medium-frequency (fleet status): 5min
- Low-frequency (reference data): 30min+

## Optimistic Loading

Mutations MUST use optimistic updates so the UI reflects changes immediately without waiting for the server response.

```js
const queryClient = useQueryClient()

useMutation({
  mutationFn: updateSomething,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['something'] })
    const previous = queryClient.getQueryData(['something'])
    queryClient.setQueryData(['something'], (old) => ({ ...old, ...newData }))
    return { previous }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['something'], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['something'] })
  },
})
```

Always roll back on error using the snapshot captured in `onMutate`.

## Paginated responses

List endpoints (`/api/vehicles`, `/api/drivers`) return a paginated envelope — never a raw array:

```json
{ "data": [...], "total": 42, "page": 1, "totalPages": 3 }
```

Always pass `page` and `limit` as query params. `limit` is always `200` (rows per page). Include `page` in the TanStack Query key so each page is cached independently:

```js
queryKey: ['vehicles', { search, sortBy, order, make, year, status, page }]
```

Changing search, sort, or a filter must reset `page` back to `1` in the URL params (delete the `page` param so it falls back to the default).

## Naming

- Query hook files: `use<Resource>.js` (e.g. `useAnalytics.js`)
- Query keys: use the resource name as a string array (e.g. `['analytics']`)
