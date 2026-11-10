# Plan: Koidoro pets walk

## Approach

`layout()` already knows the front of the garden: grass that no tree or decoration stands in front of. It now marks that grass with `front`. `Garden` keeps where each pet is in state and, every 2.4s, lets one random pet step to a free neighbouring front plot. Two extra empty turns in the draw mean a lone pet still rests.

The step itself is CSS: the pet group's `transform` has a 2s transition, and the walking pet gets `.life.hop` until the hop animation ends. Pets are drawn in their own layer after the trees, which is always right because they only stand on front grass. The timer does not start under reduced motion.

State is tied to the `plots` array, so a new tree sends pets back to their own plots.

## Alternatives considered

- **CSS-only patrol.** Rejected: paths differ per garden and per pet, and pets would cross each other.
- **Walking anywhere, behind trees too.** Rejected: needs the pet redrawn at a new depth on every step, and pets would spend much of the time hidden.
- **Keeping a one-plot gap between pets.** Rejected: at 17 trees six pets share eleven front plots and none could move.

## File map

| Path                          | Action | Purpose                          |
|-------------------------------|--------|----------------------------------|
| `src/pomo/garden-layout.ts`   | edit   | mark front grass                 |
| `src/pomo/Garden.tsx`         | edit   | step timer, pet layer            |
| `src/pomo/styles.css`         | edit   | step transition and hop          |
| `src/pomo/Garden.test.tsx`    | edit   | walking rules                    |

## Test plan

- **Unit/component** (Vitest): steps are one plot, onto open front grass, never shared; hop class; reduced motion.
- **Manual**: Playwright run in Chromium with 20 trees, screenshots before and after 20s.
