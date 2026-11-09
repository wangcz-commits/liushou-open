import {
  W, H, C, clamp01, lerp, eio, eout, ein, hexA, lg, glow, prng, pool,
  person, caption, disclaimer, vignette, grain,
} from './stage'

const SERIF = '"Noto Serif SC", serif'
const SANS = '"Noto Sans SC", sans-serif'

// 统一光源逻辑：黎明前的冷蓝是底色，暖光只有一个来源。
const BASE = '#0a1016'
const WALL = '#121b24'
const WARM = '#FFC98A'
const WARM_D = '#E9A94B'
const INK2 = '#06090c'

/* 镜 1｜黑场，手写一行字，最后一笔没写完 */
export function title(ctx: CanvasRenderingContext2D, f: number, dur: number) {
  ctx.fillStyle = '#050708'
  ctx.fillRect(0, 0, W, H)

  const text = '正月初六，清晨五点。'
  const chars = [...text]
  const size = 106
  const x0 = 158
  const y0 = 552
  ctx.font = `500 ${size}px ${SERIF}`
  const widths = chars.map((c) => ctx.measureText(c).width)

  const q = clamp01((f - 6) / (dur * 0.7))
  const p = q * 0.9
  const n = p * chars.length
  const full = Math.floor(n)
  const frac = n - full

  let cx = x0
  let tip = x0
  ctx.fillStyle = C.cream
  for (let i = 0; i < chars.length; i++) {
    const w = widths[i]
    if (i < full) {
      const wob = (i % 3) - 1
      ctx.save()
      ctx.translate(cx + w / 2, y0 + wob * 2)
      ctx.rotate(wob * 0.007)
      ctx.fillText(chars[i], -w / 2, 0)
      ctx.restore()
    } else if (i === full && frac > 0) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(cx, y0 - size * 1.1, w * frac, size * 1.5)
      ctx.clip()
      ctx.fillText(chars[i], cx, y0)
      ctx.restore()
    }
    cx += w
    if (i <= full) tip = cx
  }

  // 笔尖一点冷光，不是暖光——这一镜还没有光源
  if (q < 1) glow(ctx, tip, y0 - size * 0.4, 120, '#D9E6F2', 0.045 * (1 - q))

  if (q > 0.04) {
    ctx.strokeStyle = hexA(C.cream, 0.16 * (1 - clamp01((f - dur * 0.82) / (dur * 0.18))))
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x0 - 18, y0 + 46)
    ctx.lineTo(x0 - 18 + 700 * clamp01(q * 0.8), y0 + 46)
    ctx.stroke()
  }

  const fade = clamp01((f - (dur - 7)) / 7)
  if (fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fade})`
    ctx.fillRect(0, 0, W, H)
  }
}

/* 镜 2｜5:40，闹钟亮，一根手指按掉 */
export function alarm(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  const px = 962
  const py = 508
  const pw = 392
  const ph = 672

  // 墙
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#0b1219'], [0.5, WALL], [1, BASE]])
  ctx.fillRect(0, 0, W, H)

  // 屏幕光落在墙上的衰减
  glow(ctx, px + 40, py + 40, 1500, WARM, 0.05)
  glow(ctx, px + 30, py, 900, WARM, 0.085)
  glow(ctx, px + 20, py - 40, 430, WARM, 0.1)

  // 被子（左下）
  ctx.fillStyle = '#16212b'
  ctx.beginPath()
  ctx.moveTo(0, 1080)
  ctx.lineTo(0, 812)
  ctx.quadraticCurveTo(240, 742, 470, 826)
  ctx.quadraticCurveTo(640, 884, 760, 1080)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = hexA(WARM, 0.12)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 812)
  ctx.quadraticCurveTo(240, 742, 470, 826)
  ctx.stroke()

  // 床头柜
  ctx.fillStyle = '#0d151c'
  ctx.beginPath()
  ctx.roundRect(660, 800, 700, 120, 8)
  ctx.fill()
  ctx.fillStyle = hexA(WARM, 0.16)
  ctx.fillRect(660, 800, 700, 4)

  // 手机
  ctx.save()
  ctx.translate(px, py)
  ctx.rotate(-0.05)
  ctx.fillStyle = INK2
  ctx.beginPath()
  ctx.roundRect(-pw / 2 - 9, -ph / 2 - 9, pw + 18, ph + 18, 38)
  ctx.fill()

  const pressed = f > dur * 0.68
  const dim = pressed ? 0.76 : 1
  const scr = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2)
  scr.addColorStop(0, hexA('#FFF0D2', 0.99 * dim))
  scr.addColorStop(0.55, hexA(WARM, 0.95 * dim))
  scr.addColorStop(1, hexA(WARM_D, 0.9 * dim))
  ctx.fillStyle = scr
  ctx.beginPath()
  ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 30)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = hexA('#FFF0D2', 0.5 * dim)
  ctx.shadowBlur = 18
  ctx.fillStyle = hexA(C.ink, pressed ? 0.45 : 0.66)
  ctx.font = `600 30px ${SANS}`
  ctx.fillText('正月初六', 0, -ph / 2 + 86)
  ctx.font = `300 25px ${SANS}`
  ctx.fillStyle = hexA(C.ink, pressed ? 0.34 : 0.46)
  ctx.fillText('周四 · 晴', 0, -ph / 2 + 126)

  ctx.shadowBlur = 26
  ctx.fillStyle = hexA(C.ink, pressed ? 0.5 : 0.9)
  ctx.font = `300 158px ${SANS}`
  ctx.fillText('05:40', 0, 34)

  ctx.shadowBlur = 0
  ctx.font = `400 26px ${SANS}`
  ctx.fillStyle = hexA(C.ink, 0.42)
  ctx.fillText(pressed ? '已稍后提醒' : '闹 钟', 0, 122)
  ctx.restore()

  // 一根手指，从右下伸进来
  const hp = clamp01((f - dur * 0.2) / (dur * 0.34))
  if (hp > 0) {
    const k = eout(hp)
    const tipX = lerp(1560, 1032, k)
    const tipY = lerp(1080, 660, k)
    const cx2 = tipX + 118
    const cy2 = tipY + 150

    ctx.save()
    ctx.fillStyle = hexA(INK2, 0.97)
    ctx.strokeStyle = hexA(INK2, 0.97)
    ctx.lineCap = 'round'
    // 手腕
    ctx.lineWidth = 122
    ctx.beginPath()
    ctx.moveTo(cx2 + 300, cy2 + 360)
    ctx.lineTo(cx2 + 40, cy2 + 46)
    ctx.stroke()
    // 手掌
    ctx.beginPath()
    ctx.ellipse(cx2, cy2, 92, 76, -0.62, 0, Math.PI * 2)
    ctx.fill()
    // 蜷着的三根手指
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.ellipse(cx2 + 26 + i * 16, cy2 + 46 - i * 10, 36, 26, -0.5, 0, Math.PI * 2)
      ctx.fill()
    }
    // 食指，指向屏幕
    const dx = tipX - cx2
    const dy = tipY - cy2
    const ang = Math.atan2(dy, dx)
    ctx.save()
    ctx.translate(cx2, cy2)
    ctx.rotate(ang)
    ctx.beginPath()
    ctx.roundRect(-10, -22, Math.hypot(dx, dy) + 34, 44, 22)
    ctx.fill()
    ctx.restore()

    // 指尖被屏幕照到的一线暖边
    ctx.strokeStyle = hexA(WARM, 0.4)
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(tipX - 6, tipY + 2, 24, Math.PI * 0.9, Math.PI * 1.8)
    ctx.stroke()
    ctx.restore()
  }

  vignette(ctx, 0.6)
  grain(ctx, gr, f, 0.26)
}

/* 镜 3｜村口土路，两道车灯推近，光扫过霜 */
export function road(ctx: CanvasRenderingContext2D, f: number, dur: number) {
  const t = clamp01(f / dur)

  ctx.fillStyle = lg(ctx, 0, 0, 0, 660, [[0, '#070c11'], [0.6, '#0d1720'], [1, '#16212b']])
  ctx.fillRect(0, 0, W, H)

  const r = prng(9187)
  for (let i = 0; i < 70; i++) {
    const sx = r() * W
    const sy = r() * 360
    ctx.fillStyle = hexA('#c9dae8', (0.07 + r() * 0.26) * (0.6 + 0.4 * Math.sin(f * 0.07 + i)))
    ctx.fillRect(sx, sy, 2, 2)
  }

  // 村子
  ctx.fillStyle = '#080f15'
  const houses = [[60, 558, 210], [290, 586, 150], [500, 570, 180], [1390, 564, 220], [1640, 588, 160], [1810, 568, 130]]
  houses.forEach(([hx, hy, hw]) => {
    ctx.fillRect(hx, hy, hw, 660 - hy)
    ctx.beginPath()
    ctx.moveTo(hx - 12, hy)
    ctx.lineTo(hx + hw / 2, hy - hw * 0.22)
    ctx.lineTo(hx + hw + 12, hy)
    ctx.closePath()
    ctx.fill()
  })

  // 电线杆
  ;[214, 1698].forEach((px) => {
    ctx.fillStyle = '#05090d'
    ctx.fillRect(px - 7, 300, 14, 360)
    ctx.fillRect(px - 46, 336, 92, 9)
    ctx.fillRect(px - 34, 372, 68, 7)
  })
  ctx.strokeStyle = hexA('#080e13', 0.95)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(214, 340)
  ctx.quadraticCurveTo(960, 424, 1698, 340)
  ctx.stroke()

  // 土路
  ctx.fillStyle = lg(ctx, 0, 640, 0, H, [[0, '#1a252f'], [0.45, '#17212a'], [1, '#0c141a']])
  ctx.beginPath()
  ctx.moveTo(902, 650)
  ctx.lineTo(1020, 650)
  ctx.lineTo(1840, H)
  ctx.lineTo(80, H)
  ctx.closePath()
  ctx.fill()

  // 车辙：两条压出来的沟
  const rut = (x0: number, w: number) => {
    const g = lg(ctx, x0, 650, x0 + (x0 - 960) * 3.2, H, [[0, hexA('#080e13', 0)], [0.3, hexA('#080e13', 0.7)], [1, hexA('#050a0e', 0.85)]])
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(x0 - 6, 652)
    ctx.lineTo(x0 + 6, 652)
    ctx.lineTo(x0 + (x0 - 960) * 3.2 + w, H)
    ctx.lineTo(x0 + (x0 - 960) * 3.2 - w, H)
    ctx.closePath()
    ctx.fill()
  }
  rut(944, 60)
  rut(978, 60)

  // 霜：只有被光照到才亮
  const rr = prng(4412)
  for (let i = 0; i < 220; i++) {
    const u = rr()
    const v = rr()
    const yy = lerp(662, H, v * v)
    const half = lerp(14, 900, Math.pow(v, 1.35))
    const xx = 960 + (u - 0.5) * 2 * half
    const near = 1 - Math.min(1, Math.abs(xx - 960) / (half + 1))
    const a = (0.04 + 0.5 * t * near * rr())
    ctx.fillStyle = hexA('#eaf4fb', a)
    const s = 2 + v * 3
    ctx.fillRect(xx, yy, s, s)
    if (a > 0.3) {
      ctx.fillStyle = hexA('#ffffff', a * 0.5)
      ctx.fillRect(xx - 2, yy + s / 2, s + 4, 1)
    }
  }

  // 车灯
  const s = 0.16 + 0.84 * Math.pow(t, 1.7)
  const hx = 960
  const hy = lerp(636, 612, t)
  const sep = 30 + 96 * s

  // 光束：三层递减，边缘是软的
  for (let i = 0; i < 3; i++) {
    const k = 1 - i * 0.28
    const beam = lg(ctx, hx, hy, hx, H, [[0, hexA(WARM, 0.16 * s * k)], [0.5, hexA(WARM, 0.05 * s * k)], [1, hexA(WARM, 0)]])
    ctx.fillStyle = beam
    ctx.beginPath()
    ctx.moveTo(hx - sep * 0.7, hy)
    ctx.lineTo(hx + sep * 0.7, hy)
    ctx.lineTo(hx + 720 * s * k, H)
    ctx.lineTo(hx - 720 * s * k, H)
    ctx.closePath()
    ctx.fill()
  }

  // 地面光斑
  pool(ctx, hx, lerp(880, 940, t), 620 * s + 80, 200 * s + 40, WARM, 0.1 + 0.12 * s)

  ;[hx - sep, hx + sep].forEach((lx) => {
    glow(ctx, lx, hy, 470 + 420 * s, WARM, 0.16 + 0.16 * s)
    glow(ctx, lx, hy, 120 + 90 * s, '#FFF6E2', 0.3 + 0.4 * s)
    ctx.fillStyle = hexA('#FFFDF7', 0.7 + 0.3 * s)
    ctx.beginPath()
    ctx.arc(lx, hy, 9 + 15 * s, 0, Math.PI * 2)
    ctx.fill()
  })

  // 横向的眩光
  const flare = lg(ctx, hx - sep - 260 * s, hy, hx + sep + 260 * s, hy, [
    [0, hexA(WARM, 0)], [0.35, hexA(WARM, 0.1 * s)], [0.5, hexA('#FFF3DC', 0.34 * s)], [0.65, hexA(WARM, 0.1 * s)], [1, hexA(WARM, 0)],
  ])
  ctx.fillStyle = flare
  ctx.fillRect(hx - sep - 300 * s, hy - 3 - 4 * s, (sep + 300 * s) * 2, 6 + 8 * s)

  vignette(ctx, 0.68)
}

/* 镜 4｜大人们一个一个上车，孩子背对镜头 */
export function boarding(ctx: CanvasRenderingContext2D, f: number, dur: number) {
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#080e13'], [1, '#05080b']])
  ctx.fillRect(0, 0, W, H)

  // 地面
  ctx.fillStyle = '#111a22'
  ctx.fillRect(0, 866, W, H - 866)
  ctx.fillStyle = hexA('#05090d', 0.7)
  ctx.fillRect(0, 866, W, 5)

  // 车身
  ctx.fillStyle = '#0f1820'
  ctx.beginPath()
  ctx.roundRect(1060, 150, 940, 810, 26)
  ctx.fill()
  ctx.fillStyle = hexA('#7FA8C9', 0.12)
  ctx.fillRect(1100, 158, 860, 3)
  // 车身的一条冷轮廓光，把车从夜色里托出来
  const bodyLight = lg(ctx, 1050, 0, 1540, 0, [[0, hexA('#7FA8C9', 0.07)], [1, hexA('#7FA8C9', 0)]])
  ctx.fillStyle = bodyLight
  ctx.beginPath()
  ctx.roundRect(1060, 150, 940, 810, 26)
  ctx.fill()
  ctx.strokeStyle = hexA('#8FB6D4', 0.22)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(1080, 236)
  ctx.lineTo(1080, 902)
  ctx.stroke()

  // 车窗：亮一点，加玻璃反光
  for (let i = 0; i < 5; i++) {
    const wx = 1226 + i * 132
    const g = lg(ctx, wx, 240, wx, 470, [[0, hexA(WARM, 0.62)], [1, hexA(WARM_D, 0.3)]])
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.roundRect(wx, 244, 112, 224, 10)
    ctx.fill()
    // 窗里的人
    ctx.fillStyle = hexA('#141d25', 0.72)
    ctx.beginPath()
    ctx.arc(wx + 56, 356, 27, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(wx + 26, 384, 60, 84)
    // 玻璃反光
    ctx.fillStyle = hexA('#FFFFFF', 0.1)
    ctx.beginPath()
    ctx.moveTo(wx + 8, 464)
    ctx.lineTo(wx + 62, 244)
    ctx.lineTo(wx + 84, 244)
    ctx.lineTo(wx + 30, 464)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = hexA('#081016', 0.9)
  for (let i = 0; i <= 6; i++) ctx.fillRect(1214 + i * 132, 240, 12, 232)

  // 车门：门框 + 台阶 + 车内
  const doorX = 1150
  const doorW = 238
  ctx.fillStyle = lg(ctx, doorX, 0, doorX + doorW, 0, [[0, hexA('#FFE3B4', 0.95)], [0.6, hexA(WARM, 0.75)], [1, hexA(WARM_D, 0.4)]])
  ctx.beginPath()
  ctx.roundRect(doorX, 366, doorW, 560, 6)
  ctx.fill()
  // 车内：座位 + 扶手
  ctx.fillStyle = hexA('#0d151c', 0.55)
  ctx.beginPath()
  ctx.roundRect(doorX + 150, 470, 60, 300, 8)
  ctx.fill()
  ctx.strokeStyle = hexA('#0d151c', 0.6)
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(doorX + 74, 380)
  ctx.lineTo(doorX + 74, 900)
  ctx.stroke()
  // 台阶
  ctx.fillStyle = hexA('#0b1319', 0.5)
  ctx.fillRect(doorX + 6, 852, doorW - 12, 10)
  ctx.fillRect(doorX + 22, 884, doorW - 44, 8)
  // 门框
  ctx.fillStyle = '#081016'
  ctx.fillRect(doorX - 22, 350, 22, 590)
  ctx.fillRect(doorX + doorW, 350, 26, 590)
  ctx.fillRect(doorX - 22, 336, doorW + 48, 20)

  // 地上的一摊光
  pool(ctx, doorX + 60, 892, 640, 96, WARM, 0.22)
  glow(ctx, doorX + 40, 640, 900, WARM, 0.16)

  // 上车的人：踩着台阶上一级，身形跟着变小
  const walkers = [
    { d: 0.02, h: 366, y: 898, carry: 'sack' as const, ph: 0 },
    { d: 0.16, h: 350, y: 884, carry: 'case' as const, ph: 2.1 },
    { d: 0.32, h: 378, y: 902, carry: 'none' as const, ph: 4.2 },
    { d: 0.48, h: 356, y: 890, carry: 'sack' as const, ph: 1.1 },
  ]
  walkers.forEach((w) => {
    const p = clamp01((f / dur - w.d) / 0.56)
    if (p <= 0 || p >= 1) return
    const x = lerp(-180, doorX + 96, eio(p))
    const step = Math.sin(f * 0.42 + w.ph) * 0.55
    person(ctx, {
      x, y: w.y - Math.max(0, (x - doorX + 40) / 6), h: w.h, pose: 'walk',
      step, arm: step, carry: w.carry, hair: 'cap', fill: hexA(C.cream, 0.9),
    })
  })

  // 孩子：背对镜头，头微微仰着看车门
  const sway = Math.sin(f * 0.06) * 2
  ctx.fillStyle = hexA('#000000', 0.52)
  ctx.beginPath()
  ctx.ellipse(524, 926, 120, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  person(ctx, {
    x: 520 + sway, y: 922, h: 420, hair: 'bob', back: true,
    headTilt: -0.1, fill: C.cream,
  })

  caption(ctx, {
    lines: [{ t: '班车会带走' }, { t: '一批大人。', c: WARM }],
    f, start: Math.floor(dur * 0.16), end: dur,
  })
  disclaimer(ctx, 0.85)
  vignette(ctx, 0.56)
}

/* 镜 5｜蹲下，手放在肩上；然后站起来，走进车门 */
export function farewell(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const p = clamp01(f / dur)
  const lightIn = eio(clamp01((p - 0.45) / 0.4))

  ctx.fillStyle = lg(ctx, 0, 0, W, 0, [[0, '#080d12'], [0.55, '#0b1219'], [1, '#0d1620']])
  ctx.fillRect(0, 0, W, H)

  // 地面
  ctx.fillStyle = '#080f14'
  ctx.fillRect(0, 908, W, H - 908)
  ctx.fillStyle = hexA(WARM, 0.05 + lightIn * 0.05)
  ctx.fillRect(0, 906, W, 3)

  // 车门：有框、有台阶、有车厢
  const dx = 1616
  const dw = 246
  const dTop = 296
  ctx.fillStyle = '#0c141b'
  ctx.beginPath()
  ctx.roundRect(dx - 96, 236, dw + 220, 690, 14)
  ctx.fill()

  // 门里的光
  const dg = lg(ctx, dx, 0, dx + dw, 0, [[0, hexA(WARM, 0.55)], [0.5, hexA('#FFE3B4', 0.92)], [1, hexA(WARM, 0.7)]])
  ctx.fillStyle = dg
  ctx.beginPath()
  ctx.roundRect(dx, dTop, dw, 612, 4)
  ctx.fill()

  // 车厢里：扶手
  ctx.strokeStyle = hexA('#0b131a', 0.55)
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(dx + 62, 310)
  ctx.lineTo(dx + 62, 900)
  ctx.stroke()
  // 台阶
  ctx.fillStyle = hexA('#0a1218', 0.45)
  ctx.fillRect(dx + 4, 856, dw - 8, 10)
  ctx.fillRect(dx + 20, 888, dw - 40, 8)
  // 门框竖边
  ctx.fillStyle = '#080e14'
  ctx.fillRect(dx - 16, 286, 16, 630)
  ctx.fillRect(dx + dw, 286, 20, 630)

  glow(ctx, dx + 80, 640, 1080, WARM, 0.2 + lightIn * 0.16)
  pool(ctx, dx + 40, 912, 700, 100, WARM, 0.24)

  const childX = 1322
  const childH = 486
  const groundY = 912

  const stand = clamp01((p - 0.34) / 0.13)
  const walk = clamp01((p - 0.47) / 0.45)
  const mx = lerp(1004, 1780, eio(walk))
  const my = lerp(groundY, 884, eio(walk))
  const mh = lerp(618, 560, eio(walk))
  const squatting = stand < 0.5

  // 行李放在她脚边
  ctx.fillStyle = hexA('#0a1117', 0.95)
  ctx.beginPath()
  ctx.roundRect(872, 846, 158, 66, 8)
  ctx.fill()
  ctx.fillStyle = hexA(C.cream, 0.12)
  ctx.fillRect(872, 846, 158, 3)

  // 母亲脚下的影子
  ctx.fillStyle = hexA('#000000', 0.42)
  ctx.beginPath()
  ctx.ellipse(mx, my + 2, 0.16 * mh, 0.022 * mh, 0, 0, Math.PI * 2)
  ctx.fill()

  // 母亲
  if (mx < 1880) {
    const walking = !squatting
    person(ctx, {
      x: mx, y: my, h: mh,
      pose: squatting ? 'squat' : 'walk',
      step: walking ? Math.sin(f * 0.62) * 0.62 : 0,
      arm: walking ? Math.sin(f * 0.62) * 0.5 : 0,
      hair: 'cap', noArms: squatting, fill: hexA(C.cream, 0.96),
    })

    if (squatting) {
      // 两条手臂：上臂到肘，前臂落到孩子肩上
      const shx = mx + 0.09 * mh
      const shy = my - 0.448 * mh
      const elx = mx + 0.165 * mh
      const ely = my - 0.30 * mh
      const hdx = childX - 0.085 * childH
      const hdy = groundY - 0.585 * childH
      ctx.strokeStyle = hexA(C.cream, 0.96)
      ctx.lineWidth = 0.047 * mh
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(shx, shy)
      ctx.quadraticCurveTo(elx, ely, hdx, hdy)
      ctx.stroke()
      // 手：一小团，搭在肩上
      ctx.beginPath()
      ctx.arc(hdx + 4, hdy + 6, 0.032 * mh, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = hexA(C.cream, 0.96)
      ctx.beginPath()
      ctx.arc(hdx + 4, hdy + 6, 0.032 * mh, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 孩子：侧身朝左，看着母亲
  person(ctx, { x: childX, y: groundY, h: childH, hair: 'bob', flip: true, fill: C.cream })
  ctx.fillStyle = hexA('#000000', 0.5)
  ctx.beginPath()
  ctx.ellipse(childX, groundY + 2, 112, 13, 0, 0, Math.PI * 2)
  ctx.fill()

  // 走进光里：门光把人淹掉一半
  if (mx > dx - 120) {
    const k = clamp01((mx - (dx - 120)) / 240)
    const veil = lg(ctx, dx - 40, 0, dx + dw + 40, 0, [[0, hexA('#FFE3B4', 0)], [0.4, hexA('#FFE3B4', 0.55 * k)], [1, hexA('#FFE3B4', 0.8 * k)]])
    ctx.fillStyle = veil
    ctx.fillRect(dx - 40, 0, dw + 80, H)
  }

  // 车门关上
  if (p > 0.9) {
    const k = eio(clamp01((p - 0.9) / 0.1))
    ctx.fillStyle = hexA('#04070a', 0.94 * k)
    ctx.fillRect(lerp(W, 1180, k), 0, W, H)
  }

  vignette(ctx, 0.55)
  grain(ctx, gr, f, 0.24)
}
