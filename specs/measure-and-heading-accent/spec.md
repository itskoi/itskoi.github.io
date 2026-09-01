# Spec: measure-and-heading-accent

> WHAT and WHY. Two refinements to the reading experience: (1) hold the content to a centered measure so wide displays stop stretching the grid edge-to-edge; (2) the section you scroll to — e.g. Experience — has its `<h2>` fade to Swiss red while it is the section being read. No implementation here — see `plan.md`.

## Context

Today `.section-grid` (`src/styles/global.css`) spans the full viewport, inset only by `--grid-margin` (`clamp(1.25rem, 5vw, 4rem)`). On a wide display the 12-column grid runs edge-to-edge: entry rows stretch past any comfortable reading width and the page reads as a spreadsheet. The owner wants the content pulled in — not full-bleed.

Section headings are static ink. The owner wants the title of the section you arrive at to fade to red, within the accent discipline of `specs/swiss-redesign`. The site already has a "current section" notion: the nav's IntersectionObserver marks the section crossing a thin mid-viewport band (`-45% 0px -50% 0px`) with a red index bar. The heading accent joins that system rather than inventing a second trigger.

## User stories

- As a **visitor on a wide display**, I want **content held to a centered measure** so the page **reads as a composed column, not a stretched table**.
- As a **visitor**, I want **the section I'm reading to carry a red title** so **my position is announced in the field itself**, not only in the nav.
- As a **motion-sensitive visitor**, I want **the color change without the fade** so the **signal survives with calmer motion**.
- As the **owner**, I want **nav highlight and heading accent to agree** so the **"you are here" system reads as one decision**.

## Acceptance criteria

(testable; each maps to at least one test)

### Content measure

- [ ] A `--grid-max-width` token (`80rem`) is defined, and `.section-grid`'s inline padding grows to center it — the grid's content box never exceeds the measure. — `src/styles/global.test.ts`
- [ ] Below the wide threshold the inline padding is exactly `--grid-margin` — today's layout, pixel-identical. — `src/styles/global.test.ts` + `tests/e2e/measure-and-accent.spec.ts` (computed widths at a 1280px viewport)
- [ ] Above the threshold the content box is centered and exactly `80rem` wide, while the section boxes (and their hairline `border-top` rules) still span the full viewport. — `tests/e2e/measure-and-accent.spec.ts` (1920px viewport)
- [ ] The nav's inline padding uses the same formula, so nav links and the theme toggle align to the measure's edges on wide displays. — `src/styles/global.test.ts` + `tests/e2e/measure-and-accent.spec.ts`
- [ ] The hero caps identically (it is a `.section-grid`): the poster never exceeds the measure. — `tests/e2e/measure-and-accent.spec.ts`

### Heading accent

- [ ] Each content section's `<h2>` (Experience, Education, Publications, Technologies) renders with the active contract (`data-active="true"`) while its section crosses the nav's mid-viewport band, and without it otherwise. — the four section `*.test.tsx` with a stubbed `IntersectionObserver`
- [ ] The active heading color is `var(--color-accent)` — the large-text red (`--fs-h2` ≥ 2.25rem → AA-large in both themes, per the swiss token contract); inactive headings are inherited ink. — `src/styles/global.test.ts` (CSS contract) + `tests/e2e/measure-and-accent.spec.ts`
- [ ] The change is a CSS `color` transition (~400ms ease) on the heading — no JS tweening, no GSAP/ScrollTrigger reintroduction. — `src/styles/global.test.ts` + section source contracts
- [ ] At most one section heading is red at any scroll position. — `tests/e2e/measure-and-accent.spec.ts`
- [ ] Under `prefers-reduced-motion: reduce` the color still switches, instantly (`transition: none`). — `src/styles/global.test.ts` + `tests/e2e/measure-and-accent.spec.ts` (reduced-motion emulation)
- [ ] All existing suites stay green (no backwards-compat shims). — full `bun run check / test / lint / test:e2e`

## Out of scope

- The descent canvas — it stays fixed full-viewport; only the content measure changes.
- The nav's visual design and active-link logic (it only imports the shared band constant).
- The hero `<h1>` — no accent; its red `.role` line already carries the accent.
- Content, copy, section order, and the grid column grammar (headings stay in columns 1–4).
- Any other motion — the 2026-08-31 motion reset stands (GSAP ticker-only).

## Open questions

- **80rem vs 90rem.** 80rem (1280px) bites from ~1408px viewports up — a visible change on laptops; 90rem only guards genuinely wide displays. Default 80rem; retuning is a one-token change — record in a dated Changes note if moved.
- **Live indicator vs latched.** Default: red while the section is active, ink once passed (agrees with the nav's index bar). If the owner prefers "stays red once visited", drop the deactivation branch — the same tests minus the un-red assertions.
- Fade duration (400ms) is taste — tune in review; a visual constant, not a behavior change, so no spec amendment needed.

## References

- Grid + accent discipline: `specs/swiss-redesign/spec.md` (full-bleed hairline grammar, large-text red rule)
- Motion stack: `specs/constitution.md` Changes 2026-08-31 (GSAP ticker-only; ScrollTrigger removed)
- Active-section precedent: `src/components/Nav/Nav.tsx` (band `-45% 0px -50% 0px`, jsdom guard)
- Project principles: `specs/constitution.md`
- Derived from: `specs/_template/`
