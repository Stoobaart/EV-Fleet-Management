# Data Fetching

## Tool

Use **TanStack Query** for all server state. Query hooks live in `src/features/<feature>/api/`.

## Error Handling

Fetch functions must NOT throw errors. On failure, return an error object instead:

```js
async function fetchSomething() {
  try {
    const res = await fetch('/api/something')
    if (!res.ok) return { error: `Request failed with status ${res.status}` }
    return res.json()
  } catch (err) {
    return { error: err.message }
  }
}
```

Consumers check for `data.error` before using the response. Always destructure `refetch` alongside `data` so the error state can offer a Retry button:

```js
const { data, isPending, refetch } = useQuery(...)

if (data?.error) {
  // render error state with retry
}
```

Every error state must render an inline Retry button that calls `refetch`:

```jsx
{data?.error && (
  <p className="my-component__error">
    {data.error}
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

## Naming

- Query hook files: `use<Resource>.js` (e.g. `useAnalytics.js`)
- Query keys: use the resource name as a string array (e.g. `['analytics']`)
