import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { W, H, SS, makeGrain } from './components/stage'
import { drawCaption, atmosphere } from './components/captions'
import { SHOT_E, CUTS_E } from './components/shotE'

// 段 4（3315–4290 帧 / 32.5 秒）｜镜 37–47
// 被夸"懂事" → 手蹭裤缝 → 摸头 → 半夜找药 → 删掉重写"我没事"
// → 座位表"姑姑" → 一排家长 → 塞行李箱 → 拉拉链 → 站在门口 → 车拐弯

export default function Scene() {
  const f = useCurrentFrame()
  const gr = useMemo(() => makeGrain(8831), [])
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
    for (let k = 0; k < CUTS_E.length - 1; k++) if (sf >= CUTS_E[k]) i = k
    const shot = SHOT_E[i]
    const local = sf - CUTS_E[i]
    ;(shot.fn as (c: CanvasRenderingContext2D, fr: number, d: number, g: HTMLCanvasElement) => void)(
      ctx, local, shot.dur, gr,
    )
    drawCaption(ctx, 3, i, local, shot.dur)
    atmosphere(ctx, sf, 3 * 131 + i)
  }, [f, gr])

  return (
    <AbsoluteFill style={{ background: '#07090b' }}>
      <canvas ref={ref} width={W * SS} height={H * SS} style={{ width: W, height: H }} />
    </AbsoluteFill>
  )
}
