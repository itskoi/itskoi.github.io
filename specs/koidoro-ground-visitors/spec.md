# Spec: Koidoro ground visitors

> Birds and bees that fly in, settle on the grass, and fly off again.

## User stories

- As a **Koidoro user**, I want **birds and bees to land in my garden** so that it feels visited, not only lived in.

## Acceptance criteria

- [x] Bees arrive at 7 trees and birds at 10, and more come as the garden grows, up to 8 bees and 6 birds — `src/pomo/Garden.test.tsx`, `src/pomo/garden-layout.test.ts`.
- [x] Each visitor repeats a cycle: it flies in, stays on the ground, and flies off, with wings beating only while it flies — `.visit`, `.air`, `.rest` in `src/pomo/styles.css`, checked in Chromium.
- [x] Visitors land on open grass, one to a plot. Bees land on grass with flowers and birds on the rest — `src/pomo/garden-layout.test.ts`.
- [x] Visitors are drawn by depth with trees and animals, so nearer things cover them — `src/pomo/Garden.tsx`, checked in Chromium.
- [x] Under reduced motion visitors are shown still on the ground — `src/pomo/Garden.test.tsx`.

## Out of scope

- Visitors reacting to a walking animal, which can pass over one.
- Sounds.
- Landing on trees or decorations.

## References

- `specs/koidoro-scattered-garden/spec.md`, `specs/koidoro/garden-decorations/spec.md`

## Changes

### 2026-11-10 — bees only

Birds no longer land on the ground, so only bees do. The flock still crosses the sky at 10 trees. Bees arrive at 7 trees, up to 8, on grass with flowers — `src/pomo/garden-layout.test.ts`, `src/pomo/Garden.test.tsx`.
