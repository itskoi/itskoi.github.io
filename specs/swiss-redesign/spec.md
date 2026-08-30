# Spec: swiss-redesign

> WHAT we are building and WHY. Reset the portfolio's visual system from "atmospheric dark showcase" to **Swiss / International Typographic Style**: a strict grid, black ink on white paper, one red accent, and neo-grotesque type doing all the work. No implementation here — see `plan.md`.

## Context

The site today is the opposite of Swiss, by design: a dark-first showcase with atmospheric layered gradients (`--scene-backdrop`), a Fraunces serif carrying every heading, translucent rounded section panels, a centered hero, a center-spine zigzag timeline with an accent fill that grows on scroll, a pulse-network canvas behind everything, and a two-blue accent system. All of that shipped via `specs/typography-and-theme/` and friends.

The owner wants a Swiss redesign. What that means concretely — and what this spec removes as much as what it adds:

| Swiss principle          | Today                                       | This spec                                        |
|-------------------------|---------------------------------------------|--------------------------------------------------|
| Mathematical grid        | centered `max-width: 64rem` column          | explicit 12-column grid, content snapped to it   |
| Neo-grotesque type only  | Fraunces serif headings                     | Geist everywhere; serif role deleted             |
| Flush-left asymmetry     | centered hero, symmetric zigzag             | bottom-left-anchored hero, asymmetric sections   |
| Flat, objective surfaces | gradients, glow, translucency, 1rem radii   | flat paper, hairline rules, zero border-radius   |
| One disciplined accent   | two blues across type + scene               | Swiss red, non-text/large only, + AA-strong pair |
| Type carries the poster  | atmosphere carries it                       | extreme display scale (up to ~9.5rem)            |

## Design thesis

The boldness budget is spent on **one move: deleting the atmosphere**. Gradients, glow, the pulse network, translucency, and rounded softness all go; the poster energy they used to provide is replaced by extreme type-scale contrast (huge lowercase grotesque against tiny mono data labels) and generous paper. The single signature element is the 3D chess scene reframed as an **objective specimen plate** — an ink wireframe exhibit that sits *on* the grid, crossed by a hairline rule, captioned `FIG. 1` in mono like a technical drawing. Everything else stays quiet and disciplined so the type and the specimen read.

Motion follows the same doctrine: mechanical and grid-aligned (masked line-rises, exact easings, short staggers) instead of atmospheric (no parallax, no soft opacity fades, no growing fills).

## Token contract

### Palette (light = paper default, dark = ink inverse)

| Token                | Light (default) | Dark            | Role                                            |
|----------------------|-----------------|-----------------|-------------------------------------------------|
| `--color-bg`         | `#FFFFFF`       | `#0A0A0A`       | flat paper / flat ink field                     |
| `--color-fg`         | `#0A0A0A`       | `#FAFAFA`       | primary text                                    |
| `--color-fg-muted`   | `#55595F`       | `#A3A3A3`       | secondary text                                  |
| `--color-border`     | fg @ 15%        | fg @ 15%        | hairline rules (via `color-mix`)                |
| `--color-accent`     | `#E30613`       | `#FF2B39`       | Swiss red — non-text + large text (≥ h3) only   |
| `--color-accent-strong` | `#C00016`    | `#FF5A66`       | red at small sizes (AA ≥ 4.5:1 in both modes)   |
| `--scene-figure-rgb` | `10 10 10`      | `250 250 250`   | chess wireframe (ink on paper / paper on ink)   |
| `--scene-piece-rgb`  | `10 10 10`      | `250 250 250`   | chess pieces — specimen is monochrome           |

Deleted tokens: `--color-surface` (no elevation — everything is flat), `--scene-backdrop` (no gradients), `--color-accent-2` (one accent, not two), `--font-serif` (no serif role). `--scene-figure` hex form is kept only if `theme.ts` still needs it; otherwise the rgb form is the contract.

### Type (all Geist family — personality comes from scale contrast, not the faces)

