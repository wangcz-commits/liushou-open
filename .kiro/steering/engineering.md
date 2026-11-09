# Steering · Engineering

## Stack

- Remotion (React frame renderer) + Canvas 2D
- No three.js, no WebGL, no AI video generation
- TypeScript

## Scene contract

Every shot is a pure function:

```ts
export function boarding(ctx: CanvasRenderingContext2D, f: number, dur: number) { … }
```

- `f` — frame index **within the shot**, starting at 0
- `dur` — total frames of the shot
- All animation must be expressed as `f / dur` so retiming never breaks a shot
- No global state, no time source other than `f`

## Scene dispatch

`scene-N.tsx` owns a `CUTS` array and a `SHOTS` array. It maps the composition frame
into `(shot, local)`, calls the draw function, then overlays the caption and the
atmosphere pass. Nothing else.

## Shared layer

All primitives live in `components/stage.ts`:

- `person(opts)` — faceless silhouette, stand / walk / squat
- `hand(opts)` — open / point / relaxed / grip
- `caption(opts)` — top-left multi-line, keyword colour
- `glow / lg / vignette / grain / pool` — light and texture

Never draw an ad-hoc hand or figure inside a shot. If the primitive does not fit,
extend the primitive.

## Retiming

Change `timeline.json` frame counts **and** the scene's `CUTS` / `SHOTS[].dur`
together. Everything else scales automatically because every shot normalises on `f/dur`.

## Verification

Before calling a shot done:

1. `motion_preview` at the shot's first, middle and last frame
2. Check: is there one bright thing? does anything move? does the caption match?
3. Only then render.
