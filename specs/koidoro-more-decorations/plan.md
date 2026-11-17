# Plan: Koidoro more decorations

## Approach

The new art lives in `src/pomo/art/features.ts`, built from the same `box` and `quad` primitives as `decor.ts`, which now exports them. Each new decoration appears once in a garden, so its markup goes inline on its plot rather than into a shared sprite; `feature(id, floors)` caches the string, so the memoized `Markup` never rewrites it and its animations keep running. The gradients the glows and beams need are defined once in `Sprites`.

`garden-layout.ts` reuses twelve spiral positions that held a second or later meadow, pond, flower bed, rocks, tall grass or boulder. No position is added, so every tree keeps its plot. The tower's height comes from `towerFloors(treeCount)`.

Fireflies and the lantern glow carry a `night` class, shown only under `[data-scheme="night"]`. Leaves reuse `petals`: Đa gets a `fallen` colour.

## Alternatives considered

- **New spiral positions for the new decorations.** Rejected: every tree after them would move in gardens people already have.
- **Sprites with `<use>` for the new art.** Rejected: nothing is reused, and the animated parts would need to be inline anyway.

## File map

| Path                                | Action | Purpose                                      |
|-------------------------------------|--------|----------------------------------------------|
| `src/pomo/art/features.ts`          | create | the new decorations, tower, flies            |
| `src/pomo/art/features.test.ts`     | create | every feature draws; tower grows             |
| `src/pomo/art/decor.ts`             | edit   | export the drawing primitives                |
| `src/pomo/art/Sprites.tsx`          | edit   | glow and beam gradients                      |
| `src/pomo/art/trees.ts`             | edit   | Đa sheds                                     |
| `src/pomo/garden-layout.ts`         | edit   | new kinds on old positions, `towerFloors`    |
| `src/pomo/Garden.tsx`               | edit   | draw features, flies, room for the tower     |
| `src/pomo/styles.css`               | edit   | new animations, night-only rule              |

## Test plan

- **Unit/component** (Vitest): arrival counts, tower floors, feature markup, flies, night class, reduced motion.
- **Manual**: Chromium screenshot of a 100-tree garden under Day and Night.

## Risks

- Inline markup for the tower is large — mitigation: one tower per garden, cached string.
