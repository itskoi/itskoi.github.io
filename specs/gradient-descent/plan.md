# Plan: gradient-descent

> HOW we will implement the spec. Alternatives, trade-offs, file map.

## Approach

**The maths is a pure module.** `src/components/DescentScene/descentField.ts` (mirroring `flowField.ts`) owns everything computable: a `Vec3` type with the handful of operations needed; the analytic loss `loss(p)` (gaussian wells over a weak quadratic bowl plus sinusoidal ridges); its analytic gradient `gradLoss(p)`; the field `descentDirection(p)` = normalized −∇f; `buildTrajectory()` — plain gradient descent from a fixed start, fixed step count, returning points plus cumulative arc lengths; `poseAt(trajectory, s)` — an arc-length-parameterized camera pose (position pulled back and raised off the path point, forward = local tangent, up ≈ world +Y orthogonalized); `project(point, pose, viewport)` — world → camera space → perspective screen coordinates, returning `null` for anything behind the near plane; and `scrollProgress(scrollY, max)` — the clamped document fraction. Every function is deterministic and DOM-free, so the whole spec's math criteria are ordinary Vitest numerics (finite differences, monotonicity, convergence, projection geometry) with no canvas in sight.

**The scene reuses the FlowScene lifecycle verbatim.** One `<canvas data-descent-canvas aria-hidden>` fixed at z-0 behind content (`DescentScene.module.css`); a single `useEffect` keyed `[theme]` that guards `getContext('2d')` (jsdom), reads ink via `readSceneColors()`, caps DPR at 2, listens for resize, runs one rAF loop, and tears down cleanly. Each frame: read `window.scrollY` → `s` → `poseAt`; clear; draw the wireframe slice of the loss surface (two families of grid polylines sampled around the camera, slice plane riding the camera's altitude); draw the field — short streamlines integrated along −∇f from a lattice of seeds near the camera, dashed with `lineDashOffset` advanced by local |∇f|·dt; draw the trajectory split at `s` (behind = solid accent, ahead = dotted ink); draw the accent crosshair at the minimum. Per-line alpha = base ink × depth fade, computed from mean camera-space depth; polylines break into subpaths where projection culls.

**The reset lands before the new scene.** The reveal hooks (`useHeroIntro`, `useScrollReveal`) and ScrollTrigger wiring leave the codebase first, with section/unit tests updated in the same commit; `FlowScene` is deleted in the same commit that lands `DescentScene`, so the canvas contract in E2E flips once, not twice. GSAP stays, ticker-only, as Lenis's RAF host; `prefersReducedMotion()` stays in `src/lib/gsap.ts` (it remains the scene's reduced-motion gate). CLAUDE.md's pipeline section and the constitution's Motion line get matching updates (dated note, no silent edit).

## Alternatives considered

- **three.js / WebGL** — real scene graph, depth sorting for free. Rejected: re-adds the dependency `specs/flow-field` deliberately dropped; the figure is line art; 2D-canvas hairlines are crisper and cheaper, and the projection maths is small and testable.
- **GSAP ScrollTrigger scrubbing the camera** — declarative pinning/scrub. Rejected: the house keeps rAF + raw `window.scrollY` as the single source of motion (flow-field precedent); Lenis already smooths the input; ScrollTrigger is leaving with the reveals anyway.
- **Optimizer-steps narrative** — fixed camera, scroll = training step, particles step downhill. Rejected by owner: watching training is weaker than *riding* the run.
- **Contour bands on the slice plane** (marching-squares level sets) instead of a wireframe height-field. Deferred: marching squares is a second algorithm to test; the wireframe grid is a direct sample loop and reads as "3D plot" immediately.
- **Momentum / Adam for the trajectory** — more "real" ML. Rejected: plain GD guarantees monotone loss, which is a crisp test invariant; momentum overshoots by design.

## File map

