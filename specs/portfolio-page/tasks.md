# Tasks: portfolio-page

> A flat checklist. Each task is small (~30 min max) and ends with a green test + a commit. Tick boxes as you land commits.
> Implementation order is bottom-up: data → scroll/motion infra → nav → sections → Hero → wire App → E2E.

## 0. Decisions (resolved 2026-08-01 — no action, just reference)

- [x] Contact: name + role + location in Hero; LinkedIn + email as links; **phone omitted**.
- [x] Motion: **richer** — Hero staggered intro + parallax, section children stagger-in, transform-only.
- [x] External links: all resume URLs as `target="_blank" rel="noreferrer noopener"`.

## 1. Content model + scroll plumbing

- [ ] T1 — Create `src/data/portfolio.ts` with typed interfaces and the four exports + `profile` (phone omitted). Header comment names `docs/resume.tex` as source of truth. Test: `src/data/portfolio.test.ts` asserts counts + newest-first ordering. Commit: `feat(portfolio): add typed content from resume (spec: specs/portfolio-page)`.
- [ ] T2 — Edit `src/lib/lenis.ts`: module-level holder + `scrollTo(target)`; reset holder in `destroy`. Edit `src/lib/gsap.ts`: export `prefersReducedMotion` (one `matchMedia` read). Tests: `lenis.test.ts` (scrollTo delegates/no-ops) and extend `gsap` coverage. Commit: `feat(lib): expose scrollTo and prefersReducedMotion`.

## 2. Motion infra (three transform-only hooks)

- [ ] T3 — `src/hooks/useScrollReveal.ts` (ref + selector + stagger; kills trigger on unmount; no-op under reduced motion). Test: `useScrollReveal.test.ts` mocking `@/lib/gsap`. Commit: `feat(hooks): add useScrollReveal`.
- [ ] T4 — `src/hooks/useParallax.ts` (scrubbed ScrollTrigger translateY; Hero/decorative only, never a section root; no-op under reduced motion). Test: `useParallax.test.ts`. Commit: `feat(hooks): add useParallax`.
- [ ] T5 — `src/hooks/useHeroIntro.ts` (one-shot staggered name→role→location timeline; killed on unmount; no-op under reduced motion). Test: `useHeroIntro.test.ts`. Commit: `feat(hooks): add useHeroIntro`.

## 3. Navigation

- [ ] T6 — `src/components/Nav/` (sticky `<nav aria-label="Sections">`, four links, click → `scrollTo('#id')` + `preventDefault`). Test: `Nav.test.tsx` asserts links, hrefs, and that a click calls mocked `scrollTo` with the right id. Commit: `feat(nav): sticky nav with Lenis smooth anchors`.

## 4. Sections (copy the shared anatomy from plan.md; each applies `useScrollReveal`)

- [ ] T7 — `Experience`. Test: 4 roles, newest-first (Wao first), each with role/company/period + ≥1 highlight. Commit: `feat(experience): render roles from data`.
- [ ] T8 — `Education`. Test: school, degree, period, GPA, awards list, certifications list. Commit: `feat(education): render degree, GPA, awards, certs`.
- [ ] T9 — `Publications`. Test: 2 papers newest-first; owner name emphasized; DOI link present. Commit: `feat(publications): render papers with DOI links`.
- [ ] T10 — `Technologies`. Test: all 6 categories with their tools. Commit: `feat(technologies): render tech stack by domain`.

## 5. Hero + composition + cleanup

- [ ] T11 — Update `Hero`: real profile (name, role, location) with refs for the timeline; wire `useHeroIntro` + `useParallax`; drop placeholder copy; adjust CSS. Test: `Hero.test.tsx` asserts name + role, old copy gone, both motion hooks wired, and the reduced-motion path registers nothing. Commit: `feat(hero): real profile with intro + parallax`.
- [ ] T12 — Compose `App` (Hero + Nav + four sections); delete `src/sections/Placeholder/`; update `App.test.tsx`. Test: `App.test.tsx` renders the sections and no longer references Placeholder. Commit: `feat(app): compose portfolio page`.

## 6. E2E + verification

- [ ] T13 — Update `tests/e2e/smoke.spec.ts` (Hero heading = real name). Create `tests/e2e/portfolio.spec.ts` (4 nav links; click "Education" brings `#education` into view; nav stays visible after scroll; all section text present; respects reduced-motion if feasible). Commit: `test(e2e): cover nav scroll and portfolio content`.
- [ ] T14 — Green bar: `bun run check && bun run lint && bun run test && bun run build && bun run test:e2e` all pass. Commit: `chore: verify portfolio-page green`.

## Done

- [x] Every acceptance criterion in `spec.md` verified by a passing test.
- [x] `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green (44 unit + 3 E2E, 2026-08-01).
- [ ] PR/commit subject references `specs/portfolio-page` — pending commit.
