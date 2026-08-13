# Spec: chess-pieces

> WHAT and WHY. An ambient, chess-themed backdrop: a wireframe/HUD Queen and King that float gently behind the portfolio as you scroll.

## Context

The owner likes chess and wants a subtle high-tech accent — two pieces (Queen and King) that "slide through the page" on scroll. Chosen direction: **wireframe/HUD** look with **ambient free-float** motion (not a strict path). It's a decorative backdrop layer, not content.

## Decisions (resolved 2026-08-01)

1. **Look — wireframe / HUD.** Each piece is an SVG: an outlined (stroked, no fill) chess glyph centered inside a HUD ring with targeting ticks and a faint crosshair. Angular, blueprint, cyan line-art.
2. **Motion — ambient free float.** Gentle drift (slow x/y yoyo) + slow continuous HUD-ring rotation + a subtle scroll parallax on the whole backdrop. Non-directional.
3. **Layering — background.** Fixed, behind all content, `pointer-events: none`, low opacity (~0.18) so text stays readable. Never blocks clicks.
4. **Color — Queen cyan (`--color-accent`), King violet (new `--color-accent-2`).** Distinct but on-theme.
5. **Reduced motion — static.** Under `prefers-reduced-motion: reduce`, no drift/rotation/parallax; pieces render faded and still.
6. **Accessibility — decorative.** Pieces are `aria-hidden`; no meaningful text or roles added.

## User stories

- As a **visitor**, I want a **subtle chess motif drifting behind the page** so the portfolio has **personality without distracting from the content**.
- As a **motion-sensitive visitor**, I want the **pieces to be still** when I've requested reduced motion.
- As the **owner**, I want the pieces to **stay out of the way** — never blocking text or clicks.

## Acceptance criteria

(testable; each maps to a test — see `plan.md`)

- [ ] A backdrop renders **two** chess pieces (Queen ♛ and King ♚). — `ChessBackdrop.test.tsx`
- [ ] Each piece is an SVG with an **outlined glyph** (stroke, no fill) inside a **HUD ring** (`[data-ring]`) with **targeting ticks**. — `ChessBackdrop.test.tsx`
- [ ] Pieces are `aria-hidden` and the backdrop has `pointer-events: none`. — `ChessBackdrop.test.tsx`
- [ ] `useChessMotion` wires drift on `[data-piece]`, rotation on `[data-ring]`, and parallax on `[data-backdrop]`; all killed on unmount. — `useChessMotion.test.ts`
- [ ] Under `prefers-reduced-motion`, `useChessMotion` registers **no** animation. — `useChessMotion.test.ts`
- [ ] The Queen uses the cyan accent and the King uses the violet accent. — `ChessBackdrop.test.tsx`
- [ ] Content sits **above** the backdrop (backdrop never covers text). — E2E: the Hero heading remains visible/clickable; backdrop present.
- [ ] All existing tests stay green; `prefers-reduced-motion` path for Hero/sections unaffected.

## Out of scope

- Interactive chess (no board, no moves, no game).
- More than two pieces.
- Foreground/prominent pieces or click handlers.
- Sound.
- Mobile-specific behavior beyond responsive sizing (pieces shrink via `clamp()`).

## References

- Site motion infra: `src/hooks/{useScrollReveal,useParallax,useHeroIntro}.ts`, `src/lib/gsap.ts`
- Reduced-motion gate: `prefersReducedMotion()` in `src/lib/gsap.ts`

## Changes (2026-08-01)

After seeing a reference image, the owner revised the look and motion. The original "Decisions" above are superseded by these:

1. **Look — 3D lathed wireframe (not HUD).** Each piece is a surface-of-revolution wireframe: latitude ellipses wrapping the body + a silhouette outline, in thin uniform strokes, no fill, no glow, no ring/ticks/crosshair. Queen head = a wireframe sphere; King head = a cross. Matches the reference image (a clean, uniform wireframe chess piece).
2. **Motion — diagonal, back and forth (not ambient float+rotation).** Each piece translates diagonally and yoyos back: Queen drifts down-right and back, King up-left and back, so the two cross paths. Rotation dropped. Scroll parallax on the backdrop is retained.
3. **Colors retained** — Queen cyan, King violet, no glow.

