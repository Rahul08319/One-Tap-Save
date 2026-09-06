# One Tap Goalkeeper

> A fast, touch-first football reflex game built for the web and prepared for YouTube Playables.

Step into goal, read the shot, and make the save. One Tap Goalkeeper is designed around a single satisfying decision: dive left, center, or right before the ball hits the net.

## Highlights

- **Instant goalkeeper gameplay** — three large touch zones, plus keyboard support for desktop.
- **Classic and Daily Challenge modes** — build high scores or take on a seeded daily run.
- **Progression** — earn XP, unlock glove styles, and climb the monthly league ladder.
- **Momentum systems** — streaks, combos, power-ups, haptics, crowd sound, and replay highlights.
- **Accessibility choices** — high contrast, reduced motion, haptics, left-handed controls, and fullscreen support.
- **Responsive by design** — adapts to mobile, tablet, ultrawide, and resized Playables canvases.

## YouTube Playables readiness

The game includes a defensive YouTube Playables SDK integration:

- Loads the SDK before game code.
- Signals `firstFrameReady()` and `gameReady()`.
- Uses SDK pause/resume and audio state callbacks.
- Restores cloud data before any cloud save attempt.
- Sends score updates and reports health warnings/errors safely.
- Falls back gracefully when running outside Playables.

Ads and other monetization APIs are intentionally not included.

> Before release, validate the production build in the [YouTube Playables Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite) using your authenticated Developer Portal account.

## Controls

| Action | Touch | Keyboard |
| --- | --- | --- |
| Dive left | Left zone | `←` |
| Dive center | Center zone | `↑` or `Space` |
| Dive right | Right zone | `→` |
| Fullscreen | — | `F` |

## Local development

```bash
git clone https://github.com/Rahul08319/one-tap-save.git
cd one-tap-save
npm install
npm run dev
```

For a production check:

```bash
npm run build
npm run test
```

## Tech

- React + TypeScript
- Vite
- Tailwind CSS
- Canvas 2D + Web Audio API
- YouTube Playables SDK

## Project structure

```text
src/
├── game/       # gameplay, progression, accessibility, Playables adapter
├── components/ # reusable UI primitives
└── pages/      # app routes
```

## Release checklist

- Build with `npm run build`.
- Confirm the production bundle meets Playables size limits.
- Test touch, mouse, keyboard, resize, pause/resume, and muted audio states.
- Run the YouTube Playables Test Suite.
- Complete required metadata in the YouTube Playables Developer Portal.

---

Built by Rahul Kumar.
