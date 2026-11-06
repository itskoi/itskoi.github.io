# Plan: hero particle text

## Approach

Vendor the TS + CSS variant of React Bits' `ParticleText` into `src/components/ParticleText/` (no deps; canvas + rAF, honors reduced motion, pauses off-screen). Changes from upstream: CSS Module, named export, no `min-height`, and particles are placed flush-left instead of centered. Props are the demo's `vortex` preset (`intro="spiral"`, `shape="circle"`) with the link's overrides, then red (`highlightColor="var(--color-accent)"`, resolved by the component since canvas can't read CSS variables), `particleSize=2.2`, and a raised particle cap so density 2 isn't thinned. `fontSize="1em"` inherits `--fs-display` from the h1. The h1 is `1em` tall, like the original text line; the canvas overhangs it by 30% top and bottom so the spiral intro isn't clipped.

## Alternatives considered

- **`npx shadcn add`** — pulls the Tailwind variant. Rejected: no Tailwind here.
- **Tech Text** — tried first, replaced at the user's request.

## File map

| Path | Action | Purpose |
|---|---|---|
| `src/components/ParticleText/*` | create | vendored component |
| `src/sections/Hero/Hero.tsx`, `.module.css` | edit | use it for the name |
| `src/App.test.tsx`, `tests/e2e/swiss.spec.ts` | edit | page now has two canvases |

## Overhang

The particle container is absolutely positioned with negative insets equal to its padding (`--bleed-y: 3em`, `--bleed-x: 1.5em`). The component lays the text out in the content box, which is the h1, and particles fly through the padding. A two-gradient `mask-image` on the component's canvas fades its edges so off-canvas particles dissolve. The container is `pointer-events: none` so the links underneath stay clickable, and the component tracks the pointer on `window`. Bursts only fire on presses inside the text box. `.hero` gets `overflow-x: clip` so the bleed can't cause horizontal scroll.

## No intro

The appear animation was removed at the user's request. Upstream has no option for that, so `intro` gains a `'none'` value: no intro on mount, and `startIntro` does nothing. The overhang stays for click bursts and pointer repel.
