# Plan: measure-and-heading-accent

> HOW we will implement the spec. Alternatives, trade-offs, file map.

## Approach

**The measure is padding, not a max-width.** A `--grid-max-width: 80rem` token joins the grid block in `global.css`, and the inline inset becomes one shared custom property:

```css
--grid-inline: max(var(--grid-margin), calc((100% - var(--grid-max-width)) / 2));
```

`.section-grid` and the nav bar set `padding-inline: var(--grid-inline)`. Custom properties substitute at the using element, so the `100%` resolves against each user's own inline size — the sections' containing block and the fixed nav's viewport, both full width. Content box = `min(viewport − 2·margin, 80rem)`, centered. Section boxes keep their full-bleed hairline `border-top` (the swiss grammar); the hero caps for free (it *is* a `.section-grid`); the inner `.entry`/`.row` grids re-flow inside the measure without edits; and below ~1408px viewports the `max()` degenerates to today's exact `--grid-margin` — zero regression window, zero DOM changes.

**The heading accent is the nav's active system, surfaced in the field.** A new `src/hooks/useSectionActive.ts` owns the single definition of "active": the exported `ACTIVE_BAND` constant (`-45% 0px -50% 0px`) plus `useSectionActive(id)`, which observes `document.getElementById(id)` with its own IntersectionObserver (Nav's exact pattern: `typeof IntersectionObserver === 'undefined'` guard for jsdom, `disconnect()` on cleanup) and returns the boolean. `Nav.tsx` imports `ACTIVE_BAND` for its own observer, so nav red and heading red can never drift apart. Each of the four content sections calls the hook and sets `data-active` on its `<h2>`. No GSAP anywhere — consistent with the 2026-08-31 motion reset.

**The fade is one CSS rule per section module**, following the existing duplicated-`.heading` grammar that `global.test.ts` already regexes across all four sheets: `.heading { transition: color 0.4s ease }` and `.heading[data-active='true'] { color: var(--color-accent) }`. `--fs-h2` (≥ 2.25rem, weight 650) is large text by size alone, so the plain accent red is the discipline-correct token in both themes — **not** `--color-accent-strong`, which is reserved for small text. A `prefers-reduced-motion: reduce` block sets `transition: none`: the information (which section is active) survives, only the motion drops.

**Test seams.** jsdom has no IntersectionObserver: the hook's guard means an unstubbed render simply stays ink (asserted), and the section tests install a synchronous stub on `window` before render that reports a chosen section intersecting — or not — to drive both branches. E2E asserts geometry (content width ≤ 80rem, section box = viewport) and color *relative to the page's own tokens*: read `--color-accent` from `getComputedStyle(document.documentElement)` rather than hardcoding hex, so the assertions hold in either theme. The observer fires its callbacks for adjacent sections in one batch (sections share an edge), so the handoff — old heading un-reds as the new one reds — lands in a single frame.

## Alternatives considered

- **`max-width: 80rem; margin-inline: auto` on `.section-grid`** — one line, but it bounds the section *boxes*, so the hairline rules stop at the measure and the swiss "full-bleed rule" grammar breaks. Rejected.
- **A measure wrapper `<div>` inside each section** — keeps rules full-bleed with a bounded inner box, but is DOM surgery across five sections and every section test. Rejected: padding achieves it with no DOM change.
- **Growing `--grid-margin`** — `vw`-scaled margins never cap; an ultrawide still stretches. Rejected.
- **CSS scroll-driven animations (`animation-timeline: view()`)** — zero JS. Rejected: a discrete attribute flip + `transition` is testable in jsdom, rides the Nav IO precedent, and doesn't gamble on per-engine support.
- **GSAP/ScrollTrigger color tween** — rejected outright: the 2026-08-31 motion reset removed ScrollTrigger deliberately; GSAP stays ticker-only.
- **A shared singleton active-section store** (one observer feeding nav + all headings) — elegant, but per-hook observers are the established Nav pattern, trivially testable in isolation, and five IOs cost nothing. The *band constant* is what needs sharing; that is what we share.
- **Latched red (stays once visited)** — rejected as default: a live indicator agrees with the nav and keeps "at most one red" trivially true. Owner can flip later (spec open question).

