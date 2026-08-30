# Plan: flow-field

> HOW we will implement the spec. Alternatives, trade-offs, file map.

## Approach

A single new component, `src/components/FlowScene/`, replaces `ChessScene` in `App.tsx` as the fixed full-viewport backdrop. The physics lives in a pure, DOM-free module `flowField.ts`; the component is a thin shell that owns the canvas, the rAF loop, theme/resize/reduced-motion handling, and drawing. Everything testable about the motion is testable without a canvas.

**The field.** Superposition of analytic components, evaluated per point:

- Free stream `(U, 0)`.
- Potential flow past a cylinder (uniform + doublet): `u = U(1 − R²(x²−y²)/r⁴)`, `v = −U·2R²xy/r⁴` in cylinder-local coordinates. Gives no-penetration, ~2U crown speed, stagnation poles, irrotationality — the exact textbook invariants the unit tests pin.
- A staggered Kármán street of regularized point vortices (`Γ/2π · (−Δy, Δx)/(Δr² + CORE²)`), generated **statelessly** from `(time, strength)`: vortex *k* has age `(t mod period) + k·period`, spawn index `n = floor(t/period) − k`, side and circulation sign from `n` parity, position marching downstream with age. Zero mutable simulation state — the same `t` always yields the same street.
- A settling waviness: a single traveling sinusoid on `v`, weighted `(1 − settle)` from the scroll timeline.

**Rendering.** ~14 seeds spaced evenly down the left edge; each frame every seed is re-integrated across the viewport with RK2 (6 px steps), producing one polyline per line. Each polyline is stroked once, dashed (`setLineDash([4, 6])`), hairline width, at ~0.38 ink from `--scene-figure-rgb`. Dash phase per line advances by `meanSpeed · dt` — dashes visibly travel, slow near the stagnation poles, fast at the crown. The obstacle is drawn last: 0.75-ink ring + 0.05-ink fill, the chess specimen weight. Total cost ≈ 14 × ~300 field evals/frame — trivial next to three.js.

**Scroll → state.** Same pattern as `ChessScene`: section tops read once (`#experience`, `#education`, `#publications`) + on resize; `window.scrollY` read per frame inside the rAF; no ScrollTrigger (the rAF stays the single source of motion). The timeline emits `settle`, `shed`, `street`, `exit` in [0, 1]: waviness `= 1 − settle`, street strength `= shed · (1 − exit)`, obstacle presence `= 1 − exit` (radius eases to 0 at the end of the page). Reduced motion freezes `time` and `scrollY`, skipping all of it and rendering one canonical laminar frame every rAF (as chess did). Theme flips rebuild via the `useTheme()` → `[theme]` effect dep, re-reading `readSceneColors()`.

**Removal.** `ChessScene/` is deleted outright; `three`/`@types/three` leave `package.json`. `figureHex` and `readPieceColors` (chess-only helpers) are deleted from `theme.ts`, and `--scene-figure` (hex) + `--scene-piece-rgb` tokens are deleted from `global.css` — `readSceneColors()` over `--scene-figure-rgb` is the sole scene-ink contract. E2E selectors move from `data-chess-canvas` to `data-flow-canvas`; the one-canvas poster assertion and the `FIG. 1` caption assertion stay.

## Alternatives considered

- **Keep three.js, build the streamlines as `Line` objects** — one-line summary: reuse the existing pipeline. Rejected because a 2D line-art specimen gains nothing from WebGL, keeps a 600 KB dep, and inherits the ≤ 480px FOV bug that the swiss spec flagged as needing camera recomposition.
- **Bathymetric contours / interference rings** — the other two owner-reviewed concepts. Rejected in concept review (2026-08-30): contours are quieter than the owner wants; rings risk reading as decorative moiré rather than flow.
- **SVG paths updated per frame** — DOM churn at 60 Hz with hundreds of path nodes; the house pattern for this layer is a canvas, and CSS Modules don't help animate polylines.
- **Particle trails instead of dashed streamlines** — soft, atmospheric, and violates the motion doctrine; dashes give the same direction reading mechanically.
- **ScrollTrigger scrub for the timeline** — no other scene input uses scrub, and the rAF-reads-scrollY pattern already exists and stays independent of Lenis↔ScrollTrigger wiring.

