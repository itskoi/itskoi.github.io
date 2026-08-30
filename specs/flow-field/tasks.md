# Tasks: flow-field

> A flat checklist. Each task is small (~30 min max) and ends with a green test + a commit. Tick boxes as you land commits.

## 1. Spec

- [ ] Task 1 — Land the spec triplet. Test: n/a (docs). Commit: `docs(flow): spec triplet (spec: specs/flow-field)`.

## 2. Field math

- [ ] Task 2 — Cylinder flow invariants: no-penetration at `r = R`, crown ≈ 2U, far-field `(U, 0)`, stagnation poles, irrotational away from the core. Test: `src/components/FlowScene/flowField.test.ts`.
- [ ] Task 3 — Regularized point vortices: circulation ≈ ±Γ on a loop at `r ≥ 3·CORE`, superposition with the cylinder. Test: `flowField.test.ts`.
- [ ] Task 4 — Stateless Kármán street: empty at strength 0, alternating side/sign, downstream order, deterministic in `t`. Test: `flowField.test.ts`.
- [ ] Task 5 — Scroll timeline `settle/shed/street/exit` clamped to bands; load = laminar + wobble, end = calm + no obstacle. RK2 integration returns bounded polylines (straight in uniform flow). Test: `flowField.test.ts`.

## 3. Scene

- [ ] Task 6 — `FlowScene` renders the fixed canvas (`data-flow-canvas`, `aria-hidden`, module CSS) guarded for missing 2D context. Test: `src/components/FlowScene/FlowScene.test.tsx`.
- [ ] Task 7 — rAF loop: scroll-driven timeline, dash travel, streamline strokes, obstacle ring/fill; `[theme]` rebuild via `readSceneColors()`; reduced-motion static branch. Test: `FlowScene.test.tsx` (source contract).
- [ ] Task 8 — Swap into `App.tsx`, retitle the hero caption (`FIG. 1 — flow past a cylinder, streamline study`) + `Hero.test.tsx`. Test: `Hero.test.tsx`.

## 4. Removal

- [ ] Task 9 — Delete `ChessScene/`, move e2e selectors to `data-flow-canvas` (`swiss.spec.ts`, `portfolio.spec.ts`). Test: `bun run test:e2e`.
- [ ] Task 10 — Prune chess-only surface: `figureHex`/`readPieceColors` from `theme.ts`, `--scene-figure` + `--scene-piece-rgb` from `global.css`, update `theme.test.ts`/`global.test.ts`, `bun remove three @types/three`. Test: `bun run check && bun run test`.

## 5. Verification

- [ ] Task 11 — Screenshot both breakpoints + both themes; tune dash pattern, street strength, free-stream speed if needed; record shipped values in a dated Changes note. Test: manual + suites stay green.
- [ ] Task 12 — Full gate: `check`, `test`, `lint`, `build`, `test:e2e`. Commit: `feat(flow): … (spec: specs/flow-field)`.

## Done

- [ ] All acceptance criteria from `spec.md` verified.
- [ ] `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green.
- [ ] PR description links to `specs/flow-field/`.
