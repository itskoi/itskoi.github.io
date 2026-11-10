# Plan: Koidoro ground visitors

## Approach

`visitors()` picks grass plots with a seeded shuffle, so a plot's visitor does not change as the garden grows. `visitor()` writes each one as static markup, grouped by depth in `drawScene` and rendered inside that depth's row, before its animals.

The cycle is CSS only. `.visit` moves the creature along one keyframe path, and `.air` and `.rest` share its duration and delay through CSS variables to swap flying wings for the ground shadow. The creature's resting place is its untransformed position, so stopping the animation under reduced motion leaves it on the ground.

## Alternatives considered

- **Adding them to the `flying` layer.** Rejected: it is drawn over everything, so a bird on the ground behind a tree would show through it.
- **A JS timer per visitor.** Rejected: nothing about the cycle needs state, and CSS keeps it off the render path.

## File map

| Path                          | Action | Purpose                    |
|-------------------------------|--------|----------------------------|
| `src/pomo/garden-layout.ts`   | edit   | choose landing plots       |
| `src/pomo/art/decor.ts`       | edit   | sparrow, bee, markup       |
| `src/pomo/Garden.tsx`         | edit   | draw by depth              |
| `src/pomo/styles.css`         | edit   | the flight cycle           |

## Test plan

- **Unit/component** (Vitest): arrivals, landing plots, caps, reduced-motion marking.
- **Manual**: Chromium screenshots in flight and on the ground.
