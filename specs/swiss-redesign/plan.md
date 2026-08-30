# Plan: swiss-redesign

> HOW we will implement the spec. Alternatives, trade-offs, file map.

## Approach

**Tokens first, then structure, then scene.** The reset lands in `global.css`/`fonts.css` as a new token contract (paper palette, Geist-only type scale, grid tokens) gated by the rewritten `global.test.ts`/`fonts.test.ts`/`contrast.test.ts`/`theme.test.ts`. With the contract green, each section module is rebuilt onto the grid — Hero and Nav first (they define the poster grammar), then the three tabular sections (Experience/Education/Publications) and Technologies. The scene work is deliberately last so the chess pieces are re-colored and re-framed against an already-flat page: `Background` is deleted, `ChessScene` keeps its token-reading mechanism (`readSceneColors`/`readPieceColors`) but moves from full-screen atmosphere to a grid-placed specimen with a `FIG. 1` mono caption.

**The grid is shared, not duplicated.** A `.section-grid` class in `global.css` (alongside the existing global section rules it replaces) implements `display: grid; grid-template-columns: repeat(var(--grid-columns), 1fr)` with the margin/gutter tokens. Section modules `composes:`-style apply it via their own class and place children with `grid-column`. `global.css` is already the home for shared layout (`#root`, `main`, the old panel rules), so this adds no new mechanism. Sections keep their `id`s — Nav scroll-spy and `aria-labelledby` wiring are untouched.

**Motion grammar swaps mechanism, not plumbing.** `useHeroIntro` and `useScrollReveal` keep their GSAP/ScrollTrigger registration path via `@/lib/gsap`; only the animation target changes — each `[data-intro]`/`[data-reveal]` child animates `y` from `100%`→`0` inside an `overflow: hidden` clip wrapper (the hook wraps children itself, so markup changes stay minimal) with an expo-out ease and 80 ms staggers. `useParallax` and `useTimelineFill` are deleted along with what consumed them. Reduced-motion guards behave as today: resolve instantly.

**Theme default flip is mechanical.** `:root` becomes the light palette; `[data-theme="dark"]` becomes the override; the OS-follow media query flips to `prefers-color-scheme: dark`. `theme.ts`'s fallback order changes its terminal value only (dark → light). `ThemeToggle` logic is untouched; its styling flattens (sharp, hairline, mono).

**Contrast is enforced by computation, not eyeball.** `contrast.test.ts` recomputes WCAG ratios from the token hex values for both modes and both red tiers, so palette drift fails CI the way the blue palette's did.

### Hero composition

```
┌──────────────────────────────────────────────────────────────────┐
│ experience education publications technologies          [theme]  │ mono top bar, hairline under
├──────────────────────────────────────────────────────────────────┤
│ 1  2  3  4  5  6  7  8  9  10 11 12            ← 12-col grid     │
│                                          ┌──────────────┐        │
│                                          │ chess scene  │ ink    │
│                                          │ FIG. 1 ──────│ wire-  │
│                                          └──────────────┘ frame  │
│                                                                  │
│ khoi vo                                              ← display  │
│ software engineer                                    ← h2, red  │
│ MONTEREY, CA · LINKEDIN · EMAIL                      ← mono     │
└──────────────────────────────────────────────────────────────────┘
  ↑ flush-left, bottom-anchored; meta links replace icon buttons
```

### Section row grammar (tabular sections)

```
────────────────────────────────────────────────────────────────────
2023—NOW    Senior Engineer              Led the migration of the
(mono)      Company — accent-strong      rendering pipeline; cut…
────────────────────────────────────────────────────────────────────
2021—2023   Engineer                     Owned the wireframe…
────────────────────────────────────────────────────────────────────
 cols 1–2       cols 3–6                      cols 7–12
```

## Alternatives considered

- **Keep Fraunces for display, "Swiss-ify" around it** — rejected: a wonky serif display is the single loudest anti-Swiss signal in the current design; half-measures would read as neither.
- **Tailwind or a CSS grid framework** — rejected: constitution bans CSS-in-JS/framework layers; custom properties + a shared class do the same job in ~10 lines.
- **Per-module duplicated grid CSS instead of a shared `.section-grid`** — rejected: twelve copies of the same `grid-template-columns` invites drift; one shared class keeps the grid honest and testable in one place.
- **Keep the pulse network, monochrome line-art** — rejected by owner decision: atmosphere competes with type for attention; deleting it is the thesis.
- **Replace hero icons with mono text links** vs keep icon buttons — chosen: type over pictograms is the Swiss answer; same `href`s and accessible labels, so behavior is unchanged. (Icons styled as plain glyphs were the fallback.)
- **Number the nav/sections (01/02/03)** — rejected: section order carries no meaning here; numbering would be decoration, not information.
- **`subgrid` for the table rows** — deferred: browser support is fine in 2026 but each row re-declaring `repeat(12, 1fr)` with explicit column spans is simpler, works today, and tests identically.

## File map