## File map

| Path                                          | Action | Purpose                                                       |
|-----------------------------------------------|--------|---------------------------------------------------------------|
| `src/components/FlowScene/flowField.ts`       | create | pure math: field components, street, timeline, integration   |
| `src/components/FlowScene/flowField.test.ts`  | create | physics invariants + timeline clamps + street determinism    |
| `src/components/FlowScene/FlowScene.tsx`      | create | canvas, rAF, theme/resize/reduced-motion, drawing            |
| `src/components/FlowScene/FlowScene.module.css`| create | fixed inset-0 canvas, z-0, pointer-events none               |
| `src/components/FlowScene/FlowScene.test.tsx`  | create | renders canvas, source contract (tokens, reduce, no three)   |
| `src/components/ChessScene/`                  | delete | superseded specimen                                           |
| `src/App.tsx`                                 | edit   | `<ChessScene />` → `<FlowScene />`                            |
| `src/sections/Hero/Hero.tsx`                  | edit   | caption → `FIG. 1 — flow past a cylinder, streamline study`  |
| `src/sections/Hero/Hero.module.css`           | edit   | comment references the flow field, not the shard cloud       |
| `src/sections/Hero/Hero.test.tsx`             | edit   | test rename to the streamline study                           |
| `src/lib/theme.ts`                            | edit   | delete `figureHex`, `readPieceColors`                         |
| `src/lib/theme.test.ts`                       | edit   | drop the deleted helpers' cases                               |
| `src/styles/global.css`                       | edit   | delete `--scene-figure`, `--scene-piece-rgb` (3 blocks)       |
| `src/styles/global.test.ts`                   | edit   | scene-token assertions → `--scene-figure-rgb` only            |
| `tests/e2e/swiss.spec.ts`                     | edit   | one-canvas test → `data-flow-canvas`                          |
| `tests/e2e/portfolio.spec.ts`                 | edit   | chess selectors/comments → flow canvas                        |
| `package.json`                                | edit   | `bun remove three @types/three`                               |

## Test plan

- **Unit** (Vitest, `flowField.test.ts`): no-penetration at `r = R` (|u·r̂| < ε across sampled θ); crown ≈ 2U and far-field → `(U, 0)`; stagnation at local `(±R, 0)`; circulation ≈ ±Γ around each row's vortex (loop at r ≥ 3·CORE, 5% tolerance); irrotationality of cylinder-only flow; street: empty at strength 0, alternating side/sign, downstream ordering, determinism (two calls equal); timeline: clamped 0/1 at band edges, monotone midpoints, load = laminar+wobble/no street, end = calm/no obstacle.
- **Component** (Vitest, `FlowScene.test.tsx`): renders one `<canvas data-flow-canvas aria-hidden>`; source contract — reads tokens via `readSceneColors`, `}, [theme])` rebuild, `if (!reduce)` static branch, no `three` import.
- **E2E** (Playwright): `swiss.spec.ts` — exactly one canvas, `data-flow-canvas` attached, `FIG. 1` visible; `portfolio.spec.ts` — canvas behind content through the Education (street) band, readable content above it.

## Risks

- Superposed point vortices ignore the cylinder wall (no image vortices) — early-shed lines near the wall may kink. Mitigation: spawn at `cx + 2.1R`, regularize cores, tune by screenshot; add image vortices only if it visibly offends.
- Street strength vs. type legibility over the Education rows — the lattice lesson. Mitigation: streamlines stay at third-ink (~0.38); tune against screenshots and record values in a Changes note.
- Dash travel could strobe at small dash lengths on low-DPR screens. Mitigation: dash length ≥ 4 px, DPR-capped transform, screenshot check at 1×.
- jsdom has no 2D context — the component must guard `getContext('2d')` and skip the loop (the `supportsWebGL` pattern), so component tests exercise the DOM, not the drawing.
