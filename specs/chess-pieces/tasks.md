# Tasks: chess-pieces

> Small feature; ~4 tasks. TDD per task.

## 1. Motion hook

- [ ] T1 — `src/hooks/useChessMotion.ts` (drift `[data-piece]`, rotation `[data-ring]`, parallax `[data-backdrop]`; one context; reduced-motion gate; revert on unmount). Test: `useChessMotion.test.ts` (mock `@/lib/gsap`). Commit: `feat(hooks): add useChessMotion`.

## 2. Components

- [ ] T2 — `ChessPiece.tsx` (SVG outlined glyph + HUD ring `[data-ring]` + ticks + crosshair, `aria-hidden`, color via prop) + `ChessBackdrop.tsx` (fixed layer, Queen ♛ cyan top-left, King ♚ violet bottom-right, `data-backdrop`) + `ChessBackdrop.module.css`. Test: `ChessBackdrop.test.tsx`. Commit: `feat(chess): wireframe HUD queen & king backdrop`.

## 3. Integration

- [ ] T3 — `global.css`: add `--color-accent-2`, `main { position: relative; z-index: 1 }`. `App.tsx`: render `<ChessBackdrop />` once before `<Nav/>`. Commit: `feat(app): mount chess backdrop behind content`.

## 4. Verify

- [ ] T4 — `tests/e2e/portfolio.spec.ts`: assert backdrop present + Hero heading visible. Run `check && lint && test && build && test:e2e` green. Commit: `test(e2e): cover chess backdrop`.

## Done

- [x] Every acceptance criterion in `spec.md` verified by a passing test.
- [x] `check`, `test`, `lint`, `build`, `test:e2e` all green (50 unit + 5 E2E, 2026-08-01).
- [ ] Commit subject references `specs/chess-pieces` — pending commit.
