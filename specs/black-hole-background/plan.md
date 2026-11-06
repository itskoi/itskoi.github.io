# Plan: black-hole-background

> HOW.

## Approach

`blackHoleField.ts` ports the maths of `pieces/black-hole.js` and the noise it needs from `lib/kit.js`. It is pure: each frame it writes a glyph index and an ink index per cell, so it can be tested without a canvas. `BlackHoleScene.tsx` owns the canvas and the frame loop, and paints cells grouped by ink, as the Lorenz scene did.

The reference is a fixed 100×38 grid. A backdrop has to fill any viewport, so cells keep a size (at least 9×18px, growing past 160 columns to bound the per-frame cost) and the piece's units are scaled to cover the viewport. The hole's center is free, so the Lorenz placement carries over: right of the hero text, clear of the illustration stage during Experience, easing between the two.

Glyphs are drawn with `fillText` in the self-hosted Geist Mono, which covers `U+2500-259F`, so there is no OS font fallback. The loop starts after that font loads so the first frame does not swap.

## Motion decisions (constitution 7)

- 24fps, the reference's rate.
- The disk loops every 7s; two crossfaded texture layers keep the winding from running away.
- Stars drift at 3 cells per second, sampled at cell resolution so they stay single glyphs at any scale.
- Field glyphs stay faint so body text stays readable. The CSS dim and blur are unchanged.

## Alternatives considered

- **Embed `ascii-magic.com/ascii/ascii.js`.** A third-party script on every load, with their palette. Rejected.
- **The `ascii-magic-art` npm package.** Its player is a fixed grid in its own palette, so it cannot fill the viewport or follow the theme. Rejected.
- **Keep the reference's palette.** Off the site's palette, and a dark field cannot sit on the paper theme. Rejected.

## File map

| Path | Action | Purpose |
|---|---|---|
| `src/components/BlackHoleScene/*` | create | the scene, its field, tests, the source's license |
| `src/components/LorenzScene/*` | delete | replaced |
| `tests/e2e/blackHole.spec.ts` | create | replaces `tests/e2e/lorenz.spec.ts` |
| `tests/e2e/swiss.spec.ts`, `tests/e2e/portfolio.spec.ts` | edit | the canvas's new name |
| `src/App.tsx` | edit | mounts the new scene |
| `src/lib/gsap.ts`, `src/sections/Hero/Hero.module.css`, `CLAUDE.md`, `specs/constitution.md` | edit | references to the backdrop |

## Test plan

- **Unit/component** (Vitest): anatomy, loop, drift, determinism, cell bound, placement; decorative canvas and token use.
- **E2E** (Playwright): paint and accent census, motion, reduced motion, dim, blur, theme repaint.

## Risks

- About 8,000 `fillText` calls a frame on the main thread — mitigation: 24fps cap and the 160-column bound; frame cost measured in a real browser.

## Changes

### 2026-11-05

- Halftone dots replace `fillText`, per the spec's change: `shadeField` writes an ink per dot and the scene batches arcs per ink, so no font is involved. Spacing is at least 4px, growing past 240 columns to bound the frame cost, and replaces the 1:2 text cell. `viewportScale` now returns pixels per unit and bounds the disk's width. Star map enlarged to 256×256 with 200 stars, because finer dots would otherwise show its repeat and read as specks on paper.
- Ring and halo constants depart from the source: ring width 0.45 (0.7), with a floor of 0.6 dots for coarse grids; halo center 1.1 (1.18) and width 0.2 (0.32) shadow radii, at half the gain.
- `diskDot` reproduces the library's `paintTone` for this piece. Its brightness, glyph ink times color luminance across the disk gradient, measures close to `smoothstep(v)^1.5`, and its largest dot is about 0.52 pitches. `color-mix` as the canvas fill keeps the mix in the theme's tokens with no parsing.
