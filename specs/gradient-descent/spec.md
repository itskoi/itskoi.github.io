# Spec: gradient-descent

> WHAT we are building and WHY. Replace every existing animator with one showpiece: a **3D vector field rendered as a technical figure** — the loss landscape of a fixed analytic objective f: ℝ³ → ℝ, its negative gradient −∇f as the field, and the visitor's smooth scroll **riding a gradient-descent trajectory** from a high-loss start down to the converged minimum. The owner is an AI engineer; the signature element should say so. No implementation here — see `plan.md`.

## Context

The owner retired the flow-field specimen (streamlines, planet, moon) and asked for a **full motion reset**: remove every animator shipped so far — the flow-field scene, the hero intro, the scroll reveals — and build one new scene around a metaphor from the owner's own discipline. Three scroll narratives were reviewed (**ride the descent** — the camera travels the trajectory; **optimizer steps** — a fixed camera watches particles train as you scroll; **slice sweep** — a plane scans the latent space). The owner selected **ride the descent**: scrolling the page *is* the optimization run.

The figure is drawn the way a 3D plot in a paper would be — wireframe surface, field lines, an optimizer path, a marked minimum — in ink on paper with a single accent, per `specs/swiss-redesign/`'s motion doctrine (mechanical, grid-aligned, no atmospheric fades). The maths is honest: the field really is −∇f of one fixed objective, the path really is gradient descent, and the loss only ever falls. A peer reviewing the figure would find nothing fake.

What the visitor sees, mapped to scroll (the whole document is one run — no section-band anchoring):

| Scroll position      | Scene state                                                                                  |
|----------------------|----------------------------------------------------------------------------------------------|
| Hero (top, s ≈ 0)    | Camera high at the trajectory's start; the landscape spreads out ahead; the full descent path lies dotted in ink |
| Experience → Education (s mid) | The camera rides down the slope; the accent path lengthens behind it; field dashes stream past, everywhere pointing downhill |
| Publications → end (s → 1) | The camera settles into the global basin; field lines converge radially inward; the path ends on the accent crosshair at the minimum |

Field dashes travel continuously with the scene clock — the gradient is alive between scrolls, and the page never goes still.

## User stories

- As a **visitor**, I want **a showpiece that reads as an optimizer at work — a landscape, a field, a converging path** so the portfolio **feels authored by an AI engineer, not by a template**.
- As a **visitor scrolling the page**, I want **the camera to ride the descent** — start high, settle into the minimum — so **scrolling feels like watching (and causing) convergence**.
- As the **owner**, I want **the metaphor to be honest** — the field is −∇f of a fixed objective, the path is real gradient descent, the loss only falls — so **the figure survives review by peers**.
- As a **motion-sensitive visitor**, I want **one static composition instead of the flight** so **the poster stays calm**.
- As the **owner**, I want **the scene in monochrome ink with a single accent path** so it **inverts cleanly with dark mode and stays Swiss**.

## Acceptance criteria

(testable; each maps to at least one test — see `plan.md`)

### The objective (field math)

- [ ] The loss f: ℝ³ → ℝ is analytic and deterministic — gaussian wells over a weak quadratic bowl with gentle sinusoidal ridges — with a single global basin in the plotted window. Identical inputs give identical outputs. — `descentField.test.ts`
- [ ] The analytic gradient is correct: it matches a central finite difference at sample points to tight tolerance. — `descentField.test.ts`
- [ ] The objective is non-convex yet unambiguous: the loss at the basin centre is strictly below the loss at every window corner. — `descentField.test.ts`
- [ ] The field is the negative gradient: at sample points the field direction is ∇f flipped (unit dot product with −∇f ≈ 1), a pure function of position. — `descentField.test.ts`

### The trajectory (the optimizer run)

- [ ] The trajectory is plain gradient descent from a fixed start with a fixed step size: the loss is non-increasing from every point to the next, and the endpoint rests inside the global basin. — `descentField.test.ts`
- [ ] The run is deterministic: building the trajectory twice yields identical points. — `descentField.test.ts`
- [ ] The camera rides the trajectory by arc length: s = 0 gives the start pose, s = 1 the converged pose, and s is clamped to [0, 1]. — `descentField.test.ts`

### The projection (3D → 2D)

- [ ] The camera is perspective: the point straight ahead of the camera projects onto the canvas centre; points behind the camera (or inside the near plane) are culled — never mirrored across the centre. — `descentField.test.ts`
- [ ] Scroll progress is the document scroll fraction clamped to [0, 1] — one run per page, no section-band anchoring. — `descentField.test.ts`

### The rendering

