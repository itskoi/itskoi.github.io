# Spec: experience-timeline

> WHAT and WHY. Turn the Experience section from a stacked list into a vertical timeline so the career progression reads as a scannable sequence rather than four disconnected cards.

## Context

Today `src/sections/Experience/Experience.tsx` renders the 4 roles as plain stacked `<article>` cards (flex header of role / company / period, then highlight bullets). The owner wants a **vertical timeline**. Chosen direction (owner-selected): **center spine, entries alternating left/right**.

The `experience` data (`src/data/portfolio.ts`, `ExperienceItem`) has only free-form `period` strings — no numeric dates — and the roles overlap chronologically (ITR sits inside the CLC span). So the timeline uses **even spacing in authored (newest-first) order**, not a chronologically-proportioned axis.

## User stories

- As a **visitor**, I want to **see my career as a vertical timeline** so progression is **scannable at a glance**, not buried in a list.
- As a **visitor**, I want the **spine to fill as I scroll** so the page **feels alive and on-brand** with the rest of the motion.
- As a **motion-sensitive visitor**, I want the **timeline to be calm** (static spine, no scroll-driven fill) under reduced motion.
- As a **mobile visitor**, I want the timeline to **collapse cleanly** so it stays readable on a narrow screen.

## Acceptance criteria

(testable; each maps to at least one test)

- [ ] The section still renders `<h2>Experience</h2>` and exactly 4 `<article>` (one per role, Wao first). — `Experience.test.tsx` (existing, unchanged).
- [ ] Each article keeps an `<h3>` role, a company link (`target="_blank" rel="noreferrer noopener"`) when `href` is present, and a `<ul>` of highlight `<li>`s. — `Experience.test.tsx` (existing, unchanged).
- [ ] The section renders a `.timeline` container with a `.spine` (base rail) and a `.spineFill` (the scroll-filled line). — `Experience.test.tsx`.
- [ ] Each entry has a `.marker` on the spine; there is one marker per entry (4). — `Experience.test.tsx`.
- [ ] `useTimelineFill` scrubs the fill's `scaleY` 0→1 across the section, with `ease: 'none'` and `scrollTrigger.scrub: true`. — `useTimelineFill.test.tsx`.
- [ ] `useTimelineFill` kills its timeline on unmount (`ctx.revert()`). — `useTimelineFill.test.tsx`.
- [ ] Under `prefers-reduced-motion`, `useTimelineFill` registers **no** animation. — `useTimelineFill.test.tsx`.
- [ ] Below the mobile breakpoint, the layout collapses to a left rail (all entries on one side, left-aligned). — manual / visual.

## Out of scope

- Changing role/company/highlight content or order.
- Chronologically-proportioned spacing (entries stay even-spaced, authored order).
- Timeline treatments for other sections (Education, Publications).
- Per-entry click/expand interactions.

## References

- Current section: `src/sections/Experience/Experience.tsx`, `Experience.module.css`
- Reveal infra reused: `src/hooks/useScrollReveal.ts`
- Scrub template for the fill: `src/hooks/useParallax.ts`
- Project principles: `specs/constitution.md`

## Changes (2026-08-02 — interleaved zigzag)

Owner wanted each entry to start at the **previous entry's midpoint** (a denser zigzag) instead of stacking one-below-the-next, so a marker no longer lands flush at the previous entry's end. Implemented in `Experience.tsx` as a `useLayoutEffect` that measures each entry's height and sets a negative `marginTop` so `entry[i].top = center(entry[i-1])`, **clamped** so same-side entries (i and i-2) never overlap (24px floor) — necessary because Wao (tall, 4 highlights) and CLC (shorter, left side) would otherwise collide. Re-measured via `ResizeObserver` + window resize; disabled (margins cleared) under the ≤640px left-rail collapse. Markers stay at the top of their own entry (owner-confirmed), so they land at the previous entry's midpoint wherever it's safe.

## Changes (2026-08-02 — spine fill tracks the reading position)

Owner wanted the spine "pulse" to run **from the start marker to the current reading viewport, keeping the tail** — i.e. the fill grows to wherever you're currently reading, filled portion persisting above. It wasn't doing this: two bugs.

1. **ScrollTrigger wasn't registered when section hooks ran.** `ensureGsapRegistered()` lived in `createSmoothScroll` (an App effect), but React runs child effects first, so `useScrollReveal` / `useParallax` / `useTimelineFill` created their `scrollTrigger` tweens before the plugin was registered — GSAP silently dropped the trigger and the tween played instantly. Fixed by registering eagerly at module load in `src/lib/gsap.ts` (idempotent guard already present). This also restores intended on-scroll reveals and Hero parallax site-wide.
2. **The fill was its own ScrollTrigger trigger.** Since the fill is the element being `scaleY`-transformed, its bbox fed back into the scroll math and collapsed the scrub range (fill snapped 0→1). Fixed in `useTimelineFill` by triggering on the stable parent (`el.parentElement`) instead.

Verified by measurement: the fill's bottom edge now tracks the viewport center exactly as the section scrolls (scaleY 0→1 smoothly), so the filled pulse spans from the start marker to the current reading position, tail kept.
