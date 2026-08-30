# Tasks: swiss-redesign

> A flat checklist. Each task is small (~30 min max) and ends with a green test + a commit. Tick boxes as you land commits.

## 1. Token contract

- [x] Task 1 — Rewrite the palette/type/grid tokens in `global.css` (paper default + dark inverse, red pair, Geist-only scale, grid tokens, `.section-grid`, flat sections, headings → sans; delete `--color-surface`, `--scene-backdrop`, `--color-accent-2`, `--font-serif`, panel blocks). Test: `src/styles/global.test.ts` (rewritten). Commit: `feat(swiss): token contract (spec: specs/swiss-redesign)`.
- [x] Task 2 — Drop Fraunces: remove the import from `fonts.css` and the dependency from `package.json`. Test: `src/styles/fonts.test.ts` (updated). Commit: `feat(swiss): geist-only type (spec: specs/swiss-redesign)`.
- [x] Task 3 — Flip the theme default to light: `:root` light, `[data-theme="dark"]` override, dark OS-follow media query; `theme.ts` fallback → light. Tests: `src/lib/theme.test.ts`, `src/styles/global.test.ts`. Commit: `feat(swiss): paper default theme (spec: specs/swiss-redesign)`.
- [x] Task 4 — Gate contrast for the red pair in both modes. Test: `src/lib/contrast.test.ts` (updated). Commit: `test(swiss): wcag gates for red accents (spec: specs/swiss-redesign)`.

## 2. Motion grammar

- [x] Task 5 — Rework `useHeroIntro` to masked line-rises (clip wrapper + `translateY`, expo-out, 80 ms stagger, reduced-motion instant). Test: `src/hooks/useHeroIntro.test.tsx`. Commit: `feat(swiss): masked hero intro (spec: specs/swiss-redesign)`.
- [x] Task 6 — Rework `useScrollReveal` to the same masked-rise grammar. Test: `src/hooks/useScrollReveal.test.tsx`. Commit: `feat(swiss): masked scroll reveals (spec: specs/swiss-redesign)`.
- [x] Task 7 — Delete `useParallax` and `useTimelineFill` with their tests; remove call sites (Hero parallax ref, Experience fill ref — spine removal itself is task 10). Tests: suites green with the files gone. Commit: `refactor(swiss): drop parallax and timeline fill (spec: specs/swiss-redesign)`.

## 3. Chrome

- [x] Task 8 — Hero poster: flush-left, bottom-anchored on `.section-grid`, display scale/tracking per tokens, icon buttons → mono text links (same hrefs/labels). Tests: `src/sections/Hero/Hero.test.tsx` + `src/styles/global.test.ts` (hero module contract). Commit: `feat(swiss): flush-left hero poster (spec: specs/swiss-redesign)`.
- [x] Task 9 — Nav top bar: fixed top, flat bg + hairline, mono uppercase links, red active state, toggle flattened. Tests: `src/components/Nav/Nav.test.tsx`, `src/components/ThemeToggle/ThemeToggle.test.tsx`. Commit: `feat(swiss): mono top-bar nav (spec: specs/swiss-redesign)`.

## 4. Sections

- [x] Task 10 — Experience: delete spine/spineFill/marker + the zigzag layout effect; render entries as hairline-ruled grid rows (period 1–2, role 3–6, highlights 7–12). Tests: `src/sections/Experience/Experience.test.tsx` + `src/styles/global.test.ts`. Commit: `feat(swiss): experience as grid table (spec: specs/swiss-redesign)`.
- [x] Task 11 — Education + Publications onto the same row grammar. Tests: section `.test.tsx` + `src/styles/global.test.ts` (module regex). Commit: `feat(swiss): education & publications rows (spec: specs/swiss-redesign)`.
- [x] Task 12 — Technologies: category column + sharp mono chip tiles (radius 0, hairline border). Tests: `src/sections/Technologies/Technologies.test.tsx` + `src/styles/global.test.ts`. Commit: `feat(swiss): technologies tiles (spec: specs/swiss-redesign)`.

## 5. Scene

- [x] Task 13 — Delete `src/components/Background/` and drop it from `App.tsx`. Tests: suites green; single-canvas check arrives with task 15. Commit: `refactor(swiss): remove pulse network (spec: specs/swiss-redesign)`.
- [x] Task 14 — Chess specimen: place the scene in the hero grid (cols 7–12) over flat `--color-bg`, verify monochrome ink/paper via scene tokens, add the `FIG. 1` mono caption. Screenshot both breakpoints; tune wireframe weight if faint (record values in a dated Changes note). Tests: `src/components/ChessScene/ChessScene.test.tsx`. Commit: `feat(swiss): chess specimen plate (spec: specs/swiss-redesign)`.

## 6. Verification

- [x] Task 15 — E2E `tests/e2e/swiss.spec.ts`: light default + persistence, hero flush-left computed styles, section grid + zero radius, exactly one canvas, keyboard nav/toggle. Update `tests/e2e/typography-theme.spec.ts` for the flipped default. Commit: `test(swiss): e2e poster contract (spec: specs/swiss-redesign)`.
- [x] Task 16 — Sweep: `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green; no `fraunces`/`--font-serif`/`--color-accent-2`/`--scene-backdrop`/`gradient(` anywhere in `src/`. Commit: `chore(swiss): sweep stray tokens (spec: specs/swiss-redesign)` (skip if clean).

## Done

- [x] All acceptance criteria from `spec.md` verified.
- [x] `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green.
- [ ] PR description links to `specs/swiss-redesign/`.
