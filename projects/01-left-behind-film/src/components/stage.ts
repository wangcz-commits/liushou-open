// 扁平矢量舞台：无脸剪影 + 冷夜 + 一点灯暖。
// 规则：只画剪影和光；不描边、不画五官细节；每镜只有一个主光源。
export const W = 1920
export const H = 1080
export const SS = 2

export const C = {
  night: '#0d1319',
  deep: '#141d25',
  slate: '#22303d',
  cream: '#EDE6D8',
  paper: '#F6F1E6',
  amber: '#E9A94B',
  warm: '#F5C97F',
  red: '#B5483B',
  blue: '#7FA8C9',
  ink: '#0a0d10',
  dust: '#7F8A96',
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const eio = (t: number) => {
  const x = clamp01(t)
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}
export const eout = (t: number) => 1 - Math.pow(1 - clamp01(t), 3)
export const ein = (t: number) => Math.pow(clamp01(t), 3)

export function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

export function lg(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, x1: number, y1: number,
  stops: [number, string][],
) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  for (const [o, c] of stops) g.addColorStop(o, c)
  return g
}

export function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, hexA(color, a))
  g.addColorStop(0.42, hexA(color, a * 0.38))
  g.addColorStop(1, hexA(color, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

export function prng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function makeGrain(seed = 7717, size = 160) {
  const cv = document.createElement('canvas')
  cv.width = size
  cv.height = size
  const g = cv.getContext('2d')!
  const img = g.createImageData(size, size)
  let s = seed
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0
    const v = (s >>> 24) & 255
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = (s >>> 9) & 1 ? 20 : 5
  }
  g.putImageData(img, 0, 0)
  return cv
}

export function grain(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, f: number, a = 0.3) {
  ctx.save()
  ctx.globalAlpha = a
  ctx.translate(-((f * 29) % 160), -((f * 47) % 160))
  ctx.fillStyle = ctx.createPattern(cv, 'repeat')!
  ctx.fillRect(0, 0, W + 160, H + 160)
  ctx.restore()
}

export function vignette(ctx: CanvasRenderingContext2D, a = 0.55) {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.46, H * 0.22, W * 0.5, H * 0.5, H * 0.96)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(0.6, `rgba(0,0,0,${a * 0.28})`)
  g.addColorStop(1, `rgba(0,0,0,${a})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

export type PersonOpts = {
  x: number
  y: number
  h: number
  fill?: string
  alpha?: number
  flip?: boolean
  lean?: number
  pose?: 'stand' | 'walk' | 'crouch' | 'squat'
  step?: number
  arm?: number
  hair?: 'none' | 'short' | 'bob' | 'cap'
  headTilt?: number
  carry?: 'none' | 'case' | 'sack'
  reach?: 'none' | 'right'
  back?: boolean
  noArms?: boolean
}

// 单位高度 = 1，脚在 y=0。
export function person(ctx: CanvasRenderingContext2D, o: PersonOpts) {
  const fill = o.fill ?? C.cream
  ctx.save()
  ctx.globalAlpha = o.alpha ?? 1
  ctx.translate(o.x, o.y)
  if (o.flip) ctx.scale(-1, 1)
  if (o.lean) ctx.rotate(o.lean)
  ctx.scale(o.h, o.h)
  ctx.fillStyle = fill
  ctx.strokeStyle = fill
  ctx.lineCap = 'round'

  if (o.pose === 'crouch') {
    crouch(ctx, o, fill)
    ctx.restore()
    return
  }
  if (o.pose === 'squat') {
    squat(ctx, o, fill)
    ctx.restore()
    return
  }

  const hipY = -0.34
  const shoulderY = -0.72
  const headY = -0.805
  const headR = 0.082

  // 腿
  const step = o.step ?? 0
  const s = step * 0.06
  ctx.fillRect(0.012 + s, hipY + 0.02, 0.052, -hipY - 0.03)
  ctx.fillRect(-0.064 - s, hipY + 0.02, 0.052, -hipY - 0.03)
  ctx.beginPath()
  ctx.ellipse(0.05 + s, -0.012, 0.044, 0.014, 0, 0, Math.PI * 2)
  ctx.ellipse(-0.026 - s, -0.012, 0.044, 0.014, 0, 0, Math.PI * 2)
  ctx.fill()

  // 脖子
  ctx.fillRect(-0.026, headY + headR - 0.045, 0.052, 0.07)

  // 躯干
  ctx.beginPath()
  ctx.moveTo(-0.078, shoulderY)
  ctx.quadraticCurveTo(-0.095, (shoulderY + hipY) / 2, -0.108, hipY + 0.03)
  ctx.quadraticCurveTo(0, hipY + 0.062, 0.108, hipY + 0.03)
  ctx.quadraticCurveTo(0.095, (shoulderY + hipY) / 2, 0.078, shoulderY)
  ctx.quadraticCurveTo(0, shoulderY - 0.028, -0.078, shoulderY)
  ctx.closePath()
  ctx.fill()

  // 手臂
  const sw = o.arm ?? 0
  const armY = hipY + 0.07
  ctx.lineWidth = 0.044
  if (o.noArms) {
    // 手臂由镜头自己画
  } else if (o.reach === 'right') {
    ctx.beginPath()
    ctx.moveTo(0.066, shoulderY + 0.02)
    ctx.quadraticCurveTo(0.15, shoulderY + 0.02, 0.225, shoulderY - 0.06)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(-0.066, shoulderY + 0.02)
    ctx.quadraticCurveTo(-0.106, (shoulderY + armY) / 2, -0.092 - sw * 0.07, armY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0.066, shoulderY + 0.02)
    ctx.quadraticCurveTo(0.106, (shoulderY + armY) / 2, 0.092 + sw * 0.07, armY)
    ctx.stroke()
  }

  // 头
  ctx.save()
  if (o.headTilt) {
    ctx.translate(0, headY + headR)
    ctx.rotate(o.headTilt)
    ctx.translate(0, -(headY + headR))
  }
  ctx.beginPath()
  ctx.arc(0, headY, headR, 0, Math.PI * 2)
  ctx.fill()
  hair(ctx, o.hair ?? 'short', headY, headR, o.back)
  ctx.restore()

  if (o.carry === 'case') {
    ctx.fillStyle = hexA('#0c1218', 0.95)
    ctx.beginPath()
    ctx.roundRect(-0.30, hipY + 0.10, 0.15, 0.115, 0.02)
    ctx.fill()
    ctx.fillRect(-0.235, hipY + 0.06, 0.022, 0.05)
  } else if (o.carry === 'sack') {
    ctx.fillStyle = hexA('#101820', 0.95)
    ctx.beginPath()
    ctx.ellipse(-0.25, hipY + 0.13, 0.07, 0.088, 0.22, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function hair(ctx: CanvasRenderingContext2D, kind: 'none' | 'short' | 'bob' | 'cap', headY: number, headR: number, back?: boolean) {
  if (kind === 'none') return
  ctx.fillStyle = C.ink
  if (back) {
    ctx.beginPath()
    ctx.arc(0, headY, headR * 1.04, 0, Math.PI * 2)
    ctx.fill()
    if (kind === 'bob') {
      ctx.fillRect(-headR * 0.95, headY, headR * 0.34, headR * 1.15)
      ctx.fillRect(headR * 0.61, headY, headR * 0.34, headR * 1.15)
    }
    return
  }
  if (kind === 'cap') {
    ctx.beginPath()
    ctx.arc(0, headY - 0.004, headR * 0.99, Math.PI * 1.04, Math.PI * 1.96)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(headR * 0.1, headY - 0.018, headR * 0.95, headR * 0.16, headR * 0.08)
    ctx.fill()
  } else if (kind === 'bob') {
    ctx.beginPath()
    ctx.arc(0, headY - 0.004, headR * 0.99, Math.PI * 0.9, Math.PI * 2.1)
    ctx.fill()
    ctx.fillRect(-headR * 0.99, headY - 0.02, headR * 0.3, headR * 1.3)
    ctx.fillRect(headR * 0.69, headY - 0.02, headR * 0.3, headR * 1.3)
  } else {
    ctx.beginPath()
    ctx.arc(0, headY - 0.004, headR * 0.99, Math.PI * 1.08, Math.PI * 1.92)
    ctx.fill()
  }
}

// 蹲着的人：侧身，一条腿折在身下。总高约 0.66。
function crouch(ctx: CanvasRenderingContext2D, o: PersonOpts, fill: string) {
  ctx.save()
  ctx.translate(0, -0.01)

  // 大腿、小腿、脚
  ctx.beginPath()
  ctx.roundRect(-0.04, -0.255, 0.17, 0.085, 0.042)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(0.098, -0.20, 0.068, 0.185, 0.03)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(0.072, -0.028, 0.13, 0.028, 0.014)
  ctx.fill()

  // 躯干（前倾）
  ctx.save()
  ctx.translate(0, -0.235)
  ctx.rotate(-0.14)
  ctx.beginPath()
  ctx.moveTo(-0.072, 0)
  ctx.quadraticCurveTo(-0.088, -0.12, -0.07, -0.245)
  ctx.quadraticCurveTo(0, -0.28, 0.07, -0.245)
  ctx.quadraticCurveTo(0.088, -0.12, 0.072, 0)
  ctx.quadraticCurveTo(0, 0.045, -0.072, 0)
  ctx.closePath()
  ctx.fill()

  // 手臂：一只撑在膝上
  ctx.strokeStyle = fill
  ctx.lineWidth = 0.042
  ctx.beginPath()
  ctx.moveTo(0.06, -0.215)
  ctx.quadraticCurveTo(0.13, -0.18, 0.145, -0.115)
  ctx.stroke()

  // 头
  const headY = -0.245 - 0.078
  ctx.fillRect(-0.026, headY + 0.05, 0.052, 0.06)
  ctx.beginPath()
  ctx.arc(0, headY, 0.082, 0, Math.PI * 2)
  ctx.fill()
  hair(ctx, o.hair ?? 'short', headY, 0.082)
  ctx.restore()

  ctx.restore()
}
// 左上角字幕：一行一条，关键词换色。
export function caption(
  ctx: CanvasRenderingContext2D,
  o: { lines: { t: string; c?: string }[]; f: number; start: number; end: number; x?: number; y?: number; size?: number },
) {
  const size = o.size ?? 56
  const x = o.x ?? 104
  let y = o.y ?? 128
  const lh = size * 1.42
  o.lines.forEach((ln, i) => {
    const t0 = o.start + i * 5
    const p = clamp01((o.f - t0) / 9)
    if (p <= 0) return
    const yy = y + i * lh
    ctx.save()
    ctx.globalAlpha = p
    ctx.translate(0, (1 - eout(p)) * 14)
    ctx.font = `700 ${size}px "Noto Sans SC", sans-serif`
    ctx.textBaseline = 'top'
    ctx.shadowColor = 'rgba(0,0,0,0.55)'
    ctx.shadowBlur = 18
    ctx.fillStyle = ln.c ?? C.cream
    ctx.fillText(ln.t, x, yy)
    ctx.restore()
  })
  return y + o.lines.length * lh
}

export function disclaimer(ctx: CanvasRenderingContext2D, a = 1) {
  ctx.save()
  ctx.globalAlpha = a
  ctx.font = '400 22px "Noto Sans SC", sans-serif'
  ctx.fillStyle = hexA(C.dust, 0.85)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('画面为示意 · 人物为多个真实案例合成', W - 52, H - 40)
  ctx.restore()
}

// 蹲下：屁股落在脚跟上，胸口压在膝盖上。总高约 0.61。
function squat(ctx: CanvasRenderingContext2D, o: PersonOpts, fill: string) {
  ctx.save()
  // 脚
  ctx.beginPath()
  ctx.roundRect(0.075, -0.036, 0.215, 0.036, 0.018)
  ctx.fill()
  // 小腿
  ctx.beginPath()
  ctx.roundRect(0.148, -0.275, 0.076, 0.275, 0.038)
  ctx.fill()
  // 大腿 + 臀
  ctx.beginPath()
  ctx.arc(0.026, -0.202, 0.082, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.translate(0.028, -0.212)
  ctx.rotate(0.3)
  ctx.beginPath()
  ctx.roundRect(0, -0.052, 0.205, 0.104, 0.052)
  ctx.fill()
  ctx.restore()
  // 躯干：前倾，胸口在膝盖上方
  ctx.save()
  ctx.translate(0.03, -0.20)
  ctx.rotate(0.24)
  ctx.beginPath()
  ctx.moveTo(-0.072, 0)
  ctx.quadraticCurveTo(-0.086, -0.14, -0.07, -0.255)
  ctx.quadraticCurveTo(0, -0.29, 0.07, -0.255)
  ctx.quadraticCurveTo(0.086, -0.14, 0.072, 0)
  ctx.quadraticCurveTo(0, 0.05, -0.072, 0)
  ctx.closePath()
  ctx.fill()
  // 脖子、头（跟着前倾）
  ctx.fillRect(-0.026, -0.345, 0.052, 0.07)
  ctx.beginPath()
  ctx.arc(0.004, -0.355, 0.082, 0, Math.PI * 2)
  ctx.fill()
  hair(ctx, o.hair ?? 'short', -0.355, 0.082, o.back)
  ctx.restore()
  ctx.restore()
}
// 地上的一摊光：软椭圆，边缘衰减
export function pool(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, rx: number, ry: number, color: string, a: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(rx, ry)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
  g.addColorStop(0, hexA(color, a))
  g.addColorStop(0.45, hexA(color, a * 0.42))
  g.addColorStop(1, hexA(color, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// ── 手：一套可复用的手部组件 ─────────────────────────────
// 单位长度 = 手腕到指尖。原点在手腕，手指朝 +x。
// pose: open 张开 / point 食指伸出 / relaxed 半松 / grip 握住
export type HandPose = 'open' | 'point' | 'relaxed' | 'grip'

export function hand(
  ctx: CanvasRenderingContext2D,
  o: {
    x: number; y: number; len: number; ang: number
    pose?: HandPose; fill?: string; alpha?: number; flip?: boolean
  },
) {
  const fill = o.fill ?? C.cream
  const pose = o.pose ?? 'relaxed'
  const L = o.len

  ctx.save()
  ctx.globalAlpha = o.alpha ?? 1
  ctx.translate(o.x, o.y)
  ctx.rotate(o.ang)
  ctx.scale(L, o.flip ? -L : L)
  ctx.fillStyle = fill
  ctx.strokeStyle = fill
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // 腕
  ctx.beginPath()
  ctx.roundRect(-0.17, -0.088, 0.22, 0.176, 0.05)
  ctx.fill()

  // 掌：手腕窄、掌心宽，靠近指根略收
  ctx.beginPath()
  ctx.moveTo(-0.02, -0.088)
  ctx.quadraticCurveTo(-0.02, -0.128, 0.06, -0.132)
  ctx.quadraticCurveTo(0.28, -0.155, 0.48, -0.172)
  ctx.quadraticCurveTo(0.52, -0.176, 0.522, -0.148)
  ctx.lineTo(0.522, 0.148)
  ctx.quadraticCurveTo(0.52, 0.176, 0.48, 0.172)
  ctx.quadraticCurveTo(0.28, 0.155, 0.06, 0.132)
  ctx.quadraticCurveTo(-0.02, 0.128, -0.02, 0.088)
  ctx.closePath()
  ctx.fill()

  // 四指：两节，关节处收一点
  const baseCurl = pose === 'open' ? 0 : pose === 'relaxed' ? 0.52 : 0.9
  const knuck = [-0.118, -0.04, 0.04, 0.118]
  const flen = [0.36, 0.4, 0.37, 0.31]
  const fwid = [0.076, 0.08, 0.074, 0.064]

  for (let i = 0; i < 4; i++) {
    const isIndex = i === 0
    const c = pose === 'point' && isIndex ? 0 : baseCurl
    const base = flen[i] * 0.55
    const tipLen = flen[i] * 0.45
    ctx.save()
    ctx.translate(0.5, knuck[i])
    ctx.rotate(c * 1.3 + (pose === 'open' ? (i - 1.5) * 0.07 : 0))
    ctx.beginPath()
    ctx.roundRect(0, -fwid[i] / 2, base, fwid[i], fwid[i] / 2)
    ctx.fill()
    ctx.translate(base - fwid[i] * 0.18, 0)
    ctx.rotate(c * 0.85)
    ctx.beginPath()
    ctx.roundRect(0, -fwid[i] * 0.45, tipLen, fwid[i] * 0.9, fwid[i] * 0.45)
    ctx.fill()
    ctx.restore()
  }

  // 拇指：两节，从掌根斜出去
  ctx.save()
  ctx.translate(0.1, 0.14)
  ctx.rotate(-0.5 - baseCurl * 0.45)
  ctx.beginPath()
  ctx.roundRect(0, -0.052, 0.21, 0.104, 0.052)
  ctx.fill()
  ctx.translate(0.195, 0)
  ctx.rotate(-0.4 - baseCurl * 0.3)
  ctx.beginPath()
  ctx.roundRect(0, -0.048, 0.16, 0.096, 0.048)
  ctx.fill()
  ctx.restore()

  ctx.restore()
}
