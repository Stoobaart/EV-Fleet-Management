# Design System

All styling uses SCSS with a token-based design system. **Never hardcode colours, spacing, or border-radius values in component styles.** Always use the tokens defined in `src/shared/styles/_variables.scss` and the CSS custom properties in `src/index.css`.

---

## Token reference

All tokens live in `src/shared/styles/_variables.scss`. Import them into any SCSS file with:

```scss
@use '../../../shared/styles/variables' as *;
// (adjust the relative path to suit the file's location)
```

### Colours

| Token | Value | Usage |
|---|---|---|
| `$text` | `#6b6375` | Body text, secondary labels |
| `$text-h` | `#08060d` | Headings, primary content |
| `$bg` | `#fff` | Page and component backgrounds |
| `$border` | `#e5e4e7` | Borders, dividers |
| `$accent` | `#aa3bff` | Primary action colour |

For values that must respond to dark mode at runtime, use the CSS custom properties directly: `var(--text)`, `var(--text-h)`, `var(--bg)`, `var(--border)`, `var(--accent)`, `var(--accent-bg)`, `var(--accent-border)`, `var(--shadow)`.

#### Semantic colours

| Token | CSS var | Value | Usage |
|---|---|---|---|
| `$color-error` | `var(--color-error)` | `#c0392b` | Error messages, destructive states |
| `$color-success` | `var(--color-success)` | `#27ae60` | Success states |
| `$color-warning` | `var(--color-warning)` | `#e67e22` | Warning states |

Use the SCSS variable (`$color-error`) in SCSS files. These colours do not change in dark mode; if dark-mode variants are added later, switch to the CSS custom properties.

### Spacing scale

| Token | Value |
|---|---|
| `$space-1` | `4px` |
| `$space-2` | `8px` |
| `$space-3` | `12px` |
| `$space-4` | `16px` |
| `$space-5` | `24px` |
| `$space-6` | `32px` |
| `$space-7` | `48px` |
| `$space-8` | `64px` |

### Border-radius scale

| Token | Value | Usage |
|---|---|---|
| `$radius-sm` | `6px` | Small elements (nav links, badges) |
| `$radius-md` | `8px` | Inputs, dropdowns |
| `$radius-lg` | `12px` | Cards, tables |

### Typography

| Token | Value |
|---|---|
| `$font-sans` | `system-ui, 'Segoe UI', Roboto, sans-serif` |
| `$font-size-xs` | `12px` |
| `$font-size-sm` | `14px` |
| `$font-size-md` | `16px` |
| `$font-size-lg` | `18px` |
| `$font-size-xl` | `24px` |
| `$font-size-2xl` | `36px` |
| `$font-size-3xl` | `56px` |

### Other

| Token | Value | Usage |
|---|---|---|
| `$nav-height` | `64px` | Navbar height |
| `$transition-fast` | `0.15s` | Hover/focus transitions |

---

## Rules

1. **No hardcoded colours.** Use `$color-error`, `var(--accent)`, etc.
2. **No hardcoded spacing.** Use `$space-*` tokens.
3. **No hardcoded border-radius.** Use `$radius-sm/md/lg`.
4. **No hardcoded font sizes.** Use `$font-size-*` tokens.
5. **SCSS only** — no plain CSS files except `src/index.css` (global resets and CSS custom properties).
6. **Co-locate styles** — feature SCSS lives in `src/features/<feature>/components/` or `src/features/<feature>/styles/`; shared SCSS in `src/shared/styles/`.
7. **BEM naming** — `block__element--modifier`.

---

## Loading states

### Shimmer skeleton — images and cards

Use the shimmer skeleton for content that has a known shape before it loads: images and dashboard cards.

Import the shared mixin and apply it to a placeholder element sized to match what will appear:

```scss
@use '../../../shared/styles/skeleton' as *;

.my-component__skeleton {
  width: 100%;
  height: 320px;
  border-radius: $radius-lg;
  @include skeleton;
}
```

The `@keyframes skeleton-shimmer` animation is defined once in `src/shared/styles/_skeleton.scss` and included automatically when the mixin is used. The shimmer uses `var(--border)` and `var(--bg)` so it works in both light and dark mode.

Hide the real element with `display: none` until it has loaded, then remove the skeleton:

```jsx
const [loaded, setLoaded] = useState(false)

<>
  {!loaded && <div className="my-component__skeleton" aria-hidden="true" />}
  <img
    src={src}
    onLoad={() => setLoaded(true)}
    style={loaded ? undefined : { display: 'none' }}
  />
</>
```

### Loading spinner — tables

Use the loading spinner for tabular data. Pass `isPending` to `DataTable` — it renders the spinner automatically inside the table wrapper at the full table height, so no loading state is needed in the parent component.

```jsx
<DataTable
  columns={columns}
  data={rows}
  isPending={isPending}
  ...
/>
```

The spinner style is defined in `src/shared/components/DataTable/DataTable.scss`. It uses `$accent` for the active arc and `var(--border)` for the track.

---

## Adding new tokens

If the design calls for a value not covered above, add it to `src/shared/styles/_variables.scss` (and the matching CSS custom property to `src/index.css` if it needs dark-mode support), then use it via the token — never inline.
