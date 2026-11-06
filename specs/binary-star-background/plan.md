# Plan: binary-star-background

> HOW. Alternatives, trade-offs, file map.

## Approach

`binaryStarField.ts` holds the maths: it solves Kepler's equation once per sample, for one period, and stores both stars in figure units. Each frame only multiplies by scale and adds the placement, so nothing is re-solved. `BinaryStarScene.tsx` keeps the Lorenz scene's frame: the dot grid, braille cells, level buckets, placement easing, dim and blur. Levels interleave the two inks, so a cell still keeps its strongest dot.

## Alternatives considered

- **Port the reference's character grid.** Rejected: the site's light backdrop is a dot grid with no font dependency.
- **Keep orange and blue.** Rejected: the owner already moved the light backdrop back to the site's palette once, so red and black tell the stars apart instead.
- **Large discs as in the reference.** Rejected: text runs over the figure, so the discs are smaller than its 10% of the figure scale.

## File map

| Path | Action | Purpose |
|------|--------|---------|
| `src/components/BinaryStarScene/` | create | Field, scene, styles, tests, source license |
| `src/components/LorenzScene/` | delete | Replaced |
| `src/App.tsx` | edit | Draw the new scene on light |
| `tests/e2e/binaryStar.spec.ts` | rename | From `lorenz.spec.ts`, adjusted for two inks |

## Test plan

- **Unit/component** (Vitest): orbit physics, centring, glow, placement, canvas attributes, color tokens.
- **E2E** (Playwright): two inks, motion, reduced motion, dim, blur, theme swap.

## Risks

- A solid disc under small text. Mitigation: small discs, plus the existing dim and blur.
