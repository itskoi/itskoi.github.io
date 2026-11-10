# Spec: Koidoro pets walk

> Dogs and cats wander the front of the garden instead of sitting on one plot.

## User stories

- As a **Koidoro user**, I want **my pets to walk around the garden** so that it feels lived in during a break.

## Acceptance criteria

- [x] While the garden is shown, pets walk one plot at a time to a neighbouring plot, at most one pet setting off at a time — `src/pomo/Garden.test.tsx`.
- [x] Pets only walk on open grass at the front of the garden, so no tree or decoration ever stands in front of one — `src/pomo/Garden.test.tsx`, `src/pomo/garden-layout.test.ts`.
- [x] Two pets never stand on the same plot — `src/pomo/Garden.test.tsx`.
- [x] A walking pet hops, and stops hopping when it arrives — `src/pomo/Garden.test.tsx`.
- [x] Under reduced motion pets stay on their own plots — `src/pomo/Garden.test.tsx`.

## Out of scope

- Walking among or behind the trees.
- The buffalo, egret and koi: they keep their plots.
- A walking pose with moving legs, and pets turning to face where they walk.
- Remembering where pets are between visits: they start from their own plots each time.

## References

- `specs/koidoro/garden-decorations/spec.md` (this replaces "Pets SHALL NOT walk")

## Changes

### 2026-11-10 — nearer pet in front

Pets are drawn back to front, so the one lower on the screen covers the one behind it — `src/pomo/Garden.test.tsx`. The step is now a CSS animation instead of a transition, because moving a pet's element to redraw it would cancel a transition.

### 2026-11-10 — among the trees

Animals now walk on any open grass, not only at the front, and start from random plots. See `specs/koidoro-scattered-garden/spec.md`.

### 2026-11-10 — animations no longer restart on a step

Each step re-rendered the garden, and React 19 rewrites injected markup on every render, so all pets, koi, butterflies, birds, petals and bees restarted together every 2.4s. One pet's step now leaves every other animation running — `src/pomo/Garden.test.tsx`.
