import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { W, H, SS, makeGrain } from './components/stage'
import { drawCaption, atmosphere } from './components/captions'
import { SHOT_D, CUTS_D } from './components/shotD'

// 段 3（2145–3315 帧 / 39 秒）｜镜 24–36
// 5:40 摸黑起床 → 穿衣 → 灶台 → 里屋 → 挂件 → 签字栏 → 补日期
// → 奶奶语音 → 想改又收回 → 快递 → 午饭 → 反锁 → 47 条未接

export default function Scene() {
  const f = useCurrentFrame()
  const gr = useMemo(() => makeGrain(5521), [])
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
    for (let k = 0; k < CUTS_D.length - 1; k++) if (sf >= CUTS_D[k]) i = k
    const shot = SHOT_D[i]
    const local = sf - CUTS_D[i]
    ;(shot.fn as (c: CanvasRenderingContext2D, fr: number, d: number, g: HTMLCanvasElement) => void)(
      ctx, local, shot.dur, gr,
    )
    drawCaption(ctx, 2, i, local, shot.dur)
    atmosphere(ctx, sf, 2 * 131 + i)
  }, [f, gr])

  return (
    <AbsoluteFill style={{ background: '#07090b' }}>
      <canvas ref={ref} width={W * SS} height={H * SS} style={{ width: W, height: H }} />
    </AbsoluteFill>
  )
}
