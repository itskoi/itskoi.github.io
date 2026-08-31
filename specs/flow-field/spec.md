# Spec: flow-field

> WHAT we are building and WHY. Replace the chess→lattice WebGL specimen with a **2D streamline study**: dashed ink hairlines flowing left→right past a hairline circle, developing into a Kármán vortex street and calming again — wind and water rendered as a technical chart, not atmosphere. No implementation here — see `plan.md`.

## Context

The owner retired the chess/cube scene as the page's signature element and asked for something evoking **the flow of water or wind** instead. Three concepts were reviewed (streamline study past an obstacle, bathymetric depth contours, two-source interference rings); the owner selected the **streamline study**.

The constraint that shapes everything: `specs/swiss-redesign/`'s motion doctrine — *mechanical and grid-aligned… instead of atmospheric (no parallax, no soft opacity fades, no growing fills)*. So "flow" is not rendered as soft blur, particles, or glow. It is rendered the way a fluid-dynamics textbook figure would be: **streamlines** (lines everywhere tangent to the velocity field) drawn as traveling dashes in ink on paper, bending around a circular obstacle, shedding alternating vortices in its wake. The specimen-plate framing survives verbatim — same fixed full-viewport canvas behind the content, same `FIG. 1` mono caption; only the specimen changes.

What the visitor sees, mapped to the page's scroll bands (mirroring the chess choreography):

| Scroll band        | Field state                                                            |
|--------------------|------------------------------------------------------------------------|
| Hero (load)        | Laminar lines with a gentle traveling waviness; the circle stands full-size right of center — the labeled exhibit |
| Hero → Experience  | Waviness settles; the stream straightens                               |
| Experience         | Shedding begins — alternating vortices peel off behind the circle      |
| Education          | Fully developed vortex street; lines weave the full width             |
| Publications → end | Circulation decays, the circle dematerializes, lines calm to straight |

Dashes travel along every line continuously — the flow direction reads without any soft trails, and the page keeps living between scrolls.

## User stories

- As a **visitor**, I want **the showpiece to evoke wind or water moving across the page** so the portfolio **feels alive without decorative noise**.
- As a **visitor**, I want **the flow drawn like a technical figure — hairline streamlines, a labeled obstacle, traveling dashes** so the showpiece **stays objective and Swiss rather than atmospheric**.
- As a **visitor scrolling the page**, I want **the flow to evolve with my scroll** — settle, shed, weave, calm — so **scrolling feels like turning the pages of a study**.
- As a **motion-sensitive visitor**, I want **a static laminar frame instead of the animation** so **the poster stays calm**.
- As the **owner**, I want **the scene monochrome ink from the theme tokens** so it **inverts cleanly with dark mode like the rest of the poster**.

## Acceptance criteria

(testable; each maps to at least one test — see `plan.md`)

### The field (physics of the drawing)
- [ ] The velocity field is analytic and pure: uniform free stream + potential flow past a cylinder + a staggered row of regularized point vortices + a settling waviness term. Given identical inputs it returns identical outputs. — `flowField.test.ts`
- [ ] The obstacle is impermeable: radial velocity at the cylinder surface (`r = R`) is ~0, and the crown (`r = R`, θ = 90°) runs at ~2U. — `flowField.test.ts`
- [ ] Far from the cylinder the field returns to the free stream `(U, 0)`. — `flowField.test.ts`
- [ ] Stagnation points sit at the upstream and downstream poles of the circle (velocity ~0 at `(±R, 0)` relative to center). — `flowField.test.ts`
- [ ] Each vortex carries its circulation: the tangential line integral around a loop enclosing one vortex ≈ Γ (within the regularization tolerance), positive for one row, negative for the other. — `flowField.test.ts`
- [ ] With zero vortices the cylinder flow is irrotational (discrete curl ≈ 0 away from the core). — `flowField.test.ts`

### The street
- [ ] The street is a deterministic function of time and strength: same inputs → same vortices; strength 0 → no vortices. — `flowField.test.ts`
- [ ] Vortices alternate sign and side (top row one circulation, bottom row the opposite), drift downstream, and are gone past the exit. — `flowField.test.ts`

### The timeline (scroll choreography)
- [ ] Scroll progress maps to the four beats — `settle`, `shed`, `street`, `exit` — each clamped to [0, 1] with the bands anchored to the `#experience`, `#education`, `#publications` tops. — `flowField.test.ts`
- [ ] At page load the field is laminar with full waviness and zero shedding; at the end of the page it is calm laminar with no obstacle. — `flowField.test.ts`

