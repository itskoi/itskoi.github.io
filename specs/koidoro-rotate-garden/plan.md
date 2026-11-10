# Plan: Koidoro rotate garden

## Approach

`Garden` keeps a `view` of 0 to 3 quarter turns. `place` turns a plot's grid position by `view` before projecting it, and depth comes from the projected height, so draw order follows the view. `layout()` and the plots themselves never change, so animals and bees stay put and nothing is saved.

The island is a square centred on the origin, so its outline is the same from every side. Only tree tops could change the frame, so the top of the frame uses the highest a tree gets from any side.

## Alternatives considered

- **Rotating the plots returned by `layout()`.** Rejected: animals are matched to plots by position and bees are picked by position, so both would move.
- **Painting every sprite from four angles.** Rejected: four times the images to build on load.

## File map

| Path                        | Action | Purpose                      |
|-----------------------------|--------|------------------------------|
| `src/pomo/Garden.tsx`       | edit   | view state, button, drawing  |
| `src/pomo/styles.css`       | edit   | button position              |
| `src/pomo/Garden.test.tsx`  | edit   | rotation rules               |

## Test plan

- **Unit/component** (Vitest): quarter-turn positions, draw order, stable frame, animals, button presence.
- **Manual**: Playwright run in Chromium, screenshots of two views.
