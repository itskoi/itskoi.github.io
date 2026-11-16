# Spec: Koidoro quick start

> Start and stop sessions from under the timer while the panel is hidden.

## User stories

- As a **Koidoro user** with the panel hidden, I want **buttons by the timer** so that I can start a session without opening the panel.

## Acceptance criteria

- [x] With the panel hidden and no session, Start Work, Start Break and Start Long break sit under the timer; each starts that kind at its configured length, Work with the tree picked last, and the suggested kind stands out — `src/pomo/App.test.tsx`.
- [x] During a session the same spot offers Abandon (Work) or End break, which behave as the panel's buttons do — `src/pomo/App.test.tsx`.
- [x] With the panel open the quick buttons are gone, so no control shows twice — `src/pomo/App.test.tsx`.

## Out of scope

- Picking a tree from the quick buttons.
