# Spec: Koidoro scattered garden

> Trees stand apart with grass between them, and animals live among them instead of lining the edge.

## User stories

- As a **Koidoro user**, I want **my trees scattered instead of packed together** so that the garden looks natural.
- As a **Koidoro user**, I want **animals to appear anywhere in the garden** so that they don't all stand around its edge.

## Acceptance criteria

- [x] About two in five plots the trees could take stay grass, so trees stand apart. A tree's plot depends only on its order, so a planted tree never moves when more are added. The first tree stands at the centre — `src/pomo/garden-layout.test.ts`.
- [x] Decorations keep their plots and arrive at the same tree counts as before. Trees never take those plots — `src/pomo/garden-layout.test.ts`, `src/pomo/Garden.test.tsx`.
- [x] The island is a whole square reaching one plot past the outermost tree — `src/pomo/garden-layout.test.ts`.
- [x] Each animal starts on a random plot of open grass anywhere in the garden, among the trees as well as at the edge, never two on a plot — `src/pomo/garden-layout.test.ts`.
- [x] When a new tree joins, animals still on open grass stay where they are, and only those it displaces or new arrivals get a new random plot — `src/pomo/garden-layout.test.ts`.
- [x] Animals walk on any open grass, never onto a tree or decoration — `src/pomo/Garden.test.tsx`.
- [x] Animals and trees are drawn by depth, so whatever is lower on the screen covers what is behind it. On a step, an animal is drawn at the nearer of its two plots. Reordering never moves a tree in the page, so watering and keyboard focus are not disturbed — `src/pomo/Garden.test.tsx`.
- [x] An animal on a back plot is not cut off at the top of the garden — `src/pomo/Garden.tsx` (viewBox), checked in Chromium.

## Out of scope

- Remembering where animals were between visits.
- Keeping animals out of view-blocking spots: one can stand behind a tree until it walks out.
- Letting saved gardens keep their old tree positions: the new pattern applies to every garden.

## References

- `specs/koidoro-pets-walk/spec.md`, `specs/koidoro-animals-and-decor/spec.md`, `specs/koidoro/garden/spec.md`

## Changes

### 2026-11-10 — sparser

`OPEN_SHARE` is 0.62 instead of 0.42: about three in five plots the trees could take stay grass.

### 2026-11-10 — half open

`OPEN_SHARE` is 0.5: about half the plots the trees could take stay grass.

### 2026-11-10 — 0.48

`OPEN_SHARE` is 0.48.
