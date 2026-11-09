import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { W, H, SS, makeGrain } from './components/stage'
import { title, alarm, road, boarding, farewell } from './components/shotA'
import { windowSeat, depart, counting, taillight, number } from './components/shotB'
import { drawCaption, atmosphere } from './components/captions'

// 段 1（0–777 帧 / 26 秒）｜镜 1–10
// 原时间轴 930 帧，整片压到 150 秒，这里按 0.8357 缩放。

const SHOTS = [
  { fn: title, dur: 90 },
  { fn: alarm, dur: 75 },
  { fn: road, dur: 90 },
  { fn: boarding, dur: 105 },
  { fn: farewell, dur: 90 },
  { fn: windowSeat, dur: 75 },
  { fn: depart, dur: 90 },
  { fn: counting, dur: 90 },
  { fn: taillight, dur: 105 },
  { fn: number, dur: 120 },
]
const CUTS = [0, 90, 165, 255, 360, 450, 525, 615, 705, 810, 930]

export default function Scene() {
  const f = useCurrentFrame()
  const gr = useMemo(() => makeGrain(7717), [])
  const ref = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    ctx.setTransform(SS, 0, 0, SS, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    const sf = f / 0.8357
    let i = 0
    for (let k = 0; k < CUTS.length - 1; k++) if (sf >= CUTS[k]) i = k
    const shot = SHOTS[i]
    const local = sf - CUTS[i]
    ;(shot.fn as (c: CanvasRenderingContext2D, fr: number, d: number, g: HTMLCanvasElement) => void)(
      ctx, local, shot.dur, gr,
    )
    drawCaption(ctx, 0, i, local, shot.dur)
    atmosphere(ctx, sf, 131 * 0 + i)
  }, [f, gr])

  return (
    <AbsoluteFill style={{ background: '#07090b' }}>
      <canvas ref={ref} width={W * SS} height={H * SS} style={{ width: W, height: H }} />
    </AbsoluteFill>
  )
}
