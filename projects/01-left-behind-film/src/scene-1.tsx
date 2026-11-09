import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { W, H, SS, makeGrain } from './components/stage'
import { drawCaption, atmosphere } from './components/captions'
import { SHOT_C, CUTS } from './components/shotC'

// 段 2（930–2145 帧 / 40.5 秒）｜镜 11–23
// 表格 → 一摞 → 城市 → 校门口 → 三道闸 → 座位 → 村小 → 地图 → 八公里 → 宿舍 → 铺床 → 熄灯 → 那笔账

export default function Scene() {
  const f = useCurrentFrame()
  const gr = useMemo(() => makeGrain(3311), [])
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
    const shot = SHOT_C[i]
    const local = sf - CUTS[i]
    ;(shot.fn as (c: CanvasRenderingContext2D, fr: number, d: number, g: HTMLCanvasElement) => void)(
      ctx, local, shot.dur, gr,
    )
    drawCaption(ctx, 1, i, local, shot.dur)
    atmosphere(ctx, sf, 1 * 131 + i)
  }, [f, gr])

  return (
    <AbsoluteFill style={{ background: '#07090b' }}>
      <canvas ref={ref} width={W * SS} height={H * SS} style={{ width: W, height: H }} />
    </AbsoluteFill>
  )
}
