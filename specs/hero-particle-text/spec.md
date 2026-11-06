# Spec: hero particle text

> The hero name becomes React Bits' Particle Text wordmark ("vortex" preset).

## User stories

- As a **visitor**, I want the big name to spiral in from particles and scatter away from my cursor so that the poster feels alive.

## Acceptance criteria

- [x] The h1 still has the accessible name `profile.name` — `src/sections/Hero/Hero.test.tsx`.
- [x] The name renders on a canvas next to the single theme backdrop canvas — `src/App.test.tsx`, `tests/e2e/swiss.spec.ts`.
- [x] The h1 stays flush-left, bottom-anchored, with tight tracking — `tests/e2e/swiss.spec.ts`.

## Out of scope

- Role/meta lines.

## References

- https://reactbits.dev/c/text-animations/particle-text?highlightColor=8e8e98&gatherDuration=2600&stagger=650&scatter=180&burstStrength=1.7&pointerRepel=60&repelRadius=150&idleDrift=1.3&density=2&glow=false&preset=vortex
