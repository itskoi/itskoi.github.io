# Plan: Koidoro more trees and tree motion

## Approach

New species are one id in `SPECIES_IDS`, one `SPECIES` entry and one `SHAPES` function. The picker, sprites and storage validation all read those, so nothing else changes. Stages 0 to 2 reuse the existing generic branches.

Motion stays CSS-only, on the `.life` class that the reduced-motion rule already stops. The breeze is a `skewX` around the tree's foot, which is the local origin of its plot group, so the base stays put and the crown moves. The pop remounts a keyed group so its one-shot animation replays on each new stage.

## Alternatives considered

- **Sway every tree.** Rejected: a tree animating inside the island SVG repaints it, and gardens can hold hundreds of trees. Capped at 24, the same way butterflies are capped.
- **Smooth 60fps sway.** Rejected: `steps(10)` over 3.2s moves the crown about 0.2px a step, which looks the same and repaints far less. Sharing four phases lets trees repaint in the same frames.

## File map

| Path                          | Action | Purpose                              |
|-------------------------------|--------|--------------------------------------|
| `src/pomo/session.ts`         | edit   | four new species ids                 |
| `src/pomo/art/trees.ts`       | edit   | species info and shapes              |
| `src/pomo/art/cubes.ts`       | edit   | Bằng lăng palette                    |
| `src/pomo/art/decor.ts`       | edit   | falling petal markup                 |
| `src/pomo/Garden.tsx`         | edit   | breeze and petals, capped            |
| `src/pomo/App.tsx`            | edit   | breeze and pop in the single tree view |
| `src/pomo/styles.css`         | edit   | keyframes                            |

## Test plan

- **Unit/component** (Vitest): species list and frame fit, breeze and petal rules and caps, pop remounting.
- **Manual**: Playwright screenshots of the new trees and a repaint-cost comparison.

## Risks

- Ten species means more sprites painted at startup — mitigation: painted once and memoised. The whole page, sprites included, was ready in about 0.6s on a dev server.