### The rendering
- [ ] Exactly one `<canvas>` remains on the page — now `data-flow-canvas`, fixed full-viewport behind the content, `aria-hidden`, `pointer-events: none`. — `FlowScene.test.tsx` + `tests/e2e/swiss.spec.ts`
- [ ] Streamlines are dashed hairlines in ink from `--scene-figure-rgb`; the obstacle is a hairline ring at specimen ink (0.75) over a faint fill (0.05) — the same two-ink grammar the chess edges used. — `FlowScene.test.tsx` (source contract)
- [ ] Dash phase advances with time so dashes travel along the lines at the local field speed; lines are re-integrated from fixed left-edge seeds every frame. — `FlowScene.test.tsx` (source contract)
- [ ] The scene re-reads tokens and rebuilds on theme change (`useTheme` dep), caps DPR at 2, and handles resize. — `FlowScene.test.tsx` (source contract)
- [ ] Reduced-motion visitors get a static laminar frame: no time advance, no scroll response, one canonical composition. — `FlowScene.test.tsx` (source contract)

### The specimen plate
- [ ] The hero caption reads `FIG. 1 — flow past a cylinder, streamline study` and keeps the mono/meta styling. — `Hero.test.tsx` + `tests/e2e/swiss.spec.ts`
- [ ] The specimen is visible on ≤ 480px viewports (the 2D field spans the viewport; the chess FOV bug dies with chess). — `tests/e2e/portfolio.spec.ts`

### Removal
- [ ] `src/components/ChessScene/` is deleted; nothing in `src/` imports `three`; `three` and `@types/three` leave `package.json`. — `bun run check`/`lint` green + dependency absence
- [ ] Theme helpers only the chess scene consumed (`figureHex`, `readPieceColors`) and their tokens (`--scene-figure` hex, `--scene-piece-rgb`) are deleted, not shimmed; `--scene-figure-rgb` remains the scene-ink contract, read by `readSceneColors()`. — `theme.test.ts`, `global.test.ts`

## Out of scope

- Content, section order, grid grammar, type scale, palette — all owned by `specs/swiss-redesign/` and untouched.
- The masked line-rise reveal system (`useHeroIntro`, `useScrollReveal`) — unchanged.
- Smooth-scroll plumbing (Lenis ↔ GSAP ticker) — unchanged; the scene keeps reading raw `window.scrollY` in its own rAF, no ScrollTrigger.
- Physical fidelity beyond the listed invariants (no viscosity, no boundary layers, no image vortices inside the cylinder).

## Decisions (resolved 2026-08-30)

1. **Concept — streamline study past an obstacle.** Owner-selected over "bathymetric depth contours" and "interference rings". Wind-and-water in one figure; maps 1:1 onto the chess narrative beats (order → interaction → transformation → calm).
2. **Pipeline — 2D canvas, three.js deleted.** The specimen is line art; 2D canvas gives crisper hairlines at lower cost, drops ~600 KB of dependency, and fixes the ≤ 480px invisibility for free.
3. **Motion doctrine — flow as technical drawing.** Dashed streamlines with traveling dash phase are the *only* ambient motion; no particle trails, no gradients, no opacity fades. The waviness/settling term is a pure sinusoid. This **amends** `specs/swiss-redesign/`'s "chess scene keeps its existing motion untouched" (Decision 5) — the specimen itself is replaced; the doctrine (mechanical, not atmospheric) is kept.
4. **Ink grammar — two inks, inherited.** Streamlines at ~0.38 ink (the "third ink" the lattice taught: full ink over the tabular rows reads as noise); the obstacle ring at 0.75 with a 0.05 fill, exactly the chess-edge specimen weight.
5. **Narrative — ends calm, not symmetrical.** Load shows the full specimen (circle + laminar weave); the page ends on empty ruled calm as the study concludes.

## Open questions

- Dash pattern density and street strength on paper — tune by screenshot during implementation; record shipped values in a dated Changes note (same protocol as the wireframe-opacity tuning).
- Free-stream speed: a dash should cross the viewport in roughly 8–15 s idle. Tune once the obstacle spacing is seen in situ.

## References

