# Plan: portfolio-page

> HOW we will implement the spec. Architecture, alternatives, file map, test plan.

## Approach

**Separate content from presentation.** The resume's content is transcribed once into a single typed data module (`src/data/portfolio.ts`). Every section component is a thin, propless presentational component that imports its slice of the data and renders it. This keeps future edits in one place (the data file) and makes each section trivially unit-testable against the data.

**Reuse the smooth-scroll pipeline for navigation.** The Lenis instance is currently created inside `useSmoothScroll` and never exposed. We add a module-level holder in `src/lib/lenis.ts` and a `scrollTo(target)` helper. The `Nav` calls `scrollTo('#section')` on click and `preventDefault`s the native jump. StrictMode-safe because the holder is overwritten (not appended) on each effect run.

**Motion = layered and richer (Decision 2).** Three composable hooks, all transform-only (opacity/translate) so document flow and anchor targets never shift:

- `useScrollReveal(ref, { selector, stagger, y })` — on enter, staggers the matching children in (`opacity: 0→1`, `y: 20→0`, `stagger ≈ 0.08`). Applied to each content section's list/cards.
- `useParallax(ref, { amount })` — drives a `scrollTrigger` with `scrub` that translates the element by `amount` as it passes through the viewport. Used for the Hero content (drifts up and fades as the visitor scrolls away) and optional decorative elements.
- `useHeroIntro(ref)` — a one-shot `gsap.timeline` that staggers name → role → location on mount; paired with the Hero's parallax. Killed on unmount.

All three short-circuit when `prefers-reduced-motion: reduce` is set (the `matchMedia` is read once in `@/lib/gsap` and exported as `prefersReducedMotion`), so content renders statically and no ScrollTrigger/timeline is created. This keeps the site usable for motion-sensitive visitors and gives jsdom a clean no-op path to test.

**Conventions reused, not invented:** CSS Modules per section, `@/*` imports, named exports, co-located `*.test.tsx`, jsdom-safe mocks for `@/lib/lenis` and `@/lib/gsap`.

## Alternatives considered

- **Hardcode content inside components.** Rejected — duplicates the resume into JSX, hard to edit, harder to test. The data module wins on all three.
- **Contact via a React Context instead of a module-level Lenis holder.** Rejected — context adds a Provider and re-renders for a value used in exactly one place (the nav click handler). A module function is simpler and testable.
- **Lenis `data-lenis-scroll-to` attribute + `anchors` option.** Rejected for now — Lenis's anchor handling requires the `anchors` constructor option and is less explicit to test; `scrollTo()` called from an `onClick` is clearer and covered by a unit test. Can revisit.
- **Tailwind / CSS-in-JS.** Rejected by constitution — CSS Modules only.
- **React Router for "pages".** Rejected by constitution — single page, anchor sections.

## Content model (`src/data/portfolio.ts`)

Typed exports, derived verbatim from `docs/resume.tex`:

```ts
export interface Link { label: string; href: string }
export interface ExperienceItem { role: string; company: string; href?: string; period: string; highlights: string[] }
export interface Award { title: string; period: string }
export interface Certification { title: string; issuer: string; period: string; href?: string }
export interface Publication { title: string; venue: string; period: string; authors: string[]; owner: string; doi: { label: string; href: string } }
export interface TechGroup { category: string; tools: string[] }

export const profile: { name; role; location; email; linkedin }      // phone intentionally omitted
export const experience: ExperienceItem[]                            // 4, newest first
export const education: { school; degree; period; gpa; awards: Award[]; certifications: Certification[] }
export const publications: Publication[]                             // 2, newest first
export const technologies: TechGroup[]                               // 6 groups
```

The owner's name in `publication.authors` is matched against `publication.owner` so the component can emphasize it; storing `owner` separately avoids string-matching heuristics.

## File map

