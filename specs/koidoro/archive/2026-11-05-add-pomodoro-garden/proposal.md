# Proposal

## Why

A plain pomodoro timer gives nothing back once a session ends. Koidoro turns each Work session into a tree that stays in a personal garden, so focus time builds into something worth visiting on a break. The project is empty, so this first change delivers the whole usable app.

## What Changes

- Add a timer that runs the fixed cycle of Work (25 min), Break (5 min), and Long break (15 min), selecting the next session automatically, letting the user choose another, and starting each session only on click.
- Grow one tree during each Work session, chosen from six Vietnamese trees before it starts. A completed session leaves a mature tree; an abandoned one leaves an immature tree.
- Add an isometric garden to view during Break and Long break, where each tree stands on its own plot and can be watered for fun.
- Bring the garden to life as it grows, with ponds, rocks, meadows, koi, butterflies, birds, an egret, a buffalo, three dogs, and three cats, all arriving by themselves.
- Animate the pets in place, with a way to pause all animal movement.
- Alert the user when a session ends, including when the app is in a background tab.
- Keep the garden, cycle position, and any running session on the device across reloads.
- Lay every screen out as a sidebar beside a full-screen main area, with the timer floating at the top centre.
- Play short sounds when a session starts, when it ends, and when a tree is watered.
- Add a collapsible settings panel for each session kind's time, the sound when a session ends, and a gradient background scheme.
- Scaffold the project as a static web app with no backend.

Out of scope for this version: pausing a session, statistics, syncing between devices, offline install, deployment, animals that walk around, and placing decorations by hand.

## Capabilities

### New Capabilities

- `session-cycle`: The session kinds and durations, their order, choosing a session, starting and ending sessions, the countdown, and resuming after a reload.
- `session-alerts`: Telling the user a session has ended, and how that behaves when notifications or sound are unavailable.
- `tree-growth`: Choosing a tree, how a Work session produces it, its growth stages, and what decides whether it matures.
- `garden`: Keeping trees on the device, placing them on plots, showing them during breaks, and watering them.
- `garden-decorations`: The decorations and animals that arrive as the garden grows, where they appear, and how they move.

- `settings`: The times, end-of-session sound, and background scheme the user can choose, and how they are kept.

### Modified Capabilities

None. The project has no existing specs.

## Impact

- **Code:** all new, in the currently empty `koidoro/` project.
- **Dependencies:** React 19, plus development tools Vite, TypeScript, Biome, Vitest, and Testing Library, at the same major versions as the user's other projects.
- **Browser permissions:** asks for notification permission the first time a session is started.
- **Network:** fonts load from Google Fonts, falling back to system fonts offline.
- **Data:** stored only in this browser's local storage. Clearing site data erases the garden.
