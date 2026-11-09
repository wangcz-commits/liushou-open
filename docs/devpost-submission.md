# Devpost submission copy

Ready-to-paste text for the Kiroween 2026 project page. Everything below is English,
as required.

---

## Project name

**Left Behind — a code-drawn documentary short**

## Elevator pitch (140 chars)

Every frame of this 150-second documentary is drawn by Canvas 2D code. 59 shots, zero
footage, zero generated video.

## Inspiration

15.5 million children in rural China live apart from parents who work in cities. Most
coverage of them is either handheld footage or AI-generated "sad" clips, and both make
the viewer spend attention on whether the image is real.

Flat vector removes that question. Nobody asks if a silhouette is a real child, so the
attention goes to what is happening.

## What it does

A 150-second, 59-shot film about one child's day: a 5:40 alarm, two bowls of rice, a
parent signature field filled in with a grandmother's crooked hand, 47 missed video
calls, a guardian column left empty.

Every shot is a pure function `draw(ctx, frame, duration)`. The film is deterministic:
the same spec always renders the same frames.

## How we built it

- **Remotion + Canvas 2D.** No three.js, no WebGL, no generative video.
- **A shared drawing layer** — `person()`, `hand()`, `caption()`, `glow()`, `grain()` —
  so anatomy and light are defined once and composed 59 times.
- **Frame normalisation.** Every shot computes progress as `f / dur`, which is what made
  retiming from 179.5s to 150s a pure data change: frame counts only, no shot code edited.
- **A caption table** covering 59 shots, with 12 shots intentionally left silent.

## How Kiro was used

*(fill this in with the concrete Kiro features you actually used — this section is what
judges read most closely)*

- **Spec**: `.kiro/specs/film-pipeline/` holds requirements, design and tasks for the
  authoring pipeline (storyboard → timeline → scene code → render).
- **Steering**: `.kiro/steering/` encodes the visual language as rules the agent must
  follow — no pure black, one light per shot, 4-second ceiling, never draw an ad-hoc hand.
- **Hooks**: `preview-edited-shot` renders three frames whenever a shot file is saved;
  `guard-visual-rules` blocks a commit that breaks the visual rules.
- **Agent workflow**: the agent reads the spec, edits `components/shot*.ts`, previews
  frames, and iterates without a human describing the picture in words.

## Challenges

1. **Hands.** A hand drawn ad-hoc reads as a claw. The fix was a single reusable
   `hand()` primitive with two-segment fingers and four poses — and a rule that no shot
   may draw a hand inline.
2. **Exposure.** The first cut of segment 2 was unreadable: everything sat at 5% brightness.
   The fix was a discipline, not a filter — never pure black, one light per shot, one
   bright thing per frame.
3. **Static shots.** A pretty composition held for four seconds reads as a slide. The rule
   became: over four seconds requires three change points inside the shot.

## What's next

The pipeline is the product. Next: a storyboard parser that validates duration sums, a
shot generator that emits review-ready skeletons, and a lint pass that catches
pure-black fills and ad-hoc anatomy before they reach a render.

## Built with

remotion, react, typescript, canvas2d, node.js

## Links

- GitHub: https://github.com/wangcz-commits/liushou-open
- Demo video: *(YouTube, public, ≤ 3 min — add after upload)*

---

## Demo video outline (≤ 3:00)

| Time | Content |
|---|---|
| 0:00–0:20 | Cold open: the film's first 20 seconds, no commentary |
| 0:20–0:50 | What it is: 59 shots, every frame drawn by code; show a shot's `draw()` function next to the frame it produces |
| 0:50–1:30 | Kiro in action: open the spec, ask the agent to retime a segment, watch the three-frame preview hook fire |
| 1:30–2:20 | The visual rules and what they fixed — before/after the exposure pass |
| 2:20–2:50 | The film's ending card |
| 2:50–3:00 | Repo URL on screen |
