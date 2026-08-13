# Plan: typography-and-theme

> HOW we implement the spec. Approach, alternatives, file map, test plan, risks.

## Approach

Three independent concerns, layered bottom-up so each is independently testable:

**(1) Type system.** Add `--font-serif` / `--font-sans` / `--font-mono` and a clamp-based type scale to `global.css`. Map roles globally: `h1,h2,h3 { font-family: var(--font-serif); font-optical-sizing: auto }`, `body { font-family: var(--font-sans) }`, and a small `.eyebrow` / dates / tag-chip utility that uses `--font-mono`. Self-host the families with `@fontsource-variable/fraunces`, `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, imported once from a new `src/styles/fonts.css` (which `main.tsx` imports) so Vite bundles the woff2 and there is no runtime request to a font CDN. `@fontsource-variable/*` ships matching metric fallbacks, so there's no first-paint reflow.

**(2) Theme system.** Move every hardcoded color into tokens. `:root` carries the dark palette (dark = default, since dark is the showcase mode and the no-JS/no-storage fallback must still look right); `[data-theme="light"]` overrides every token; and a `@media (prefers-color-scheme: light)` block scoped to `:root:not([data-theme])` makes a first visit (no stored choice) follow the OS. A framework-free `src/lib/theme.ts` owns resolution + persistence + a tiny pub/sub:

- `initTheme()` — read `localStorage["theme"]`; else read `matchMedia("(prefers-color-scheme: light)")`; else `dark`. Set `documentElement.dataset.theme`. Idempotent.
- `getTheme()`, `setTheme(mode)`, `toggleTheme()` — mutate the attribute + storage + notify.
- `onThemeChange(cb): () => void` — subscribe / unsubscribe.
- `readSceneColors()` — the **testable seam**: reads `--scene-figure-rgb` from `documentElement` computed style and returns `{ r, g, b }` (and a couple of derived alphas), so the canvas/3D layers never hardcode color. Called at scene init **and** on every `onThemeChange`.

`initTheme()` runs in `main.tsx` **before** `createRoot().render(...)` so the correct tokens are applied at first paint — no flash of the wrong theme. `color-scheme: light dark` (+ per-mode value) lands on `:root` so native scrollbars/selection match.

**(3) Scene layers follow the theme.** Replace the hardcoded hex/`0x`/`rgba` in `Background.tsx` and `ChessScene.tsx` with values derived from `readSceneColors()`:

- `Background` — stars, wires, nodes, and `drawPulse` all draw from the figure RGB at fixed alphas; the `.backdrop` gradient switches to `var(--scene-backdrop)`. Subscribe in the effect: on change, re-read colors and re-render the offscreen static layer (cheap; it already re-renders on resize).
- `ChessScene` — replace `CYAN`/`VIOLET` with a single figure color for both pieces (Queen and King now share `--scene-figure`). Because rebuilding three.js materials mid-flight is fiddly, the cleanest correct move is to **key the `useEffect` on the resolved theme** so the scene tears down and rebuilds on toggle. Toggle is rare and user-driven, so the rebuild cost is negligible, and teardown already disposes geometries/materials/renderer (no leak). We pass the theme in via a `useTheme()`-driven prop or read it through a subscription that bumps a state the effect depends on.

A new `useTheme()` hook wraps the pub/sub for React (`{ theme, toggle }`, re-renders on change). `ThemeToggle` is a small button in `Nav` — sun/moon glyph via inline SVG, `aria-pressed`, visible `:focus-visible` ring, `aria-label` that names the *target* state ("Switch to light mode"). It is a pure presentational consumer of `useTheme()`.

Violet (`--color-accent-2`) is removed entirely; its sole consumer (the King) moves to the figure color, superseding the color decision in `specs/chess-pieces/`.

## Alternatives considered

- **`class="dark|light"` instead of `data-theme`.** Rejected — equivalent power, but `data-theme` is the convention for state-only attributes and reads clearer in selectors/tests than a presentational class.
- **CSS-only via `prefers-color-scheme`, no toggle.** Rejected — the owner chose a manual toggle that remembers the choice; CSS alone can't persist or override the OS preference.
- **A theming library (e.g. next-themes-style).** Rejected — overkill for a static SPA; ~40 lines of framework-free `theme.ts` covers resolution, persistence, and pub/sub with no dependency and full testability.
- **Mutate three.js material colors on toggle instead of rebuilding.** Rejected — updating `LineBasicMaterial.color` + `MeshStandardMaterial.color` across the shared materials is doable but fragile (must also re-tint the fill vs. edge set), and a rare user toggle doesn't justify the added state-tracking complexity. Rebuilding via an effect dependency reuses the existing, leak-safe teardown.
- **Two competing neons (keep cyan + violet).** Rejected — reads as gamer-RGB, not high-end; the brief asks for *restraint* via white-on-neon discipline. Violet had only one consumer and is dropped.
- **Google Fonts `<link>` instead of `@fontsource`.** Rejected — adds a third-party request (privacy + an extra connection) and a FOIT/FOUT dance; `@fontsource-variable` bundles and ships metric-matched fallbacks.

## File map

| Path                                              | Action | Purpose                                                                      |
|---------------------------------------------------|--------|------------------------------------------------------------------------------|
| `package.json`                                    | edit   | add `@fontsource-variable/fraunces`, `…/geist`, `…/geist-mono`               |
| `src/styles/fonts.css`                            | create | import the three `@fontsource-variable` families (bundled, self-hosted)      |
| `src/styles/global.css`                           | edit   | tokens (dark `:root` + `[data-theme="light"]` + OS media), type scale, role map, `color-scheme` |
| `src/lib/theme.ts`                               | create | `initTheme/getTheme/setTheme/toggleTheme/onThemeChange/readSceneColors`     |
| `src/lib/theme.test.ts`                          | create | unit tests for resolution, persistence, pub/sub, `readSceneColors`           |
| `src/hooks/useTheme.ts`                          | create | React wrapper: `{ theme, toggle }`, subscribes via `onThemeChange`           |
| `src/hooks/useTheme.test.ts`                     | create | re-renders on change, cleans up subscription                                 |
| `src/main.tsx`                                   | edit   | call `initTheme()` before `createRoot().render(...)`; import `fonts.css`     |
| `src/main.test.ts`                               | create | asserts `initTheme` is invoked pre-render (or fold into E2E)                 |
| `src/components/ThemeToggle/ThemeToggle.tsx`     | create | accessible sun/moon button consuming `useTheme`                              |
| `src/components/ThemeToggle/ThemeToggle.module.css` | create | focus ring, glyph styling                                                    |
| `src/components/ThemeToggle/ThemeToggle.test.tsx`| create | a11y, `aria-pressed`, flips `data-theme` on click, keyboard                  |
| `src/components/Nav/Nav.tsx`                      | edit   | render `<ThemeToggle/>` in the nav                                           |
| `src/components/Background/Background.tsx`        | edit   | derive all colors from `readSceneColors()`; subscribe + re-render on change  |
| `src/components/Background/Background.module.css` | edit   | `.backdrop` gradient → `var(--scene-backdrop)`                               |
| `src/components/Background/Background.test.tsx`   | edit   | assert colors come from tokens; re-render on theme change                    |
| `src/components/ChessScene/ChessScene.tsx`        | edit   | drop `CYAN`/`VIOLET`; both pieces use figure color; rebuild on theme change  |
| `src/components/ChessScene/ChessScene.test.tsx`   | edit   | assert figure-color sourcing; rebuild-on-toggle                              |
| `src/styles/global.css` (sections)               | edit   | swap any `var(--color-accent-2)`; nothing else needs touching (all already token-driven) |
| `tests/e2e/typography-theme.spec.ts`             | create | toggle flips body bg/fg via computed style; persists across reload; OS-follow on fresh load; no `fonts.googleapis.com` request |
| `src/styles/__tests__/styles.test.ts`             | create | asserts the CSS contract: tokens defined, roles mapped, violet gone, `color-scheme` present |
| `src/lib/__tests__/contrast.test.ts`              | create | WCAG AA luminance check on fg/bg and accent-strong/bg pairs in both modes     |

Note: every new test file follows the repo convention of co-located `*.test.ts(x)`; the two `__tests__/` paths are only used where the unit-under-test is a non-TS asset (`global.css`) or a pure numeric check (contrast) with no natural co-location site. If the team prefers flat co-location, `contrast.test.ts` can live in `src/lib/`.

## Test plan

**Unit/component (Vitest, jsdom):**
- `theme.test.ts` — resolution precedence (stored > OS > dark), `setTheme`/`toggleTheme` mutate attribute + storage + notify, `onThemeChange` subscribe/unsubscribe, `readSceneColors` returns the RGB parsed from `--scene-figure-rgb` set on `documentElement`.
- `useTheme.test.ts` — initial `theme` matches resolver, `toggle()` flips state, component re-renders on external change, unsubscribes on unmount.
- `ThemeToggle.test.tsx` — renders in nav context, `aria-label` names target state, `aria-pressed` reflects mode, click + Space/Enter flip `data-theme`, visible focus ring class present.
- `Background.test.tsx` / `ChessScene.test.tsx` — with the canvas/WebGL context mocked (already the pattern in these files), assert the color values passed into draw/material calls are derived from `readSceneColors()` (mock it), and that a theme-change notification triggers a re-render/rebuild.
- `styles.test.ts` — read `global.css` source (via `readFileSync`) and assert: all tokens present on `:root`, all overridden under `[data-theme="light"]`, `prefers-color-scheme: light` block exists scoped to `:root:not([data-theme])`, `--color-accent-2` absent, `--font-serif` mapped to `h1,h2,h3`, `--font-mono` mapped to eyebrow/dates/tags, type-scale clamps present, `color-scheme` declared.
- `contrast.test.ts` — hardcode the four pairs (dark fg/bg, dark accent-strong/bg, light fg/bg, light accent-strong/bg) as hex, compute relative luminance, assert ≥ 4.5:1 (body) / AA-large threshold for accent.

**E2E (Playwright):**
- Toggle button present and operable; clicking flips `<html data-theme>` and the body's computed `background-color` + `color` change accordingly.
- After toggling + reload, the mode persists (read `data-theme`).
- Fresh context with `colorScheme: 'light'` and cleared storage → page loads in light mode.
- No request to `*.googleapis.com`/`gstatic.com` (fonts are self-hosted).
- Reduced-motion + existing `smoke.spec.ts` still pass.

**Manual / visual (not automated — recorded in `tasks.md`):**
- Dark-mode screenshot: chess pieces + pulse network render **white**, neon cyan confined to type/chrome.
- Light-mode screenshot: wireframe renders in ink, accent teal legible, backdrop is pale cool.
- No first-paint theme flash on hard reload.

## Risks

- **`readSceneColors()` returning empty in jsdom** — jsdom may not resolve custom properties from imported CSS. Mitigation: the unit test sets `--scene-figure-rgb` directly on `documentElement.style` before calling, so the function is tested in isolation from CSS loading. In the browser (E2E), the real cascade resolves it.
- **Theme-flash (FOUC) on first paint** — mitigated by calling `initTheme()` synchronously before `createRoot`; verify in E2E on a hard reload.
- **Light-mode neon illegibility** — mitigated by `--color-accent-strong` + the contrast test; if a token pair fails, deepen that mode's accent.
- **ChessScene rebuild cost / StrictMode double-mount** — existing teardown already disposes resources and is StrictMode-safe; adding a theme dependency keeps that property. Verify no WebGL context leak by checking `renderer.dispose()` runs (existing pattern).
- **Fraunces optical/soft axes not in the variable subset** — verify the `@fontsource-variable/fraunces` package exposes `opsz` (it does); defer `SOFT`/`WONK` per the open question.
- **Forgetting a hardcoded color** — the grep that found today's hardcoded values becomes the verification step in `tasks.md` (re-run, expect zero hits in `Background`/`ChessScene`).
