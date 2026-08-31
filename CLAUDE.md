# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page portfolio SPA built with TypeScript + React 19, bundled by Vite, with Bun as the package manager and script runner. Smooth scrolling is handled by Lenis wired into GSAP's ticker. The page's single animator is the gradient-descent canvas scene (`src/components/DescentScene/`, spec: `specs/gradient-descent`).

Work in this repo follows **Spec-Driven Development (SDD) + Test-Driven Development (TDD)**. See `specs/README.md` and `specs/constitution.md` for the full methodology — the short version is below.

## Commands

All commands run through Bun. There is no npm/yarn flow.

```bash
bun install                  # install deps
bun run dev                  # vite dev server on :5173
bun run build                # vite production build to dist/
bun run preview              # serve the production build
bun run check                # tsc --noEmit (type-check only)
bun run test                 # vitest run (unit + component)
bun run test:watch           # vitest in watch mode
bun run test:ui              # vitest UI
bun run test:e2e             # playwright E2E (boots dev server automatically)
bun run lint                 # biome check . (lint + format verification)
bun run format               # biome format --write . (auto-fix formatting)
```

### Running a single test

```bash
# Single Vitest file
bun run test src/sections/Hero/Hero.test.tsx

# Single test name (substring match)
bun run test -t "renders the title"

# Single Playwright test file
bun run test:e2e tests/e2e/smoke.spec.ts

# Single Playwright test by line number
bun run test:e2e tests/e2e/smoke.spec.ts:5
```

## Architecture

### Toolchain boundary

- **Bun** installs deps and runs scripts. It is **not** the bundler.
- **Vite** is the dev server and production bundler.
- **Biome** handles both lint and format. No ESLint or Prettier.
- **Vitest** runs in jsdom for unit/component tests. **Playwright** runs real browsers for E2E.

### Path alias

`@/*` resolves to `src/*` (configured in `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts`). Always prefer `@/...` over long relative paths.

### Smooth scroll pipeline

The Lenis + GSAP handshake is centralized so React StrictMode's double-effect in dev doesn't double-register:

```
src/lib/gsap.ts              ticker-only: re-exports gsap + prefersReducedMotion() (no ScrollTrigger)
src/lib/lenis.ts             createSmoothScroll(): builds a Lenis instance, hooks its raf
                             into gsap.ticker, returns { lenis, destroy }
src/hooks/useSmoothScroll.ts calls createSmoothScroll() in useEffect, destroys on unmount
src/App.tsx                  calls useSmoothScroll() once at the top
```

GSAP no longer animates anything — its ticker only drives Lenis's RAF. Scroll-driven motion lives in the canvas scene, which reads raw `window.scrollY` inside its own rAF loop (deliberately no ScrollTrigger). `prefersReducedMotion()` from `@/lib/gsap` is the reduced-motion gate. The Lenis instance is reachable via the `SmoothScroll` interface if you need `lenis.scrollTo(target)` from a nav link.

### Source layout

```
src/
├── main.tsx                 entry: mounts <App/> into #root
├── App.tsx                  composes sections; owns useSmoothScroll
├── sections/                top-level portfolio sections (Hero, About, Work, Contact…)
│   └── <Section>/
│       ├── <Section>.tsx
│       ├── <Section>.module.css
│       └── <Section>.test.tsx
├── components/              reusable UI bits, same file pattern
├── hooks/                   app-specific React hooks
├── lib/                     framework-free modules (gsap, lenis, …)
└── styles/                  global.css (reset, base typography, CSS vars)
```

CSS Modules are the styling primitive. CSS variables for theme tokens live in `src/styles/global.css`. There is no Tailwind, no CSS-in-JS.

### Tests

- **Unit/component tests** are co-located with the module under test, named `*.test.ts(x)`. Vitest picks them up via the `src/**/*.test.{ts,tsx}` glob. The setup file `tests/setup.ts` registers `@testing-library/jest-dom` matchers.
- **E2E tests** live under `tests/e2e/*.spec.ts`. Playwright auto-boots the dev server (`bun run dev`) before tests and tears it down after. The Playwright config reuses an already-running dev server locally for fast iteration.
- Tests that exercise `useSmoothScroll` mock `@/lib/lenis` so jsdom doesn't choke on real RAF/ticker behavior.

## SDD + TDD workflow

For any non-trivial change (new feature, behavior change, regression fix), follow this loop:

```
Explore → Plan → Implement → Commit
```

1. **Explore.** Read the relevant `src/` files and any existing `specs/<feature>/` artifacts before writing anything.
2. **Plan.** Copy `specs/_template/` to `specs/<feature>/` and fill in:
   - `spec.md` — user stories + **testable** acceptance criteria (WHAT/WHY).
   - `plan.md` — technical design, alternatives considered, file map, test plan (HOW).
   - `tasks.md` — small checklist of tasks, each tied to a test.
3. **Implement** task-by-task. For each task: write a failing test, implement the minimum code to make it green, refactor, tick the task off in `tasks.md`.
4. **Commit** per task or coherent unit. Reference the spec path in the commit subject, e.g. `feat(hero): parallax on scroll (spec: specs/hero-parallax)`.

Pure refactors don't need a spec triplet. Bug fixes for regressions do.

### Rules of thumb

- The `constitution.md` file enumerates project principles (strict TS, no `any` without a comment, co-located tests, no backwards-compat shims, motion is content). Plans must be consistent with it.
- Spec docs are immutable after implementation starts. If scope changes, append a dated "Changes" section rather than rewriting.
- Every acceptance criterion in `spec.md` maps to at least one test.

## Conventions

- TypeScript is **strict** (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`). Don't weaken these flags.
- Imports use `type` annotations when importing only types (the `verbatimModuleSyntax` flag enforces this).
- Components are named exports (`export function Hero()`), not default exports.
- No comments unless the *why* is non-obvious. Never narrate the *what* — well-named code already does that.
