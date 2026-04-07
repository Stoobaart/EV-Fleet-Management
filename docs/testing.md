# Testing

Read this before writing or changing any test. All rules here are mandatory.

---

## Test Types

### Unit tests — pure components and hooks

Use for components that accept direct props and own no data-fetching logic.

- Render with direct props. No router wrapper, no mocked hooks.
- Examples: `VehicleAnalyticsCard`, `DriverAnalyticsCard`, `useDebounce`.

### Integration tests — pages and stateful components

Use for any component that calls API hooks, owns side effects, or composes children.

- Mock API hooks at module level with `jest.mock()`.
- Mock heavy shared components (e.g. `DataTable`) inline as simplified JSX.
- Wrap in `MemoryRouter` when the component uses any router hook or `Link`.
- Examples: `DashboardPage`, `VehiclesTable`, `VehicleDetailPage`, `AssignmentModal`.

### Server tests — controller functions

Use for pure Express handler functions. No HTTP layer involved.

- Mock data modules at the top of the file with `jest.mock()`.
- Reset mutable arrays in `beforeEach`.
- Build req/res objects with factory functions — do not import Express.
- These run in the `server` Jest project (Node/ESM). Import `jest` from `@jest/globals`.

---

## File Naming and Placement

```
src/features/<feature>/__tests__/<ComponentOrHook>.test.jsx   # frontend
server/features/<feature>/__tests__/<controller>.test.js      # server
```

Test file name must match the source file name exactly.

---

## Mock Patterns

### API hooks

Declare `jest.mock()` before the import that depends on it. Set the return value in `beforeEach`, not inside individual `test()` calls.

```jsx
jest.mock('../api/useVehicles')
import { useVehicles } from '../api/useVehicles'

beforeEach(() => {
  useVehicles.mockReturnValue({ isPending: true, data: undefined })
})
```

### DataTable

Mock `DataTable` inline whenever testing a parent component that renders it. The real `DataTable` uses `react-virtualized`'s `AutoSizer`, which reads `offsetWidth`/`offsetHeight` — values that are always `0` in jsdom and cause silent rendering failures.

```jsx
jest.mock('../../../shared/components/DataTable/DataTable', () => ({
  DataTable: ({ data, isPending, onSort, onRowClick, sortBy, order }) => (
    <div data-testid="data-table">
      {isPending && <div data-testid="table-pending" />}
      {data.map((row) => (
        <div key={row.id} data-testid="table-row" onClick={() => onRowClick(row)}>
          {row.make} {row.model}
        </div>
      ))}
      <button data-testid="sort-make" onClick={() => onSort('make')}>
        sort:make:{sortBy}:{order}
      </button>
    </div>
  ),
}))
```

Expose only the props the test needs to exercise. Do not replicate `DataTable`'s full API.

### useNavigate

Use a partial mock that preserves the real `react-router` module:

```js
const mockNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}))

beforeEach(() => {
  mockNavigate.mockReset()
})
```

### Cross-feature hooks

Mock using the path relative to the file under test:

```js
jest.mock('../../drivers/api/useDrivers')
import { useDrivers } from '../../drivers/api/useDrivers'
```

### Server data modules

```js
jest.mock('../vehiclesData.js', () => ({
  vehicles: [/* initial fixtures */],
}))

import { vehicles } from '../vehiclesData.js'

const resetFixtures = [/* same fixtures */]

beforeEach(() => {
  vehicles.length = 0
  vehicles.push(...resetFixtures.map(v => ({ ...v })))
})
```

Spread-clone each fixture object so mutations in one test do not leak into the next.

---

## Router Wrapping

Use `MemoryRouter` + `Routes` + `Route` when the component uses `useParams` or `useSearchParams`:

```jsx
function renderDetailPage(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/vehicles/${id}`]}>
      <Routes>
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}
```

Use plain `<MemoryRouter>` when the component only uses `useNavigate` or renders `Link`.

Do not wrap unit tests in a router — if a component requires a router it is integration-level.

---

## Describe Block Structure

Organise integration tests by data state. Each state gets its own `describe` with a `beforeEach` that sets the mock:

```js
describe('ComponentName', () => {
  describe('pending state', () => {
    beforeEach(() => {
      useFoo.mockReturnValue({ isPending: true, data: undefined })
    })
    test(...)
  })

  describe('error state', () => {
    beforeEach(() => {
      useFoo.mockReturnValue({ isPending: false, data: { error: 'Failed to load' } })
    })
    test(...)
  })

  describe('loaded state', () => {
    beforeEach(() => {
      useFoo.mockReturnValue({ isPending: false, data: fixtures })
    })
    test(...)
  })

  // Additional describes for interaction scenarios:
  describe('row click', () => { ... })
  describe('sorting', () => { ... })
})
```

Server tests use `describe` blocks per operation or business rule (e.g. `'assign'`, `'unassign'`).

---

## Error Shape

Errors are returned in `data`, not thrown. This matches the convention in `data-fetching.md`.

```js
useFoo.mockReturnValue({ isPending: false, data: { error: 'Something went wrong' } })
```

Never mock `isError: true` or throw from a mock hook — the codebase does not use TanStack Query's error channel.

---

## Assertion Style

This project does not use `@testing-library/jest-dom`. Do not use `.toBeInTheDocument()`, `.toBeVisible()`, or `.toHaveTextContent()`.

| Intent | Pattern |
|---|---|
| Element exists | `expect(screen.getByText('...')).toBeTruthy()` |
| Element absent | `expect(screen.queryByText('...')).toBeNull()` |
| Count | `expect(elements.length).toBe(n)` |
| Attribute | `expect(element.disabled).toBe(true)` |
| Text content | `expect(element.textContent).toBe('...')` |
| Function called | `expect(mockFn).toHaveBeenCalledWith(...)` |
| Function not called | `expect(mockFn).not.toHaveBeenCalled()` |

Use `getByX` when the element must be present — it throws a clear error if missing.
Use `queryByX` only for absence assertions.

---

## Server req/res Factories

```js
function makeReq(params, body = {}) {
  return { params, body }
}

function makeRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}
```

Success response assertion (no status call):

```js
expect(res.status).not.toHaveBeenCalled()
expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
```

Error response assertion:

```js
expect(res.status).toHaveBeenCalledWith(404)
expect(res.json).toHaveBeenCalledWith({ error: 'Vehicle not found' })
```

---

## What Not to Test

- **No snapshot tests.** They are brittle and not used in this project.
- **No implementation details** — internal state, private functions, CSS class names (except when a class name is the only observable signal, e.g. skeleton presence).
- **Never mock the component under test.** Only mock its dependencies.
- **Do not duplicate assertions across `describe` blocks.** If the heading always renders, test it once in `loaded state`, not in every block.

---

## Gaps — Tests to Add

These areas do not yet have tests. Follow the rules above when adding them.

**Drivers feature** — no tests exist. Follow the same structure used for `VehiclesTable` and `VehicleDetailPage`.

**`useDebounce` hook** — test standalone with `renderHook` and fake timers:

```js
jest.useFakeTimers()
const { result } = renderHook(() => useDebounce('hello', 500))
act(() => jest.advanceTimersByTime(500))
expect(result.current).toBe('hello')
```

**Async / timer-based tests** — any test involving `useEffect` timers or mutation callbacks requires `jest.useFakeTimers()` and `act`. Do not write these without wrapping state updates in `act`.

**ErrorBoundary** — render a child that throws and assert the fallback UI. Suppress the expected console error in `beforeEach`/`afterEach`:

```js
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  console.error.mockRestore()
})
```
