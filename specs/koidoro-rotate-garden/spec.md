# Spec: Koidoro rotate garden

> Turn the garden a quarter at a time to see it from another side.

## User stories

- As a **Koidoro user**, I want **to rotate my garden** so that I can see the trees and animals from another side.

## Acceptance criteria

- [x] A Rotate button on the garden turns it a quarter turn; four presses bring it back. It works whether or not the trees can be watered, and an empty garden has no button — `src/pomo/Garden.test.tsx`.
- [x] Nearer things cover farther ones from every side, ground included — `src/pomo/Garden.test.tsx`.
- [x] Rotating does not move the frame, so the island does not jump or rescale — `src/pomo/Garden.test.tsx`.
- [x] Animals stay on their plots when the garden turns, and after it they face the way they walk on screen — `src/pomo/Garden.test.tsx`.

## Out of scope

- Redrawing trees and animals from another angle: each keeps its one drawing and moves to its new place.
- An animated turn: the view changes at once.
- Remembering the view between visits.
