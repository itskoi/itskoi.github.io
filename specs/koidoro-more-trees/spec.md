# Spec: Koidoro more trees and tree motion

> Four more trees to grow, and trees that feel alive between waterings.

## User stories

- As a **Koidoro user**, I want **more kinds of tree to choose from** so that my garden has more variety.
- As a **Koidoro user**, I want **my trees to move on their own** so that the garden feels alive while I work.

## Acceptance criteria

- [x] The picker offers Bằng lăng, Thông, Bàng and Chuối after the first six, and saved gardens keep working — `src/pomo/art/trees.test.ts`, `src/pomo/storage.test.ts`.
- [x] Each new tree has art at all four stages that fits its sprite frame — `src/pomo/art/trees.test.ts`, `src/pomo/art/Sprites.test.tsx`.
- [x] Trees past the seed stage sway in a breeze, in the garden and in the single tree view. In the garden only the 24 oldest trees sway, so a huge garden stays cheap — `src/pomo/Garden.test.tsx`, `src/pomo/App.test.tsx`.
- [x] Mature trees that shed (Phượng, Mai, Đào, Bằng lăng, Bàng) drop petals or leaves in the garden, under the same cap — `src/pomo/Garden.test.tsx`.
- [x] The single tree view pops when the tree reaches a new stage or the user picks another tree — `src/pomo/App.test.tsx`.
- [x] All of this stops under reduced motion, and no petals are left hanging in the air — `src/pomo/Garden.test.tsx`, plus the `.life` rule and hidden-by-default `.petal` in `src/pomo/styles.css`.

## Out of scope

- Weather, clouds, fireflies and other motion that is not the trees.
- Changing the art of the first six trees.

## References

- `specs/koidoro/tree-growth/spec.md`, `specs/koidoro/garden/spec.md`

## Changes

### 2026-11-10 — stage preview

Before a Work session starts, the stage shows all four growth stages of the picked tree, labelled, instead of only its seed. It goes back to the single growing tree once the session starts — `src/pomo/App.test.tsx`.
