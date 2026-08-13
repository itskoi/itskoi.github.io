# Spec: typography-and-theme

> WHAT and WHY. Give the portfolio a deliberate visual identity: a serif/sans type system and a dual light/dark color system that reads as advanced, high-end technology rather than default neon. No implementation here — see `plan.md`.

## Context

Today the site is **dark-only** with two competing neon accents (cyan `#64ffda` + violet `#b388ff`) and a single `system-ui` sans for everything — no serif, no webfonts loaded (`index.html` is bare; nothing is imported from a foundry). Color tokens live in `src/styles/global.css` and are consumed via `var(--color-*)` in every CSS Module — **except** the two canvas/3D layers, which hardcode their colors in TypeScript:

- **Pulse** — the electric pulses traveling the wireframe network in `src/components/Background/Background.tsx` (`drawPulse`, `rgba(120,255,230,…)`), plus its star/wire/node colors and the `.backdrop` CSS gradient in `Background.module.css`.
- **Chesses** — the Queen/King pieces in `src/components/ChessScene/ChessScene.tsx` (`CYAN = 0x64ffda`, `VIOLET = 0xb388ff`).

The owner wants a refined direction: **serif headers + sans body**, **neon but high-end**, a **dark and a light mode**, and in **dark mode the pulse + chess pieces in white**.

## Design thesis

Neon everywhere reads as gamer-RGB, not high-end. The signature move here is **restraint**: the two large atmospheric layers (chess pieces + pulse network) go **monochrome** in dark mode, and a **single disciplined electric-cyan neon** carries only the type and UI chrome (role line, active/hover nav, section accents, focus). The tension between white wireframe and electric type is what makes it read as advanced technology rather than a template. Boldness is spent on the type pairing + this white-vs-neon discipline; everything else stays quiet.

## Source of truth for decisions

- Fonts: **Fraunces** (serif display, optical sizing + soft/wonk axes) for headers; **Geist** (modern dev-tool sans) for body; **Geist Mono** for data micro-labels (eyebrows, dates, tag chips). All free, self-hosted via `@fontsource-variable/*` (no third-party requests, bundles with Vite).
- Theme switching: a sun/moon button in the `Nav`. First visit follows the OS `prefers-color-scheme`; the manual choice is then persisted in `localStorage`; falls back to **dark** when the OS preference is unknown. Dark is the showcase mode (white pulse + white chess pieces live here).

## Token system (the contract)

Custom properties on `:root` (dark = default), overridden under `[data-theme="light"]` and under `@media (prefers-color-scheme: light)` when no explicit attribute is set:

| Token                  | Dark            | Light           | Used by                                              |
|------------------------|-----------------|-----------------|------------------------------------------------------|
| `--color-bg`           | `#08090C`       | `#F7F8FA`       | page background                                       |
| `--color-surface`      | `#101418`       | `#FFFFFF`       | cards / elevated panels                               |
| `--color-fg`           | `#F3F4F6`       | `#0B0E12`       | primary text                                          |
| `--color-fg-muted`     | `#9AA1AB`       | `#5A6370`       | secondary text                                        |
| `--color-border`       | `fg @ 10%`      | `fg @ 10%`      | hairlines (via `color-mix`)                           |
| `--color-accent`       | `#2DE2E6`       | `#0B7C78`       | signature neon — non-text + large text               |
| `--color-accent-strong`| `#5EEEDC`       | `#0A6561`       | accent on small text (legibility in each mode)       |
| `--scene-figure`       | `#FFFFFF`       | `#0B0E12`       | chess edges + pulse cores + network nodes            |
| `--scene-figure-rgb`   | `255 255 255`   | `11 14 18`      | same, space-separated for `rgba()` compositing in JS |
| `--scene-backdrop`     | deep teal-black | pale cool lab   | layered radial+linear gradient behind the canvas     |

Type:

