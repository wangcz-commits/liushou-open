# Design · Film pipeline

## Data flow

```
storyboard.md          human-written, one row per shot
      │
      ▼  parse
timeline.json          { fps, durationInFrames, shots[] }
      │
      ▼  generate / edit
scene-{0..4}.tsx       CUTS[] + SHOTS[] + dispatch
      │
      ▼  render
.out/film.mp4          1920×1080 · 30fps · H.264
```

## Why five scenes, not fifty-nine

One scene file per shot would mean 59 files and 59 imports. Instead:

- One scene file per **segment** (a narrative block: hook / mechanism / day /
  "good kid" / cost).
- Inside a segment, shots are entries in a `SHOTS` array, dispatched by a `CUTS` table.

This keeps the dispatch in one place and makes retiming a table edit.

## Frame normalisation

Every draw function receives `(f, dur)` and computes progress as `f / dur`.
Because of that, the 179.5s → 150s retime was a pure data change: scale the timeline,
scale `CUTS` and `SHOTS[].dur`, done. No shot code was edited.

## Shared layer boundary

`components/stage.ts` owns anatomy and light. Shot files only compose.

The one exception is text that must live inside the artwork (form fields, phone UI);
those are drawn locally because their layout is shot-specific.

## Failure modes we hit

| Symptom | Cause | Fix |
|---|---|---|
| Shot reads as a still | no motion beat inside 4s | add a third change point or cut it shorter |
| Figure reads as a blob | hands drawn ad-hoc | always use `hand()` |
| Frame reads as black | base colour too dark | lift to `#101922`; keep pure black for the end card only |
| Banding on gradients | 8-bit quantisation | add grain; keep gradients to <= 3 stops |
