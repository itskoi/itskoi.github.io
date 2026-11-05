# Tasks: portfolio-redesign

> Tick as you land.

## 1. Palette

- [x] Dark navy and orange tokens. Test: `src/styles/global.test.ts`, `src/lib/contrast.test.ts`.

## 2. Content

- [x] Sync `portfolio.ts` to the resume. Test: `src/data/portfolio.test.ts`, section tests.

## 3. Scroll tracking

- [x] `useActiveId`, used by Nav and Experience. Test: `src/hooks/useSectionActive.test.tsx`, `src/components/Nav/Nav.test.tsx`.

## 4. Stage and scenes

- [x] Two-column layout with sticky stage. Test: `src/sections/Experience/Experience.test.tsx`, `tests/e2e/experience-scenes.spec.ts`.
- [x] Seven illustrations with build-in. Test: `src/components/ProjectScene/ProjectScene.test.tsx`, `tests/e2e/experience-scenes.spec.ts`.

## 5. Records

- [x] Constitution and CLAUDE.md note on the animators.

## Done

- [x] All acceptance criteria verified.
- [x] `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green (e2e ran through a temporary config on another port, because 5173 was taken by another project's dev server).
- [x] Every scene checked by eye in at least one theme on desktop; Companion and Voice in both; Companion, Voice and RAG on phone.
- [ ] Remaining scenes checked by eye in the other theme (colors come only from tokens, so low risk).