| Token          | Stack                                                                    | Role                                                       |
|----------------|--------------------------------------------------------------------------|------------------------------------------------------------|
| `--font-serif` | `"Fraunces", Georgia, "Times New Roman", serif`                          | Hero `<h1>`, every section `<h2>`, item titles (role/degree/paper/category) |
| `--font-sans`  | `"Geist", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`      | all body copy, meta (company/dates/venue), links, nav      |
| `--font-mono`  | `"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace`                | eyebrow labels, date ranges, tech tag chips (the "data")   |

Notes:
- `--color-accent-2` (violet) is **removed**. Its only consumer was the King chess piece, which goes monochrome.
- The light-mode accent is a **deeper teal** than the dark-mode neon because pure neon cyan is illegible on white; `--color-accent-strong` exists specifically so small accent text passes contrast in both modes.

## User stories

- As a **visitor**, I want **elegant serif headlines over clean sans body copy** so the portfolio **feels considered and high-end, not templated**.
- As a **visitor**, I want a **one-tap switch between dark and light** so the site **feels comfortable in any lighting**.
- As a **visitor on a phone in bright sun** (light OS), I want the site to **open in light mode by default** so I'm not blinded.
- As a **returning visitor**, I want the site to **remember the mode I chose** so it **doesn't reset every load**.
- As the **owner**, I want the **chess pieces and pulse network to read as sculptural white wireframe** in dark mode so the **neon stays disciplined to the type**.
- As a **motion-sensitive / keyboard visitor**, I want the **toggle to be operable and the page to remain calm** when I switch modes.

## Acceptance criteria

(testable; each maps to at least one test — see `plan.md`)

### Typography
- [ ] `global.css` defines `--font-serif`, `--font-sans`, and `--font-mono` with the stacks above. — `styles.test.ts`
- [ ] Heading elements (`h1`, `h2`, `h3`) resolve to `var(--font-serif)`; `body` resolves to `var(--font-sans)`. — `styles.test.ts` (asserts the CSS role contract)
- [ ] Item-title class names (role / degree / paper title / category) are mapped to the serif; meta (company / dates / venue) and body stay sans. — `styles.test.ts`
- [ ] Mono is applied to eyebrow labels, date ranges, and tech tag chips. — `styles.test.ts`
- [ ] A type scale is defined via tokens/clamps: display (`clamp(3rem,10vw,6rem)`), h2 (`clamp(2rem,4vw,2.75rem)`), h3 (`clamp(1.25rem,2.5vw,1.5rem)`), body (`1rem`–`1.125rem`). — `styles.test.ts`

### Font loading
- [ ] Fraunces, Geist, and Geist Mono are imported (self-hosted via `@fontsource-variable/*`) and load with no external network host. — `fonts.test.ts` + E2E (`typography-theme.spec.ts`: no request to `fonts.googleapis.com`).
- [ ] Fonts load before/at first paint without layout-breaking fallback (matching `size-adjust` fallbacks in the `@fontsource` stacks). — E2E (`typography-theme.spec.ts`).

### Theme tokens
- [ ] `global.css` defines every color/scene token for dark on `:root`, and overrides every one under `[data-theme="light"]`. — `styles.test.ts`
- [ ] `[data-theme="light"]` also applies under `@media (prefers-color-scheme: light)` when no explicit `data-theme` is set (OS-follow on first visit). — `styles.test.ts`.
- [ ] `--color-accent-2` (violet) no longer exists anywhere in `src/`. — `styles.test.ts`.

### Theme infra
- [ ] `initTheme()` resolves the mode as: stored `localStorage["theme"]` → else OS `prefers-color-scheme` → else `dark`; sets `data-theme` on `documentElement`. — `theme.test.ts`.
- [ ] `setTheme(mode)` sets `data-theme`, persists to `localStorage["theme"]`, and notifies subscribers. — `theme.test.ts`.
- [ ] `toggleTheme()` flips dark↔light and persists. — `theme.test.ts`.
- [ ] `onThemeChange(cb)` fires on toggle and is unsubscribable. — `theme.test.ts`.
- [ ] `initTheme()` runs before React mounts (in `main.tsx`, before `createRoot`) so there is no first-paint flash. — `main.test.ts` / E2E.
- [ ] `useTheme()` exposes `{ theme, toggle }` and re-renders the toggle on change. — `useTheme.test.ts`.

