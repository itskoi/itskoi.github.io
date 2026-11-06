# Spec: pomo route

> Host the Koidoro pomodoro timer at `/pomo/` on the portfolio domain.

## User stories

- As **Khoi**, I want my pomodoro timer at `itskoi.github.io/pomo` so that I can use it without a separate deploy.

## Acceptance criteria

- [x] `/pomo/` renders the Koidoro app (heading "Koidoro", a start button) — `tests/e2e/pomo.spec.ts`.
- [x] The portfolio at `/` is unchanged and does not load Koidoro code or styles — separate Vite entry; existing e2e suite.
- [x] Koidoro's own unit tests run in this repo's `bun run test`.

## Out of scope

- Linking `/pomo` from the portfolio nav.
- Sharing theme tokens or fonts with the portfolio.
- Keeping `../koidoro` and `src/pomo/` in sync automatically.

## References

- Source app: `../koidoro` (its own `openspec/` holds the timer's behavior specs).

## Changes

- **2026-11-06** — Koidoro now lives only in this repo: `src/pomo/` is the source of truth (synced from `../koidoro` one last time), and its behavior specs moved to `specs/koidoro/`. The "keep in sync" out-of-scope item and the drift risk in `plan.md` no longer apply.
