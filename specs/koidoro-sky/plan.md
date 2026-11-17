# Plan: Koidoro sky

## Approach

`src/pomo/Sky.tsx` is one static layer, the first child of `.stage`, at `z-index: -1` behind every view. It holds still while the garden zooms, pans and rotates. The sun and moon are two paths in one SVG; the existing `night` class shows the moon, and a new `[data-scheme="night"] .day` rule hides the sun. Each scheme sets `--sun` and `--cloud`.

A cloud is a full-width strip moved by a `drift` transform, so it costs no layout. A negative delay starts it at its resting place, which is where `.life` leaves it under reduced motion.

## Alternatives considered

- **Draw them inside the garden SVG.** Rejected: they would zoom and scroll with the island, and be missing from the tree view.

## File map

| Path                      | Action | Purpose                              |
|---------------------------|--------|--------------------------------------|
| `src/pomo/Sky.tsx`        | create | sun, moon, clouds                    |
| `src/pomo/Sky.test.tsx`   | create | shapes, cloud start, hidden from AT  |
| `src/pomo/App.tsx`        | edit   | mount the sky in the stage           |
| `src/pomo/App.test.tsx`   | edit   | the sky is in the stage              |
| `src/pomo/styles.css`     | edit   | layer, colours per scheme, `drift`   |

## Test plan

- **Unit/component** (Vitest): the files above.
- **Manual**: Chromium screenshots under Clear sky, Night and Sunset, desktop and phone width.
