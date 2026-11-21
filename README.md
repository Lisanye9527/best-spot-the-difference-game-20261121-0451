# The Reading Room — Spot the Difference

[![Competition](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Lisanye9527/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Lisanye9527/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game built for the
[make.fun "best spot the difference game" bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
Two near-identical pictures of a cozy reading room stand side by side; ten
quiet changes hide between them — a cat that slipped away, a clock telling
the wrong time, a lamp gone out, a book missing from the shelf. Find them
all against the clock.

## Play

Serve the static game and open it in a desktop browser — no build step, no
network requests, every file it loads lives under `game/`:

```
node serve.ts
# then open http://localhost:8080
```

- Click a difference in either picture and it is ringed in both.
- A wrong click adds 5 seconds; a hint glows at one hidden difference and
  adds 10.
- Keys: **H** for a hint, **R** to restart.

## Layout

- `game/index.html` — the page: masthead, status HUD with the remaining
  counter, the two panels and the win card.
- `game/src/scene.js` — paints the room on a canvas; a set of difference
  ids selects which objects take their changed form.
- `game/src/differences.js` — the ten differences and their click targets.
- `game/src/game.js` — the hunt itself: state, markers, timer, penalties,
  hint, sounds and the win.
- `game/src/main.js` — wiring: HUD, buttons, keys and the frame loop.
- `screenshots/` — the maker's screenshots of the game in play.
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  the output directory and writes `dossier.json` with the vendored
  make.fun library (`vendor/makefun-game.ts`).

## License

MIT — see `LICENSE`.