| Path                                                          | Action | Purpose                                                        |
|---------------------------------------------------------------|--------|----------------------------------------------------------------|
| `src/styles/global.css`                                       | edit   | paper/ink + red tokens, Geist-only scale, grid tokens + `.section-grid`, flat sections (delete panels/radius), heading role → sans |
| `src/styles/global.test.ts`                                   | edit   | rewrite the token/layout contract to this spec                 |
| `src/styles/fonts.css`                                        | edit   | drop the Fraunces import                                       |
| `src/styles/fonts.test.ts`                                    | edit   | two families, no Fraunces dep                                  |
| `package.json`                                                | edit   | remove `@fontsource-variable/fraunces`                         |
| `src/lib/theme.ts`                                            | edit   | fallback default → light                                       |
| `src/lib/theme.test.ts`                                       | edit   | resolution-order tests                                         |
| `src/lib/contrast.test.ts`                                    | edit   | red pairs, both modes, AA gates                                |
| `src/components/Background/`                                  | delete | pulse network removed (spec decision 3)                        |
| `src/hooks/useTimelineFill.ts` + `.test.tsx`                  | delete | spine fill dies with the spine                                 |
| `src/hooks/useParallax.ts` + `.test.tsx`                      | delete | hero type is static on the grid                                |
| `src/hooks/useHeroIntro.ts` + `.test.tsx`                     | edit   | masked line-rise timeline                                      |
| `src/hooks/useScrollReveal.ts` + `.test.tsx`                  | edit   | masked line-rise on scroll                                     |
| `src/App.tsx`                                                 | edit   | drop `<Background />`                                          |
| `src/components/Nav/Nav.module.css`                           | edit   | fixed top bar: flat bg, hairline, mono uppercase, red active   |
| `src/components/Nav/Nav.tsx` / `Nav.test.tsx`                 | edit   | markup tweaks only (scroll-spy logic unchanged)                |
| `src/components/ThemeToggle/ThemeToggle.module.css`           | edit   | flatten to match nav chrome                                    |
| `src/sections/Hero/Hero.tsx` / `.module.css` / `.test.tsx`    | edit   | flush-left bottom-anchored poster, mono text links, scene slot |
| `src/sections/Experience/Experience.tsx` / `.module.css` / `.test.tsx` | edit | delete zigzag layout effect + spine; grid table rows     |
| `src/sections/Education/*`, `Publications/*`, `Technologies/*`| edit   | same row grammar; chips → sharp mono tiles                     |
| `src/components/ChessScene/ChessScene.module.css`             | edit   | grid placement (cols 7–12 within hero), `FIG. 1` caption styles |
| `src/components/ChessScene/ChessScene.tsx` + `.test.tsx`      | edit   | caption element; color mechanism unchanged                     |
| `tests/e2e/swiss.spec.ts`                                     | create | computed-style checks (grid, flush-left, radius), single canvas, theme default + persistence |
| `tests/e2e/typography-theme.spec.ts`                          | edit   | default-theme expectations flip to light                       |

## Test plan

- **Unit/component (Vitest)**
  - `global.test.ts`: token presence/values (palette both modes, grid, scale), heading→sans, mono data labels, flatness (no radius/gradient/translucency), light-default structure, single accent.
  - `fonts.test.ts`: Geist + Geist Mono only; no Fraunces import or dependency.
  - `theme.test.ts`: stored → OS → light resolution; toggle persistence.
  - `contrast.test.ts`: computed WCAG ratios for body + accent-strong ≥ 4.5:1 and accent ≥ 3:1 (large) in both modes.
  - `ChessScene.test.tsx`: monochrome via scene tokens; `FIG. 1` caption rendered; theme flip rebuilds colors.
  - `useHeroIntro` / `useScrollReveal`: masked-rise (transform-based, clipped), no opacity animation; reduced-motion resolves instantly.
- **E2E (Playwright)** — `tests/e2e/swiss.spec.ts`
  - Default load (no stored choice) is light paper; toggle persists across reload.
  - Hero: `text-align: left`, content bottom-anchored; name letter-spacing/line-height tight.
  - Sections: computed `display: grid`; no `border-radius` on section/chip elements; exactly one `canvas` (chess only).
  - Keyboard: nav + toggle operable, visible focus.

## Risks

- **Red on white fails AA at small sizes** — mitigation: the `--color-accent-strong` tier is part of the token contract from task 1 and gated by `contrast.test.ts` before any section consumes the accent.
- **Chess wireframe reads faint on paper** — mitigation: tune line weight/opacity in the scene task and verify with a screenshot at both breakpoints; append a dated Changes note with the shipped values.
- **Big-bang token flip breaks every section at once** — mitigation: task order lands tokens + gates first, then rebuilds sections one module per task behind the already-green contract tests; each commit is independently green.
- **E2E computed-style checks are brittle across engines** — mitigation: assert properties Playwright computes identically (grid display, radius, canvas count) and keep numeric type checks tolerant (≤ comparisons, not exact strings).
- **Existing suites encode the old contract** — mitigation: each task updates the tests it invalidates in the same commit (constitution: no backwards-compat shims); the spec's non-regression criterion is "all suites green against the *new* contract".
