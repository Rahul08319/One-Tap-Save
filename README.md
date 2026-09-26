<div align="center">

# ⚽ One Tap Goalkeeper

### Read the shot. Pick a side. Make the save.

An arcade penalty-save game built for quick touch sessions and YouTube Playables.

![Game platform](https://img.shields.io/badge/game-HTML5-16c784?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)
![YouTube Playables](https://img.shields.io/badge/YouTube-Playables-FF0000?style=flat-square&logo=youtube&logoColor=white)

</div>

---

## The game

Shots come from the left, center, or right. Read the ball, dive into the matching lane, and build a save streak. Three goals end a classic match. Daily Challenge uses a shared shot sequence so players can compare how they did.

### Match features

- Three difficulty levels and touch friendly dive controls.
- Combos, power ups, score records, and replayable match summaries.
- Seasonal leagues with XP and unlockable goalkeeper gloves.
- Daily Challenge with a consistent daily sequence.
- Friend challenge codes and a compact match breakdown.
- Reduced motion, high contrast, left handed layout, and optional haptics.
- Sound effects and crowd ambience that respect mute, pause, and host audio settings.

## Controls

| Action | Touch | Keyboard |
| --- | --- | --- |
| Dive left, center, right | Tap the matching lane | ←, ↑ / Space, → |
| Pause or resume | Pause control in the game HUD | P or Escape |
| Fullscreen | — | F |
| Mute or unmute | Speaker control in the game HUD | — |

## YouTube Playables

The game includes an adapter for the YouTube Playables SDK lifecycle and host settings. It signals the first rendered frame and game readiness, follows host pause and audio changes, saves supported player progress, reports scores, and logs runtime errors without interrupting a match. No ads, rewarded revives, or purchase flows are included in the game.

You can run the game locally without the YouTube host; platform calls are guarded and the game remains playable in standalone mode. A successful local build or browser run does not mean YouTube certification has passed. Run the official [YouTube Playables Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite) against the packaged game before submission.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
git clone https://github.com/Rahul08319/One-Tap-Save.git
cd One-Tap-Save
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

Run the project tests:

```bash
npm test
```

## Built with

React, TypeScript, Vite, Canvas 2D, and the YouTube Playables SDK. The match renderer and game rules run in the browser; no game server is required for local play.

## License

MIT © [Rahul Kumar](https://github.com/Rahul08319)
