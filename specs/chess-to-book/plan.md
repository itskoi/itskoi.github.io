# Plan: chess-to-book

> HOW. Reuse the shard pool so chess and book are one cloud in two arrangements; make the book an articulated group in the same canvas/rAF; scrub open + page-turn to the Education scroll band.

## Approach

**One canvas, one rAF, one shard pool with two target states.** The cleanest way to make the chess *become* a book — not dissolve-and-reappear — is to treat both as arrangements of the **same shards**. Today `buildShards()` splits each piece's geometry into per-triangle fragments, each with an assembled (identity) and a scattered target. We extend that idea: every shard gains a **third target — its home in the closed book** — computed by subdividing a book geometry into exactly the chess shard count. During the Education-entry band we lerp each shard chess→book (position + a rotation that flattens it into the book's plane). Because the counts match, there is no crossfade: the pieces literally re-flow into a book.

**The book is articulated, the chess is not.** Once morphed, free-floating shards can't hinge convincingly, so the moment the morph completes we hand the visual off to an **articulated book group**: a fixed spine, two cover planes hinged on the spine's Y axis, and N page planes also hinged there. (Implementation note: rather than swap meshes at the seam — which would flash — we keep the shard book as the *closed* book and build the articulated covers/pages as the *opened* book, crossfading opacity across a few percent of scroll right at the seam. The seam happens while the book is closed, so the crossfade is invisible.) Opening = covers rotate 0 → ~160°. Page-turn = page `i` rotates 0 → 180° when `pagesTurned` crosses its threshold, eased and scrubbed so scroll-up reverses it.

**Scroll choreography is raw-scroll math, consistent with ChessScene.** ChessScene already reads `window.scrollY` and element rects each frame rather than using ScrollTrigger; the book follows suit. We add an `education` rect and a `publications` rect, then carve the Education band into sub-bands (morph / open / pages / exit) with `clamp`-based sub-progress. Eases are small local functions (or `gsap.parseEase(...)` since `gsap` is already a registered dep) so the existing rAF stays the single source of motion.

**Page content via `CanvasTexture`, sourced from `education`.** A small mapper turns `education` into an ordered list of spreads (title → degree/GPA → awards → certifications). Each spread is rasterized once to a 2D canvas using the serif token (`--font-serif`) and wrapped in a `THREE.CanvasTexture` mapped onto a page plane. This gives crisp text with **no new dependency** and keeps `portfolio.ts` the single source of truth (the DOM card and the book read the same data).

**Reduced motion short-circuits to a closed, still book.** The whole motion block already lives behind `if (!reduce)` in the rAF; the book is built inside that effect, so under reduced motion it simply renders at its closed-book arrangement and never moves.

**Lifecycle: scene builds once per theme, disposes on unmount.** The book meshes are created inside the existing `[theme]` effect (so a theme toggle rebuilds with new tokens) and disposed in the same cleanup `traverse`. No second WebGLRenderer, no second canvas.

### Recommended transform animation (the owner asked for this explicitly)

The "transform" is a **shard re-flow morph with a flatten** — recommended over a crossfade because the entire visual language of this site is shards/fragments, so a morph feels native while a crossfade would read as a cut. Concretely, as the visitor crosses the Education-entry band:

1. **Converge** — the Queen and King stop swapping and glide to center; their shards "loosen" (a touch of scatter returns) — a one-breath anticipation.
2. **Flatten + re-flow** — each shard eases (`power3.inOut`) from its chess position to its book target, while its rotation eases toward the book's plane normal. The two tall pieces visibly *collapse flat* and *write themselves into a book*, with a tiny per-shard stagger (sorted by travel distance) so the book assembles like ink finding the page rather than snapping.
3. **Seam** — at closed-book, opacity hands from the shard-book to the articulated book (a few % of scroll; invisible because both are closed and coincident).
4. **Open** — front cover hinges up with `back.out(1.4)` (a real-book overshoot).
5. **Turn** — pages flip in sequence, `power2.inOut`, scrubbed: one scroll gesture = one page.
6. **Resolve** — leaving Education, covers close and shards scatter out (reverse of the morph) so Publications gets a clean canvas.

