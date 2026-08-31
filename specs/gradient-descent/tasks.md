# Tasks: gradient-descent

> A flat checklist. Each task is small (~30 min max) and ends with a green test + a commit. Tick boxes as you land commits.

## 1. Spec

- [x] Task 1 — Land the spec triplet + the constitution's dated motion-reset note. Test: n/a (docs). Commit: `docs(descent): land the gradient-descent spec triplet (spec: specs/gradient-descent)`.

## 2. Motion reset

- [x] Task 2 — Delete `useHeroIntro`/`useScrollReveal` + tests; strip `data-intro`/`data-reveal` and refs from the five sections + their tests. Test: `src/sections/**/*.test.tsx`. Commit: `refactor(motion): remove reveal hooks — sections render statically (spec: specs/gradient-descent)`.
- [x] Task 3 — Drop ScrollTrigger from `src/lib/gsap.ts` and `src/lib/lenis.ts`; update `gsap.test.ts`/`lenis.test.ts`/`App.test.tsx`; update `CLAUDE.md`'s pipeline section. Test: `src/lib/*.test.ts`. Commit: `refactor(motion): ScrollTrigger leaves — GSAP is ticker-only (spec: specs/gradient-descent)`.

## 3. Field math

- [x] Task 4 — `descentField.ts`: loss + analytic gradient + descent direction. Test: `descentField.test.ts` (finite difference, basin, direction). Commit: `feat(descent): the loss landscape and its gradient (spec: specs/gradient-descent)`.
- [x] Task 5 — trajectory, camera pose, projection, scroll progress. Test: `descentField.test.ts` (monotone loss, convergence, determinism, pose endpoints, projection geometry, clamps). Commit: `feat(descent): trajectory, camera pose, and 3D projection (spec: specs/gradient-descent)`.

## 4. Scene

- [x] Task 6 — `DescentScene.tsx` + `.module.css` + `.test.tsx`; wire into `App.tsx`; delete `src/components/FlowScene/`; update `Hero.module.css` comment. Test: `DescentScene.test.tsx` + `App.test.tsx`. Commit: `feat(descent): the descent scene — ride the trajectory on scroll (spec: specs/gradient-descent)`.
- [x] Task 7 — E2E: `swiss.spec.ts` canvas contract → `data-descent-canvas`; `portfolio.spec.ts` canvas-behind-content + readability-through-scroll. Test: `tests/e2e/*.spec.ts`. Commit: `test(descent): e2e canvas contract (spec: specs/gradient-descent)`.

## 5. Verification

- [x] Task 8 — Browser review of the shipped composition (inks, dash speed, camera pullback); record shipped values in a dated Changes note in `spec.md` if any constants moved. Test: n/a (review).

## 6. Owner revisions — direction marks

- [x] Task 9 — Cap every field streamline with a solid chevron arrowhead at its downstream tip; size in world units via the local projection scale so arrows fade with depth. Test: `DescentScene.test.tsx` (source contract). Commit: `feat(descent): quiver arrowheads — the field states its direction (spec: specs/gradient-descent)`.
- [x] Task 10 — Accent arrowhead on the leading tip of the traversed path, pointing along the tangent. Test: `DescentScene.test.tsx` (source contract). Commit: `feat(descent): the run states its heading — accent arrowhead on the traversed tip (spec: specs/gradient-descent)`.

## Done

- [x] All acceptance criteria from `spec.md` verified.
- [x] `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green.
- [x] Commit subjects reference `specs/gradient-descent/`.
