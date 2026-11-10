# Plan: Koidoro animals and decorations

## Approach

**Poses.** Each animal keeps its sitting drawing and gains a `walk` entry: a body on four legs built by one shared `standing()` helper, a tail, and how far to move the sitting head onto it. The head, ears, eyelids and tongue sprites are reused, so a walking pose costs four new images (tail, two leg pairs, body) instead of a whole second set. `petMarkup` emits both poses, and CSS shows `.walk` only inside the garden's `.step` class. Diagonal legs share a part, and the two parts run the same `stride` animation in opposite directions.

**Facing.** Animals are drawn facing left. The garden remembers which have last walked right and mirrors those with `scale(-1 1)`.

**New animals.** Buffalo, bear, monkey and elephant are four more entries in `PETS`, so arrival, placement, walking and reduced motion all come from the existing pet code. They are drawn as babies: a head as big as the body, low eyes, pink cheeks. A wide head hides its far ear, so there is a new `earsBack` part drawn before the head.

**Decorations.** `flowers`, `reeds` and `boulder` are new `Decoration` kinds with their own sprites. The old buffalo plots become a flower bed and a boulder, so no tree changes plot before spiral position 37. Ground variety comes from a table of what each plot kind scatters.

## Alternatives considered

- **A full second sprite set per pose.** Rejected: twice the images to paint at start-up for a head that looks the same.
- **Keeping the buffalo as a decoration.** Rejected: it would be the one animal that cannot walk, drawn in a different style.
- **Decorating the front grass with tall things.** Rejected: animals walk there and would pass through them.

## File map

| Path                          | Action | Purpose                                   |
|-------------------------------|--------|-------------------------------------------|
| `src/pomo/art/pets.ts`        | edit   | walk poses, four animals, `earsBack`      |
| `src/pomo/art/cubes.ts`       | edit   | palettes                                  |
| `src/pomo/art/decor.ts`       | edit   | flowers, reeds, boulder, plot kinds; old buffalo removed |
| `src/pomo/art/Sprites.tsx`    | edit   | new sprites                               |
| `src/pomo/garden-layout.ts`   | edit   | arrivals, decoration places               |
| `src/pomo/Garden.tsx`         | edit   | facing                                    |
| `src/pomo/styles.css`         | edit   | pose switch, stride, ear fan              |

## Test plan

- **Unit/component** (Vitest): poses and markup, frame fit, arrivals, decoration counts, pose and facing in the garden.
- **Manual**: Chromium screenshots of every pose and decoration, and of a 40-tree garden with an animal mid-step.
