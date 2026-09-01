# Tasks: measure-and-heading-accent

> A flat checklist. Each task is small (~30 min max) and ends with a green test + a commit. Tick boxes as you land commits.

## 1. Spec

- [x] Task 1 — Land the spec triplet. Test: n/a (docs). Commit: `docs(spec): land the measure-and-heading-accent triplet (spec: specs/measure-and-heading-accent)`.

## 2. Content measure

- [x] Task 2 — `--grid-max-width` + `--grid-inline` tokens in `global.css`; `.section-grid` and `.nav` consume `var(--grid-inline)`. Test: `src/styles/global.test.ts`. Commit: `feat(layout): content capped to a centered 80rem measure (spec: specs/measure-and-heading-accent)`.
- [x] Task 3 — E2E geometry: full-bleed rules, 1280px measure at a 1920 viewport, unchanged layout at 1280, nav aligned to the measure. Test: `tests/e2e/measure-and-accent.spec.ts`. Commit: `test(e2e): measure contract at wide and narrow viewports (spec: specs/measure-and-heading-accent)`.

## 3. Heading accent

- [x] Task 4 — `useSectionActive` hook + `ACTIVE_BAND` constant; `Nav.tsx` imports the band (behavior unchanged). Test: `src/hooks/useSectionActive.test.tsx` + `src/components/Nav/Nav.test.tsx`. Commit: `feat(hooks): one active-section band via useSectionActive (spec: specs/measure-and-heading-accent)`.
- [x] Task 5 — Wire `data-active` on the four `<h2>`s; `.heading` transition + accent + reduced-motion block in the four sheets. Test: the four section `*.test.tsx` + the heading-accent block in `src/styles/global.test.ts`. Commit: `feat(sections): the active section's heading fades to Swiss red (spec: specs/measure-and-heading-accent)`.
- [x] Task 6 — E2E scroll journey: heading color equals the page's `--color-accent` per section, at most one red at a time, ink before arrival, instant flip under reduced motion. Test: `tests/e2e/measure-and-accent.spec.ts`. Commit: `test(e2e): heading accent tracks the reading position (spec: specs/measure-and-heading-accent)`.

## 4. Verification

- [x] Task 7 — Browser review on a wide display (measure feel, fade duration, band handoff); record any moved constants in a dated Changes note in `spec.md`. Test: n/a (review). No constants moved (80rem, 400ms, band as specced).

## Done

- [x] All acceptance criteria from `spec.md` verified.
- [x] `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green.
- [x] Commit subjects reference `specs/measure-and-heading-accent/`.
