# Plan: back-to-top

## Approach

Nav already computes `activeId` with `useActiveId`, which is undefined on the hero. Nav renders the button only when `activeId` is set, and its click calls `scrollTo(0)`. The button is `position: fixed` at the bottom-right (with safe-area insets), so it lives in Nav's markup without sitting in the bar. It is placed before the theme toggle so the toggle stays the bar's last child. Styling copies the theme toggle: hairline border, mono label, accent on hover and focus.

## Alternatives considered

- **A separate component with its own scroll listener.** A second source of truth for "past the hero", plus a listener on every scroll frame. Rejected; Nav already knows.

## File map

| Path | Action | Purpose |
|---|---|---|
| `src/components/Nav/Nav.tsx` | edit | the button |
| `src/components/Nav/Nav.module.css` | edit | fixed corner styling |
| `src/components/Nav/Nav.test.tsx` | edit | AC1, AC2 |
| `tests/e2e/portfolio.spec.ts` | edit | AC2, AC3 |

## Test plan

- **Unit:** hidden with no active section; shown once one intersects; click calls `scrollTo(0)`.
- **E2E:** scroll to Education, click, land at the top with the button gone.

## Changes

### 2026-11-06 — icon only, in the page margin

With a "Top" label at the grid's edge, the button covered the end of the Experience illustration's caption. It is now a 2rem icon square (like the theme toggle, named "Back to top" for screen readers and as a tooltip) 1rem from the screen edge, in the page margin past the stage.
