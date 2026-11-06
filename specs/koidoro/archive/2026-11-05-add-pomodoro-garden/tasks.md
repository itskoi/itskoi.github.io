# Tasks

## 1. Project setup

- [x] 1.1 Add `package.json` with the `dev`, `build`, `preview`, `check`, `test`, `lint`, and `format` scripts and the dependency versions from `itskoi.github.io`, limited to React, Vite, TypeScript, Biome, Vitest, jsdom, and Testing Library, and verify `bun install` succeeds
- [x] 1.2 Add `tsconfig.json`, `vite.config.ts` (including the Vitest jsdom settings), `biome.json` (same style rules, excluding `.claude` and `openspec`, with Biome's VCS integration off), `.gitignore`, `index.html`, `src/main.tsx`, and a stub `src/App.tsx`, and verify `bun run check`, `bun run lint`, and `bun run build` all pass

## 2. Session rules

- [x] 2.1 Implement the state type, session kind and duration lookup, next-kind order, and growth stage calculation in `src/session.ts`, and verify with `src/session.test.ts` that eight steps give the order Work, Break, Work, Break, Work, Break, Work, Long break, then repeat, and that the stage is immature at every time before the end
- [x] 2.2 Implement start, finish, abandon, and end-break functions in `src/session.ts`, and verify with tests that finishing Work adds a mature tree of the chosen species and advances the cycle, abandoning Work adds a tree of that species at the reached stage without advancing, ending a break advances without adding a tree, start does nothing while a session runs, and starting Work updates `lastSpecies`

## 3. Saving

- [x] 3.1 Implement load and save in `src/storage.ts`, including settling a session that expired while the app was closed, and verify with `src/storage.test.ts` that state round-trips, an expired Work session comes back as a mature tree, and first launch gives the empty starting state
- [x] 3.2 Handle bad data and failed saves in `src/storage.ts`, and verify with tests that malformed JSON, wrong-shaped JSON, and an unknown species all give an empty state plus a copy under `koidoro.state.corrupt` and a reported problem, and that a throwing `setItem` reports a problem rather than throwing

## 4. Art and garden

- [x] 4.1 Port the cube grid, puff and limb helpers, palettes, and painter from `art-preview.html` to `src/art/cubes.ts`, and verify with `src/art/cubes.test.ts` that the same input gives the same cubes and that, using a fake canvas context, faces hidden by a neighbouring cube are not painted
- [x] 4.2 Port the six species at all four stages to `src/art/trees.ts`, and verify with `src/art/trees.test.ts` that every species and stage gives a non-empty grid and that each stage has more cubes than the seed stage of that species
- [x] 4.3 Port the six pets to `src/art/pets.ts`, and verify with `src/art/pets.test.ts` that every pet has body, head, tail, and eyelid parts and that the Golden retriever has a tongue part
- [x] 4.4 Port plots, decorations, and the watering can to `src/art/decor.ts`, and add `src/art/Sprites.tsx` to render all art once in a shared `<defs>`, then verify `bun run check` and `bun run build` pass (how it looks is checked in 7.2)
- [x] 4.5 Implement `src/garden-layout.ts`, and verify with `src/garden-layout.test.ts` that across 300 trees no two things share a plot, adding a tree moves no earlier tree or decoration, the first meadow, pond, and rocks arrive at 7, 16, and 18 trees, each pet arrives at its specified count, and no tree stands in front of any pet
- [x] 4.6 Implement `src/Garden.tsx` from the layout, with animated pets, koi, butterflies, and birds, the empty-garden message, and shrink-then-scroll sizing at 28 pixels per plot, and verify with `src/Garden.test.tsx` that every tree is labelled with its species and stage, animals appear only once they have arrived, and the empty message appears
- [x] 4.7 Add the keyboard behaviour and watering overlay to `src/Garden.tsx`, and verify with `src/Garden.test.tsx` that the garden has one Tab stop, arrow keys move through planting order, and Enter and Space water a tree without changing the trees passed in
- [x] 4.8 Add the animation styles, the pause control, and the `prefers-reduced-motion` rules, and verify with `src/App.test.tsx` that the pause control toggles the paused state and is reachable by keyboard

## 5. Timer screen

- [x] 5.1 Add `src/ticker.worker.ts` and wire it into `src/App.tsx` so the countdown is recalculated from `endsAt` on each tick and the session finishes at its end time, then verify with `src/App.test.tsx` using a stubbed `Worker` that a tick after the end time moves to the next session
- [x] 5.2 Build the waiting, Work, and break views in `src/App.tsx`, including the tree picker, Start, the growing tree, Abandon with `window.confirm`, End break, and the warning messages from saving, and verify with `src/App.test.tsx` that the garden shows only during breaks, the picker shows only before Work with the last tree preselected, a declined confirm keeps the session running, and a confirmed abandon returns to waiting for Work
- [x] 5.3 Save on each state change and apply `storage` events from other tabs in `src/App.tsx`, and verify with `src/App.test.tsx` that a dispatched `storage` event updates the screen and that a reload (remounting the app) resumes the running session
- [x] 5.4 Move the title and controls into a sidebar beside a stage that fills the rest of the screen, float the timer at the top centre of the stage, and verify with `src/App.test.tsx` that the garden and timer are in the stage and the controls are not, and in a headless browser that the page does not scroll sideways and plots stay at least 28 pixels wide
- [x] 5.5 Replace the "next session" heading with Work, Break, and Long break buttons that start with the next session in the cycle selected, and verify with `src/session.test.ts` and `src/App.test.tsx` that the chosen kind runs, the cycle carries on from it, and the buttons show only while waiting
- [x] 5.6 Add `src/settings.ts` and a collapsible `src/SettingsPanel.tsx` for each kind's time, and verify with `src/settings.test.ts` and `src/App.test.tsx` that times are used and saved, bad values fall back, a running session is unaffected, and a garden saved before settings existed opens with no warning
- [x] 5.7 Add six gradient background schemes, and verify with `src/App.test.tsx` that the chosen scheme applies, survives a reload, and follows other tabs
- [x] 5.8 Set the title to Pixelify Sans in the highlight colour and add a divider under the session buttons or session name, and verify in a headless browser that the font loads and the title reads well in light and dark mode

## 6. Alerts

- [x] 6.1 Implement `src/alert.ts` with the Web Audio beep and tagged notification, each guarded on its own, and verify with `src/alert.test.ts` that a missing `Notification`, a throwing `Notification`, and a throwing `AudioContext` do not throw, and that the notification text names the next session kind
- [x] 6.2 Call the alert only from the worker-tick ending and set up sound and permission on the Start click, and verify with `src/App.test.tsx` that a tick-driven ending alerts, while abandon, end break, and an expired session found on load do not, and that permission is requested only while it is `default`
- [x] 6.3 Add the Start sound, a session-end chime that rises before Work and falls before a break, and a water-drop sound when watering, and verify with `src/alert.test.ts`, `src/Garden.test.tsx`, and `src/App.test.tsx` that each plays at the right time and that abandon, end break, and an expired session found on load stay silent
- [x] 6.4 Add a choice of end-of-session sounds, including no sound, with a preview on choosing, and verify with `src/alert.test.ts` and `src/App.test.tsx` that each keeps the rising and falling tunes and that no sound still notifies

## 7. Final checks

- [x] 7.1 Run `bun run check`, `bun run test`, `bun run lint`, and `bun run build`, and verify all pass
- [x] 7.2 Ask the user to run `bun run dev` and check in a real browser that the sound and notification arrive on time with the tab in the background, that the start, watering, and all end-of-session sounds are pleasant and at a good volume, that the timer and garden read well on every background scheme, that the page keeps working after a reload mid-session, that the trees, decorations, and pets match `art-preview.html`, that pets and watering animate smoothly, and that the pause control and reduced-motion setting stop animal movement, since jsdom cannot test these

## Workflow follow-up

- Archive the change once the user has done the browser check and is happy with the result.