## Alternatives considered

- **Crossfade swap (chess scatters out + book scatters in).** Cheapest and most robust — two independent groups, opacity hand-off. **Rejected as primary** because it reads as "chess disappears, book appears," not "chess becomes book." Kept as a fallback if the 1:1 morph proves unstable in practice.
- **DOM / CSS-3D book overlay.** Keep chess in WebGL; render the book as a `transform-style: preserve-3d` DOM element that fades in over the canvas at Education. Cheapest text, easiest to build, but the chess→book handoff is necessarily a crossfade between two renderers — no morph. **Rejected for the same reason**, but noted as the low-effort fallback.
- **True 3D vertex morph (lerp shared vertex buffers).** Rejected — chess (lathe shards) and book (boxes/planes) have incompatible topologies and vertex counts; forcing equal counts would mean discarding the shard system that defines the look.
- **Per-page ScrollTrigger tweens.** Viable, but ChessScene's motion is intentionally raw-scroll (so it composes with Lenis + the existing rAF without a second update path). Adding ScrollTrigger just for pages would mix two motion drivers on related elements. Rejected; we scrub inside the existing rAF.
- **Troika / `TextGeometry` for page text.** Rejected — both add bundle weight and config; `CanvasTexture` reuses the loaded serif font with no new deps.

## File map

| Path                                                | Action | Purpose                                                                                 |
|-----------------------------------------------------|--------|-----------------------------------------------------------------------------------------|
| `src/components/ChessScene/bookGeometry.ts`         | create | `buildBookShards(count)` → shard targets for a closed book, subdivided to `count` triangles; `buildArticulatedBook(spreads)` → spine + hinged covers + page planes |
| `src/components/ChessScene/bookPages.ts`            | create | `mapEducationSpreads(education)` → ordered spread list; `makePageTexture(spread)` → `CanvasTexture` (serif font, figure color) |
| `src/components/ChessScene/ChessScene.tsx`          | edit   | Build the book inside the `[theme]` effect; extend the rAF with Education scroll-band math (morph/open/pages/exit); dispose book meshes in cleanup |
| `src/components/ChessScene/ChessScene.test.tsx`     | edit   | Add source-assertions: book built, shard-count parity, `#education`/`#publications` band math, reduced-motion gate, no hardcoded hex |
| `src/components/ChessScene/bookPages.test.ts`       | create | Unit: `mapEducationSpreads` returns the expected ordered spreads from `education` |
| `src/components/ChessScene/bookGeometry.test.ts`    | create | Unit: `buildBookShards(N)` returns exactly `N` shards; articulated book has spine + 2 covers + N pages |
| `tests/e2e/portfolio.spec.ts`                       | edit   | Scroll to Education; assert heading + a certification link visible & clickable while canvas present |
| `src/data/portfolio.ts`                             | no change | `education` is the single source; book reads it (no duplication) |

## Book anatomy (three.js)

```
bookGroup (THREE.Group)            // positioned at world origin behind the card
├── spine        BoxGeometry       // thin slab along Y
├── backCover    Mesh (plane/box)  // hinged at spine, static
├── frontCover   Mesh (plane/box)  // hinged at spine → rotation.y 0..~160°
└── pages[i]     Mesh (plane)×N    // each hinged at spine → rotation.y 0..180°
                                      front = spread[i] texture, back = spread[i+1] texture
```

- Hinge = each cover/page is a child of a pivot `Group` whose origin sits on the spine; rotating the pivot rotates the leaf about the spine axis (real book physics).
- A page's **front** face shows spread `i`, **back** shows spread `i+1`, so a single 180° flip reveals the next spread — `N` pages ⇒ `N+1` visible spreads.
- Materials: `MeshStandardMaterial({ color: figureHex(...), side: DoubleSide })` for covers; page planes use the `CanvasTexture` as `map`.

## Shard-morph parity

