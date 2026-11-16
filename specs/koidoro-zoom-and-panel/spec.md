# Spec: Koidoro zoom and collapsible panel

> Zoom into the garden, and fold the sidebar away to give it the whole screen.

## User stories

- As a **Koidoro user**, I want **to zoom the garden** with buttons, the mouse wheel or a trackpad so that I can look at one tree up close.
- As a **Koidoro user**, I want **to hide the left panel** so that the garden or tree fills the screen.

## Acceptance criteria

- [x] Zoom in / Zoom out buttons scale the garden; zoom stays between 1× and 4×, and each button is disabled at its limit — `src/pomo/Garden.test.tsx`.
- [x] Scrolling the wheel (or a trackpad scroll or pinch) over the garden zooms it instead of scrolling the page — `src/pomo/Garden.test.tsx`.
- [x] Dragging the garden with the mouse pans it, and a drag does not water the tree it ends on — `src/pomo/Garden.test.tsx`.
- [x] A Hide panel button hides the sidebar; Show panel brings it back, and the button reports its state with `aria-expanded` — `src/pomo/App.test.tsx`.

## Out of scope

- Remembering zoom or the panel state between visits.
- Safari's own pinch gesture events (Safari sends no ctrl+wheel for a pinch).
- Pinch-zoom on touch screens.

## Changes

### 2026-11-16

- [x] The garden shows how many trees it has, at its bottom left — `src/pomo/Garden.test.tsx`.