| Token        | Value                                  | Role                        |
|--------------|----------------------------------------|-----------------------------|
| `--fs-display` | `clamp(3.5rem, 13vw, 9.5rem)`        | hero name — weight 650, line-height 1.0, tracking `-0.045em` |
| `--fs-h2`      | `clamp(2.25rem, 6vw, 4.5rem)`        | section headings — tracking `-0.03em` |
| `--fs-h3`      | `clamp(1.375rem, 3vw, 1.875rem)`     | item titles                |
| `--fs-body`    | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` | body copy             |
| `--fs-meta`    | `0.8125rem`                          | mono data labels — uppercase, tracking `0.08em` |

Roles: `h1`–`h4` and body → Geist Variable; every data label (dates, DOIs, tag chips, nav links, hero meta, the `FIG. 1` caption) → Geist Mono. Fraunces is removed from `fonts.css` and `package.json`.

### Grid

| Token            | Desktop    | ≤ 768px |
|------------------|------------|---------|
| `--grid-columns` | `12`       | `6`     |
| `--grid-gutter`  | `clamp(1rem, 2vw, 1.5rem)` | same |
| `--grid-margin`  | `clamp(1.25rem, 5vw, 4rem)`  | same |

Section grammar: every content section is a 12-column grid; the `h2` occupies columns 1–4, content occupies columns 5–12; a full-bleed 1px hairline rule separates sections. Tabular sections (Experience, Education, Publications) lay out each entry as one grid row with hairline top rules. Mobile collapses to a single stacked column under the heading.

## User stories

- As a **visitor**, I want **huge flush-left typography on a strict grid** so the page **reads as deliberately composed, not templated**.
- As a **visitor**, I want **the chess scene presented like a labeled technical exhibit** so the showpiece feels **objective and considered rather than atmospheric**.
- As a **visitor in bright surroundings**, I want **the site to open on white paper with black ink** so it **reads cleanly like a printed poster**.
- As a **returning visitor**, I want **my dark/light choice remembered** so the site **doesn't reset every load**.
- As a **motion-sensitive visitor**, I want **calm, optional motion** so the **poster stays legible**.
- As the **owner**, I want **one red accent held to a strict discipline** so the design **reads Swiss rather than decorated**.

## Acceptance criteria

(testable; each maps to at least one test — see `plan.md`)

### Typography
- [ ] No serif anywhere: `--font-serif` and `fraunces` appear nowhere in `src/` or `package.json` deps. — `fonts.test.ts`, `global.test.ts`
- [ ] `h1`–`h4` resolve to `var(--font-sans)`; no `font-family` in any module CSS references a serif. — `global.test.ts`
- [ ] The scale tokens above are defined; the display size clamps to `9.5rem` max (up from 6rem). — `global.test.ts`
- [ ] Display type is set tight: the hero name's computed `letter-spacing` ≤ `-0.03em` and `line-height` ≤ `1.05`. — `tests/e2e/swiss.spec.ts`
- [ ] Mono carries every data label: nav links, hero meta, `.period`, `.doi`, `.tool`, and the scene caption. — `global.test.ts` (per-module regex)

### Grid & layout
- [ ] Grid tokens (`--grid-columns`, `--grid-gutter`, `--grid-margin`) are defined with a 6-column override at ≤ 768px. — `global.test.ts`
- [ ] Every content section renders as `display: grid` over `repeat(var(--grid-columns), 1fr)`; headings sit in columns 1–4 and content in 5–12. — `global.test.ts` + `tests/e2e/swiss.spec.ts` (computed style)
- [ ] The hero is flush-left and bottom-anchored: computed `text-align` is `left`, content anchored to the bottom of the viewport. — `tests/e2e/swiss.spec.ts`
- [ ] Tabular sections render one hairline rule per entry (no spine, no markers, no zigzag). — `global.test.ts` + Experience module test

### Flatness & palette
- [ ] No `border-radius` other than `0`/`999px`-on-nothing remains on sections, panels, chips, or buttons in `src/` — sections and chips are sharp-cornered. — `global.test.ts`
- [ ] No translucent section panels: the `color-mix(... surface ...%)` panel blocks in `global.css` are gone. — `global.test.ts`
- [ ] No gradients: `--scene-backdrop` and every `radial-gradient`/`linear-gradient` in `src/` are removed. — `global.test.ts`
- [ ] One accent: `--color-accent-2` is gone; the red pair `#E30613`/`#C00016` (light) and `#FF2B39`/`#FF5A66` (dark) is defined. — `global.test.ts`

### Theme default
- [ ] `:root` carries the **light** palette; `[data-theme="dark"]` overrides it; `@media (prefers-color-scheme: dark)` applies the dark palette when no explicit choice is set. — `global.test.ts`
- [ ] `theme.ts` resolves: stored choice → OS preference → **light** (was dark). — `theme.test.ts`
- [ ] The manual toggle still flips and persists the choice across reloads. — `theme.test.ts` + `tests/e2e/swiss.spec.ts`
- [ ] `color-scheme` tracks the mode in both directions. — `global.test.ts`

### Scene
- [ ] The pulse network is gone: `src/components/Background/` is deleted and `App` renders no Background. — `tests/e2e/swiss.spec.ts` (exactly one `canvas` on the page)
- [ ] The chess scene derives its figure/piece color from the scene tokens and renders monochrome ink on paper (light) / paper on ink (dark). — `ChessScene.test.tsx`
- [ ] The scene sits within the hero grid (right field, columns 7–12) rather than as full-screen atmosphere behind the page. — `ChessScene.module.css` contract in `global.test.ts` + `tests/e2e/swiss.spec.ts`
- [ ] The scene carries a mono caption beginning `FIG. 1` — the specimen label. — `ChessScene.test.tsx` / `Hero.test.tsx`
- [ ] Chess motion (swap/spin, owned by `specs/chess-to-book/` and `specs/chess-pieces/`) is unchanged. — existing suites

