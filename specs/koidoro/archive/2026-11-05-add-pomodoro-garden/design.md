# Design

## Context

The project is empty, so this sets the structure for everything after it. See `proposal.md` for motivation and `specs/` for behavior. Tooling matches `itskoi.github.io`: the same scripts and the same Biome style. There is no backend, and the app is one screen, so it needs no router or state library.

The approved art is in `art-preview.html` in this folder, and is the starting point for the art code. Its sample trees and sliders are preview-only and do not carry over.

## Goals / Non-Goals

**Goals:**

- Keep session rules and plot placement in pure modules that can be tested without a browser.
- Stay accurate and alert on time in a background tab, and survive reloads.
- Keep the garden smooth as it grows to hundreds of trees.

**Non-Goals:**

- Alerts while the page is closed or suspended, which would need a push service and a backend.
- Pausing a session, a countdown in the tab title, statistics, and offline install.
- Animals that walk, and placing or earning decorations by hand.
- A mute control for every sound, ambient sounds, and pet noises.

## Decisions

### All state is one plain object, changed by pure functions

`src/session.ts` holds the state and the functions that change it, used through `useReducer`. Each function takes the current time as an argument, so tests need no fake clocks.

```ts
type Species = 'phuong' | 'mai' | 'dao' | 'da' | 'tre' | 'dua'
type Tree = { plantedAt: number; stage: number; species: Species } // stage 3 is mature; plantedAt also identifies it
type Session = { startedAt: number; endsAt: number; species: Species | null } // null during breaks
type State = { step: number; session: Session | null; trees: Tree[]; lastSpecies: Species }
```

- `step` (0 to 7) is the position in the eight-step cycle. Odd steps below 7 are Break, 7 is Long break, and even steps are Work, so the session kind is always derived rather than stored.
- Starting a session the user chose moves `step` to the first step of that kind, so the kind stays derived and the cycle carries on from there.
- Finishing a session or ending a break early moves `step` forward. Abandoning Work leaves it alone, which gives the "next session is Work again" rule without a special case.
- A tree is only stored when its session ends. While the session runs, its stage is calculated from `startedAt` and `endsAt`, so a reload needs no extra handling.
- `lastSpecies` starts as `phuong` and updates when a Work session starts, which gives the preselected choice.
- `trees` is only ever appended to, so its order is the planting order that plot placement depends on.

*Alternative:* a separate store for trees and timer. Rejected because the two change together when a session ends, and one object saves atomically.

### Growth stages come from elapsed time

There are three immature stages, one for each third of the session, and stage 3 for mature. Only reaching the end time gives stage 3, so an abandoned tree can never be mature, even in the last second. If the end time passes while the abandon dialog is open, confirming counts as a completed session, because the session did run to its end.

### Time comes from a saved end time, with ticks from a Web Worker

The time left is always `endsAt - Date.now()`. A small dedicated worker (`src/ticker.worker.ts`) posts a message every second while a session runs, and the app recalculates and ends the session when each message arrives.

*Alternative:* `setInterval` on the page. Rejected because Chrome slows page timers in hidden tabs to about once a minute, so the alert could be up to a minute late. Dedicated workers are not slowed this way, and using one mechanism for both the display and the ending avoids a second code path.

### Alerts are decided at the moment of ending

Only the worker tick path alerts. On load, an expired session is settled through the same function but with no alert, and user actions never alert. The soft Start sound is feedback for the click, not an alert. `src/alert.ts` handles the two channels independently, each in its own `try`/`catch`, so one failing cannot stop the other or the timer.

- **Sound:** short oscillator notes through Web Audio, so there is no audio file. The `AudioContext` is created on the Start click, because browsers block sound without a click. Start plays a soft click. The session-end chime rises before Work and falls before a break, so it says what is next without looking.
- **Notification:** `new Notification` with a fixed `tag`, so two tabs show one notification rather than two. Permission is requested on the Start click if it is still `default`.

### Settings are saved apart from the session state

`src/settings.ts` keeps the three times, the end sound, and the background scheme under `koidoro.settings`. A separate key means gardens saved before settings existed stay valid, and a bad value only costs a preference, so each bad field falls back to its default with no warning and no backup. Times are whole minutes from 1 to 180, and only valid typed values are kept.

A session's `endsAt` is fixed when it starts, so changing a time never affects a running session. `src/SettingsPanel.tsx` is a native `<details>`, which is collapsible and keyboard accessible with no extra code. Every end sound keeps the rising and falling tunes, and choosing one plays it as a preview.

Background schemes are `data-scheme` CSS rules that set the gradient and the colours drawn over it, including the timer, its glow, the plot shadows, and the birds. The gradient covers the whole page, and the sidebar is translucent over it. Each scheme sets its own colours whatever the system's dark mode says.

### Saving goes through one small module

`src/storage.ts` reads and writes one JSON value under `koidoro.state`, using a `useEffect` that saves on every state change.

- **On load:** the value is validated by checking its shape field by field, including that each species is one of the six. If it is invalid, the raw text is copied to `koidoro.state.corrupt` before starting empty, and the page says so. If that copy fails, saving stops for the rest of the visit, so the only copy is not overwritten.
- **On save failure:** the error is caught, the app keeps running from memory, and the page shows a warning.
- **Other tabs:** a `storage` event listener replaces the state with what another tab saved. Writing an identical value fires no event, so tabs cannot loop.

*Alternative:* IndexedDB. Rejected because the data is small and a single synchronous value is much less code.

### Art is drawn from cubes in code, in layers of responsibility

There are no image files. The modules in `src/art/` are ported from `art-preview.html`:

- `cubes.ts`: a grid of small cubes, helpers that fill it with soft puffs and tapering limbs, the colour palettes, and the painter that draws a grid onto a canvas, back to front, skipping hidden faces.
- `trees.ts`: the shape of each of the six species at each of the four growth stages.
- `pets.ts`: the six pets, each built from separate parts (body, head, tail, ears, eyelids, and the Golden retriever's tongue) so that the parts can move.
- `decor.ts`: plots, ponds, rocks, meadows, the buffalo, the egret, and the watering can, drawn as SVG paths.
- `Sprites.tsx`: paints each cube grid once to a canvas, converts it to an image, and renders everything in one `<defs>` block that the garden and Work view reuse through `<use>`.

Everything is deterministic, seeded by coordinates rather than `Math.random`, so a tree looks the same on every load.

*Alternative:* one SVG path per cube face. Rejected because a single mature tree has thousands of faces, which would slow a large garden, while a drawn image costs one element per tree.

*Alternative:* drawing the whole garden to one canvas. Rejected because trees need to be focusable, labelled for screen readers, and individually animated, and SVG elements provide all of that for free.

### Plot placement is a pure function of the tree count

`src/garden-layout.ts` takes the list of trees and returns every plot: its position, and whether it holds a tree, a decoration, a pet, or plain grass. Nothing about placement is saved, so the same tree list always gives the same garden.

- **Spiral:** plots run ring by ring from the centre. Decorations sit at fixed spiral positions on the front edges of each ring, and trees skip them.
- **Grass:** any free plot touching a used plot is plain grass, which softens the edge of the garden.
- **Pets:** the pets that have arrived are spread evenly across grass plots with nothing in front of them. Because the front of the garden moves as it grows, a pet's plot can change between breaks, which is the one exception to things staying put. This is what stops a tree hiding a pet.

The drawing order sorts by `gx + gy`, so nearer things always cover farther ones.

### Animal movement is CSS only

Tails, heads, ears, eyelids, koi, butterflies, and birds animate with CSS keyframes, each around its own joint through a nested transform. Each pet gets a different negative `animation-delay`, so they never move in unison. The three cats share one rig but have their own tail rhythm and head movement. Pause lasts across breaks until a reload.

All animated elements share a `life` class, so the pause control only has to set `animation-play-state`, and a `prefers-reduced-motion` rule only has to set `animation: none`. Pet parts rest in a sensible pose with animation off, and eyelids rest fully open.

### Screens are chosen from state, and abandoning uses native confirm

Every view is the same layout: a sidebar with the title and controls, beside a stage that fills the rest of the screen, with the timer floating at the top centre of the stage. On a narrow screen the stage sits above the sidebar. `src/App.tsx` shows one of three views: waiting (Work, Break, and Long break buttons with the next session in the cycle selected, and Start, plus the tree picker and that tree's seed when Work is selected, or a short message when a break is selected), Work (session name, growing tree, Abandon), or break (session name, garden, pause control, End break). The title is Pixelify Sans in the highlight colour, and a divider sits under the session buttons or session name. Abandon uses `window.confirm`, because a misclick would permanently cost the tree its maturity, and a native dialog is accessible with one line of code.

### Trees are SVG buttons with one Tab stop

Each tree in `src/Garden.tsx` is a `<g role="button">` with a label naming its species and stage. A roving `tabindex` makes the whole garden one Tab stop, and arrow keys move through planting order, so a big garden never means hundreds of Tab presses.

Watering is a temporary overlay on that tree: a watering can tilts, drops fall, and the soil darkens and fades. It lives only in component state, so nothing is saved. A short run of water-drop notes plays in time with the falling drops. With reduced motion, the can and drops appear and fade without moving.

## Risks / Trade-offs

- [Painting all sprites at load delays the first screen] → The preview loaded in about 0.7 seconds in a headless browser. If real devices feel slow, build sprites only when a break starts, or cache them.
- [A very large garden could still slow down, since each tree adds elements and animals repaint nearby areas] → The preview held 60 frames per second with 120 trees, though only in a headless browser. Check real use as the garden grows, and draw the plots to one image if needed.
- [Long sideways scrolling in a huge garden] → Accepted for now. Add drag-to-pan if it feels bad.
- [jsdom has no canvas, so tests cannot check how art looks] → Tests cover the cube grids and plot placement, and mock `Sprites.tsx` in component tests. How the art looks is part of the user's browser check.
- [A pet's plot can change between breaks as the garden grows] → Accepted, because it keeps every pet visible and they never walk on screen.

- [Closing the laptop during a session counts as time elapsed, so it can complete a Work session and mature the tree] → Accepted. This is a personal app, and the end time is what keeps the timer accurate.
- [Browsers can suspend a page entirely, as mobile browsers do, so no alert fires until it wakes] → Accepted and listed as a non-goal. The session is still settled correctly on return.
- [Android Chrome throws on `new Notification`] → Caught, so sound and the on-page state still work.
- [Sound is blocked if the page was reloaded mid-session with no click since] → The notification and on-page state still work, and this is covered by the specs.
- [Two open tabs may both play the sound if both reach the end before seeing the other's save] → Accepted as harmless. The saved result is identical either way, because a tree is identified by its `plantedAt`.
- [Clearing site data erases the garden] → Accepted for now. Export or sync can be a later change.
- [A tree fully hidden behind nearer trees cannot be clicked] → Accepted, because it can still be reached and watered by keyboard.
- [No new decorations appear after spiral position 106, at around 95 trees] → Accepted, matching the approved preview. Trees and pets carry on as normal.
- [Fonts come from Google Fonts] → They fall back to system fonts offline, so the app still works.
- [Choosing a Long break early as often as wanted skips the four-session rhythm] → Accepted. This is a personal app, and the choice is the user's.
