# Tasks: experience-timeline

> Small, TDD checkpoints. Reference `specs/experience-timeline/` in commits.

## 1. Motion

- [ ] Task 1 — Create `src/hooks/useTimelineFill.ts` (scrubbed `scaleY` fill, `useParallax` shape). Test: `useTimelineFill.test.tsx` (vars, revert, reduced-motion). Commit: `feat(experience): scroll-filled timeline spine (spec: specs/experience-timeline)`.

## 2. Layout

- [ ] Task 2 — Rewrite `Experience.tsx` markup: `.timeline` → `.spine` + `.spineFill` (ref) + `.entries` (existing `useScrollReveal` ref) → alternating `<article>` with `.marker`; period as mono kicker. Commit: `feat(experience): center-spine alternating timeline markup`.
- [ ] Task 3 — Rewrite `Experience.module.css`: center-spine alternating layout, `.spine`/`.spineFill`/`.marker`, `≤640px` left-rail collapse. Commit: `style(experience): center-spine timeline styles + mobile collapse`.

## 3. Tests + verify

- [ ] Task 4 — `Experience.test.tsx`: keep the 4 existing assertions green; add spine/fill/marker presence. Commit: `test(experience): assert timeline spine + markers`.
- [ ] Task 5 — `bun run check`, `bun run lint`, `bun run test`, `bun run test:e2e`, `bun run build` all green; manual scroll check (dark + light, mobile collapse, reduced motion).

## Done

- [ ] All acceptance criteria from `spec.md` verified.
- [ ] Gate green; PR description links `specs/experience-timeline/`.
