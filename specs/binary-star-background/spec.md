# Spec: binary-star-background

> WHAT and WHY. Replace the light theme's Lorenz attractor with a binary star orbit, from the owner's reference. No implementation here, see `plan.md`.

## User stories

- As a **visitor**, I want **two stars orbiting each other behind the page** so that **the backdrop feels alive and physical**.
- As a **reader**, I want **the text to stay readable over it** so that **the motion never costs me the content**.
- As a **motion-sensitive visitor**, I want **a still frame** so that **the backdrop does not move**.

## Acceptance criteria

- [x] The stars follow Kepler ellipses (eccentricity 0.55, 9 second period) around a fixed centre of mass, the lighter star on the wider orbit, moving fastest at closest approach, with no jump when the loop closes. — `src/components/BinaryStarScene/binaryStarField.test.ts`
- [x] Each star has a solid disc, a fading glow and a fading trail in braille-style dots, with the centre of mass marked, on one decorative canvas hidden from assistive tech. The nearer star draws on top. — `src/components/BinaryStarScene/BinaryStarScene.test.tsx`, `tests/e2e/binaryStar.spec.ts`, by eye
- [x] All color comes from theme tokens: the heavy star from `--color-accent`, its companion from `--scene-figure-rgb`. — `src/components/BinaryStarScene/BinaryStarScene.test.tsx`, `tests/e2e/binaryStar.spec.ts`
- [x] The stars move with time, not scroll. — `tests/e2e/binaryStar.spec.ts`
- [x] Under reduced motion the frame is still. — `tests/e2e/binaryStar.spec.ts`
- [x] The placement, dimming and blur match the backdrop it replaces, except that the canvas also stays dimmed while blurred during Experience, because a solid black star would otherwise hide black text. — `src/components/BinaryStarScene/binaryStarField.test.ts`, `tests/e2e/binaryStar.spec.ts`, by eye
- [x] The dark theme keeps the black hole. — `src/App.test.tsx`, `tests/e2e/binaryStar.spec.ts`
- [x] The Lorenz scene and its field are removed, with no new dependency. — `src/App.tsx`, `package.json` unchanged

## Out of scope

- The reference's orange and blue, and its dark sky, which are off the light theme's white, black and red palette.
- The reference's shaded discs, nebula noise and ASCII characters.

## References

- The owner's pasted `binary-stars` piece, built on the same `lib/kit.js` as the black hole's source, ascii-magic-art (MIT).

## Changes

### 2026-11-05

- Changed, at the owner's request: the two stars are halftone dots on a fixed coarse lattice, large at the centre and specks at the rim, not solid discs, and their radii return to the reference's. Glows use the same lattice, and glows and trails stay out of a disc's gaps. This supersedes "a solid disc" and the plan's small discs. The discs never overlap, so "the nearer star draws on top" is dropped. — `src/components/BinaryStarScene/binaryStarField.test.ts`, `tests/e2e/binaryStar.spec.ts`
- Added, at the owner's request: the black hole's drifting star field of two dot sizes and crosses, sharing its star map, without the lensing. — `src/components/BinaryStarScene/BinaryStarScene.test.tsx`, `tests/e2e/binaryStar.spec.ts`
