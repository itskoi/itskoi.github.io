# Spec: black-hole-background

> WHAT and WHY. Replace the Lorenz backdrop with an animated ASCII black hole, after the owner's reference. No implementation here, see `plan.md`.

## User stories

- As a **visitor**, I want **a black hole swirling behind the page** so that **the site has a distinctive backdrop**.
- As a **reader**, I want **the text to stay readable over it** so that **the motion never costs me the content**.
- As a **motion-sensitive visitor**, I want **a still frame** so that **the backdrop does not move**.

## Acceptance criteria

- [x] The figure keeps the reference's anatomy: an empty shadow, a photon ring, a lensed halo, a tilted accretion disk with differential rotation, over a star field bent around the hole, drawn in text glyphs (`░▒▓█`, `.`, `·`, `+`). — `src/components/BlackHoleScene/blackHoleField.test.ts`
- [x] The shadow and ring hold still while the disk swirls on a seamless 7s loop and the stars drift. — `src/components/BlackHoleScene/blackHoleField.test.ts`, `tests/e2e/blackHole.spec.ts`
- [x] It fills the viewport at any size on one decorative canvas hidden from assistive tech, with a bounded number of cells. — `src/components/BlackHoleScene/blackHoleField.test.ts`, `src/components/BlackHoleScene/BlackHoleScene.test.tsx`, `tests/e2e/swiss.spec.ts`
- [x] All color comes from theme tokens: field and stars from `--scene-figure-rgb`, disk from `--color-accent`. — `src/components/BlackHoleScene/BlackHoleScene.test.tsx`, `tests/e2e/blackHole.spec.ts`
- [x] Under reduced motion the frame is still. — `tests/e2e/blackHole.spec.ts`
- [x] The dim past the hero, the blur during Experience, and moving clear of the illustration stage all carry over from the Lorenz backdrop. — `tests/e2e/blackHole.spec.ts`, `src/components/BlackHoleScene/blackHoleField.test.ts`
- [x] No new dependency and no third-party request; the source's MIT notice ships with the port. — `package.json` unchanged, `src/components/BlackHoleScene/LICENSE.ascii-magic-art`
- [x] The Lorenz scene and its field are removed. — `tests/e2e/swiss.spec.ts`, `src/App.tsx`

## Out of scope

- The reference's controls, exports and look presets.
- The reference's purple-and-orange palette, which is off the site's palette. On the paper theme the shadow is therefore page white, not black.
- A pause control. Only the OS reduced-motion setting stops it, as before.

## References

- https://www.ascii-magic.com/ascii/black-hole (the look; the source is MIT-licensed)

## Changes

### 2026-11-05

- Changed, at the owner's request before anything shipped: the figure is smaller and drawn in halftone dots, not text glyphs. A dot's area carries the brightness, on a square grid. The disk spans half a wide screen and most of a phone, instead of the reference's scale covering the viewport. The star field still fills the viewport, but the field's darkest parts lose their dots. — `src/components/BlackHoleScene/blackHoleField.test.ts`, `tests/e2e/blackHole.spec.ts`
- Changed: past the hero, sharp or blurred, the canvas dims to 25%, not the Lorenz backdrop's 40% and full-strength blur, because the disk's dots are dense enough to cost small text its contrast. — `tests/e2e/blackHole.spec.ts`
- Changed, at the owner's request: a thinner ring and fewer stars. The ring and lensed halo are narrower than the source's and the halo dimmer, because a single ink has no color gradient to keep them apart; bright dots stay within 2.5 units across the upper arc, and the ring stays unbroken on a phone's coarser grid. About 100 stars show on a laptop, as many as the source's frame. — `src/components/BlackHoleScene/blackHoleField.test.ts`
- Changed, at the owner's request after comparing against the reference's render: the figure takes the reference's contrast. Disk dots follow its halftone tone curve, from specks to full dots, and hot dots mix from `--color-accent` toward `--scene-figure-rgb`, standing in for the gradient's white end. Stars come back as the source's three kinds, including crisp crosses, and the field recedes to barely visible. The page's background stays the theme's. — `src/components/BlackHoleScene/blackHoleField.test.ts`, `src/components/BlackHoleScene/BlackHoleScene.test.tsx`
- Changed, at the owner's request: the ring is about 10% larger across, at the same line weight, with a shadow radius of 10.5 units against the source's 9.5. The disk keeps its size. — `src/components/BlackHoleScene/blackHoleField.test.ts`
- Changed, at the owner's request: on the paper theme the disk stays red. Hot dots mix toward a new `--scene-hot` token, the deeper accent on paper and white on dark, because mixing toward ink read as muddy maroon and a heavy black ring on white. — `tests/e2e/blackHole.spec.ts`, `src/styles/global.test.ts`
- Changed, at the owner's request: the black hole shows on the dark theme only, and the Lorenz backdrop returns for the light theme, restored unchanged. This reverses the criterion that removed the Lorenz scene, and the `--scene-hot` token goes with the paper version, so hot dots mix toward `--scene-figure-rgb` again. — `src/App.test.tsx`, `tests/e2e/lorenz.spec.ts`, `tests/e2e/blackHole.spec.ts`
- Changed, at the owner's request: patches of the ring are pink, a half mix of `--color-accent` and `--scene-figure-rgb`, and the rest stays white. The patches follow the disk's texture, so they swirl with it. — `src/components/BlackHoleScene/blackHoleField.test.ts`, `src/components/BlackHoleScene/BlackHoleScene.test.tsx`
