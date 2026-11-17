# Spec: Koidoro more decorations

> Twelve new things to find in the garden, a tower that grows with it, and more life in the air.

## User stories

- As a **Koidoro user**, I want **new decorations as my garden grows** so that a big garden keeps showing me something I have not seen.
- As a **Koidoro user**, I want **a tower that grows at 25, 50 and 100 trees** so that the milestones leave a mark.

## Acceptance criteria

- [x] Eleven decorations arrive, one each: stone lantern (31 trees), lily pond (34), beehive (35), zen sand (50), bench and path (51), red bridge (52), bamboo spout (53), mossy log (55), bird bath (56), vegetable patch (57), torii gate (77) — `src/pomo/garden-layout.test.ts`, `src/pomo/art/features.test.ts`.
- [x] A brutalist tower arrives at 25 trees with two blocks, and stands three blocks tall from 50 trees and five from 100. It flies the Vietnam flag, is planted on every roof, lights its windows one by one, and sweeps two searchlights across the sky — `src/pomo/garden-layout.test.ts`, `src/pomo/art/features.test.ts`, `src/pomo/Garden.test.tsx`.
- [x] The new decorations take plots that held a repeat of an older one, so no tree moves and the first meadow, pond, flower bed, rocks, tall grass and boulder arrive when they did — `src/pomo/garden-layout.test.ts`.
- [x] The garden's frame leaves room for the tower and its searchlights from every side — `src/pomo/Garden.test.tsx`.
- [x] Dragonflies hover over tall grass. Fireflies drift over meadows and the lantern glows, both only under the Night sky — `src/pomo/Garden.test.tsx`.
- [x] A mature Đa sheds leaves — `src/pomo/Garden.test.tsx`.
- [x] Reduced motion stops every new moving part — `src/pomo/Garden.test.tsx`.

## Out of scope

- Turning decorations as the garden rotates: they look the same from every side, as the older ones do.
- Leaves from bamboo, coconut, pine and banana.
- Pets or bees reacting to the new decorations.

## References

- `specs/koidoro-animals-and-decor/spec.md`, `specs/koidoro-scattered-garden/spec.md`