### Theme toggle UI
- [ ] A `ThemeToggle` button renders inside `Nav`, with an accessible name (e.g. "Switch to light/dark mode") and `aria-pressed` reflecting state. — `ThemeToggle.test.tsx`.
- [ ] Activating the button flips `data-theme` on `<html>`. — `ThemeToggle.test.tsx`.
- [ ] The persisted choice survives a reload. — E2E (`typography-theme.spec.ts`).
- [ ] On a fresh load with no stored choice, the resolved mode matches the OS preference (mocked). — E2E (`typography-theme.spec.ts`).
- [ ] `color-scheme` on `:root` tracks the mode (native scrollbars/controls match). — `styles.test.ts`.

### Scene layers follow the theme (the "white in dark mode" requirement)
- [ ] `readSceneColors()` reads `--scene-figure` / `--scene-figure-rgb` from `documentElement` and returns the resolved RGB. — `theme.test.ts` (the testable seam).
- [ ] `Background` derives pulse, node, wire, and star colors from `readSceneColors()` (no hardcoded neon hex/rgba). In dark mode the figure resolves white. — `Background.test.tsx`.
- [ ] `ChessScene` derives both pieces' edge/fill color from `readSceneColors()` (no `CYAN`/`VIOLET` constants). In dark mode both pieces resolve white. — `ChessScene.test.tsx`.
- [ ] Toggling the theme re-renders `Background`'s static layer and rebuilds `ChessScene`'s materials so the scene color flips live without a reload. — `Background.test.tsx`, `ChessScene.test.tsx`.
- [ ] The `.backdrop` gradient in `Background.module.css` is driven by `--scene-backdrop` (dark = deep teal-black, light = pale cool). — `styles.test.ts`.

### Accessibility & non-regression
- [ ] Body text and accent-on-background meet WCAG AA in **both** modes (body ≥ 4.5:1; accent text via `--color-accent-strong`). — `contrast.test.ts` (computed luminance check on the token pairs).
- [ ] The toggle is keyboard-operable with a visible focus ring. — `ThemeToggle.test.tsx`.
- [ ] All existing unit/component/E2E tests stay green; reduced-motion paths for Hero/sections/scene are unaffected. — existing suites.

## Out of scope

- Changing layout, section order, or content (this is surfaces only — type + color).
- New sections, copy, or imagery.
- The chess pieces' geometry/motion (owned by `specs/chess-pieces/`); this spec only changes their **color source**.
- The pulse network's geometry/motion (owned by Background); this spec only changes its **color source** + the CSS backdrop gradient.
- Per-section custom fonts beyond the serif/sans/mono roles.
- Analytics on theme choice.

## Decisions (resolved 2026-08-02)

1. **Fonts — Fraunces + Geist + Geist Mono.** Owner-selected over Instrument Serif/IBM Plex and Newsreader/Inter. Self-hosted via `@fontsource-variable/*`.
2. **Theme switching — Nav toggle, OS-follow first, then persist, default dark.** Owner-selected over "always-dark default" and "auto-only."
3. **One accent, not two.** Violet (`--color-accent-2`) is removed; a single electric cyan is the signature, mapped darker in light mode for legibility.
4. **Pulse + chess go monochrome, not neon.** In dark mode both resolve to `--scene-figure` = white; in light mode to ink `#0B0E12` (white would vanish on a light bg). This supersedes the "Queen cyan / King violet" color decision in `specs/chess-pieces/`.
5. **Mechanism — `data-theme` attribute + `prefers-color-scheme` media fallback**, with `theme.ts` owning resolution/persistence and an `onThemeChange` subscription so the canvas/3D layers can re-read scene colors live.
6. **Light-mode accent legibility** handled by a separate `--color-accent-strong` token rather than one accent trying to serve both large and small text.

## Open questions

