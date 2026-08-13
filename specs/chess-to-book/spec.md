# Spec: chess-to-book

> WHAT and WHY. As the visitor scrolls into the Education section, the two 3D chess pieces transform into a closed book; the book opens and its pages turn in sync with continued scrolling — each spread revealing an education fact. Motion is content (constitution principle #7), so the choreography is specified here, not improvised during implementation.

## Context

Today (`specs/chess-pieces/`) the chess motif is a fixed full-viewport three.js `<canvas>` behind all content. Two low-poly wireframe pieces — a Queen and a King — are each built from per-triangle **shards** that (1) assemble into silhouettes by the time the Experience section reaches the top, then (2) swap sides and spin over the rest of the page, all driven by `window.scrollY` progress inside one `requestAnimationFrame` loop (`src/components/ChessScene/ChessScene.tsx`).

The owner wants the motif to *become* the Education section: the chess literally transforms into a book of the owner's education, and reading the book is the act of scrolling. This keeps the 3D layer as a continuous thread through the page instead of a static decoration.

## Decisions (resolved 2026-08-02)

1. **Transform — shard re-flow morph.** The chess and the book are the **same pool of shards in two arrangements**. As the visitor enters Education, each shard eases from its position in the Queen/King silhouettes to a target position in a **closed book** (front cover slab + page block + back cover). The book geometry is subdivided into exactly as many triangles as the chess shard pool so the morph is a true 1:1 re-flow — no fade, no cut. Shards also flatten their orientation toward a plane, so the 3D pieces visibly "iron flat" into a book. *(Primary recommendation. Alternatives in `plan.md`.)*
2. **Trigger — scroll progress, scoped to Education.** Same raw-scroll approach ChessScene already uses (reads element bounding rects each frame, no new ScrollTrigger). The transform is choreographed across the Education scroll band: converge → morph to closed book → cover opens → pages turn → close + scatter on exit.
3. **Book — articulated three.js group sharing the canvas.** A spine + two hinged covers + N hinged page planes, all in the existing `ChessScene` scene graph and rAF loop (one WebGL context, one render). Opening = covers hinge about the spine axis; page-turn = page planes hinge sequentially, scrubbed to scroll.
4. **Page content — from `portfolio.ts`, drawn via `CanvasTexture`.** Pages are mapped from `education` (school → degree/GPA → awards → certifications), so the book and the DOM card share one source of truth. Text is rasterized to a 2D canvas and used as a texture (no new font/3D-text dependency).
5. **Color — reuse scene tokens.** The book draws in `--scene-figure` / `--scene-piece-rgb` via the existing `figureHex()`/`readPieceColors()` helpers. No new neon; no hardcoded hex.
6. **Reduced motion — static.** Under `prefers-reduced-motion: reduce`, the scene shows a **closed book at rest** when Education is in view (no morph, no open, no turn). Assembles instantly, holds still.
7. **Accessibility — decorative.** The canvas stays `aria-hidden`, `pointer-events: none`, `z-index: 0`. The DOM Education card (translucent, `z-index: 1`) remains the authoritative, screen-reader-accessible content. The book never blocks clicks or text.
8. **Placement — centered, slightly smaller than the card.** *(Resolved per the owner's "Implement" go-ahead.)* The book renders at world origin behind the translucent Education card, sized to frame the text through the glass rather than underlay it.
9. **After Education — book closes and scatters; the chess does not return.** Leaving Education, covers close and shards scatter out so Publications gets a clean canvas. The chess has told its story.
10. **Spread count — 5 spreads.** Cover/title (school) → degree + period → GPA → awards → certifications, mapped 1:1 from `education`. One spread revealed per page turn.

## User stories

- As a **visitor**, I want the **chess pieces to physically become a book** as I reach Education so the page feels like a continuous, living object rather than separate decorations.
- As a **visitor**, I want **scrolling to turn the book's pages** so reading my education history is a tactile, paced reveal instead of a wall of text.
- As a **motion-sensitive visitor**, I want the **book to be still** (closed, at rest) when I've requested reduced motion.
- As the **owner**, I want the **book's content to stay in sync with my resume** (single source of truth in `portfolio.ts`) so updating one updates both.
- As the **owner**, I want the **scene to clean up** after Education so Publications/Technologies aren't cluttered by a leftover book.

## Acceptance criteria

(testable; each maps to a test — see `plan.md`)

- [ ] A book exists in the scene graph with a spine, **two** covers, and **N page planes** where N equals the number of education "spreads" derived from `education` (school + degree/GPA + awards + certifications). — `BookScene`/`ChessScene` source-assertion test.
- [ ] The transform is a **1:1 shard morph**: the book geometry is subdivided so its shard count equals the chess shard count, and each shard has a chess-state and a book-state target. — source-assertion test.
- [ ] The choreography is bound to the **Education scroll band**: morph completes by the time the Education heading lands; covers open in the first sub-band; pages turn across the remainder; book closes/scatters before Publications. — source-assertion test asserting the scroll-band math references `#education` (and `#publications` for the exit).
- [ ] Page-turn progress is **scrubbed** to scroll (pages turn forward on scroll-down, reverse on scroll-up), turning exactly `N` pages across the Education band. — source-assertion test.
- [ ] Page textures are built **from `education`** (no hardcoded text duplicated from the resume). — source-assertion test (`/from .*education/` or equivalent) + a unit test on the page-data mapper.
- [ ] Colors come from `figureHex()` / `readPieceColors()`; **no hardcoded hex** for the book. — source-assertion test (extend the existing ChessScene "no neon" test).
- [ ] Under `prefers-reduced-motion`, the book renders **closed and static** (no morph/open/turn tweens run). — source-assertion test that the motion block is gated by `prefersReducedMotion()` (already covers chess; assert book branch is inside the same gate).
- [ ] The scene **rebuilds on theme change** (book picks up the new tokens) — covered by the existing `[theme]` effect dependency; assert the book is built inside that effect.
- [ ] Content stays **above** the book: the Education card text remains visible/clickable while the book is on screen. — E2E (extend `portfolio.spec.ts`): scroll to Education, assert heading + a certification link are visible and the canvas is present.
- [ ] All existing tests stay green; chess assemble/swap/spin behavior above Education is **unchanged**.

## Out of scope

- True 3D vertex morph between chess and book meshes (topologies don't share vertex counts — rejected, see `plan.md`).
- A second WebGL context or a router/SPA navigation change.
- Interactive page-turn by drag/click (turning is scroll-driven only).
- Audio (page-flip sound).
- Carrying the book into Publications/Technologies as live content (it only **resolves/cleans up** there).
- DOM/CSS-3D book as the implementation (considered; see alternatives).

## Open questions

(All resolved 2026-08-02 — folded into Decisions #8–#10 above.)

## References

- Current chess implementation: `src/components/ChessScene/ChessScene.tsx`, `specs/chess-pieces/` (esp. the shard `buildShards` + scroll-band math).
- Motion infra: `src/lib/gsap.ts` (`prefersReducedMotion`, registered `gsap`/`ScrollTrigger`), `src/hooks/useSmoothScroll.ts`.
- Theme tokens: `src/lib/theme.ts` (`figureHex`, `readPieceColors`), `src/styles/global.css` (`--scene-figure-rgb`, `--scene-piece-rgb`).
- Education data + DOM: `src/data/portfolio.ts` (`education`), `src/sections/Education/Education.tsx` (`id="education"`).
- Constitution: motion is content (#7); no new feature without a spec triplet; strict TS; no `any`; co-located tests; `@/*` alias only.

## Changes (2026-08-02)

### Reduced motion: book hidden, chess assembled (refines Decision #6)

Decision #6 said reduced motion would show "a closed book at rest when Education is in view." In practice the **entire** motion block — including the scroll-band math that would gate book visibility to Education — is already gated by `prefersReducedMotion()`, so there is no scroll awareness under reduced motion. Rather than reintroduce scroll-driven visibility for that single case, the implementation **hides the book entirely under reduced motion** (its materials start at opacity 0 and are only raised inside the gated block) and shows the **assembled chess, static** — i.e. the prior reduced-motion behavior, unchanged. Nothing moves; the book simply never appears. This is calmer than a static closed book and keeps the reduced-motion path fully free of scroll logic. Acceptance criterion #6 is read as "no morph/open/turn tweens run" (satisfied); the "renders closed and static" wording is superseded by "does not appear."
