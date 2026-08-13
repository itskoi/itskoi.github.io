# Tasks: chess-to-book

> A flat checklist. Each task is small (~30 min max) and ends with a green test + a commit. Tick boxes as you land commits. Order is intentional: data → geometry → scene wiring → tests → polish.

## 1. Page data + textures

- [x] **T1** — `mapEducationSpreads(education)` returns the ordered spread list (title → degree/GPA → awards → certifications), deterministic. Test: `bookPages.test.ts`.
- [x] **T2** — `makePageTexture(spread)` rasterizes a spread to a `THREE.CanvasTexture` using the serif font + figure color; no hardcoded hex. Test: `bookPages.test.ts` (`drawSpread` asserts spread text is what's painted).

## 2. Book geometry

- [x] **T3** — `buildArticulatedBook(spreads)` builds `bookGroup`: spine + back cover + front cover pivot + N page pivots, each leaf hinged on the spine. Test: `bookGeometry.test.ts` (1 spine + 2 covers + N pages).
- [x] **T4** — `buildBookShards(count)` subdivides the closed-book faces into exactly `count` triangles (deterministic, no `Math.random`). Test: `bookGeometry.test.ts` (returned length === requested count).

## 3. Shard-morph parity

- [x] **T5** — Compute chess shard count `C` at runtime; `buildBookShards(C).length === C`. Each shard gets `bookPos` + `bookQuat` targets (the flatten). Test: `bookGeometry.test.ts` (parity) + source-assertion `buildBookShards(allShards.length)` in `ChessScene.test.tsx`.

## 4. Scene wiring — morph

- [x] **T6** — Build the book inside ChessScene's `[theme]` effect; dispose book materials + textures in cleanup. Test: `ChessScene.test.tsx`.
- [x] **T7** — Education/Publishing scroll-band math (`#education`, `#publications`) + `uMorph` sub-progress; lerp shards chess→book with `easeInOutCubic`, spatially sorted pairing. Test: `ChessScene.test.tsx` (source references `getElementById('education')` + `uMorph`).

## 5. Scene wiring — open + page-turn + exit

- [x] **T8** — Cover-open: `frontCoverPivot.rotation.y = -2.7 * easeOutBack(uOpen) * (1-uExit)`. Test: source-assertion.
- [x] **T9** — Seam: crossfade shard-cloud ↔ articulated-book across `uMorph ∈ [0.85, 1]` via `smoothstep` opacity (both closed). Test: source-assertion.
- [x] **T10** — Page-turn: `pagePivots[i].rotation.y = -easeInOutCubic(turned - i) * π * (1-uExit)`, scrubbed (reverses on scroll-up). Test: source-assertion (`uPage * pageCount`, `pagePivots[i].rotation.y`).
- [x] **T11** — Exit: leaving Education (`uExit`), covers close + shards scatter out so Publications gets a clean canvas. Test: source-assertion (`getElementById('publications')`).

## 6. Theme, reduced motion, color gate

- [x] **T12** — Book colors via `figureHex()` / `readPieceColors()`; existing "no hardcoded hex" regex covers book code. Test: `ChessScene.test.tsx`.
- [x] **T13** — Reduced motion: book hidden (materials init opacity 0, raised only inside the `if (!reduce)` gate) → assembled chess, static. See spec `Changes (2026-08-02)` for the refinement vs. the original "closed book at rest" wording. Test: `ChessScene.test.tsx` (`if (!reduce)` + `opacity: 0`).

## 7. E2E + Done

- [x] **T14** — E2E: scroll to `#education`, assert heading + a certification link visible while `[data-chess-canvas]` present; nudge down + scroll back up, canvas survives. Test: `tests/e2e/portfolio.spec.ts` (passing).
- [ ] **T15** — Manual visual pass (owner runs `bun run dev`): morph flatten reads; seam is invisible; book frames the card; reverse scroll smooth; tune `BOOK_W/H`, opacities, band widths if needed. Log in `spec.md` Changes.

## Done

- [x] All acceptance criteria from `spec.md` verified (criterion #6 per the reduced-motion refinement note).
- [x] `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green.
- [x] Chess assemble/swap/spin above Education unchanged; existing tests green.
- [ ] T15 manual visual pass + commit(s) / PR (pending owner).