- In **light mode**, should the chess pieces + pulse be **ink** (this spec's default, symmetric with dark's white) or keep a faint **accent tint**? Defaulting to ink; revisit if the wireframe reads too heavy on white.
- Fraunces `SOFT`/`WONK` axes: use them (characterful, risk of "too quirky" for a recruiter audience) or keep the default optical sizing only? Plan defaults to optical-sizing only for now.

## References

- Tokens today: `src/styles/global.css`
- Hardcoded scene colors: `src/components/Background/Background.tsx`, `src/components/ChessScene/ChessScene.tsx`, `src/components/Background/Background.module.css`
- Color decision superseded: `specs/chess-pieces/spec.md` ("Queen cyan / King violet")
- Project principles: `specs/constitution.md`
- Derived from: `specs/_template/`

## Changes (2026-08-02 — during implementation)

1. **Light-mode accent deepened for WCAG AA.** The proposed light `--color-accent: #0B7C78` measured ~4.4:1 on the light bg (borderline for the body-size text that uses `--color-accent`, e.g. company/GPA/venue). Shipped values: `--color-accent: #0A6561` (~6.5:1) and `--color-accent-strong: #084F4B`. Gated by `src/lib/contrast.test.ts`.
2. **Fraunces loaded via the `opsz.css` subset** (weight + optical-size axis), not the weight-only `index.css`, so `font-optical-sizing: auto` actually shapes the headlines. `SOFT`/`WONK` axes still deferred (open question). `@fontsource-variable` registers the families as `Fraunces Variable` / `Geist Variable` / `Geist Mono Variable`, so the token stacks use those names.
3. **Mono role wired per-module.** CSS Modules scope class names, so a global selector can't reach `.period` / `.tool` / `.doi`; each section's module was edited to set `font-family: var(--font-mono)`. Section `.heading` and Hero `.name` now consume `--fs-h2` / `--fs-display` so the declared scale is actually applied.
4. **ChessScene rebuild** via `useTheme()` + a `[theme]` effect dependency (the scene tears down and rebuilds on toggle, re-reading `figureHex()`). The intentional extra dependency carries a scoped `biome-ignore`. The white `AmbientLight`/`DirectionalLight` are left as-is — neutral illumination, intentionally outside the figure-color contract.

## Changes (2026-08-02 — cyan → blue palette)

Owner rejected the cyan/teal accent. The signature is now a **two-blue system**; the chess pieces + pulse network remain monochrome (white/ink) per the original brief.

1. **`--color-accent`** is electric blue: `#5ba4ff` (dark) / `#1d4ed8` (light). **`--color-accent-2`** is royal blue: `#3b82f6` (dark) / `#1e40af` (light). Both pass WCAG AA for text in their mode (`contrast.test.ts`).
2. **`--color-accent-strong` dropped** — redundant once both accents are AA-safe at all sizes on their own.
3. **`--color-accent-2` is actually used** (it's no longer the legacy violet): nav active/hover links and the Technologies category labels render in royal blue; everything else (role, company, GPA, publication meta, focus ring) stays electric blue.
4. **Backdrop blue-shifted** — the dark radial glows and base gradient moved from teal to blue (`rgba(40,90,200,…)` / `#050a16`); the light backdrop picked up a faint blue tint. `--scene-figure` (white/ink) is unchanged.

## Changes (2026-08-02 — chess pieces go blue)

Owner reversed the earlier "chesses in white" decision: the 3D pieces are now **blue**, tying the showpiece into the palette. The **pulse network stays white** (`--scene-figure`) — only the pieces changed.

1. **New `--scene-piece-rgb` token** — `91 164 255` (electric blue, dark) / `11 14 18` (ink, light — same as the pulse network, so light mode is fully monochrome). The pulse network reads `--scene-figure-rgb` (white/ink).
2. **`readPieceColors()`** added to `theme.ts` (mirrors `readSceneColors`); `ChessScene` now calls `figureHex(readPieceColors())`. Both pieces share the one piece color — the Queen/King distinction stays geometric.