| Path                                            | Action | Purpose                                                          |
|-------------------------------------------------|--------|------------------------------------------------------------------|
| `src/data/portfolio.ts`                         | create | Typed content (single source of truth)                           |
| `src/data/portfolio.test.ts`                    | create | Sanity: correct counts, newest-first ordering                    |
| `src/lib/lenis.ts`                              | edit   | Add module-level holder + `scrollTo(target)` helper              |
| `src/lib/gsap.ts`                               | edit   | Export `prefersReducedMotion` (one `matchMedia` read)            |
| `src/components/Nav/Nav.tsx`                     | create | Sticky `<nav>`, four anchor links, click → `scrollTo`            |
| `src/components/Nav/Nav.module.css`              | create | Sticky positioning, layout                                       |
| `src/components/Nav/Nav.test.tsx`                | create | Links render, hrefs correct, click invokes `scrollTo`            |
| `src/hooks/useScrollReveal.ts`                   | create | ScrollTrigger staggered child reveal on enter                    |
| `src/hooks/useScrollReveal.test.ts`              | create | Registers/kills trigger; no-op under reduced motion              |
| `src/hooks/useParallax.ts`                       | create | Scrubbed transform parallax via ScrollTrigger                    |
| `src/hooks/useParallax.test.ts`                  | create | Registers/kills trigger; no-op under reduced motion              |
| `src/hooks/useHeroIntro.ts`                      | create | One-shot staggered name→role→location timeline on mount          |
| `src/hooks/useHeroIntro.test.ts`                 | create | Timeline created/killed; no-op under reduced motion              |
| `src/sections/Experience/Experience.tsx`         | create | Maps `experience[]`                                              |
| `src/sections/Experience/Experience.module.css`  | create |                                                                  |
| `src/sections/Experience/Experience.test.tsx`    | create | Count, order, fields                                             |
| `src/sections/Education/Education.tsx`           | create | School/degree/GPA + awards + certifications                      |
| `src/sections/Education/Education.module.css`    | create |                                                                  |
| `src/sections/Education/Education.test.tsx`      | create |                                                                  |
| `src/sections/Publications/Publications.tsx`     | create | Maps `publications[]`, emphasizes owner name, DOI links          |
| `src/sections/Publications/Publications.module.css` | create |                                                               |
| `src/sections/Publications/Publications.test.tsx`| create |                                                                  |
| `src/sections/Technologies/Technologies.tsx`     | create | Maps `technologies[]`                                            |
| `src/sections/Technologies/Technologies.module.css` | create |                                                               |
| `src/sections/Technologies/Technologies.test.tsx`| create |                                                                  |
| `src/sections/Hero/Hero.tsx`                     | edit   | Real profile (name, role, location); wires `useHeroIntro` + `useParallax` |
| `src/sections/Hero/Hero.module.css`              | edit   | Adjust to new copy; refs on name/role/location for the timeline  |
| `src/sections/Hero/Hero.test.tsx`                | edit   | Assert name + role; intro + parallax wired; reduced-motion path  |
| `src/sections/Placeholder/`                      | delete | Replaced by real content                                         |
| `src/App.tsx`                                    | edit   | Compose Hero + Nav + four sections; drop Placeholder import      |
| `src/App.test.tsx`                               | edit   | No longer references Placeholder; smoke-render the sections      |
| `tests/e2e/smoke.spec.ts`                        | edit   | Update heading assertion to the real name                        |
| `tests/e2e/portfolio.spec.ts`                    | create | Nav click scrolls; sticky persists; all sections + key text present |

## Section anatomy (shared pattern)

Every content section follows the same shape — replicate it, don't re-derive:

```tsx
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { experience } from '@/data/portfolio'
import styles from './Experience.module.css'

export function Experience() {
  const rootRef = useScrollReveal<HTMLDivElement>()
  return (
    <section id="experience" aria-labelledby="experience-heading" className={styles.section}>
      <h2 id="experience-heading" className={styles.heading}>Experience</h2>
      <div ref={rootRef}>
        {experience.map((item) => ( /* … */ ))}
      </div>
    </section>
  )
}
```

