# Constitution

Project-wide principles for `showcases/`. Every spec's `plan.md` must be consistent with these. Update this file rarely; supersede with a dated note rather than silent edits.

## Product

A personal portfolio SPA. Single page, smooth-scrolling, motion-forward. The site is the artifact — content is secondary to the experience of moving through it.

## Technology

- **Runtime**: TypeScript (strict), React 19, Bun.
- **Bundler**: Vite. Bun is the package manager and script runner; it is **not** the bundler.
- **Motion**: Lenis for smooth scroll, GSAP (with ScrollTrigger) for animation. The two are wired together so GSAP's ticker drives Lenis's RAF.
- **Tests**: Vitest + React Testing Library for unit/component; Playwright for E2E.
- **Lint/format**: Biome. No ESLint, no Prettier.

## Engineering principles

1. **Spec before code.** No new feature code lands without a spec triplet in `specs/<feature>/`.
2. **Test before implementation.** Each task in `tasks.md` starts with a failing test.
3. **Strict TypeScript.** `tsconfig.json` has `strict: true`, `noUnusedLocals`, `noUnusedParameters`. No `any` without a justifying comment.
4. **Co-locate tests.** Unit/component tests sit next to the module they test, named `*.test.ts(x)`. E2E tests live in `tests/e2e/`.
5. **Path alias only.** Imports use `@/*`, never long relative paths like `../../..`.
6. **No backwards-compat shims.** This is a single deployed site. Change call sites directly.
7. **Motion is content.** Animation choices go in the spec, not as drive-by decisions during implementation.

## Out of scope (for now)

- Server-side rendering.
- A router / multi-page architecture.
- Tailwind or CSS-in-JS libraries.
- CI workflow files (add when a remote exists).

## Changes

### 2026-11-06 — stepped project scenes

1. **Motion (amends the project illustrations note).** A project scene can play in steps (`specs/project-io-scenes`): a JS timeout moves between steps, and each step's build-in stays CSS-only and under 5 s. A full play runs longer than 5 s, so stepped scenes carry Pause, Back and Next controls. Wao Companion is the first.

### 2026-11-05 — binary star backdrop

1. **Motion (amends the black hole note below).** A binary star orbit replaces the Lorenz attractor as the light theme's canvas (`specs/binary-star-background`). The dark theme keeps the black hole, and both still run on time, not scroll.

### 2026-11-05 — black hole backdrop

1. **Motion (amends the Lorenz note below).** The page's one canvas now follows the theme: the Lorenz attractor on light, a halftone black hole on dark (`specs/black-hole-background`). Both run on time, not scroll.

### 2026-11-05 — Lorenz backdrop

1. **Motion (amends the 2026-08-31 note).** The Lorenz attractor replaces the gradient-descent field as the page's one canvas (`specs/lorenz-background`). It runs on time, not scroll, so scroll no longer drives any animation.

### 2026-11-05 — project illustrations

1. **Motion (amends the 2026-08-31 note).** The descent field stays the page's only scroll-driven animator and only canvas. Experience adds CSS build-ins on inline SVG illustrations, one pass per activation with no JS tweening (`specs/portfolio-redesign`).

### 2026-08-31 — motion stack reset

1. **Motion (amends the Technology line).** GSAP no longer animates content: the reveal hooks (`useHeroIntro`, `useScrollReveal`), the flow-field scene, and with them ScrollTrigger are removed. GSAP remains, ticker-only, as the host that drives Lenis's RAF. The site's single animator is the scroll-driven gradient-descent field (`specs/gradient-descent`). Lenis smooth scroll is unchanged.
