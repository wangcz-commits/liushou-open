# Spec · Film pipeline

**Goal** — turn a written storyboard into a rendered film, with every step reproducible
from a file on disk.

**Non-goal** — making the film look like footage. The output is intentionally flat.

---

## Requirements

### R1 · A storyboard file is the single source of truth

- Each shot is a row: index, duration, what happens, caption.
- The sum of shot durations must equal the film duration. A mismatch is an error, not
  a warning.
- Changing a duration in the storyboard must not require touching scene code.

### R2 · Scene code is generated from the storyboard

- For each shot the pipeline produces a `draw(ctx, f, dur)` function.
- Generated code must respect the visual-language rules (no pure black, one light,
  one bright thing).

### R3 · Retiming is a data operation

- Cutting the film from 179.5s to 150s must be possible by editing frame counts only.
- After retiming, every shot must still start and end on its intended beat.

### R4 · Review is frame-based

- For any shot index the pipeline can render a single frame as PNG.
- Reviewers look at first / middle / last frame before a shot is accepted.

### R5 · Export

- Final render: 1920×1080, 30fps, H.264, faststart, no audio track.
- A compressed copy under 20 MB for the repository.

---

## Constraints

- The renderer is Remotion; scenes are Canvas 2D.
- No network access at render time.
- Fonts are not vendored; the environment must provide Noto Sans SC / Noto Serif SC.