| Path                                          | Action | Purpose |
|-----------------------------------------------|--------|---------|
| `specs/gradient-descent/{spec,plan,tasks}.md` | create | this triplet |
| `src/components/DescentScene/descentField.ts` | create | pure 3D maths: loss, gradient, trajectory, camera pose, projection |
| `src/components/DescentScene/descentField.test.ts` | create | numerics: finite differences, monotonicity, convergence, projection |
| `src/components/DescentScene/DescentScene.tsx` | create | canvas + rAF loop + drawing (FlowScene lifecycle) |
| `src/components/DescentScene/DescentScene.module.css` | create | fixed z-0 full-viewport canvas |
| `src/components/DescentScene/DescentScene.test.tsx` | create | DOM + source contract |
| `src/components/FlowScene/*` (5 files)         | delete | superseded specimen |
| `src/hooks/useHeroIntro.{ts,test.tsx}`        | delete | reveal reset |
| `src/hooks/useScrollReveal.{ts,test.tsx}`     | delete | reveal reset |
| `src/lib/gsap.ts`                             | edit   | drop ScrollTrigger; keep `gsap` + `prefersReducedMotion()` |
| `src/lib/lenis.ts`                            | edit   | drop `ScrollTrigger.update` wiring |
| `src/lib/gsap.test.ts`, `src/lib/lenis.test.ts` | edit | match the slimmed modules |
| `src/App.tsx`, `src/App.test.tsx`             | edit   | `DescentScene` in, `FlowScene` out; gsap mock review |
| `src/sections/*` (5 sections + tests)         | edit   | strip reveal hooks, refs, `data-intro`/`data-reveal` |
| `src/sections/Hero/Hero.module.css`           | edit   | header comment references the retired planet |
| `tests/e2e/swiss.spec.ts`                     | edit   | canvas contract → `data-descent-canvas` |
| `tests/e2e/portfolio.spec.ts`                 | edit   | canvas-behind-content + readability-through-scroll tests |
| `CLAUDE.md`                                   | edit   | pipeline section: ScrollTrigger gone, ticker-only GSAP |
| `specs/constitution.md`                       | edit   | dated Changes note: motion stack reset |

## Test plan

- **Unit** (Vitest, `descentField.test.ts`): gradient vs central finite difference at scattered points; global basin strictly below window corners; field = normalized −∇f; trajectory loss non-increasing, endpoint in basin, build-twice determinism; `poseAt` endpoints for s = 0 / 1, clamping of s and of `scrollProgress`; projection — straight-ahead point lands at canvas centre, behind-camera point returns null, off-axis point lands off-centre in the right half-plane.
- **Component** (Vitest + RTL, `DescentScene.test.tsx`): renders `canvas[data-descent-canvas][aria-hidden]`; source contract — ink via `readSceneColors`, `[theme]` rebuild, `if (!reduce)` gate, `window.scrollY` in the loop, DPR cap 2, accent for the traversed path, no `three` import, `getContext('2d')`.
- **Sections** (existing tests, edited): static rendering only — gsap mocks and intro/reveal assertions deleted with the hooks.
- **E2E** (Playwright): `swiss.spec.ts` — exactly one canvas, `data-descent-canvas`, `aria-hidden`; `portfolio.spec.ts` — canvas attached behind hero content, content readable through the mid-descent band, canvas survives scrolling down and back up.

## Risks

- **Frame cost of many 3D polylines** — mitigation: small fixed lattice and grid (few hundred projected points per family), one stroke call per line, per-line (not per-segment) alpha, DPR cap 2; review frame time in the browser before shipping.
- **Readability over text rows** — mitigation: field/wireframe inks at or below the flow-field's 0.3 line ink; the only heavy mark is the single accent path.
- **Depth perception without shading** — mitigation: depth-faded ink + dashed field vs solid path + the crosshair target; if flat, raise the fade rate rather than adding fills (doctrine).
- **Trajectory lands in the local basin, not the global one** — mitigation: start point chosen so plain GD routes to the global well; asserted by the convergence test, retuned constants recorded in a Changes note if moved.
- **Wireframe morph shimmer as the slice plane rides the camera** — mitigation: the plane moves with s, which Lenis keeps continuous; if it still shimmers, switch to a fixed plane (open question in `spec.md`).
