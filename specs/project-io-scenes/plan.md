# Plan: project-io-scenes

> HOW. Approach, alternatives, file map, test plan.

## Approach

**Layout.** A stepped scene is one SVG with four parts top to bottom: the input card, a red system box, an "OUTPUT" label and the output card. A scene is described as data (`name`, input blocks, steps, output). Each step has a title, an optional note or failure, and a `Draw` component that draws inside a 440 × 112 stage at the box's top.

**Timeline.** `ProjectScene` keeps a step index in React state: `-1` is the input, `0…n-1` the steps, `n` the result. While the scene is active and not paused, a timeout moves the index on after each step's duration (1.6 s, 2.2 s for a step with a retry, 1.1 s for the input). Becoming active resets it to `-1`. The current step's group is keyed by index, so React mounts a fresh group and its CSS build-ins play again. Back and Next set the index directly. Pause stops the timeout and freezes any build-in mid-frame (`animation-play-state`).

**Result.** At index `n`, the box shows the numbered step list with checks (and the retry mark on the failed step), and the output card mounts below with its own build-ins. Before that, the output area stays empty but keeps its space, so the drawing never resizes.

**Reduced motion.** `prefersReducedMotion()` starts the index at `n` and turns auto-advance off. Back and Next still work. The CSS already drops every build-in.

## Motion decisions (constitution 7)

- Each step's build-in stays CSS-only, from-states only, under 5 s, never looping.
- New: a JS timeout moves between steps. A full Companion play is about 15 s, so the scene has a Pause control (WCAG 2.2.2) as well as Back and Next.
- Steps swap without a crossfade: the next step's own build-in is the transition.

## Alternatives considered

- **One long CSS timeline, seeked with the Web Animations API** (as in the preview artifact). No React state, but it needs `@keyframes` with percentage stops to hide each step, which breaks the from-state-only contract, and seeking depends on browser animation APIs that jsdom lacks, so it can't be unit-tested.
- **Keep one picture, build in under 5 s.** Seven steps with their own illustrations don't fit in 5 s and stay readable.

## File map

| Path | Action | Purpose |
|---|---|---|
| `src/components/ProjectScene/ProjectScene.tsx` | edit | stepped scene, Companion as data, controls |
| `src/components/ProjectScene/ProjectScene.module.css` | edit | step label, controls, pause freeze |
| `src/components/ProjectScene/ProjectScene.test.tsx` | edit | AC1–AC6 |
| `tests/e2e/experience-scenes.spec.ts` | edit | AC5 in a real browser |
| `specs/constitution.md` | edit | dated note on the step timer |

## Test plan

- **Unit/component** (Vitest, fake timers): input always shown; Next walks the seven step headers in order; result shows the list and answer; auto-advance and reset on re-entry; Pause, Play, Back, Next and the position label; reduced motion opens on the result.
- **E2E** (Playwright): pause Companion, press Next, see "Step 1 / 7"; existing motion checks still pass.

## Risks

- Taller drawing than the old 480 × 440 — mitigation: the stage scales the SVG to fit; the e2e stage geometry test still runs.
- Text overflowing the box — mitigation: the layout matches the preview, where every label was width-checked.

## Changes

### 2026-11-06 — Pause no longer freezes build-ins

Freezing `animation-play-state` on pause left a step paused before its build-in started stuck on its invisible from-state, and every step mounted after it stayed invisible too. Pause now only stops the step timer; each step's build-in (under 2 s) always finishes. The e2e test checks the paused step is fully drawn.

### 2026-11-06 — all seven scenes

The scene data outgrew one file. `marks.tsx` holds the shared drawing marks, `scenes.tsx` the seven scenes as data (input, steps, output, highlights), and `ProjectScene.tsx` only the step player and the figure. Every scene is now stepped, so the static `Drawing` path and the fixed 480 × 440 viewBox are gone; each drawing's height follows its content. Highlights are an HTML list under the controls, so they stay real text.