- Superseded decisions: `specs/chess-pieces/spec.md` and `specs/chess-to-book/spec.md` (scene geometry/motion ownership), `specs/swiss-redesign/spec.md` (Decision 3's chess-as-specimen framing → the specimen is now the flow study; the `--scene-piece-rgb` token row and mobile-FOV follow-up are moot)
- Token contract: `src/styles/global.css` (`--scene-figure-rgb`), `src/lib/theme.ts` (`readSceneColors`)
- Prior art: Kármán vortex street diagrams; textbook potential-flow figures (flow past a cylinder); hint-style wind maps
- Project principles: `specs/constitution.md`
- Derived from: `specs/_template/`

## Changes (2026-08-30 — during implementation, from screenshot review)

1. **Wall projection added (resolves the no-image-vortex risk).** Superposed point vortices ignore the cylinder wall, and the first screenshot round showed streamlines crossing the obstacle interior once the street was active. `integrateStreamline` now projects any step that lands inside the obstacle back onto the surface (`R + 1.5`), so lines hug the circle and release tangentially. Verified at pixel level: zero dark pixels inside the circle in canvas-only screenshots at every beat. (An earlier "interior line" reading turned out to be the Education rows' own hairline rules crossing the fixed backdrop — the canvas was already clean.)
2. **Street tuned to read as a street (resolves open question 1).** First pass read as "general waviness": circulation ratio 0.9 → 1.5, spacing 3.4R → 2.4R, row offset 1.4R → 1.2R, and vortex influence is now local to the wake (fades out between 14× and 26× the core radius) so far-field lines stay laminar and the wake reads as the event. Shipped inks: streamlines 0.38 → **0.3** (they cross the tabular rows; the lattice lesson), obstacle ring **0.75** / fill **0.05** unchanged from the chess grammar. Dash pattern `[4, 6]` at 1px.
3. **Integration budget raised.** Lines caught circling vortex cores exhausted the 420-step budget and ended raggedly mid-screen; `MAX_STEPS` is now 800 — all lines span the full width again.
4. **Mobile specimen enlarged.** At `RADIUS_RATIO` 0.105 the obstacle was ~41px on a 390px viewport — present but faint. Narrow viewports (< 768px) use 0.15; the street weaves legibly behind the stacked content (the chess FOV bug stays dead).
5. **Free-stream speed (resolves open question 2).** `U = 0.085 × viewport width` per second — a dash crosses the page in ~12 s idle; street drift 0.8U; wobble period 9 s at 0.22U amplitude. Left as shipped after review.

## Changes (2026-08-30 — owner revision: the planet system)

1. **The obstacle is now a planet with an orbiting moon (amends Decision 1's specimen).** The circle gained a wireframe-globe graticule — three meridian ellipses rotating over a 26 s spin plus equator and two static parallels, at line ink (0.3) inside the 0.75-ink specimen ring. The moon (0.28 R) rides a faint continuous orbit ring (0.15 ink, 1.9 R radius, 36 s period) that is *broken around the moon* the way an orrery chart gaps the path for the body. The whole system — graticule, moon, orbit — scales with the planet and dematerializes with the exit band; under reduced motion the moon parks at its canonical phase. `FlowField.cylinder` became `bodies: Cylinder[]`: both bodies deflect the flow (superposed doublets), and the moon deflects through a 1.5× sphere of influence while drawing at its true size.
2. **Air gap enforced (owner report: "flow hits the planet").** Streamlines hugged the ring at 1.5 px — technically outside, visually a hit. The projection standoff is now `radius × 1.12 + 2` per body, verified at pixel level under an emulated reduced-motion frame: zero dark pixels in the standoff annulus or the moon's interior.
3. **The FIG. 1 caption plate is removed (supersedes the swiss-redesign criterion "carries a mono caption beginning FIG. 1" and this spec's specimen-plate criterion of the same shape).** The scene now carries itself without a label; the hero keeps its type and meta only. `Hero.tsx`, the `.caption` CSS, and the caption tests (`Hero.test.tsx`, `global.test.ts`, `tests/e2e/swiss.spec.ts`) are deleted, not stubbed.

## Changes (2026-08-31 — owner revision: the planet goes bare)

1. **Graticule removed.** The wireframe-globe line-work (rotating meridians, parallels, equator) did not read as a sphere to the owner — it read as a busy circle — so the planet is now a bare specimen ring over its faint fill, exactly the obstacle grammar the scene launched with. The moon, its gapped orrery orbit, and the two-body deflection are unchanged; the planet's identity now comes from having a satellite, not from internal line-work. `GRATICULE_INK`, `SPIN_PERIOD`, and `MERIDIANS` are deleted with their drawing block.
2. **Orbit track removed.** The faint gapped orrery ring was the last ornament; the moon now rides an invisible orbit (same 1.9R radius, 36s period, sphere-of-influence deflection). The canvas draws exactly three kinds of marks: dashed streamlines, the planet ring, the moon ring. `ORBIT_INK` and the arc-gap drawing block are deleted.
