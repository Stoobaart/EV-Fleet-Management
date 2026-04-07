# Pages

Read this before creating or modifying any page component. All rules here are mandatory.

---

## What a page is

Pages live in `src/features/<feature>/pages/` and are route-level entry points only. They compose feature components — they do not own business logic, data fetching, or state directly.

---

## Required structure

Every page must render a `<main>` landmark containing an `<h1>` as its first child.

```jsx
export function VehiclesPage() {
  return (
    <main>
      <h1>Vehicles</h1>
      <VehiclesTable />
    </main>
  )
}
```

- `<main>` is the page landmark — do not use `<div>` or a fragment as the root.
- `<h1>` contains the page title — one per page, matches the nav label for that route.
- Everything after the `<h1>` is composed feature components.

---

## Detail pages

Detail pages follow the same rules. The `<main>` and `<h1>` are always rendered — loading, error, and data states are handled inside the `<main>` after the heading.

```jsx
export default function VehicleDetailPage() {
  const { data, isPending, refetch } = useVehicle(id)

  return (
    <main>
      <button onClick={() => navigate(-1)}>← Back</button>
      {isPending ? (
        <div aria-label="Loading" />
      ) : data?.error ? (
        <p className="vehicle-detail__error">
          {data.error}
          <button className="vehicle-detail__retry" onClick={refetch}>Retry</button>
        </p>
      ) : (
        <div>...</div>
      )}
    </main>
  )
}
```

Always destructure `refetch` from the query hook and include a Retry button in every error state. See `docs/data-fetching.md` and `docs/design-system.md` for the full pattern and SCSS.

Detail pages may omit the `<h1>` when the heading is derived from loaded data and rendered inside the content section (e.g. `{data.year} {data.make} {data.model}`). In that case the title is part of the loaded state block, not a static `<h1>` at the top.

---

## Export convention

- List pages use named exports: `export function VehiclesPage()`
- Detail pages use default exports: `export default function VehicleDetailPage()`

This matches the router setup in `src/app/router.jsx` — default exports are used for lazy-loaded routes.

---

## What pages must not do

- No data fetching directly in the page — delegate to feature components or hooks.
- No local UI state — that belongs in the feature component.
- No styles imported at the page level unless they apply to the `<main>` container itself.
