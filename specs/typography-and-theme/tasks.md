# Tasks: typography-and-theme

> A flat checklist. Each task is small (~30 min max) and ends with a green test + a commit. Tick boxes as you land commits. Reference `specs/typography-and-theme/` in every commit subject.

## 1. Foundations — type + color tokens

- [x] Task 1 — Install `@fontsource-variable/{fraunces,geist,geist-mono}`; create `src/styles/fonts.css` importing them; import it from `main.tsx`. Test: `fonts.test.ts` (no external host in import graph). Commit: `feat(theme): self-host Fraunces/Geist/Geist-Mono (spec: specs/typography-and-theme)`.
- [x] Task 2 — In `global.css`, define `--font-serif/sans/mono` with the spec'd stacks and a clamp type scale; map roles (`h1,h2,h3 → serif`, `body → sans`, `.eyebrow`/dates/tags → mono). Test: `styles.test.ts` (token + role assertions). Commit: `feat(type): serif headers + sans body + mono labels (spec: specs/typography-and-theme)`.
- [x] Task 3 — In `global.css`, replace the dark-only palette with the full token table: dark on `:root`, every token overridden under `[data-theme="light"]`, OS-follow under `@media (prefers-color-scheme: light) { :root:not([data-theme]) }`, plus `color-scheme` and `--scene-*` tokens. Remove `--color-accent-2`. Test: `styles.test.ts` (tokens defined/overridden, violet absent, `color-scheme` present). Commit: `feat(theme): dual light/dark token system (spec: specs/typography-and-theme)`.

## 2. Theme infra

- [x] Task 4 — Create `src/lib/theme.ts`: `initTheme/getTheme/setTheme/toggleTheme/onThemeChange/readSceneColors`. Test: `theme.test.ts` (resolution precedence, persistence, pub/sub, `readSceneColors` parses `--scene-figure-rgb`). Commit: `feat(theme): theme resolver + scene-color seam (spec: specs/typography-and-theme)`.
- [x] Task 5 — Call `initTheme()` in `main.tsx` before `createRoot().render(...)`. Test: `main.test.ts` (init runs pre-render) — or cover via E2E in Task 10. Commit: `feat(theme): init theme before first paint (spec: specs/typography-and-theme)`.
- [x] Task 6 — Create `src/hooks/useTheme.ts` (`{ theme, toggle }`, subscribes + cleans up). Test: `useTheme.test.ts`. Commit: `feat(theme): useTheme hook (spec: specs/typography-and-theme)`.

## 3. Toggle UI

- [x] Task 7 — Create `src/components/ThemeToggle/` (button + module css): sun/moon inline SVG, `aria-pressed`, target-state `aria-label`, visible `:focus-visible` ring. Test: `ThemeToggle.test.tsx` (a11y, click + keyboard flip `data-theme`). Commit: `feat(theme): accessible theme toggle (spec: specs/typography-and-theme)`.
- [x] Task 8 — Render `<ThemeToggle/>` in `Nav`. Test: `Nav.test.tsx` (toggle present in nav). Commit: `feat(nav): add theme toggle (spec: specs/typography-and-theme)`.

## 4. Scene layers follow the theme

- [x] Task 9 — `Background.tsx`: derive stars/wires/nodes/pulse colors from `readSceneColors()`; subscribe via `onThemeChange` and re-render the static layer. `Background.module.css`: `.backdrop` → `var(--scene-backdrop)`. Test: `Background.test.tsx` (colors sourced from tokens; re-render on change). Commit: `feat(background): theme-driven pulse network (spec: specs/typography-and-theme)`.
- [x] Task 10 — `ChessScene.tsx`: drop `CYAN`/`VIOLET`; both pieces use figure color from `readSceneColors()`; key the effect on theme so the scene rebuilds on toggle. Test: `ChessScene.test.tsx` (figure-color sourcing; rebuild-on-toggle). Commit: `feat(chess): monochrome theme-driven pieces (spec: specs/typography-and-theme)`.

## 5. Accessibility + verification

- [x] Task 11 — Create the contrast test: WCAG AA for fg/bg and `accent-strong`/bg in both modes. Test: `contrast.test.ts`. Commit: `test(theme): assert WCAG AA in both modes (spec: specs/typography-and-theme)`.
- [x] Task 12 — Create E2E: toggle flips computed bg/fg, persists across reload, OS-follow on fresh `colorScheme:'light'`, no `googleapis`/`gstatic` requests. Test: `tests/e2e/typography-theme.spec.ts`. Commit: `test(e2e): theme toggle + font self-hosting (spec: specs/typography-and-theme)`.
- [x] Task 13 — Re-run the hardcoded-color grep over `src/`; expect zero neon hex/`0x`/`rgba` hits in `Background`/`ChessScene`. Manual: screenshot dark (white pieces + pulse, neon only on type) and light (ink wireframe) modes; confirm no first-paint flash on hard reload.

## Done

- [ ] All acceptance criteria from `spec.md` verified.
- [ ] `bun run check`, `bun run test`, `bun run lint`, `bun run build`, `bun run test:e2e` all green.
- [ ] PR description links to `specs/typography-and-theme/`.
- [ ] Note in `specs/chess-pieces/spec.md` that its "Queen cyan / King violet" color decision is superseded by this spec (append a dated "Changes" note — do not rewrite).
