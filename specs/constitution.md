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
