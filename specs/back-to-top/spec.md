# Spec: back-to-top

> WHAT we are building and WHY.

## User stories

- As a **reader deep in the page**, I want **one click back to the top** so that **I don't have to scroll the whole way up**.

## Acceptance criteria

- [x] AC1. A "Back to top" button is hidden on the hero and appears once a section (Experience onward) reaches the band. — `src/components/Nav/Nav.test.tsx` "shows Back to top only once a section is active"
- [x] AC2. Clicking it smooth-scrolls to the top through Lenis, and it hides again there. — `Nav.test.tsx` "Back to top scrolls to the top"; `tests/e2e/portfolio.spec.ts` "Back to top returns to the hero"
- [x] AC3. It sits fixed in the bottom-right corner, clear of the phone's safe area, in both themes, with a visible focus ring. — `tests/e2e/portfolio.spec.ts` "Back to top returns to the hero"

## Out of scope

- Moving keyboard focus to the top of the page.

## References

- Nav's smooth scroll (`src/lib/lenis.ts`), `useActiveId` (`src/hooks/useSectionActive.ts`).