## File map

| Path | Action | Purpose |
|------|--------|---------|
| `specs/measure-and-heading-accent/{spec,plan,tasks}.md` | create | this triplet |
| `src/styles/global.css` | edit | `--grid-max-width` + `--grid-inline` tokens; `.section-grid` `padding-inline` → `var(--grid-inline)` |
| `src/components/Nav/Nav.module.css` | edit | `padding-inline` → `var(--grid-inline)` (nav aligns to the measure) |
| `src/hooks/useSectionActive.ts` | create | `ACTIVE_BAND` export + `useSectionActive(id)` (IO, jsdom guard, cleanup) |
| `src/hooks/useSectionActive.test.tsx` | create | stubbed-IO behavior: activates, deactivates, guards, disconnects |
| `src/components/Nav/Nav.tsx` | edit | observer band → `ACTIVE_BAND` import (behavior unchanged) |
| `src/components/Nav/Nav.test.tsx` | edit | only if the mock surface changes |
| `src/sections/{Experience,Education,Publications,Technologies}/<S>.tsx` | edit | `useSectionActive(id)` → `data-active` on the `<h2>` |
| the four section `.module.css` sheets | edit | `.heading` color transition + `[data-active='true']` accent + reduced-motion off |
| the four section `*.test.tsx` | edit | stubbed-IO render: `data-active` in both states |
| `src/styles/global.test.ts` | edit | measure token/formula contract + heading-accent contract across the four sheets |
| `tests/e2e/measure-and-accent.spec.ts` | create | measure geometry, nav alignment, heading color journey, one-red, reduced motion |
| `tests/e2e/{swiss,portfolio,typography-theme}.spec.ts` | edit | only if wide-viewport assumptions break |

## Test plan

- **Unit/component** (Vitest):
  - `useSectionActive.test.tsx` — with a synchronous IO stub: returns `true` when its section intersects, `false` when it leaves; stays `false` when `IntersectionObserver` is undefined (jsdom); `disconnect()` called on unmount.
  - Four section tests — with the stub reporting the section active/inactive, the `<h2>` carries/lacks `data-active="true"`; heading markup otherwise unchanged.
  - `global.test.ts` — `--grid-max-width: 80rem`; `--grid-inline` matches the `max(...)` formula; `.section-grid` and `.nav` consume `var(--grid-inline)`; each of the four sheets carries `.heading { … transition: color … }`, `[data-active='true'] { … var(--color-accent) }` (and **not** `--color-accent-strong`), and a reduced-motion `transition: none`.
- **E2E** (Playwright, `measure-and-accent.spec.ts`):
  - 1920×1080 — `#experience` box spans the viewport (rule full-bleed); its `.entries` content box is 1280px, centered; the nav list's left edge equals the measure's left edge; the hero poster ≤ 1280px.
  - 1280×720 — `.entries` width = viewport − 2·`--grid-margin` (today's layout, unchanged).
  - Scroll journey — at the top no `h2` is red; scroll each section into the band → its heading color equals the page's `--color-accent` and every other `h2` is ink (one red at a time); scrolling on returns the previous heading to ink.
  - Reduced-motion emulation — the heading still flips color, with `transition-duration: 0s`.

## Risks

- **80rem feels wrong on the owner's display** — one-token retune (90rem / 70rem); nothing else references the value. Record in a dated Changes note.
- **`100%` inside a custom property mis-resolves in some engine** (percentages in unregistered custom properties resolve at the using element — long-standing behavior, but worth proving) — the E2E width assertions catch it immediately; fallback: inline the `max()` directly in the two rules instead of sharing `--grid-inline`.
- **Band handoff flicker** (old heading un-reds a frame before the new reds) — adjacent sections share an edge so the crossing should be atomic; if a gap shows in practice, latch the heading to the last activated section (the spec's open-question variant) rather than widening the band.
- **Existing E2E width assumptions** — `swiss`/`portfolio`/`typography-theme` specs may assert full-width content; fix by asserting against the measure, never by loosening the token.
