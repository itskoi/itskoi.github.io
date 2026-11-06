# Plan: pomo route

## Approach

Vite multi-page build. `pomo/index.html` is a second entry (`build.rollupOptions.input`) that loads `src/pomo/main.tsx`, a verbatim copy of Koidoro's `src/`. GitHub Pages serves `dist/pomo/index.html` at `/pomo/` (and redirects `/pomo` → `/pomo/`). Vite dev serves the same path. No router, no shared CSS: the portfolio's `global.css` never reaches the timer.

## Alternatives considered

- **Client-side router in `App.tsx`** — would pull Lenis/theme/global CSS into the timer page. Rejected.
- **Build Koidoro separately into `public/pomo/`** — commits build output and CI cannot build `../koidoro` (not checked out). Rejected.

## File map

| Path | Action | Purpose |
|------|--------|---------|
| `pomo/index.html` | create | second HTML entry (Koidoro's, script path rewritten) |
| `src/pomo/**` | create | copy of `../koidoro/src` minus `test-setup.ts` |
| `vite.config.ts` | edit | multi-page `input` |
| `tsconfig.json` | edit | add `vitest/globals` (Koidoro tests use globals) |
| `tests/e2e/pomo.spec.ts` | create | route renders |

## Test plan

- **Unit**: Koidoro's existing suite, now under `src/pomo/`.
- **E2E**: `/pomo/` shows the Koidoro heading and start button.

## Risks

- Source drift between `../koidoro` and `src/pomo/` — re-copy when Koidoro changes.
