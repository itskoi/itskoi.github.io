# Plan: lorenz-background

> HOW.

## Approach

`lorenzField.ts` holds the pure maths: integrate the orbit once with a midpoint step, trim it where it returns closest to its start so the comet can loop without a visible jump, project all points each frame, and choose scale and placement. `LorenzScene.tsx` owns the canvas: it marks a dot grid each frame, keeping the brightest level per dot, then paints the dots grouped by level.

Dots are drawn as squares rather than braille text, so there is no font dependency and no glyph fallback. The frame rate is capped at 30fps, which suits the terminal look and saves battery. Time comes straight from the rAF clock, so a theme rebuild does not restart the figure.

Experience placement reuses `useSectionActive('experience')`, so the backdrop agrees with the nav and heading about the current section. The text column's center is measured from the Experience heading rather than repeating grid tokens in JS. Movement between placements eases over about a second, and snaps under reduced motion.

## Motion decisions (constitution 7)

- Rotation oscillates rather than spinning, so the butterfly stays readable.
- The comet tail fades over about 5 seconds.
- Faint orbit opacity stays near the old wireframe's weight so body text stays readable.

## Alternatives considered

- **Embed `ascii-magic.com/ascii/ascii.js`.** A third-party script on every load, with their palette. Rejected.
- **The `ascii-magic-art` npm package.** A dependency for about 100 lines. Rejected.
- **Real braille text.** Depends on a fallback font that varies by OS. Rejected.

## File map

| Path | Action | Purpose |
|---|---|---|
| `src/components/LorenzScene/*` | create | the scene, its field, tests |
| `src/components/DescentScene/*` | delete | replaced |
| `src/App.tsx` | edit | mount the new scene |
| `tests/e2e/lorenz.spec.ts` | create | paints, moves, still under reduced motion |
| `tests/e2e/swiss.spec.ts`, `portfolio.spec.ts` | edit | new canvas marker |
| CSS comments, `CLAUDE.md`, `specs/constitution.md` | edit | records |

## Risks

- A comet crossing body text. Mitigation: check by eye; the tail fades quickly.