- Chess shard count `C` = sum over Queen + King of `buildShards` outputs (lathe facets × profile segments × 2 + cross bars). Computed once at build.
- `buildBookShards(C)` subdivides the closed-book faces (front cover + page block + back cover) into exactly `C` triangles (recursive longest-edge split until count matches; deterministic, no `Math.random` so it's stable across the theme rebuild).
- Each shard stores `{ chess: {pos,rot}, book: {pos,rot} }`; the rAF interpolates `pos = lerp(chess.pos, book.pos, ease(uMorph))`, same for rotation (slerp or per-Euler lerp). The flatten = the book target rotations already lie in the book plane.

## Motion wiring (extends the existing rAF `tick`)

```ts
const eduEl = document.getElementById('education')
const pubEl = document.getElementById('publications')
const eduTop = () => absTop(eduEl)            // absolute offset of Education top
const eduBottom = () => absTop(pubEl) ?? docHeight
const lead = vh() * 0.6                       // begin morph slightly before Education lands
const openDur = vh() * 0.5

const uMorph = clamp((scrollY - (eduTop() - lead)) / lead, 0, 1)
const uOpen  = clamp((scrollY - eduTop()) / openDur, 0, 1)
const uPages = clamp((scrollY - (eduTop() + openDur)) / (eduBottom() - (eduTop() + openDur)), 0, 1)

// morph: lerp shards chess→book with power3.inOut(uMorph)
// seam: crossfade shard-book ↔ articulated-book across uMorph ∈ [0.92, 1]
frontCoverPivot.rotation.y = -backOut(1.4, uOpen) * 2.8     // ~160°
const turned = uPages * N
pages.forEach((p, i) => { p.rotation.y = easePageTurn(turned - i) * Math.PI })
// exit (scrolling past Education): uExit → covers close, shards scatter out
```

Eases: `power3.inOut` (morph), `back.out(1.4)` (cover), `power2.inOut` (pages). Implemented as small pure functions or via `gsap.parseEase` (gsap is already imported/registered in `src/lib/gsap.ts`).

## Test plan

- **Unit/component (Vitest, jsdom — WebGL is skipped, so tests are structural/source-assertions, matching `ChessScene.test.tsx`):**
  - `bookPages.test.ts` — `mapEducationSpreads(education)` yields the expected ordered spreads (title/degree/GPA/awards/certs); count is deterministic.
  - `bookGeometry.test.ts` — `buildBookShards(C)` returns exactly `C` shards; `buildArticulatedBook` produces 1 spine + 2 covers + N page pivots.
  - `ChessScene.test.tsx` (extend) — source contains: book built inside the `[theme]` effect; shard-count parity (`buildBookShards(C)`/`===` chess count); band math references `getElementById('education')` and `'publications'`; reduced-motion gate wraps the book motion; page-turn is scrubbed (`uPages`/`rotation.y`); **no hardcoded hex** for the book (extends the existing "no neon" regex).
- **E2E (Playwright):** scroll to `#education`; assert the Education heading and at least one certification link are visible and clickable while `[data-chess-canvas]` is present (content stays above the book); scroll back up and assert the chess canvas is still present (no crash on reverse).

## Risks

- **Shard-count parity drift.** If Queen/King geometry changes, `C` changes and `buildBookShards(C)` must re-subdivide. Mitigation: `C` is computed at runtime (not hardcoded); a unit test pins "book shard count === chess shard count."
- **The seam between shard-book and articulated-book.** A visible pop if the two don't coincide. Mitigation: crossfade opacity across a narrow sub-band while both are closed and at the same transform; covered by manual visual check + the E2E "no crash on reverse."
- **Text legibility behind the translucent card.** The book sits behind a 75%-opaque card. Mitigation: size the book to frame the card (slightly smaller, centered) rather than underlay the body text; tune in `plan.md` once visible. This is the main open design question.
- **Bundle / perf.** One more `CanvasTexture` per spread (≈5) + a handful of planes; negligible vs. the existing shard scene. Textures disposed on cleanup.
- **Reduced-motion correctness.** The book must render closed and still. Mitigation: it's built inside the same `if (!reduce)`-gated effect; under reduced motion the rAF skips all transforms, so the book stays at its closed arrangement. Covered by a source-assertion.