### Motion
- [ ] Hero parallax is removed (`useParallax` deleted); the hero type is static on the grid. — absence of file + suites green
- [ ] Intro/scroll reveals use masked line-rises (clip via `overflow: hidden` + `translateY`), not opacity fades. — `useHeroIntro.test.tsx`, `useScrollReveal.test.tsx`
- [ ] Reduced-motion users get no reveals — content renders in place instantly. — existing reduced-motion tests stay green

### Accessibility & non-regression
- [ ] Body text and `--color-accent-strong` on the background meet WCAG AA (≥ 4.5:1) in **both** modes; `--color-accent` red is used only where large-text (≥ 3:1) or non-text rules apply. — `contrast.test.ts`
- [ ] The nav remains keyboard-operable with visible focus; the theme toggle keeps its accessible name and `aria-pressed`. — `Nav.test.tsx`, `ThemeToggle.test.tsx` (updated)
- [ ] All existing suites are updated to the new contract (no backwards-compat shims) and green. — full `bun run check/test/lint/test:e2e`

## Out of scope

- Content changes: copy, section order, data in `src/data/portfolio` (casing of the name stays as-is; a lowercase-ad hero variant is a possible follow-up).
- Chess geometry and swap/spin motion (owned by `specs/chess-pieces/` and `specs/chess-to-book/`).
- Smooth-scroll plumbing (Lenis ↔ GSAP ticker stays exactly as is).
- New sections, imagery, or analytics.
- Any multi-page/router work.

## Decisions (resolved 2026-08-30)

1. **Accent — Swiss red.** Owner-selected over "keep the two blues" and "ink monochrome". One red, with an AA-strong darkened pair for small text (the same large/small split `specs/typography-and-theme/` used for cyan).
2. **Default mode — light (paper).** Owner-selected over "keep dark default". Dark becomes the inverse poster mode. This supersedes the "dark is the showcase mode" decision in `specs/typography-and-theme/`.
3. **Scene — chess as specimen, pulse network removed.** Owner-selected over "keep both flattened" and "type only". The chess scene is reframed as a captioned technical exhibit on the grid; the pulse network (atmosphere) is deleted. This supersedes the pulse-network color contract in `specs/typography-and-theme/`.
4. **Type — Geist only.** Fraunces is deleted outright (no backwards-compat shim, per constitution). Display scale roughly doubles; hierarchy is carried by size contrast between grotesque display and mono micro-labels.
5. **Motion — mechanical.** Masked line-rises replace fades/parallax/fills; the chess scene keeps its existing motion untouched.

## Open questions

- Chess wireframe line weight on white paper — ink hairlines can read faint. Tune line opacity/width during implementation; if the specimen still reads weakly, consider a heavier edge weight for light mode only (append a dated Changes note either way).
- Dark-mode `--color-accent-strong` may be redundant (`#FF2B39` already measures AA on `#0A0A0A`). Ship both for hover emphasis; collapse in a follow-up if unused.
- Nav on very narrow screens: mono labels may overflow. Fallback during implementation: horizontal scroll within the nav bar (no wrap), or hide behind the first letter — decide when seen.

## References

- Current token contract: `src/styles/global.css`, `src/styles/fonts.css`
- Superseded decisions: `specs/typography-and-theme/spec.md` (serif role, blue palette, dark default, scene backdrop, pulse network)
- Chess motion owners: `specs/chess-pieces/`, `specs/chess-to-book/`
- Prior art: Josef Müller-Brockmann, *Grid Systems in Graphic Design*; *Neue Grafik* magazine layout grammar
- Project principles: `specs/constitution.md`
- Derived from: `specs/_template/`

## Changes (2026-08-30 — during implementation)

1. **Scene placement amended.** `ChessScene` is not a hero ornament — it is a fixed full-viewport scroll narrative (pieces assemble across Experience, morph into the lattice across Education, exit at Publications; owned by `specs/chess-to-book/`). Confining the canvas to the hero's right field would hide the Education morph behind opaque content and force camera recomposition, contradicting the "chess motion unchanged" criterion. Amended resolution: the canvas stays fixed full-viewport; the specimen framing lands as the `FIG. 1` caption plate in the hero's right grid field (cols 7–12); sections stay transparent over the flat paper so the narrative stays visible. `ChessScene.tsx` is untouched — the monochrome flip rides entirely on the scene tokens.
2. **Masked rise via `clip-path`.** The line-rise is implemented as `clipPath: inset()` + `yPercent` on the revealed element itself (cleared after completion) rather than `overflow: hidden` wrappers — same masked-rise effect, no DOM surgery, StrictMode-safe.