Acceptance criteria referencing `[data-ring]` / targeting ticks are superseded; the wireframe is verified via latitude `ellipse`s + silhouette `polygon` + Queen `circle` vs King cross (see `ChessBackdrop.test.tsx`).

### Motion refinement (2026-08-01)

Motion is now **scroll-driven**, not a looping yoyo. Queen starts top-left, King top-right; as the page scrolls they glide diagonally, cross in the middle, and **swap sides** (Queen → bottom-right, King → bottom-left), passing under the content. The swap is a single scrubbed ScrollTrigger across the **entire page** (`start: top top`, `end: bottom bottom`) so it completes only when the visitor reaches the bottom of the page. Travel is a fraction of the viewport (`TRAVEL_X`/`TRAVEL_Y`), function-based + `invalidateOnRefresh` so it stays responsive. Reduced motion → static.

### Low-poly + rotation (2026-08-01)

Per a new reference image: the pieces are now **angular faceted low-poly wireframes** (flat hexagonal facet rings + vertical prism edges) instead of smooth lathed ellipses. Queen head = a faceted cone (pointed crown); King = a cross.

They also **rotate — but only while scrolling.** Rotation is folded into the same scroll-scrubbed tween as the swap (`rotation` tied to page scroll progress, Queen clockwise / King counter-clockwise), so the pieces spin as the visitor scrolls and hold still the moment scrolling stops. This is a **2D spin of a faceted SVG**, not true 3D rotation; true 3D was declined (would require three.js and ~+100 KB). Reduced motion → no spin, no swap.

Pieces were also shrunk slightly (`clamp(110px, 15vw, 200px)`) and `TRAVEL_Y` reduced to 0.2 so the tall wireframes are not clipped by the backdrop's `overflow: hidden` at their final position.

### three.js (2026-08-01)

The SVG approximation didn't read as 3D, so the chess pieces are now **real 3D** via three.js (vanilla, no react-three-fiber). `ChessScene` renders a fixed, full-viewport WebGL `<canvas>` behind the content (`z-index: 0`, `pointer-events: none`, `aria-hidden`). Each piece is a low-poly wireframe mesh: `LatheGeometry` with 7 facets + `WireframeGeometry`/`LineSegments` — Queen (cyan, rounded head in the profile) and King (violet, body + a cross). This gives **true 3D rotation** (facets actually turn).

Motion is preserved in spirit but drives the meshes directly: a `requestAnimationFrame` loop reads `window.scrollY` progress and sets each mesh's `position.x` (swap, Queen −5→+5 / King +5→−5) and `rotation.y` (±2π over the page). So they **swap and spin only while scrolling**, completing at the bottom of the page. Reduced motion → static. The SVG `ChessBackdrop`/`ChessPiece`/`useChessMotion` were removed. The framework stays **Vite + React** (a Remix migration was considered and declined as overkill for a static portfolio). Added `three` (~+150 KB gzip to the bundle).

### Color superseded by `typography-and-theme` (2026-08-02)

The "Queen cyan / King violet" color decision (Decisions #4 and the 2026-08-01 Changes) is **superseded** by `specs/typography-and-theme/`. Both pieces now draw in the shared `--scene-figure` token — **white in dark mode, ink in light mode** — read via `figureHex()` in `ChessScene.tsx`. Geometry and motion are unchanged; only the color source changed. The neon accent now lives on type/UI chrome only.

### Ambient idle motion (2026-08-02)

The scroll-driven-only behavior ("hold still the moment scrolling stops") read as frozen at rest, especially at the top where the pieces start as an exploded shard cloud. Per owner request, a **gentle ambient motion is now layered on top** of the scroll swap/spin so the pieces are never static:

- A slow continuous **idle spin** (`IDLE_SPIN ≈ 0.25 rad/s`), a vertical **bob** (`BOB_AMP 0.4`), and a horizontal **sway** (`SWAY_AMP 0.3`) — all time-based via `performance.now()` and applied as offsets to each piece's group position/rotation inside the existing `tick` rAF loop.
- The scroll-driven assemble → swap → spin is retained unchanged; the ambient offsets are added on top (subtle relative to the ±11 swap), so the reveal still reads.
- `prefers-reduced-motion` still skips the entire motion block (ambient included) — pieces stay calm.

