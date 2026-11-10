# Plan: Koidoro scattered garden

## Approach

`layout()` still walks the square spiral, but a seeded coin per cell leaves about 42% of cells as grass. The coin depends only on the cell, so a tree's plot depends only on its order. Decorations reserve their spiral cells and carry their own arrival counts, because arrival can no longer be read off the spiral position. Until a decoration arrives, its cell is open grass. Land fills a square one plot past the outermost tree.

`settlePets()` places animals on random open grass and keeps any that can stay when the plots change. The garden holds the result in state and replaces it during render when `plots` changes.

Trees, decorations and animals render in one `<g data-depth>` per depth, with the animals after the static things of that depth. An animal changing depth is remounted into another group, so trees are never reordered in the DOM.

## Alternatives considered

- **One sorted keyed list.** Rejected: React would sometimes move trees rather than the animal, which restarts their breeze and drops keyboard focus.
- **Keeping decorations keyed by tree count, on whichever cell comes next.** Rejected: ponds would land anywhere, including right behind tall trees.
- **Land only next to trees.** Rejected: with gaps in the spiral the island's outline came out full of notches.

## File map

| Path                          | Action | Purpose                                 |
|-------------------------------|--------|-----------------------------------------|
| `src/pomo/garden-layout.ts`   | edit   | scatter, reserved decorations, `settlePets` |
| `src/pomo/Garden.tsx`         | edit   | depth groups, random spawn, viewBox     |

## Test plan

- **Unit/component** (Vitest): scatter, stable plots, arrivals, spawn spread and keeping, walking over grass only, depth order.
- **Manual**: Chromium screenshots at 12, 40 and 90 trees.
