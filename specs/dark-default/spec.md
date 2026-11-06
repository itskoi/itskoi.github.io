# Spec: Dark by default

> WHAT we are building and WHY. No implementation here.

## User stories

- As the **site owner**, I want **every first visit to open in dark mode** so that **visitors first see the black hole backdrop**.
- As a **visitor**, I want **my light/dark choice to stick** so that **the site opens the way I left it**.

## Acceptance criteria

- [x] With no stored choice, the page opens dark (black, white, red) whatever the OS preference is. — `src/lib/theme.test.ts`, `tests/e2e/swiss.spec.ts`, `tests/e2e/typography-theme.spec.ts`
- [x] Dark paints first without JavaScript: `:root` holds the dark palette, `[data-theme="light"]` overrides every token with paper, and no `prefers-color-scheme` block remains. — `src/styles/global.test.ts`
- [x] The toggle starts on dark (offers "Switch to light mode"), and a stored choice wins over the default across reloads. — `src/components/ThemeToggle/ThemeToggle.test.tsx`, `src/hooks/useTheme.test.ts`, `tests/e2e/typography-theme.spec.ts`, `tests/e2e/swiss.spec.ts`
- [x] The canvas falls back to white ink when the scene token is missing. — `src/lib/theme.test.ts`

## Out of scope

- Palette values, the toggle's look, and the two backdrop scenes.

## References

- Supersedes the paper default and OS-follow from `specs/swiss-redesign`.
