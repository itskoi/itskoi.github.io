# Spec: Koidoro sky

> A sun, a moon and drifting clouds behind the garden.

## User stories

- As a **Koidoro user**, I want **a sun or moon and clouds in the sky** so that the scene behind my garden feels alive.

## Acceptance criteria

- [x] The stage shows a pixel sun, and a crescent moon in its place under the Night sky — `src/pomo/Sky.test.tsx`, `src/pomo/App.test.tsx`; the swap is CSS, checked by screenshot.
- [x] Four clouds drift across the sky behind the garden, the tree view and the timer — `src/pomo/Sky.test.tsx`.
- [x] Reduced motion leaves each cloud still at the place it starts from — `src/pomo/Sky.test.tsx`.
- [x] The sky is decoration: hidden from assistive technology and never in the way of a click — `src/pomo/Sky.test.tsx`.

## Out of scope

- Stars, and a sun or moon that moves with the real time of day.
- Clouds casting shadows on the garden.

## References

- `specs/koidoro-more-decorations/spec.md` (the `night` class)

## Changes

- 2026-11-17: Clouds are round and softly blurred, and keep to the top of the sky, above the garden.
- 2026-11-17: Clouds are drawn in front of the garden, under the timer and buttons. The sun and moon stay behind it — `src/pomo/Sky.test.tsx`.
