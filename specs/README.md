# Specs

This directory holds Spec-Driven Development (SDD) artifacts. Every non-trivial feature in `src/` is paired with a spec folder here.

## Workflow (Anthropic 4-phase)

```
Explore → Plan → Implement → Commit
```

1. **Explore** — read the relevant `src/` files and any existing `specs/<feature>/`. Don't write code yet.
2. **Plan** — copy `specs/_template/` to `specs/<feature>/` and fill in the three docs:
   - `spec.md` — WHAT and WHY (user stories, acceptance criteria). No implementation here.
   - `plan.md` — HOW (technical design, alternatives considered, trade-offs).
   - `tasks.md` — A checklist of small, verifiable tasks. Each task maps to one or more tests.
3. **Implement** — for each task in `tasks.md`:
   - Write a failing test (Vitest unit/component or Playwright E2E).
   - Implement the minimum code that makes the test pass.
   - Refactor with the safety net green.
   - Tick the task off in `tasks.md`.
4. **Commit** — one commit per task or coherent unit. Reference the spec path in the commit message, e.g. `feat(hero): add parallax (spec: specs/hero-parallax)`.

## Rules

- **No new feature code without a spec triplet.** Bug fixes for regressions also warrant a small spec; pure refactors don't.
- **Spec docs are immutable after implementation starts.** If scope changes, append a "Changes" section with a dated note rather than rewriting history.
- **Acceptance criteria must be testable.** Each criterion in `spec.md` maps to at least one test.
- **Tasks must be small.** If a task in `tasks.md` takes more than ~30 minutes, split it.

## Folder layout

```
specs/
├── README.md            ← you are here
├── constitution.md      ← project-wide principles (always loaded)
├── _template/           ← copy this for a new feature
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
└── <feature>/           ← e.g. hero-parallax/
    ├── spec.md
    ├── plan.md
    └── tasks.md
```

When a feature ships and is no longer being iterated on, leave its folder in place — it serves as design history.
