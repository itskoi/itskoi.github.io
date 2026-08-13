# Plan: experience-timeline

> HOW. Approved design: center-spine alternating timeline with a scroll-filled spine.

## Approach

A `.timeline` container (`position: relative`) holds three layers:

- `.spine` — faint full-height vertical line at the horizontal center (base rail), `left: 50%; margin-left: -1px` (2px wide) so the `transform` channel stays free for GSAP.
- `.spineFill` — accent line on top, same centering; `scaleY 0→1` scrubbed via `useTimelineFill` (ref on this element).
- `.entries` — the existing `useScrollReveal` container. Each `<article>` is half-width and alternates: `:nth-child(odd)` → left side, right-aligned text (Wao lands left); `:nth-child(even)` → right side, left-aligned text. A `.marker` dot sits on the spine at each entry's inner edge (`right` offset for left entries, `left` offset for right entries).

Period becomes a mono **kicker** above each role. Role / company / highlights content is unchanged.

Motion: reuse `useScrollReveal` (ref on `.entries`, `data-reveal` per article) unchanged. Add `useTimelineFill` — `gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: 'top', scrollTrigger: { trigger: el, start: 'top 50%', end: 'bottom 50%', scrub: true } })` inside `gsap.context`, with `prefersReducedMotion()` guard and `ctx.revert()` cleanup (a direct sibling of `useParallax`). Under reduced motion the fill is skipped; CSS defaults leave the spine as a full accent line.

Responsive: below ~640px a media query collapses to a left rail (spine shifts left, entries full-width right-aligned text, markers to the left edge).

## Alternatives considered

- **Left rail** — more legible for prose-heavy highlights, but owner chose the more dramatic center-spine alternating look.
- **Chronologically-proportioned spacing** — rejected: roles overlap (ITR inside CLC) and there are no numeric dates; would tangle. Even spacing in authored order instead.
- **Inline `useEffect` for the fill instead of a hook** — rejected: the codebase factors each motion concern into a dedicated, tested hook (`useScrollReveal`, `useParallax`, `useHeroIntro`).

## File map

| Path | Action | Purpose |
|---|---|---|
| `src/hooks/useTimelineFill.ts` | create | scrubbed `scaleY` spine-fill hook |
| `src/hooks/useTimelineFill.test.tsx` | create | tween vars, revert-on-unmount, reduced-motion |
| `src/sections/Experience/Experience.tsx` | edit | `.timeline` + `.spine`/`.spineFill` + alternating entries + `.marker`; period kicker |
| `src/sections/Experience/Experience.module.css` | edit | center-spine alternating layout, spine/fill/marker, mobile left-rail collapse |
| `src/sections/Experience/Experience.test.tsx` | edit | keep existing 4 green; add spine/fill/marker presence |

Reused: `useScrollReveal` (`src/hooks/useScrollReveal.ts`), `gsap`/`prefersReducedMotion` (`src/lib/gsap.ts`), the `vi.hoisted`+`vi.mock('@/lib/gsap')` idiom from `useParallax.test.tsx`.

## Risks

- **Alternating halves with variable-height bullets** can look uneven — mitigated by aligning each entry to the top (marker at the role line) and generous row gaps.
- **Marker alignment on the 1px spine** across both sides — handled by offsetting the marker by half its size from the entry's inner edge.
- **Transform conflict** between centering and `scaleY` — avoided by centering via `left`/`margin-left`, not `transform`.
