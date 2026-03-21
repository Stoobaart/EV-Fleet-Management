# Project Rules

These rules govern all planning and code changes for this project. Claude MUST read and adhere to every file in `docs/` before making any plan or change.

---

## General Principles

- Keep solutions simple and focused — avoid over-engineering.
- Do not add features, refactor, or "improve" code beyond what was explicitly requested.
- Do not add comments or type annotations to code you didn't change.
- Prefer editing existing files over creating new ones.
- Do not create documentation files unless explicitly requested.

## Architecture — Feature-Based Structure

The app MUST use feature-based file organization, NOT type-based.

- Group files by feature/domain, not by file type.
- Each feature lives in `src/features/<feature-name>/` and owns its components, hooks, state, styles, and tests.
- Shared/cross-feature code goes in `src/shared/`.

```
src/
  features/
    vehicles/
      components/
      hooks/
      store/         # RTK slice
      api/           # TanStack Query hooks
      styles/        # SCSS files
      __tests__/
    drivers/
      ...
  shared/
    components/
    hooks/
    styles/
  pages/             # Route-level entry points only — thin wrappers around features
  app/               # Router setup, store setup, global providers
```

## Routing

- Use **React Router** for all client-side routing.
- Route definitions live in `src/app/router.jsx`.
- Pages in `src/pages/` are thin route-level components that compose feature components.

## State Management

| Scope | Tool |
|---|---|
| Local / component | `useState`, `useReducer` |
| Global UI state | **Redux Toolkit (RTK)** |
| Server / async state | **TanStack Query** |

- Do not use RTK for server state — use TanStack Query for all data fetching, caching, and synchronization.
- Do not use TanStack Query for purely local UI state — use `useState`/`useReducer`.
- RTK slices live in `src/features/<feature>/store/`.
- TanStack Query hooks live in `src/features/<feature>/api/`.

## Styling

- Use **SCSS** for all styles — no plain CSS files except `src/index.css` (global resets/variables only).
- SCSS files are co-located within the feature: `src/features/<feature>/styles/`.
- Shared SCSS variables, mixins, and tokens go in `src/shared/styles/`.
- Do not hardcode colors or spacing — use SCSS variables sourced from design tokens.

## Testing

- Use **Jest** for all unit and integration tests.
- Tests are co-located in a `__tests__/` folder within each feature.
- Test file naming: `<ComponentOrHook>.test.jsx` / `.test.js`.
- Run tests with `npm test` before considering any task complete.

## Code Style

- Use functional React components with hooks — no class components.
- Keep components small and single-responsibility.
- Use named exports for components; default export only in entry/page files.
- Keep state as local as possible; lift only when necessary.

## Dependency Rules

- Do not add new dependencies without explicit user approval.
- Approved dependencies: React Router, Redux Toolkit, TanStack Query, SCSS (sass), Jest.

## Linting

- Run `npm run lint` after any code change to verify no new lint errors are introduced.
- Do not skip or suppress lint rules without explicit user approval.
