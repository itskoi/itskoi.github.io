# Plan: portfolio-redesign

> HOW. The design choices that matter, the file map and the test plan.

## Approach

**Palette.** Replace the dark values in `global.css`. Every component and the canvas already read tokens, so nothing else changes.

**Content.** Rewrite `portfolio.ts`. `ExperienceItem.highlights` becomes `projects` plus optional `context` and `notes`. Each project's `id` names its illustration. Body strings keep the resume's bold through `**`, split in one line at render.

**Scroll tracking.** The nav's IntersectionObserver logic ("the last id crossing `ACTIVE_BAND` wins") moves into `useActiveId(ids)` beside `useSectionActive`, and Nav and Experience both call it. Sharing the band keeps one "you are here" definition, and because the last id wins the stage is never blank in a gap between projects.

**Stage.** A `position: sticky` element is a grid item in the right column on wide screens. On narrow screens the wrapper becomes a block, so the stage is pinned under the nav and text scrolls beneath it: same DOM, same logic, CSS only. All scenes stay mounted and stacked, and the active one crossfades in. `visibility: hidden` takes the others out of the accessibility tree.

**Illustrations.** One inline SVG per project in `ProjectScene`. Colors come from tokens through CSS classes, so theming needs no code. The base CSS draws the finished picture; animations only define `from` with `backwards` fill and a per-element `--d` delay, and they apply only under `[data-active="true"]`. Three things follow from that:

- Replay on re-entry needs no JS.
- Reduced motion is just "no animation", which leaves the finished picture.
- An illustration can't get stuck half-drawn.

## Motion decisions (constitution 7)

- Build-in once on activation, under 5 seconds, then hold, so the diagram can be read and no pause control is needed.
- Vocabulary: `pop` (nodes), `draw` (wires), `grow` (bars), `dim` (rejected candidates), `rerank` (results swap).
- Crossfade 0.3s between scenes.
- Each story follows the resume: claims before reply, funnel from templates to fitted meals, tasks ticked before E2E, the search result reranked, the old lookup bar taking visibly longer than the new one, noise resolving to an image.

## Honesty rules for the illustrations

Drawn from resume text only. Hidden numbers stay out (users, logs, catalog sizes, case, flow and spec counts), as do model names the owner removed. Values like "32 g" are examples, and each caption says "Schematic".

## Alternatives considered

- **GSAP timelines with ScrollTrigger.** Finer control, but the 2026-08-31 reset removed exactly this, and CSS covers a once-only build-in.
- **Lottie or video assets.** A new dependency or heavy files, no theming through tokens, and they would need redrawing for each theme.
- **Inline illustration per project on phones.** Doubles the DOM or needs a resize branch. The pinned stage reuses the desktop structure.
- **Scrub animation to scroll position.** Pretty, but needs JS per element, and stopping mid-scroll leaves half a diagram.

## File map

| Path | Action | Purpose |
|---|---|---|
| `src/styles/global.css` | edit | dark navy and orange tokens |
| `src/data/portfolio.ts` | edit | resume content, `Project`, `SceneId` |
| `src/hooks/useSectionActive.ts` | edit | add `useActiveId` |
| `src/components/Nav/Nav.tsx` | edit | use `useActiveId` |
| `src/sections/Experience/Experience.tsx`, `.module.css` | edit | two-column layout, sticky stage |
| `src/components/ProjectScene/*` | create | the seven illustrations and their motion |
| `src/sections/Education/Education.tsx` | none | content flows from data |
| `tests/e2e/experience-scenes.spec.ts` | create | scroll, sticky, motion, phone |
| existing tests | edit | new palette and content contracts |
| `specs/constitution.md`, `CLAUDE.md` | edit | dated note: the canvas is no longer the only animator |

## Test plan

- **Unit/component:** data contract, `useActiveId`, Experience structure and active scene, scene text alternatives, CSS contract, contrast.
- **E2E:** each project activates its scene, sticky geometry, animations present and absent under reduced motion, themes, phone.
- **By eye:** screenshots of every scene in both themes on desktop and phone.

## Risks

- SVG labels get small on phones. Mitigation: 14-unit text in a 480-wide viewBox, full text alternative.
- Vietnamese diacritics may fall back in Geist. Mitigation: check by eye.
- Long section. Mitigation: `min-height` only on wide screens, tuned by eye.

## Changes

### 2026-11-05 — as built

- Wide-screen text and stage sit directly on the section grid (`.layout { display: contents }`), so the stage starts at the section's top and is already pinned when the first project reaches the band.
- The stage is a plate that bleeds to the viewport edge through a clipped box-shadow, which adds no scrollable overflow.
