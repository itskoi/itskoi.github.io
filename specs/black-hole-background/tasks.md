# Tasks: black-hole-background

> A flat checklist. Each task ends with a green test.

- [x] Port the field. Test: `src/components/BlackHoleScene/blackHoleField.test.ts`.
- [x] Build the scene and swap it into `App`. Test: `src/components/BlackHoleScene/BlackHoleScene.test.tsx`.
- [x] Replace the Lorenz e2e coverage. Test: `tests/e2e/blackHole.spec.ts`.
- [x] Remove `LorenzScene`, update references.
- [x] Check by eye in both themes, on wide and phone, and measure frame cost.

## Done

- [x] All acceptance criteria from `spec.md` verified.
- [x] `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green.
