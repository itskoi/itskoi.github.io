# Spec: lorenz-background

> WHAT and WHY. Replace the gradient-descent backdrop with a Lorenz attractor drawn as a dot grid, in the spirit of the owner's reference. No implementation here, see `plan.md`.

## User stories

- As a **visitor**, I want **a living Lorenz butterfly behind the page** so that **the site has a distinctive, mathematical backdrop**.
- As a **reader**, I want **the text to stay readable over it** so that **the motion never costs me the content**.
- As a **motion-sensitive visitor**, I want **a still frame** so that **the backdrop does not move**.

## Acceptance criteria

- [x] The orbit is the Lorenz system (σ=10, ρ=28, β=8/3): bounded, visiting both wings, and closing its loop without a visible jump. — `src/components/LorenzScene/lorenzField.test.ts`
- [x] A faint full orbit and a brighter comet with a tail are drawn as dots on a fixed grid, on one decorative canvas hidden from assistive tech. — `src/components/LorenzScene/LorenzScene.test.tsx`, `tests/e2e/lorenz.spec.ts`, `tests/e2e/swiss.spec.ts`
- [x] All color comes from theme tokens: faint ink from `--scene-figure-rgb`, comet from `--color-accent`. — `src/components/LorenzScene/LorenzScene.test.tsx`
- [x] The figure turns slowly and the comet travels with time, not scroll. — `tests/e2e/lorenz.spec.ts`
- [x] Under reduced motion the frame is still. — `tests/e2e/lorenz.spec.ts`
- [x] During Experience the figure moves out from behind the illustration stage: into the text column on wide screens, below the pinned stage on phones. — `src/components/LorenzScene/lorenzField.test.ts`, by eye
- [x] No new dependency and no third-party request. — `package.json` unchanged
- [x] The descent scene and its field are removed. — `tests/e2e/swiss.spec.ts`, `src/App.tsx`

## Out of scope

- The reference's controls, exports and equation header line.
- The reference's purple-to-yellow gradient, which is off the site's palette.
- A pause control. The old backdrop also ran continuously; only the OS reduced-motion setting stops it.

## References

- https://www.ascii-magic.com/ascii/lorenz-attractor (the look; the source is MIT-licensed)

## Changes

### 2026-11-05

- Added: the canvas runs at full strength over the hero and at 40% opacity once scrolled past it, because the comet made small text hard to read. — `tests/e2e/lorenz.spec.ts`
- Added: the canvas blurs 6px while Experience is the active section, on the same band as the nav and heading, at the owner's request. Blur replaces the dimming there, since dimmed and blurred together the figure all but vanished. Under reduced motion the blur applies instantly. — `tests/e2e/lorenz.spec.ts`
