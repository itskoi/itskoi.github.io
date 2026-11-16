# Plan: Koidoro zoom and collapsible panel

## Approach

`Garden` keeps a `zoom` from 1 to 4. The `.world` box is `zoom × 100%` (and `zoom ×` its old minimum size), and both SVGs keep fitting that box, so the whole island scales by the same ratio. After a zoom, a layout effect moves the scroll so the point under the cursor (or the centre, for the buttons) stays put. A non-passive `wheel` listener on the scroller zooms and calls `preventDefault`; Chrome and Firefox send a trackpad pinch as a wheel event with `ctrlKey`, which gets a faster rate.

Since the wheel no longer scrolls, a mouse drag on the scroller pans it. A drag over 4px swallows the click that follows, so it never waters a tree. Touch keeps native scrolling.

`App` keeps a `panelOpen` flag. The sidebar gets `hidden`, the grid drops to one column, and a toggle button sits at the top left of the stage so it stays reachable when the sidebar is gone.

## Alternatives considered

- **Zoom only on ctrl+wheel and keep wheel scrolling.** Rejected: the user asked for the plain mouse wheel to zoom.
- **CSS `transform: scale` on the island.** Rejected: the scroller would not know the new size, so you could not scroll to the edges.

## File map

| Path                       | Action | Purpose                          |
|----------------------------|--------|----------------------------------|
| `src/pomo/Garden.tsx`      | edit   | zoom state, wheel, drag, buttons |
| `src/pomo/App.tsx`         | edit   | panel toggle                     |
| `src/pomo/styles.css`      | edit   | tool row, collapsed grid         |
| `src/pomo/Garden.test.tsx` | edit   | zoom, wheel, drag                |
| `src/pomo/App.test.tsx`    | edit   | panel toggle                     |

## Test plan

- **Unit/component** (Vitest): buttons and limits, wheel zoom, drag suppresses click, panel toggle.
- **Manual**: dev server, wheel and pinch in Chrome.
