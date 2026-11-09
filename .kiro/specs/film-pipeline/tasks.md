# Tasks · Film pipeline

## Done

- [x] Storyboard v4 — 59 shots, 179.5s, durations sum checked
- [x] Five scene files with `CUTS` / `SHOTS` dispatch
- [x] Shared layer: `person`, `hand`, `caption`, `glow`, `grain`, `vignette`
- [x] Retime to 150s by scaling frame counts only
- [x] Per-shot caption table (12 shots intentionally silent)
- [x] Atmosphere pass (drifting motes) applied to every shot
- [x] Final render 1920×1080 / 30fps / 150.0s
- [x] Compressed 15 MB copy for the repo

## Next (Kiro-driven work)

- [ ] **Storyboard parser** — read `storyboard.md`, validate duration sums, emit
      `timeline.json`. Fails loudly on mismatch.
- [ ] **Shot generator** — from a storyboard row, emit a `draw()` skeleton that already
      imports the shared primitives and the segment's palette.
- [ ] **Frame review command** — `preview <shot> <frame>` renders one PNG so review is
      per-frame, not per-render.
- [ ] **Retime command** — `retime --to 120s` rewrites `CUTS` and `SHOTS[].dur` and
      re-renders a contact sheet for eyeballing.
- [ ] **Lint: visual rules** — flag pure-black fills, shots > 4s without three beats,
      ad-hoc hands, gradients with > 3 stops.

## Out of scope

- Audio, narration, subtitles burn-in
- Vertical (9:16) reframing
