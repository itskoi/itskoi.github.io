# Plan: Dark by default

## Approach

Flip the token cascade in `src/styles/global.css`: the dark palette moves onto bare `:root` (with `color-scheme: dark`), the paper palette becomes the `:root[data-theme="light"]` override, and the `prefers-color-scheme` block goes. CSS then paints dark before any script runs, so `initTheme()` keeps leaving `data-theme` unset when nothing is stored.

`src/lib/theme.ts` drops its `matchMedia` read: `getTheme()` returns the attribute, else `dark`. The scene-ink fallback becomes white to match.

## Alternatives considered

- **Keep OS-follow, change only the unknown-OS fallback to dark.** Rejected: browsers always report a preference, so nothing would visibly change.
- **Always set `data-theme` from `initTheme()`.** Rejected: the module script can run after first paint, which would flash paper.

## File map

| Path | Action | Purpose |
|------|--------|---------|
| `src/styles/global.css` | edit | dark on `:root`, paper on `[data-theme="light"]`, no OS block |
| `src/lib/theme.ts` | edit | `dark` fallback, no `matchMedia`, white scene fallback |
| `src/main.tsx` | edit | comment only |
| unit + e2e tests listed in `spec.md` | edit | dark-first expectations; paper-only suites store `theme=light` |

## Test plan

- **Unit**: token contract, theme resolution, hook, toggle.
- **E2E**: first visit is dark under an OS light preference; flip to light persists; the binary-star suite and paper palette checks run with a stored light choice.
