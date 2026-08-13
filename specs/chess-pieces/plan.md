# Plan: chess-pieces

> HOW. SVG HUD pieces + one motion hook + a fixed backdrop layer.

## Approach

**Outlined glyph via SVG `<text>` stroke.** Drawing chess pieces as hand-authored paths is high-effort and brittle. Instead, render the Unicode glyph (♛ / ♚) as SVG `<text fill="none" stroke="currentColor">` — the browser strokes the glyph outline, giving clean wireframe line-art for free, at any size, colorable via `currentColor`.

**One motion hook owns all three animations** so cleanup is a single `gsap.context().revert()`:
- drift on `[data-piece]` (the HTML wrappers) — slow `x`/`y` yoyo, staggered so the two pieces don't move in lockstep;
- rotation on `[data-ring]` (the SVG `<g>` of ring + ticks) — one clockwise, one counter via direction baked into the tween;
- parallax on `[data-backdrop]` — a scrubbed `y` translate tied to document scroll.

**Fixed background layer, content above.** `ChessBackdrop` is `position: fixed; inset: 0; pointer-events: none; z-index: 0`. `<main>` gets `position: relative; z-index: 1` so text/clicks always win. Nav already sits at `z-index: 10`.

Reuse: `prefersReducedMotion()` from `@/lib/gsap` gates the hook (same pattern as the other motion hooks). No new GSAP registration.

## Alternatives considered

- **Hand-drawn SVG paths for the pieces.** Rejected — chess silhouettes are intricate; glyph-stroke is simpler, scalable, and looks genuinely "wireframe."
- **A separate hook per animation (drift/rotate/parallax).** Rejected — three effects, one lifetime; a single context is simpler to clean up and test.
- **CSS-only animation (keyframes) for drift/rotation.** Viable for the loops, but scroll parallax needs JS (ScrollTrigger), and mixing CSS keyframes + GSAP on the same elements invites transform conflicts. One GSAP context keeps transforms coherent.
- **Foreground pieces.** Rejected by Decision 3 — they'd compete with content.

## File map

| Path                                                       | Action | Purpose                                                  |
|------------------------------------------------------------|--------|----------------------------------------------------------|
| `src/styles/global.css`                                    | edit   | Add `--color-accent-2: #b388ff`; add `main { position: relative; z-index: 1 }` |
| `src/hooks/useChessMotion.ts`                              | create | gsap.context: drift + rotation + parallax; reduced-motion gate |
| `src/hooks/useChessMotion.test.ts`                         | create | Wires all three; kills on unmount; no-op under reduced motion |
| `src/components/ChessBackdrop/ChessPiece.tsx`               | create | SVG: outlined glyph + HUD ring (`[data-ring]`) + ticks + crosshair; `aria-hidden` |
| `src/components/ChessBackdrop/ChessBackdrop.tsx`            | create | Fixed layer; renders Queen (cyan, top-left) + King (violet, bottom-right); `data-backdrop`; uses `useChessMotion` |
| `src/components/ChessBackdrop/ChessBackdrop.module.css`     | create | Fixed positioning, opacity, glow, responsive sizes       |
| `src/components/ChessBackdrop/ChessBackdrop.test.tsx`       | create | Two pieces, glyph/ring/ticks present, aria-hidden, pointer-events none, colors |
| `src/App.tsx`                                              | edit   | Render `<ChessBackdrop />` once, before `<Nav/>`         |
| `tests/e2e/portfolio.spec.ts`                              | edit   | Add a check that the backdrop exists and the Hero heading stays visible |

## ChessPiece anatomy

```tsx
<div className={styles.piece} data-piece style={{ color }}>
  <svg viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false">
    <g data-ring>
      <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      {/* targeting ticks at N/E/S/W */}
    </g>
    {/* faint crosshair */}
    <text x="60" y="80" textAnchor="middle" fontSize="66" fill="none" stroke="currentColor" strokeWidth="1.2">{glyph}</text>
  </svg>
</div>
```

`data-ring` wraps only the ring + ticks so the **glyph stays upright** while the ring rotates. Drift moves the whole `.piece` wrapper; parallax moves the backdrop container.

## Motion wiring (useChessMotion)

```ts
const ctx = gsap.context(() => {
  gsap.to('[data-piece]', { x: '+=22', y: '+=16', duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.6 })
  gsap.to('[data-ring]',  { rotation: 360, duration: 40, ease: 'none', repeat: -1, transformOrigin: 'center' })
  gsap.to('[data-backdrop]', { y: 90, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.5 } })
}, root)
```

(Second ring spins counter-clockwise by passing `rotation: -360` per-instance in the component, or by staggering direction — implementation detail; the test only asserts rotation is wired.)

## Test plan

- **Unit/component (Vitest, jsdom):**
  - `useChessMotion.test.ts` — `gsap.to` called with `[data-piece]`, `[data-ring]`, `[data-backdrop]`; `ctx.revert()` on unmount; no `gsap.to` under reduced motion (mock `@/lib/gsap`).
  - `ChessBackdrop.test.tsx` — two `[data-piece]`; Queen glyph ♛ and King glyph ♚; `[data-ring]` + ticks present; `aria-hidden`; backdrop has `pointer-events: none` (via computed style or class); Queen color resolves to the cyan token, King to violet.
- **E2E (Playwright):** backdrop SVG present after load; Hero h1 still visible (content above backdrop).

## Risks

- **Transform conflicts.** Drift sets `x/y` on `.piece`; parallax sets `y` on the backdrop container (an ancestor). Different elements → no conflict. Rotation is on the SVG `<g>`, separate again.
- **Readability.** Low opacity (0.18) + pointer-events none keeps content clear. Tunable via the CSS var later.
- **Perf.** Two small SVGs + three lightweight GSAP tweens is negligible. Rings rotate via transform (GPU-friendly).
