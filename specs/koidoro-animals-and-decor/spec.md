# Spec: Koidoro animals and decorations

> Animals that sit and walk, four big cute ones, and more to find in the garden.

## User stories

- As a **Koidoro user**, I want **animals to stand up and walk, then sit again** so that walking looks like walking.
- As a **Koidoro user**, I want **a buffalo, bear, monkey and elephant** so that a bigger garden brings new company.
- As a **Koidoro user**, I want **more ponds, flowers, grass and stones** so that the garden has more to look at.

## Acceptance criteria

- [x] Every animal has two poses: sitting when idle, and on four legs while it walks. The walking pose shows only during a step — `src/pomo/art/pets.test.ts`, `src/pomo/Garden.test.tsx`.
- [x] While walking, the legs step in diagonal pairs, and the animal faces the side it walks toward and keeps facing it after it sits — `src/pomo/art/pets.test.ts`, `src/pomo/Garden.test.tsx`.
- [x] The buffalo is redrawn in the same style as the pets and walks with them. It still arrives at 17 trees — `src/pomo/Garden.test.tsx`, `src/pomo/garden-layout.test.ts`.
- [x] A bear arrives at 21 trees, a monkey at 26 and an elephant at 32 — `src/pomo/Garden.test.tsx`, `src/pomo/garden-layout.test.ts`.
- [x] Every animal fits its sprite frame in both poses — `src/pomo/art/pets.test.ts`.
- [x] Flower beds, tall grass and boulders join the decorations, with more ponds. The first flower bed comes at 17 trees, tall grass at 32, a boulder at 33. The first meadow, pond and rocks still come at 7, 16 and 18 — `src/pomo/garden-layout.test.ts`, `src/pomo/Garden.test.tsx`.
- [x] Grass plots come in seven kinds instead of four, adding grass tufts, purple flowers and pebbles — `src/pomo/art/Sprites.test.tsx`.
- [x] Reduced motion still stops everything — `src/pomo/Garden.test.tsx`.

## Out of scope

- Animals walking among or behind the trees: they keep to the front grass (`specs/koidoro-pets-walk`).
- Animals turning to face away from the viewer when they walk up the screen.
- Moving the egret or koi.

## References

- `specs/koidoro-pets-walk/spec.md`, `specs/koidoro/garden-decorations/spec.md`

## Changes

### 2026-11-10 — among the trees

Animals now walk among the trees. See `specs/koidoro-scattered-garden/spec.md`.

### 2026-11-10 — smaller dogs and cats

Dogs and cats are drawn smaller, so the elephant, buffalo and bear read as the big animals. Each animal's shadow now follows its size — `src/pomo/art/pets.test.ts`.
