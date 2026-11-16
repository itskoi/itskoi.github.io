# Plan: Koidoro quick start

## Approach

`startSession` takes an optional kind, so the quick buttons and the panel's Start share it. The timer and a `.quick` row go in one `.top` column, so the row sits under the timer at any timer size. The row renders only while `panelOpen` is false. The column ignores the pointer, as the timer did; only its buttons take clicks, so the garden behind stays clickable.

## Alternatives considered

- **Quick buttons always visible.** Rejected: two Start buttons on screen at once.

## File map

| Path                     | Action | Purpose                  |
|--------------------------|--------|--------------------------|
| `src/pomo/App.tsx`       | edit   | quick row, startSession  |
| `src/pomo/styles.css`    | edit   | `.top`, `.quick`         |
| `src/pomo/App.test.tsx`  | edit   | quick start and stop     |

## Test plan

- **Unit/component** (Vitest): start each kind, stop, hidden with panel open.
- **Manual**: Chromium screenshot with the panel hidden.