`id` matches the nav anchor; `aria-labelledby` ties the landmark to its heading. The four sections differ only in how they map their data slice.

## `scrollTo` wiring (lenis.ts edit)

```ts
let activeLenis: Lenis | null = null

export function createSmoothScroll(): SmoothScroll {
  /* …existing setup… */
  activeLenis = lenis
  return {
    lenis,
    destroy: () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      activeLenis = null
    },
  }
}

export function scrollTo(target: string | number | HTMLElement): void {
  activeLenis?.scrollTo(target)
}
```

`Nav` uses `scrollTo` directly (not via the React hook), so it works regardless of where the hook mounted. `activeLenis` is overwritten each effect run, so StrictMode's mount→unmount→mount leaves a single live instance.

## External links

All resume URLs (Wao app, Google Cloud profile, Coursera/IBM certs, DOIs, LinkedIn) render as `<a href={...} target="_blank" rel="noreferrer noopener">`. Pending Open Question 3 — default is "include all".

## Test plan

- **Unit/component (Vitest, jsdom):**
  - `portfolio.test.ts` — 4 experiences, 2 publications, 6 tech groups; first experience is Wao; first publication is the RIVF'23 paper.
  - One test file per section — asserts presence of role/company/period for Experience, school/degree/GPA for Education, owner-emphasis + DOI for Publications, all categories for Technologies.
  - `Nav.test.tsx` — four links with correct `href`s; clicking a link calls the mocked `scrollTo` with the section id and `preventDefault`s.
  - `Hero.test.tsx` — renders name + role; old copy gone; `useHeroIntro` and `useParallax` are wired; under `prefers-reduced-motion` neither registers a timeline/trigger.
  - `useScrollReveal.test.ts`, `useParallax.test.ts`, `useHeroIntro.test.ts` — each creates its GSAP construct on mount and kills it on unmount; each is a no-op when `prefersReducedMotion` is true (mock `@/lib/gsap`).
- **E2E (Playwright):**
  - `smoke.spec.ts` (updated) — Hero heading is now the real name; Lenis init + wheel-scroll still pass.
  - `portfolio.spec.ts` (new) — nav has 4 links; clicking "Education" makes `#education` enter the viewport (via `scrollTo`); nav stays visible after scrolling; each section's key text is present and reachable.

## Risks

- **Lenis `scrollTo` + ScrollTrigger recalc.** If sections animate height (e.g., reveal expands content), anchor targets shift. Mitigation: reveal uses `opacity`/`translateY` only (no layout shift), so targets are stable.
- **Parallax vs. anchor targets.** A `translateY` parallax on a section *root* would move its `#id` off the scroll target. Mitigation: parallax is applied only to the Hero (no nav anchor) and to decorative *children*, never to a `<section>` that carries a nav `id`.
- **Reduced-motion blank content.** A `gsap.from({opacity:0})` that never plays (because motion is gated off) would leave content invisible. Mitigation: hooks short-circuit *before* creating any animation under `prefersReducedMotion`, so the DOM renders at its natural full-opacity state.
- **StrictMode double-mount leaks.** Each motion hook must kill its timeline/ScrollTrigger on unmount and tolerate mount→unmount→mount. Mitigation: every hook returns a cleanup; covered by the kill-on-unmount tests.
- **jsdom + GSAP.** Motion hooks must mock `@/lib/gsap` (and indirectly ScrollTrigger) so jsdom doesn't choke on real RAF/observer behavior — same pattern already used by `useSmoothScroll` tests.
- **Content drift from resume.** The data file is a one-time transcription; if the resume changes, the data file must be updated manually. Mitigation: a comment at the top of `portfolio.ts` points back to `docs/resume.tex` as source of truth.