- [ ] Exactly one `<canvas>` on the page — `data-descent-canvas`, fixed full-viewport behind the content, `aria-hidden`, `pointer-events: none`. — `DescentScene.test.tsx` + `tests/e2e/swiss.spec.ts`
- [ ] The scene reads as a 3D technical plot: a wireframe slice of the loss surface, dashed field lines flowing along −∇f, and the descent trajectory split at the camera — ahead as dotted ink, behind as a solid accent line. Inks: wireframe ≤ 0.25, field dashes ~0.3, traversed path at specimen weight in the poster accent. — `DescentScene.test.tsx` (source contract)
- [ ] The field keeps moving between scrolls: dash phase advances with time × the local gradient magnitude, so steep regions race and the basin floor crawls. — `DescentScene.test.tsx` (source contract)
- [ ] Depth is legible without shading: line ink fades with camera-space depth; no fills, glows, or opacity crossfades (swiss doctrine). — `DescentScene.test.tsx` (source contract)
- [ ] The minimum is marked with a small accent crosshair — the target the whole page descends toward. — `DescentScene.test.tsx` (source contract)
- [ ] The scene rebuilds on theme change (`[theme]` dep), re-reading ink from `--scene-figure-rgb` via `readSceneColors()`; DPR capped at 2; resize handled. — `DescentScene.test.tsx` (source contract)
- [ ] Reduced-motion visitors get one static frame: no time advance, no scroll response — the canonical mid-descent composition (s frozen at 0.5). — `DescentScene.test.tsx` (source contract)

### Removal (fresh start)

- [ ] `src/components/FlowScene/` is deleted with its tests; nothing in `src/` imports it. — `bun run check` / `lint` green
- [ ] `useHeroIntro` and `useScrollReveal` are deleted with their tests; the five sections render statically (no `data-intro`, no `data-reveal` attributes). — section tests
- [ ] ScrollTrigger leaves the codebase: `src/lib/gsap.ts` exports only `gsap` + `prefersReducedMotion()`; Lenis no longer wires `ScrollTrigger.update`. GSAP remains as the ticker host. — `gsap.test.ts`, `lenis.test.ts`
- [ ] `--scene-figure-rgb` stays the scene-ink contract, read by `readSceneColors()`. — `theme.test.ts` (existing, unchanged)

## Out of scope

- Content, section order, grid grammar, type scale, palette — owned by `specs/swiss-redesign/`, untouched.
- Lenis smooth-scroll plumbing — unchanged (GSAP's ticker still drives Lenis's RAF).
- Any text or numeric readout on the canvas (loss values, step counters, axis labels) — the owner removed the `FIG. 1` caption plate in `specs/flow-field`; the scene carries itself without labels.
- Optimizer realism beyond the listed invariants (no momentum, no noise, no learning-rate schedules).

## Decisions (resolved 2026-08-31)

1. **Narrative — ride the descent.** Owner-selected over "optimizer steps" (fixed camera, scroll = training progress) and "slice sweep" (a plane scanning latent space). Scrolling *is* the run: the reader causes the convergence.
2. **Scope — full motion reset.** Every animator shipped so far is removed first: the flow-field scene, the hero intro, the scroll reveals, and with them ScrollTrigger. The descent field becomes the site's only animator. Amends the constitution's Motion line via a dated note.
3. **Pipeline — 2D canvas + hand-rolled 3D projection.** The specimen is line art; a perspective projection of polylines is ~40 lines of pure, unit-testable maths. three.js stays out (precedent: `specs/flow-field` Decision 2 — crisper hairlines, zero dependency, jsdom-friendly lifecycle).
4. **Scroll mapping — document fraction, not section bands.** The page is one optimization run; Lenis already supplies the smoothness. No `#experience`/`#education` anchoring this time.
5. **Ink grammar — monochrome plus one accent.** Landscape and field stay ink (the two-ink grammar); the traversed trajectory is the poster's Swiss red `--color-accent` — the single mark that tracks *your* descent.
6. **Optimizer — plain gradient descent, fixed step.** Monotone loss decrease is a testable invariant; momentum and schedules are realism the figure doesn't need.

## Open questions

- Wireframe density, dash speed, camera pullback and field-of-view — tune by screenshot during implementation; record shipped values in a dated Changes note (same protocol as the flow-field tuning).
- Whether the wireframe slice should ride the camera's altitude (morphs as you descend — shipped choice) or sit at a fixed plane — revisit if the morph reads as shimmer.

## References

- Superseded specimen: `specs/flow-field/` (scene lifecycle, ink grammar, tuning protocol)
- Motion doctrine: `specs/swiss-redesign/` (mechanical, grid-aligned, no atmospheric fades)
- Token contract: `src/styles/global.css` (`--scene-figure-rgb`), `src/lib/theme.ts` (`readSceneColors`)
- Prior art: 3D surface + quiver plots (matplotlib); loss-landscape visualizations (Li et al., *Visualizing the Loss Landscapes of Neural Networks*, 2018); gradient-descent contour animations
- Project principles: `specs/constitution.md`
- Derived from: `specs/_template/`
