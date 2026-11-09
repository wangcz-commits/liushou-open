import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { W, H, SS, makeGrain } from './components/stage'
import { drawCaption, atmosphere } from './components/captions'
import { SHOT_F, CUTS_F } from './components/shotF'

// 段 5（4290–5385 帧 / 36.5 秒）｜镜 48–59
// 短视频滑到凌晨 → 最后一排趴着睡 → 监护人栏空着 → 流水线 → 同一个位置
// → 叠化 → 回到村口 → 1550 万个点 → 字 → 黑场

export default function Scene() {
  const f = useCurrentFrame()
  const gr = useMemo(() => makeGrain(2024), [])
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
    for (let k = 0; k < CUTS_F.length - 1; k++) if (sf >= CUTS_F[k]) i = k
    const shot = SHOT_F[i]
    const local = sf - CUTS_F[i]
    ;(shot.fn as (c: CanvasRenderingContext2D, fr: number, d: number, g: HTMLCanvasElement) => void)(
      ctx, local, shot.dur, gr,
    )
    drawCaption(ctx, 4, i, local, shot.dur)
    atmosphere(ctx, sf, 4 * 131 + i)
  }, [f, gr])

  return (
    <AbsoluteFill style={{ background: '#07090b' }}>
      <canvas ref={ref} width={W * SS} height={H * SS} style={{ width: W, height: H }} />
    </AbsoluteFill>
  )
}
